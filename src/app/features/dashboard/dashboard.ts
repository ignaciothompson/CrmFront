import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';
import { EntrevistaService } from '../../core/services/entrevista';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MeetModal } from '../entrevistas/components/meet-modal/meet-modal';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private unidadService: UnidadService, private contactoService: ContactoService, private entrevistaService: EntrevistaService, private modal: NgbModal, private firestore: Firestore, private router: Router) {}

  // Cards
  totalUnidades = 0;
  totalContactos = 0;
  unidadesDisponibles = 0;
  entrevistasPendientes = 0;

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
    const contacto = info?.event?.extendedProps?.contacto;
    const meet = info?.event?.extendedProps?.meet;
    const ref = this.modal.open(MeetModal, { size: 'md' });
    ref.componentInstance.contacto = contacto;
    ref.componentInstance.meet = meet || null;
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
    if (cat === 'Contactos' && id) { this.router.navigate([`/contactos/form`, id]); return; }
    if (cat === 'Unidades' && id) { this.router.navigate([`/unidades/form`, id]); return; }
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
