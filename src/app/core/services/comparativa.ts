import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComparativaService {
	private firestore = inject(Firestore);

	getComparativas(): Observable<any[]> {
		const ref = collection(this.firestore, 'comparativas');
		return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
	}

	getComparativa(id: string): Observable<any> {
		const ref = doc(this.firestore, `comparativas/${id}`);
		return docData(ref, { idField: 'id' });
	}

	addComparativa(payload: any) {
		const ref = collection(this.firestore, 'comparativas');
		return addDoc(ref, payload);
	}

	deleteComparativa(id: string) {
		const ref = doc(this.firestore, `comparativas/${id}`);
		return deleteDoc(ref);
	}
}
