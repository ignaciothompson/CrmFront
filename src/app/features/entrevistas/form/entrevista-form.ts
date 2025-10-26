import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { EventMonitorService } from '../../../core/services/event-monitor.service';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-entrevista-form',
  standalone: true,
  imports: [FormsModule, RouterModule, NgbDatepickerModule, NgbTimepickerModule, FullCalendarModule, TypeaheadComponent],
  templateUrl: './entrevista-form.html',
  styleUrl: './entrevista-form.css'
})
export class EntrevistaForm {
  constructor(private router: Router, private contactoService: ContactoService, private entrevistaService: EntrevistaService, private events: EventMonitorService) {}

  contactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];
  private contactosAll: any[] = [];
  comentario: string = '';
  unidadNombre: string = '';
  location: string = '';
  // Native inputs
  fechaInput: string | null = null; // YYYY-MM-DD
  horaHour: number = 9;
  horaMinute: number = 0;
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
    this.contactoService.getContactos().subscribe(cs => {
      this.contactosAll = cs || [];
      this.contactoItems = this.contactosAll.map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
    });
  }

  save(): void {
    if (!this.contactoId) { this.router.navigate(['/entrevistas']); return; }
    const fechaStr = this.fechaInput || '';
    const horaStr = `${String(this.horaHour).padStart(2,'0')}:${String(this.horaMinute).padStart(2,'0')}`;
    const contact = this.contactosAll.find(c => String(c.id) === String(this.contactoId));
    const entrevista: any = {
      contactoId: this.contactoId,
      pendiente: true,
      comentario: this.comentario,
      fecha: fechaStr,
      hora: horaStr,
      location: this.location,
      unidad: this.unidadNombre ? { nombre: this.unidadNombre } : undefined,
      createdAt: new Date().toISOString()
    };
    if (contact?.Nombre) entrevista.contactoNombre = contact.Nombre;
    if (contact?.Apellido) entrevista.contactoApellido = contact.Apellido;
    this.entrevistaService.addEntrevista(entrevista).then(() => this.router.navigate(['/entrevistas']));
  }

  private onCalendarSelect(info: any): void {
    const d = info.start; // Date
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    this.fechaInput = `${yyyy}-${mm}-${dd}`;
    this.horaHour = d.getHours();
    this.horaMinute = d.getMinutes();
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
      this.horaHour = h;
      this.horaMinute = m;
    } else {
      this.horaHour = 9;
      this.horaMinute = 0;
    }
    this.updatePreviewEvent();
  }

  onFechaChange(): void { this.updatePreviewEvent(); }
  onHoraChange(): void { this.updatePreviewEvent(); }

  private updatePreviewEvent(): void {
    if (!this.fechaInput) {
      this.calendarOptions = { ...this.calendarOptions, events: [] };
      return;
    }
    const start = `${this.fechaInput}T${String(this.horaHour).padStart(2,'0')}:${String(this.horaMinute).padStart(2,'0')}`;
    const events = [{ id: 'preview', title: this.previewTitle, start }];
    this.calendarOptions = { ...this.calendarOptions, events };
  }
}


