import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class UnidadService {
	private firestore = inject(Firestore);
  private events = inject(EventMonitorService);

	getUnidades(): Observable<any[]> {
		const ref = collection(this.firestore, 'unidades');
		return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
	}

	async addUnidad(unidad: any) {
		const ref = collection(this.firestore, 'unidades');
		const sanitized = this.removeUndefinedDeep(unidad);
		const added = await addDoc(ref, sanitized);
		await this.events.new('Unidades', { id: added.id, ...sanitized });
    if (sanitized?.proyectoId) {
      const pref = doc(this.firestore, 'proyectos', String(sanitized.proyectoId));
      const prev: any = await firstValueFrom(docData(pref));
      const unidadesCount = (prev?.unidadesCount || 0) + 1;
      await updateDoc(pref, { unidadesCount });
    }
		return added;
	}

  getUnidadById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'unidades', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

  async updateUnidad(id: string, changes: any) {
    const ref = doc(this.firestore, 'unidades', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    const sanitized = this.removeUndefinedDeep(changes);
    await updateDoc(ref, sanitized);
    const current = { ...(previous as any), ...sanitized };
    await this.events.edit('Unidades', previous as any, current);
  }

  async deleteUnidad(id: string) {
    const ref = doc(this.firestore, 'unidades', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await deleteDoc(ref);
    await this.events.delete('Unidades', previous as any);
    const prev: any = previous;
    if (prev?.proyectoId) {
      try {
        const pref = doc(this.firestore, 'proyectos', String(prev.proyectoId));
        const pprev: any = await firstValueFrom(docData(pref));
        if (pprev) {
          const unidadesCount = Math.max(0, (pprev?.unidadesCount || 0) - 1);
          await updateDoc(pref, { unidadesCount });
        }
      } catch (error: any) {
        // Si el proyecto no existe o hay un error, solo loguear pero no fallar
        console.warn('Could not update proyecto unidadesCount:', error?.message || error);
      }
    }
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
