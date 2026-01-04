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
          return (response.data || []).map((dbRow: any) => {
            // Calculate comision percentage from comision_total and importe
            let comision: number | undefined = undefined;
            if (dbRow.comision_total != null && dbRow.importe != null && dbRow.importe > 0) {
              comision = (dbRow.comision_total / dbRow.importe) * 100;
            }
            
            return {
              id: dbRow.id,
              date: dbRow.created_at ? new Date(dbRow.created_at).getTime() : undefined,
              type: dbRow.tipo,
              contactoId: dbRow.contacto_id,
              unidadId: dbRow.unidad_id,
              importe: dbRow.importe,
              comisionTotal: dbRow.comision_total,
              comision: comision,
              moneda: dbRow.moneda,
              // Note: contacto and unidad objects would need to be joined if needed
              contacto: dbRow.contacto_id ? { id: dbRow.contacto_id, nombre: '' } : null,
              unidad: dbRow.unidad_id ? { id: dbRow.unidad_id, nombre: '' } : undefined
            } as VentaRecord;
          });
        })
    );
  }

  async addVenta(payload: VentaRecord) {
    // Validate required fields
    if (!payload.type) {
      throw new Error('El tipo de venta es obligatorio');
    }
    if (!payload.contactoId && !payload.contacto?.id) {
      throw new Error('El contacto es obligatorio');
    }
    if (!payload.unidadId && !payload.unidad?.id) {
      throw new Error('La unidad es obligatoria');
    }
    if (payload.importe == null) {
      throw new Error('El importe es obligatorio');
    }
    // Moneda defaults to USD if not provided (as per database schema default)
    if (payload.comision == null && payload.comisionTotal == null) {
      throw new Error('La comisión es obligatoria');
    }
    
    // Calculate comision_total from percentage if comision is provided
    let comisionTotal: number | null = null;
    if (payload.comisionTotal != null) {
      comisionTotal = payload.comisionTotal;
    } else if (payload.comision != null && payload.importe != null) {
      // Calculate total commission from percentage: importe * (comision / 100)
      comisionTotal = (payload.importe * payload.comision) / 100;
    }
    
    // Transform app format to database format
    const dbData: any = {
      contacto_id: payload.contactoId || payload.contacto?.id || null,
      unidad_id: payload.unidadId || payload.unidad?.id || null,
      tipo: payload.type,
      importe: payload.importe,
      comision_total: comisionTotal,
      moneda: payload.moneda || 'USD',
      created_at: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString()
    };
    
    const { data: result, error } = await this.supabase.client
      .from('ventas')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return { id: result.id };
  }
}
