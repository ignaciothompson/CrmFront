import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';
import { EntrevistaService } from '../../core/services/entrevista';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MeetModal } from '../entrevistas/components/meet-modal/meet-modal';
import { UnidadForm } from '../unidades/unidad-form/unidad-form';
import { ContactoForm } from '../contactos/contacto-form/contacto-form';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { BreakpointService } from '../../core/services/breakpoint.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  @ViewChild('fullCalendar') fullCalendarComponent!: FullCalendarComponent;

  constructor(
    private unidadService: UnidadService, 
    private contactoService: ContactoService, 
    private entrevistaService: EntrevistaService, 
    private modal: NgbModal, 
    private firestore: Firestore, 
    private router: Router,
    public breakpointService: BreakpointService
  ) {}

  // Cards
  totalUnidades = 0;
  totalContactos = 0;
  unidadesDisponibles = 0;
  entrevistasPendientes = 0;

  // Upcoming meetings for mobile cards
  upcomingMeetings: any[] = [];

  // Collapsible frames (start collapsed on mobile)
  calendarCollapsed = true;
  activityCollapsed = true;
  meetingsCollapsed = true;

  // Calendar
  calendarOptions: any = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay',
      center: 'title',
      right: 'today prev,next'
    },
    events: [] as any[],
    eventClick: (info: any) => this.onEventClick(info),
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
    height: '100%'
  };

  // Recent activity (keep structure)
  private recent: {
    icon: string;
    text: string;
    time: string;
    tone?: 'primary' | 'success' | 'danger';
    navigate?: () => void;
  }[] = [];

  get publicRecent() {
    return this.recent;
  }

  // Getters for cleaner template syntax
  get isMobile(): boolean {
    return this.breakpointService.isMobile();
  }

  get isDesktop(): boolean {
    return this.breakpointService.isDesktop();
  }

  toggleCalendar(): void {
    this.calendarCollapsed = !this.calendarCollapsed;
    // If expanding on mobile, refresh calendar dimensions after frame becomes visible
    if (!this.calendarCollapsed && this.breakpointService.isMobile()) {
      setTimeout(() => {
        if (this.fullCalendarComponent) {
          const calendarApi = this.fullCalendarComponent.getApi();
          if (calendarApi) {
            calendarApi.updateSize();
          }
        }
      }, 300);
    }
  }

  toggleMeetings(): void {
    this.meetingsCollapsed = !this.meetingsCollapsed;
  }

  ngOnInit(): void {
    this.unidadService.getUnidades().subscribe(us => {
      const list = us || [];
      this.totalUnidades = list.length;
      this.unidadesDisponibles = list.filter(u => !u?.vendida && !u?.sold).length;
    });

    this.contactoService.getContactos().subscribe(cs => {
      const list = cs || [];
      this.totalContactos = list.length;
    });

    // Load entrevistas from standalone collection for calendar
    this.entrevistaService.getEntrevistas().subscribe(es => {
      const entrevistas = es || [];
      this.entrevistasPendientes = entrevistas.filter((e: any) => !!e?.pendiente).length;
      const events = entrevistas
        .map((e: any) => ({
          title: `${e?.contactoNombre || 'Entrevista'}`,
          start: e?.fecha ? `${e.fecha}T${(e?.hora || '09:00')}` : undefined,
          extendedProps: { entrevista: e }
        }))
        .filter((ev: any) => !!ev.start);
      this.calendarOptions = { ...this.calendarOptions, events };

      // Filter upcoming meetings for mobile cards
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      this.upcomingMeetings = entrevistas
        .filter((e: any) => {
          if (!e?.fecha) return false;
          const meetingDate = this.parseDate(e.fecha);
          if (!meetingDate) return false;
          meetingDate.setHours(0, 0, 0, 0);
          return meetingDate >= now;
        })
        .sort((a: any, b: any) => {
          const dateA = this.parseDate(a?.fecha);
          const dateB = this.parseDate(b?.fecha);
          if (!dateA || !dateB) return 0;
          const timeA = dateA.getTime() + (this.parseTime(a?.hora) || 0);
          const timeB = dateB.getTime() + (this.parseTime(b?.hora) || 0);
          return timeA - timeB;
        })
        .slice(0, 10); // Limit to 10 upcoming meetings
    });

    // Today's activity from eventos
    const ref = collection(this.firestore, 'eventos');
    collectionData(ref, { idField: 'id' }).subscribe((rows: any[]) => {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const today = (rows || []).filter(r => {
        const dt = this.parseDate(r?.fecha);
        return dt && dt >= start && dt <= end;
      }).sort((a,b) => String(b?.fecha).localeCompare(String(a?.fecha)));
      // Map to recent items with links
      const mapped = today.map((ev: any) => ({
        icon: this.iconFor(ev?.categoria),
        text: this.textFor(ev),
        time: 'Hoy',
        tone: this.mapTone(ev?.tipo),
        navigate: () => this.navigateTo(ev)
      }));
      this.recent = mapped.slice(0, 8);
    });
  }

  private onEventClick(info: any): void {
    const entrevista = info?.event?.extendedProps?.entrevista;
    if (entrevista) {
      this.openEntrevistaModal(entrevista);
    } else {
      const contacto = info?.event?.extendedProps?.contacto;
      const meet = info?.event?.extendedProps?.meet;
      const ref = this.modal.open(MeetModal, { size: 'md' });
      ref.componentInstance.contacto = contacto;
      ref.componentInstance.meet = meet || null;
    }
  }

  openEntrevistaModal(entrevista: any): void {
    // Get contacto if contactoId exists
    if (entrevista?.contactoId) {
      this.contactoService.getContactoById(entrevista.contactoId).subscribe(contacto => {
        const ref = this.modal.open(MeetModal, { size: 'md' });
        ref.componentInstance.contacto = contacto || {
          Nombre: entrevista?.contactoNombre || '',
          Apellido: entrevista?.contactoApellido || '',
          Celular: '',
          Mail: ''
        };
        ref.componentInstance.meet = {
          Fecha: entrevista?.fecha || '',
          Hora: entrevista?.hora || '',
          Comentario: entrevista?.comentario || '',
          Unidad: entrevista?.unidad || null,
          Location: entrevista?.location || ''
        };
      });
    } else {
      // Fallback if no contactoId
      const ref = this.modal.open(MeetModal, { size: 'md' });
      ref.componentInstance.contacto = {
        Nombre: entrevista?.contactoNombre || '',
        Apellido: entrevista?.contactoApellido || '',
        Celular: '',
        Mail: ''
      };
      ref.componentInstance.meet = {
        Fecha: entrevista?.fecha || '',
        Hora: entrevista?.hora || '',
        Comentario: entrevista?.comentario || '',
        Unidad: entrevista?.unidad || null,
        Location: entrevista?.location || ''
      };
    }
  }

  private parseTime(timeStr: string | undefined): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
  }

  private parseDate(v: any): Date | null {
    if (!v) return null;
    if (v && typeof v.toDate === 'function') {
      const d = v.toDate();
      return d instanceof Date ? d : null;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private iconFor(categoria: string): string {
    if (categoria === 'Contactos') return 'far fa-address-card';
    if (categoria === 'Unidades') return 'far fa-home';
    if (categoria === 'Entrevistas') return 'far fa-comments';
    return 'far fa-bell';
  }

  private textFor(ev: any): string {
    const tipo = ev?.tipo || '';
    const cat = ev?.categoria || '';
    const label = this.labelForEvent(ev);
    return label ? `${tipo} ${cat}: ${label}` : `${tipo} en ${cat}`;
  }

  private labelForEvent(ev: any): string {
    const cur = ev?.data?.current || {};
    if (ev?.categoria === 'Contactos') {
      const n = `${cur?.Nombre || cur?.nombre || ''} ${cur?.Apellido || cur?.apellido || ''}`.trim();
      return n;
    }
    if (ev?.categoria === 'Unidades') {
      return cur?.nombre || cur?.Nombre || '';
    }
    if (ev?.categoria === 'Entrevistas') {
      return cur?.contactoNombre || '';
    }
    return cur?.id || '';
  }

  private navigateTo(ev: any): void {
    const cat = ev?.categoria;
    const current = ev?.data?.current || {};
    const id = current?.id || current?.contactoId || current?.unidadId || current?.idRef;
    if (cat === 'Contactos' && id) {
      const modalRef = this.modal.open(ContactoForm, { size: 'xl', backdrop: 'static', keyboard: false });
      const component = modalRef.componentInstance as ContactoForm;
      component.contactoId = String(id);
      return;
    }
    if (cat === 'Unidades' && id) { 
      const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
      const component = modalRef.componentInstance as UnidadForm;
      component.unidadId = String(id);
      return;
    }
    if (cat === 'Entrevistas' && (id || ev?.id)) { this.router.navigate([`/entrevistas`]); return; }
    this.router.navigate(['/monitor-eventos']);
  }

  private mapTone(tipo: any): 'primary' | 'success' | 'danger' | undefined {
    if (tipo === 'Nuevo') return 'success';
    if (tipo === 'Editado') return 'primary';
    if (tipo === 'Eliminado') return 'danger';
    return undefined;
  }
}
