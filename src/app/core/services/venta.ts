import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface VentaRecord {
  id?: string;
  date: number; // epoch ms
  type: 'venta' | 'renta';
  contacto: { id: string; nombre: string } | null;
  unidad: { id: string; nombre: string; localidad?: string };
}

@Injectable({ providedIn: 'root' })
export class VentaService {
  private firestore = inject(Firestore);

  getVentas(): Observable<VentaRecord[]> {
    const ref = collection(this.firestore, 'ventas');
    return collectionData(ref, { idField: 'id' }) as Observable<VentaRecord[]>;
  }

  addVenta(payload: VentaRecord) {
    const ref = collection(this.firestore, 'ventas');
    const data: any = { ...payload };
    if (!data.date) data.date = Date.now();
    return addDoc(ref, data);
  }
}
