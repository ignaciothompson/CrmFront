import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { ToastService } from '../../../core/services/toast.service';
import { FormValidationService } from '../../../core/services/form-validation.service';
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
    public activeModal?: NgbActiveModal
  ) {}

  contactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];
  private contactosAll: any[] = [];
  comentario: string = '';
  unidadNombre: string = '';
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

    this.contactoService.getContactos().subscribe(cs => {
      this.contactosAll = cs || [];
      this.contactoItems = this.contactosAll.map(c => ({ 
        id: String(c.id), 
        label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() || String(c.id)
      }));
    });

    // Load existing entrevista if editing
    if (this.entrevistaId) {
      this.loadEntrevista(this.entrevistaId);
    }
  }

  private loadEntrevista(id: string): void {
    // TODO: Implement loading existing entrevista if needed
  }

  save(): void {
    // Validate required fields
    const validationRules = [
      { field: 'contactoId', label: 'Contacto', required: true },
      { field: 'unidadNombre', label: 'Unidad', required: true },
      { field: 'fechaInput', label: 'Fecha', required: true },
      { field: 'horaInput', label: 'Hora', required: true }
    ];

    const formData = {
      contactoId: this.contactoId,
      unidadNombre: this.unidadNombre,
      fechaInput: this.fechaInput,
      horaInput: this.horaInput
    };

    const validation = this.validationService.validateForm(formData, validationRules);
    if (!validation.isValid) {
      validation.errors.forEach(error => this.toastService.error(error));
      return;
    }

    const contact = this.contactosAll.find(c => String(c.id) === String(this.contactoId));
    const entrevista: any = {
      contactoId: this.contactoId,
      pendiente: true,
      comentario: this.comentario,
      fecha: this.fechaInput,
      hora: this.horaInput,
      location: this.location,
      unidad: this.unidadNombre ? { nombre: this.unidadNombre } : undefined,
      createdAt: new Date().toISOString()
    };
    
    if (contact?.Nombre) entrevista.contactoNombre = contact.Nombre;
    if (contact?.Apellido) entrevista.contactoApellido = contact.Apellido;

    this.entrevistaService.addEntrevista(entrevista)
      .then(() => {
        this.toastService.success('Entrevista creada exitosamente');
        if (this.activeModal) {
          this.activeModal.close(true);
        } else {
          this.router.navigate(['/entrevistas']);
        }
      })
      .catch((error: any) => {
        console.error('Error al guardar entrevista:', error);
        this.toastService.error('Error al guardar la entrevista. Por favor, intente nuevamente.');
      });
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



