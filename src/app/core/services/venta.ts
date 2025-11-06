import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface VentaRecord {
  id?: string;
  date: number; // epoch ms
  type: 'venta' | 'renta';
  contacto: { id: string; nombre: string } | null;
  unidad: { id: string; nombre: string; localidad?: string };
  importe?: number; // Valor de la venta/renta
  comision?: number; // Porcentaje de comisión (ej: 3.5 para 3.5%)
  precioUnitario?: number; // Precio de la unidad (usado para calcular comisión si no se especifica)
  meses?: number; // Meses de duración de la renta (solo para tipo renta)
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
    // Limpiar valores undefined antes de guardar (Firestore no acepta undefined)
    const sanitized = this.removeUndefinedDeep(data);
    return addDoc(ref, sanitized);
  }

  private removeUndefinedDeep(value: any): any {
    if (Array.isArray(value)) {
      return value.map(v => this.removeUndefinedDeep(v));
    }
    if (value && typeof value === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(value)) {
        if (v === undefined) continue;
        out[k] = this.removeUndefinedDeep(v);
      }
      return out;
    }
    return value;
  }
}
