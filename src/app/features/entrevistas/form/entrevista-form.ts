import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { EventMonitorService } from '../../../core/services/event-monitor.service';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-entrevista-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbDatepickerModule, NgbTimepickerModule, FullCalendarModule, TypeaheadComponent],
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
  fecha: { year: number; month: number; day: number } | null = null;
  hora: { hour: number; minute: number } = { hour: 9, minute: 0 };
  calendarOptions: any = {
    plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    selectable: true,
    selectMirror: true,
    allDaySlot: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    select: (info: any) => this.onCalendarSelect(info)
  };

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.contactosAll = cs || [];
      this.contactoItems = this.contactosAll.map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
    });
  }

  save(): void {
    if (!this.contactoId) { this.router.navigate(['/entrevistas']); return; }
    const fechaStr = this.fecha ? `${this.fecha.year}-${String(this.fecha.month).padStart(2,'0')}-${String(this.fecha.day).padStart(2,'0')}` : '';
    const horaStr = `${String(this.hora.hour).padStart(2,'0')}:${String(this.hora.minute).padStart(2,'0')}`;
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
    this.fecha = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    this.hora = { hour: d.getHours(), minute: d.getMinutes() };
  }
}


