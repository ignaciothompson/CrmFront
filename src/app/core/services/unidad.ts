import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnidadService {
	private firestore = inject(Firestore);

	getUnidades(): Observable<any[]> {
		const ref = collection(this.firestore, 'unidades');
		return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
	}

	addUnidad(unidad: any) {
		const ref = collection(this.firestore, 'unidades');
		return addDoc(ref, unidad);
	}

  getUnidadById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'unidades', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

  updateUnidad(id: string, changes: any) {
    const ref = doc(this.firestore, 'unidades', id);
    return updateDoc(ref, changes);
  }
}
