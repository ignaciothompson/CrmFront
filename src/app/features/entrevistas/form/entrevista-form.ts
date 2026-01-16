import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { ToastService } from '../../../core/services/toast.service';
import { FormValidationService } from '../../../core/services/form-validation.service';
import { firstValueFrom } from 'rxjs';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-entrevista-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FullCalendarModule, FilterComponent],
  templateUrl: './entrevista-form.html',
  styleUrl: './entrevista-form.css'
})
export class EntrevistaForm {
  @Input() entrevistaId?: string;

  private toastService = inject(ToastService);
  private validationService = inject(FormValidationService);

  constructor(
    private router: Router,
    private contactoService: ContactoService,
    private entrevistaService: EntrevistaService,
    private unidadService: UnidadService,
    private proyectoService: ProyectoService,
    public activeModal?: NgbActiveModal
  ) {}

  contactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];
  private contactosAll: any[] = [];
  comentario: string = '';
  unidadId: string | null = null;
  unidadItems: Array<{ id: string; label: string; nombre: string; proyectoNombre: string }> = [];
  private unidadesAll: any[] = [];
  private proyectosAll: any[] = [];
  location: string = '';
  fechaInput: string | null = null; // YYYY-MM-DD
  horaInput: string = '09:00'; // HH:mm format
  private previewTitle = 'Nueva entrevista';
  calendarOptions: any = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay',
      center: 'title',
      right: 'today prev,next'
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
    height: '100%',
    selectable: true,
    selectMirror: true,
    allDaySlot: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    select: (info: any) => this.onCalendarSelect(info),
    dateClick: (arg: any) => this.onDateClick(arg)
  };

  ngOnInit(): void {
    // If opened as modal without activeModal, redirect
    if (!this.activeModal) {
      // Allow route-based access
    }

    // Load contactos
    this.contactoService.getContactos().subscribe(cs => {
      this.contactosAll = cs || [];
      this.contactoItems = this.contactosAll.map(c => ({ 
        id: String(c.id), 
        label: `${c?.nombre || c?.Nombre || ''} ${c?.apellido || c?.Apellido || ''}`.trim() || String(c.id)
      }));
    });

    // Load proyectos y unidades
    this.proyectoService.getProyectos().subscribe(proyectos => {
      this.proyectosAll = proyectos || [];
      this.loadUnidades();
    });

    // Load existing entrevista if editing
    if (this.entrevistaId) {
      this.loadEntrevista(this.entrevistaId);
    }
  }

  private loadUnidades(): void {
    this.unidadService.getUnidades().subscribe(unidades => {
      this.unidadesAll = unidades || [];
      // Crear items para el typeahead con formato "nombre unidad, nombre proyecto"
      this.unidadItems = this.unidadesAll.map(u => {
        const proyectoNombre = this.getProyectoNombre(u);
        const label = proyectoNombre 
          ? `${u.nombre || ''}, ${proyectoNombre}`.trim()
          : (u.nombre || '');
        return {
          id: String(u.id),
          label: label,
          nombre: u.nombre || '',
          proyectoNombre: proyectoNombre
        };
      });
    });
  }

  private getProyectoNombre(unidad: any): string {
    if (unidad?.proyectoId) {
      const proyecto = this.proyectosAll.find(p => String(p.id) === String(unidad.proyectoId));
      if (proyecto?.nombre) return proyecto.nombre;
    }
    if (unidad?.proyectoNombre) return unidad.proyectoNombre;
    return '';
  }

  private loadEntrevista(id: string): void {
    // TODO: Implement loading existing entrevista if needed
  }

  async save(): Promise<void> {
    // Validate required fields
    const validationRules = [
      { field: 'contactoId', label: 'Contacto', required: true },
      { field: 'unidadId', label: 'Unidad', required: true },
      { field: 'fechaInput', label: 'Fecha', required: true },
      { field: 'horaInput', label: 'Hora', required: true }
    ];

    const formData = {
      contactoId: this.contactoId,
      unidadId: this.unidadId,
      fechaInput: this.fechaInput,
      horaInput: this.horaInput
    };

    const validation = this.validationService.validateForm(formData, validationRules);
    if (!validation.isValid) {
      validation.errors.forEach(error => this.toastService.error(error));
      return;
    }

    try {
      const entrevista: any = {
        contactoId: this.contactoId,
        unidadId: this.unidadId,
        comentario: this.comentario || null,
        fechaISO: this.fechaInput, // Formato YYYY-MM-DD para fecha_iso
        hora: this.horaInput || null,
        lugar: this.location || null
      };

      await this.entrevistaService.addEntrevista(entrevista);
      this.toastService.success('Entrevista creada exitosamente');
      if (this.activeModal) {
        this.activeModal.close(true);
      } else {
        this.router.navigate(['/entrevistas']);
      }
    } catch (error: any) {
      console.error('Error al guardar entrevista:', error);
      this.toastService.error(error?.message || 'Error al guardar la entrevista. Por favor, intente nuevamente.');
    }
  }

  cancel(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
    } else {
      this.router.navigate(['/entrevistas']);
    }
  }

  private onCalendarSelect(info: any): void {
    const d = info.start; // Date
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    this.fechaInput = `${yyyy}-${mm}-${dd}`;
    
    const h = d.getHours();
    const m = d.getMinutes();
    this.horaInput = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    this.updatePreviewEvent();
  }

  private onDateClick(arg: any): void {
    const d = arg.date as Date;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    this.fechaInput = `${yyyy}-${mm}-${dd}`;
    
    // If the click includes a time (timeGrid views), use it; otherwise default to 09:00
    const h = d.getHours();
    const m = d.getMinutes();
    if (Number.isFinite(h) && Number.isFinite(m) && (h !== 0 || m !== 0)) {
      this.horaInput = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    } else {
      this.horaInput = '09:00';
    }
    this.updatePreviewEvent();
  }

  onFechaChange(): void { 
    this.updatePreviewEvent(); 
  }

  onHoraChange(): void { 
    this.updatePreviewEvent(); 
  }

  private updatePreviewEvent(): void {
    if (!this.fechaInput || !this.horaInput) {
      this.calendarOptions = { ...this.calendarOptions, events: [] };
      return;
    }
    const start = `${this.fechaInput}T${this.horaInput}`;
    const events = [{ id: 'preview', title: this.previewTitle, start }];
    this.calendarOptions = { ...this.calendarOptions, events };
  }
}



