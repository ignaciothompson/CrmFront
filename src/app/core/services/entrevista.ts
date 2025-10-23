import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class EntrevistaService {
  private firestore = inject(Firestore);
  private events = inject(EventMonitorService);

  getEntrevistas(): Observable<any[]> {
    const ref = collection(this.firestore, 'entrevistas');
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  async addEntrevista(entrevista: any) {
    const ref = collection(this.firestore, 'entrevistas');
    const added = await addDoc(ref, entrevista);
    const current = { id: added.id, ...entrevista };
    await this.events.new('Entrevistas', current);
    return added;
  }

  async updateEntrevista(id: string, changes: any) {
    const ref = doc(this.firestore, 'entrevistas', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await updateDoc(ref, changes);
    const current = { ...(previous as any), ...changes };
    await this.events.edit('Entrevistas', previous as any, current);
  }

  async deleteEntrevista(id: string) {
    const ref = doc(this.firestore, 'entrevistas', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await deleteDoc(ref);
    await this.events.delete('Entrevistas', previous as any);
  }
}


