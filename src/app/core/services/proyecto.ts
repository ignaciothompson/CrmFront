import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private firestore = inject(Firestore);

  getProyectos(): Observable<any[]> {
    const ref = collection(this.firestore, 'proyectos');
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  addProyecto(proyecto: any) {
    const ref = collection(this.firestore, 'proyectos');
    return addDoc(ref, proyecto);
  }

  getProyectoById(id: string): Observable<any | undefined> {
    const ref = doc(this.firestore, 'proyectos', id);
    return docData(ref, { idField: 'id' }) as Observable<any | undefined>;
  }

  updateProyecto(id: string, changes: any) {
    const ref = doc(this.firestore, 'proyectos', id);
    return updateDoc(ref, changes);
  }
}


