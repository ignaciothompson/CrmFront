import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Evento, EventoCategoria, EventoData, EventoTipo } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventMonitorService {
  private firestore = inject(Firestore);

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
    const ref = collection(this.firestore, 'eventos');
    const sanitized = this.removeUndefinedDeep(evento as any);
    await addDoc(ref, sanitized);
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


