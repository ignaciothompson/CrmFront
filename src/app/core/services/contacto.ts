import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
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
}
