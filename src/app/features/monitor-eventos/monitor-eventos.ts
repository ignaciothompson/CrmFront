import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-monitor-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './monitor-eventos.html',
  styleUrl: './monitor-eventos.css'
})
export class MonitorEventosComponent {
  constructor(private firestore: Firestore) {}

  startDateStr: string | null = null;
  endDateStr: string | null = null;
  categoria: '' | 'Contactos' | 'Unidades' | 'Entrevistas' | 'ListaNegra' = '';
  tipo: '' | 'Nuevo' | 'Editado' | 'Eliminado' = '';

  stats = { total: 0, creados: 0, editados: 0 };
  items: any[] = [];

  ngOnInit(): void {
    // Default to past 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    this.startDateStr = start.toISOString().slice(0,10);
    this.endDateStr = end.toISOString().slice(0,10);
    this.load();
  }

  load(): void {
    const ref = collection(this.firestore, 'eventos');
    // Client-side filtering (simple and fast to implement). Can be moved to server query later.
    collectionData(ref, { idField: 'id' }).subscribe((rows: any[]) => {
      let data = rows || [];
      // Inclusive date range: [start 00:00, end+1day 00:00)
      const s = this.startDateStr ? new Date(this.startDateStr) : null;
      if (s) s.setHours(0,0,0,0);
      const eExclusive = this.endDateStr ? new Date(this.endDateStr) : null;
      if (eExclusive) { eExclusive.setHours(0,0,0,0); eExclusive.setDate(eExclusive.getDate() + 1); }
      if (s || eExclusive) {
        data = data.filter(r => {
          const dt = this.parseDateLike(r?.fecha);
          if (!dt) return false;
          if (s && dt < s) return false;
          if (eExclusive && dt >= eExclusive) return false;
          return true;
        });
      }
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
    });
  }

  resetFilters(): void {
    this.startDateStr = null;
    this.endDateStr = null;
    this.categoria = '';
    this.tipo = '';
    this.load();
  }

  private computeStats() {
    const total = this.items.length;
    const creados = this.items.filter(i => i?.tipo === 'Nuevo').length;
    const editados = this.items.filter(i => i?.tipo === 'Editado').length;
    this.stats = { total, creados, editados };
  }

  private parseDateLike(v: any): Date | null {
    if (!v) return null;
    if (v && typeof v.toDate === 'function') {
      const d = v.toDate();
      return d instanceof Date ? d : null;
    }
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
}


