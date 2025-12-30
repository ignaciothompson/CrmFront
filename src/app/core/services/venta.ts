import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { VentaRecord } from '../models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private supabase = inject(SupabaseService);

  getVentas(): Observable<VentaRecord[]> {
    return from(
      this.supabase.client
        .from('ventas')
        .select('*')
        .then(response => {
          if (response.error) throw response.error;
          // Transform database format to app format
          return (response.data || []).map((dbRow: any) => ({
            id: dbRow.id,
            date: dbRow.fecha ? new Date(dbRow.fecha).getTime() : undefined,
            type: dbRow.tipo,
            contactoId: dbRow.contacto_id,
            unidadId: dbRow.unidad_id,
            importe: dbRow.importe,
            comisionTotal: dbRow.comision_total,
            moneda: dbRow.moneda,
            // Note: contacto and unidad objects would need to be joined if needed
            contacto: dbRow.contacto_id ? { id: dbRow.contacto_id, nombre: '' } : null,
            unidad: dbRow.unidad_id ? { id: dbRow.unidad_id, nombre: '' } : undefined
          })) as VentaRecord[];
        })
    );
  }

  async addVenta(payload: VentaRecord) {
    // Transform app format to database format
    // Normalize date to number first (date is always number in VentaRecord)
    const dateValue: number = payload.date || Date.now();
    
    const dbData: any = {
      contacto_id: payload.contactoId || payload.contacto?.id || null,
      unidad_id: payload.unidadId || payload.unidad?.id || null,
      tipo: payload.type,
      importe: payload.importe || null,
      comision_total: payload.comisionTotal || payload.comision || null,
      moneda: payload.moneda || 'USD',
      fecha: new Date(dateValue).toISOString().split('T')[0]
    };
    
    // Remove undefined/null values
    const sanitized: any = {};
    for (const [k, v] of Object.entries(dbData)) {
      if (v !== undefined && v !== null) {
        sanitized[k] = v;
      }
    }
    
    const { data: result, error } = await this.supabase.client
      .from('ventas')
      .insert(sanitized)
      .select()
      .single();
    if (error) throw error;
    return { id: result.id };
  }
}
