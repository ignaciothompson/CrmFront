import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class ContactoService {
	private firestore = inject(Firestore);
  private events = inject(EventMonitorService);

	getContactos(): Observable<any[]> {
		const ref = collection(this.firestore, 'contactos');
		return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
	}

	async addContacto(contacto: any) {
		const ref = collection(this.firestore, 'contactos');
		const added = await addDoc(ref, contacto);
		await this.events.new('Contactos', { id: added.id, ...contacto });
		return added;
	}

  getContactoById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'contactos', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

	async updateContacto(id: string, changes: any) {
		const ref = doc(this.firestore, 'contactos', id);
		const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
		await updateDoc(ref, changes);
		const current = { ...(previous as any), ...changes };
		await this.events.edit('Contactos', previous as any, current);
	}

  async deleteContacto(id: string) {
    const ref = doc(this.firestore, 'contactos', id);
    const previous = await firstValueFrom(docData(ref, { idField: 'id' }));
    await deleteDoc(ref);
    await this.events.delete('Contactos', previous as any);
  }
}
