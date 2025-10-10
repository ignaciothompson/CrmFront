import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
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
}
