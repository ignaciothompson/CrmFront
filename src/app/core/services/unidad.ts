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
		const added = await addDoc(ref, unidad);
		await this.events.new('Unidades', { id: added.id, ...unidad });
		return added;
	}

  getUnidadById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'unidades', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

  async updateUnidad(id: string, changes: any) {
    const ref = doc(this.firestore, 'unidades', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await updateDoc(ref, changes);
    const current = { ...(previous as any), ...changes };
    await this.events.edit('Unidades', previous as any, current);
  }

  async deleteUnidad(id: string) {
    const ref = doc(this.firestore, 'unidades', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await deleteDoc(ref);
    await this.events.delete('Unidades', previous as any);
  }
}
