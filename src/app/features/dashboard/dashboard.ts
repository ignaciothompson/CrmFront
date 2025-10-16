import { Component } from '@angular/core';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MeetModal } from '../entrevistas/components/meet-modal/meet-modal';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private unidadService: UnidadService, private contactoService: ContactoService, private modal: NgbModal) {}

  // Cards
  totalUnidades = 0;
  totalContactos = 0;
  unidadesDisponibles = 0;
  entrevistasPendientes = 0;

  // Calendar
  calendarOptions: any = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    events: [] as any[],
    eventClick: (info: any) => this.onEventClick(info)
  };

  // Recent activity (keep structure)
  recent: Array<{ icon: string; text: string; time: string; tone?: 'primary'|'success' }> = [];

  ngOnInit(): void {
    this.unidadService.getUnidades().subscribe(us => {
      const list = us || [];
      this.totalUnidades = list.length;
      this.unidadesDisponibles = list.filter(u => !u?.vendida && !u?.sold).length;
      this.recent.unshift({ icon: 'far fa-home', text: 'Actualización de unidades', time: 'Ahora', tone: 'primary' });
    });

    this.contactoService.getContactos().subscribe(cs => {
      const list = cs || [];
      this.totalContactos = list.length;
      const entrevistas = list.filter(c => c?.EntrevistaPendiente || (c?.Entrevista?.Fecha && c?.Entrevista?.Hora));
      this.entrevistasPendientes = entrevistas.length;
      this.calendarOptions = {
        ...this.calendarOptions,
        events: entrevistas.map(c => ({
          title: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim(),
          start: c?.Entrevista?.Fecha ? `${c.Entrevista.Fecha}T${(c?.Entrevista?.Hora || '09:00')}` : undefined,
          extendedProps: { contacto: c, meet: c?.Meet || c?.Entrevista }
        })).filter(e => !!e.start)
      };
      this.recent.unshift({ icon: 'far fa-address-card', text: 'Actualización de contactos', time: 'Ahora', tone: 'success' });
    });
  }

  private onEventClick(info: any): void {
    const contacto = info?.event?.extendedProps?.contacto;
    const meet = info?.event?.extendedProps?.meet;
    const ref = this.modal.open(MeetModal, { size: 'md' });
    ref.componentInstance.contacto = contacto;
    ref.componentInstance.meet = meet || null;
  }
}
