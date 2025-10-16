import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ContactoService } from '../../../core/services/contacto';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-entrevista-form',
  standalone: false,
  templateUrl: './entrevista-form.html',
  styleUrl: './entrevista-form.css'
})
export class EntrevistaForm {
  constructor(private router: Router, private contactoService: ContactoService) {}

  contactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];
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
      this.contactoItems = (cs || []).map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
    });
  }

  save(): void {
    if (!this.contactoId) { this.router.navigate(['/entrevistas']); return; }
    const fechaStr = this.fecha ? `${this.fecha.year}-${String(this.fecha.month).padStart(2,'0')}-${String(this.fecha.day).padStart(2,'0')}` : '';
    const horaStr = `${String(this.hora.hour).padStart(2,'0')}:${String(this.hora.minute).padStart(2,'0')}`;
    const payload = {
      EntrevistaPendiente: true,
      Entrevista: { Fecha: fechaStr, Hora: horaStr, Comentario: this.comentario },
      Meet: { Fecha: fechaStr, Hora: horaStr, Comentario: this.comentario, Location: this.location, Unidad: { nombre: this.unidadNombre } }
    };
    this.contactoService.updateContacto(this.contactoId, payload).then(() => this.router.navigate(['/entrevistas']));
  }

  private onCalendarSelect(info: any): void {
    const d = info.start; // Date
    this.fecha = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    this.hora = { hour: d.getHours(), minute: d.getMinutes() };
  }
}


