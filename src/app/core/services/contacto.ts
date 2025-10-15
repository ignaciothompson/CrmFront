import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactoService {
	private firestore = inject(Firestore);

	getContactos(): Observable<any[]> {
		const ref = collection(this.firestore, 'contactos');
		return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
	}

	addContacto(contacto: any) {
		const ref = collection(this.firestore, 'contactos');
		return addDoc(ref, contacto);
	}

  getContactoById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'contactos', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

  updateContacto(id: string, changes: any) {
    const ref = doc(this.firestore, 'contactos', id);
    return updateDoc(ref, changes);
  }
}
