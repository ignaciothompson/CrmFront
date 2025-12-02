import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { SubheaderComponent, FilterConfig } from '../../shared/components/subheader/subheader';

@Component({
  selector: 'app-monitor-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SubheaderComponent],
  templateUrl: './monitor-eventos.html',
  styleUrl: './monitor-eventos.css'
})
export class MonitorEventosComponent {
  constructor(private firestore: Firestore) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];
  initialFilterValues: Record<string, any> = {};

  selectedDate: string | null = null;
  categoria: '' | 'Contactos' | 'Unidades' | 'Entrevistas' | 'ListaNegra' = '';
  tipo: '' | 'Nuevo' | 'Editado' | 'Eliminado' = '';

  stats = { total: 0, creados: 0, editados: 0 };
  items: any[] = [];

  ngOnInit(): void {
    // Por defecto mostrar eventos del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.selectedDate = today.toISOString().slice(0, 10);
    
    this.initialFilterValues = {
      selectedDate: this.selectedDate
    };
    
    this.updateFilterConfigs();
    this.load();
  }

  private updateFilterConfigs(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    
    this.subheaderFilters = [
      {
        id: 'selectedDate',
        type: 'date',
        label: 'Fecha',
        placeholder: 'Seleccionar fecha',
        maxDate: todayStr,
        columnClass: 'col-xs-12 col-sm-3 col-md-3'
      },
      {
        id: 'categoria',
        type: 'select',
        label: 'Categoría',
        values: [
          { value: '', label: 'Todas las categorías' },
          { value: 'Contactos', label: 'Contactos' },
          { value: 'Unidades', label: 'Unidades' },
          { value: 'Entrevistas', label: 'Entrevistas' },
          { value: 'ListaNegra', label: 'Lista negra' }
        ],
        columnClass: 'col-xs-12 col-sm-3 col-md-3'
      },
      {
        id: 'tipo',
        type: 'select',
        label: 'Tipo',
        values: [
          { value: '', label: 'Todos los tipos' },
          { value: 'Nuevo', label: 'Alta' },
          { value: 'Editado', label: 'Edición' },
          { value: 'Eliminado', label: 'Eliminación' }
        ],
        columnClass: 'col-xs-12 col-sm-3 col-md-3'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.selectedDate = values['selectedDate'] || null;
    this.categoria = (values['categoria'] || '') as '' | 'Contactos' | 'Unidades' | 'Entrevistas' | 'ListaNegra';
    this.tipo = (values['tipo'] || '') as '' | 'Nuevo' | 'Editado' | 'Eliminado';
    this.load();
  }

  load(): void {
    const ref = collection(this.firestore, 'eventos');
    // Client-side filtering (simple and fast to implement). Can be moved to server query later.
    collectionData(ref, { idField: 'id' }).subscribe((rows: any[]) => {
      let data = rows || [];
      
      // Ensure we have data
      if (!data || data.length === 0) {
        this.items = [];
        this.computeStats();
        return;
      }
      
      // Filtrar por fecha seleccionada (día específico)
      let filterDateStart: Date;
      let filterDateEnd: Date;
      
      if (this.selectedDate) {
        // Parsear la fecha en formato YYYY-MM-DD como fecha local (no UTC)
        const [year, month, day] = this.selectedDate.split('-').map(Number);
        filterDateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
        filterDateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
      } else {
        // Si no hay fecha seleccionada, usar el día actual
        const today = new Date();
        filterDateStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        filterDateEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      }
      
      console.log('Filtering eventos for date range:', {
        start: filterDateStart.toISOString(),
        end: filterDateEnd.toISOString(),
        selectedDate: this.selectedDate
      });
      
      data = data.filter(r => {
        const dt = this.parseDateLike(r?.fecha);
        if (!dt) {
          return false;
        }
        // Comparar fechas - incluir todo el día (desde 00:00:00 hasta 23:59:59)
        const eventTime = dt.getTime();
        const isInRange = eventTime >= filterDateStart.getTime() && eventTime <= filterDateEnd.getTime();
        return isInRange;
      });
      
      console.log('Filtered eventos count:', data.length);
      if (this.categoria) data = data.filter(r => r?.categoria === this.categoria);
      if (this.tipo) data = data.filter(r => r?.tipo === this.tipo);
      // Map detalle: only show primitive changes for Editado in format: Campo: "old" a "new"
      const mapped = data.map(d => {
        let detalleStr = '';
        if (d?.tipo === 'Editado' && d?.data?.changes) {
          const lines: string[] = [];
          for (const [campo, change] of Object.entries(d.data.changes)) {
            const oldV = (change as any)?.oldValue;
            const newV = (change as any)?.newValue;
            if (this.isPrimitive(oldV) && this.isPrimitive(newV)) {
              lines.push(`${campo}: "${this.formatValue(oldV)}" a "${this.formatValue(newV)}"`);
            }
          }
          detalleStr = lines.join(' | ');
        }
        return { ...d, _detalleStr: detalleStr };
      });
      this.items = mapped.sort((a,b) => {
        const da = this.parseDateLike(a?.fecha)?.getTime() || 0;
        const db = this.parseDateLike(b?.fecha)?.getTime() || 0;
        return db - da;
      });
      this.computeStats();
    }, error => {
      console.error('Error loading eventos:', error);
      this.items = [];
      this.computeStats();
    });
  }


  private computeStats() {
    const total = this.items.length;
    const creados = this.items.filter(i => i?.tipo === 'Nuevo').length;
    const editados = this.items.filter(i => i?.tipo === 'Editado').length;
    this.stats = { total, creados, editados };
  }

  private parseDateLike(v: any): Date | null {
    if (!v) return null;
    // Handle Firestore Timestamp
    if (v && typeof v.toDate === 'function') {
      try {
        const d = v.toDate();
        return d instanceof Date ? d : null;
      } catch (e) {
        console.warn('Error converting Firestore timestamp:', e);
      }
    }
    // Handle ISO string dates
    if (typeof v === 'string') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    // Handle Date objects
    if (v instanceof Date) {
      return isNaN(v.getTime()) ? null : v;
    }
    // Try to parse as date
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private isPrimitive(v: any): boolean {
    return v === null || ['string', 'number', 'boolean'].includes(typeof v);
  }

  private formatValue(v: any): string {
    if (typeof v === 'boolean') return v ? 'si' : 'no';
    if (v === null || v === undefined) return '';
    return String(v);
  }

  getTipoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'Nuevo':
        return 'badge-success';
      case 'Editado':
        return 'badge-info';
      case 'Eliminado':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  }
}


