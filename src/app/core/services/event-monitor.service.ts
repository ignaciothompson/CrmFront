import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Evento, EventoCategoria, EventoData, EventoTipo } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventMonitorService {
  private supabase = inject(SupabaseService);

  async new<T>(categoria: EventoCategoria, current: T, usuario?: string) {
    const evento: any = {
      tipo: 'Nuevo',
      categoria,
      fecha: new Date().toISOString(),
      data: { current }
    };
    if (usuario != null) evento.usuario = usuario;
    await this.persist(evento as Evento<T>);
  }

  async delete<T>(categoria: EventoCategoria, previous: T, usuario?: string) {
    const evento: any = {
      tipo: 'Eliminado',
      categoria,
      fecha: new Date().toISOString(),
      data: { current: previous }
    };
    if (usuario != null) evento.usuario = usuario;
    await this.persist(evento as Evento<T>);
  }

  async edit<T extends Record<string, any>>(categoria: EventoCategoria, previous: T, current: T, usuario?: string) {
    const changes = this.getChanges(previous, current);
    const evento: any = {
      tipo: 'Editado',
      categoria,
      fecha: new Date().toISOString(),
      data: { current, previous, changes }
    };
    if (usuario != null) evento.usuario = usuario;
    await this.persist(evento as Evento<T>);
  }

  private async persist<T>(evento: Evento<T>) {
    // Transform to database format: use data_json instead of data
    // Ensure fecha is always an ISO string for Supabase
    let fechaValue: string;
    if (evento.fecha) {
      fechaValue = typeof evento.fecha === 'string' ? evento.fecha : new Date(evento.fecha).toISOString();
    } else {
      fechaValue = new Date().toISOString();
    }
    
    const dbData: any = {
      tipo: evento.tipo,
      categoria: evento.categoria,
      fecha: fechaValue,
      data_json: evento.data || {},
      entidad_id: (evento.data as any)?.current?.id || null,
      usuario_id: (evento as any).usuario || null
    };
    
    // Generate UUID for id if not provided
    if (!dbData.id) {
      dbData.id = crypto.randomUUID();
    }
    
    const sanitized = this.removeUndefinedDeep(dbData);
    
    const { error } = await this.supabase.client
      .from('eventos')
      .insert(sanitized);
    if (error) throw error;
  }

  private getChanges(oldObj: Record<string, any>, newObj: Record<string, any>) {
    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    for (const key of Object.keys(newObj)) {
      if (Object.prototype.hasOwnProperty.call(oldObj, key) && oldObj[key] !== newObj[key]) {
        changes[key] = { oldValue: oldObj[key], newValue: newObj[key] };
      }
    }
    return changes;
  }

  private removeUndefinedDeep(value: any): any {
    if (Array.isArray(value)) {
      return value.map(v => this.removeUndefinedDeep(v));
    }
    if (value && typeof value === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(value)) {
        if (v === undefined) continue;
        out[k] = this.removeUndefinedDeep(v);
      }
      return out;
    }
    return value;
  }
}


