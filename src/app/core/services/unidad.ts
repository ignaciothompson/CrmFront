import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class UnidadService {
	private supabase = inject(SupabaseService);
  private events = inject(EventMonitorService);

	getUnidades(): Observable<any[]> {
		return from(
			this.supabase.client
				.from('unidades')
				.select('*')
				.then(response => {
					if (response.error) throw response.error;
					// Transform snake_case back to camelCase for app compatibility
					return (response.data || []).map((item: any) => this.toCamelCase(item));
				})
		);
	}

	async addUnidad(unidad: any) {
		const sanitized = this.removeUndefinedDeep(unidad);
		
		// Remove fields that don't exist in the database table
		const cleaned = { ...sanitized };
		// Remove denormalized fields (these come from proyecto, not stored in unidades)
		delete cleaned.city;
		delete cleaned.barrio;
		delete cleaned.ciudad;
		delete cleaned.ciudadId;
		delete cleaned.barrioId;
		delete cleaned.proyectoNombre; // This is just for UI
		delete cleaned.ubicacion; // This might be proyecto.direccion, check if needed
		delete cleaned.entrega; // This is stored in proyectos table, not unidades
		// Remove UI-only fields that don't exist in database schema
		delete cleaned.acceso;
		delete cleaned.infraestructura;
		delete cleaned.tipoConstruccion;
		delete cleaned.mejorasTrabajo;
		delete cleaned.infraestructuraHabitacional;
		delete cleaned.fuentesAgua;
		delete cleaned.altura; // UI-only field, not in database schema
		delete cleaned.extras; // Stored in unidad_amenities table, not in unidades
		delete cleaned.amenities; // Stored in unidad_amenities table, not in unidades
		delete cleaned.precioUSD; // Redundant with precio + moneda
		delete cleaned.pisoProyecto; // UI-only field
		delete cleaned.unidadesTotales; // UI-only field
		delete cleaned.terraza; // UI-only field
		delete cleaned.garage; // UI-only field
		delete cleaned.tamanoTerraza; // UI-only field
		delete cleaned.tamanoGarage; // UI-only field
		delete cleaned.precioGarage; // UI-only field
		delete cleaned.areaComun; // UI-only field
		delete cleaned.equipamiento; // UI-only field
		delete cleaned.tipo; // Legacy field, redundant with tipo_unidad
		delete cleaned.unidades; // Legacy field
		delete cleaned.inicio; // Legacy field
		delete cleaned.tipoPropiedad; // UI-only field, not in database schema
		// Map estado to estadoComercial (database column name)
		if (cleaned.estado !== undefined) {
			cleaned.estadoComercial = cleaned.estado;
			delete cleaned.estado;
		}
		// Map precioUSD to precio (moneda defaults to USD)
		if (cleaned.precioUSD !== undefined) {
			cleaned.precio = cleaned.precioUSD;
			delete cleaned.precioUSD;
			if (!cleaned.moneda) {
				cleaned.moneda = 'USD';
			}
		}
		// Ensure tipoUnidad maps to tipo_unidad (snake_case conversion handles this)
		// Generate UUID for new unidad if not provided
		if (!cleaned.id) {
			cleaned.id = crypto.randomUUID();
		}
		
		// Transform camelCase to snake_case for database
		const dbData = this.toSnakeCase(cleaned);
		
		const { data, error } = await this.supabase.client
			.from('unidades')
			.insert(dbData)
			.select()
			.single();
		
		if (error) throw error;
		
		await this.events.new('Unidades', { id: data.id, ...sanitized });
		return { id: data.id };
	}

  getUnidadById(id: string): Observable<any | undefined> {
    return from(
      this.supabase.client
        .from('unidades')
        .select('*')
        .eq('id', id)
        .single()
        .then(response => {
          if (response.error) {
            if (response.error.code === 'PGRST116') return undefined; // Not found
            throw response.error;
          }
          // Transform snake_case back to camelCase for app compatibility
          return this.toCamelCase(response.data);
        })
    );
  }

  async updateUnidad(id: string, changes: any) {
    const previous = await firstValueFrom(this.getUnidadById(id));
    const sanitized = this.removeUndefinedDeep(changes);
    // Remove fields that don't exist in the database table
    const cleaned = { ...sanitized };
    // Remove denormalized fields (these come from proyecto, not stored in unidades)
    delete cleaned.city;
    delete cleaned.barrio;
    delete cleaned.ciudad;
    delete cleaned.ciudadId;
    delete cleaned.barrioId;
    delete cleaned.proyectoNombre; // This is just for UI
    delete cleaned.ubicacion; // This might be proyecto.direccion, check if needed
    delete cleaned.entrega; // This is stored in proyectos table, not unidades
    // Remove UI-only fields that don't exist in database schema
    delete cleaned.acceso;
    delete cleaned.infraestructura;
    delete cleaned.tipoConstruccion;
    delete cleaned.mejorasTrabajo;
    delete cleaned.infraestructuraHabitacional;
    delete cleaned.fuentesAgua;
    delete cleaned.altura; // UI-only field, not in database schema
    delete cleaned.extras; // Stored in unidad_amenities table, not in unidades
    delete cleaned.amenities; // Stored in unidad_amenities table, not in unidades
    delete cleaned.precioUSD; // Redundant with precio + moneda
    delete cleaned.pisoProyecto; // UI-only field
    delete cleaned.unidadesTotales; // UI-only field
    delete cleaned.terraza; // UI-only field
    delete cleaned.garage; // UI-only field
    delete cleaned.tamanoTerraza; // UI-only field
    delete cleaned.tamanoGarage; // UI-only field
    delete cleaned.precioGarage; // UI-only field
    delete cleaned.areaComun; // UI-only field
    delete cleaned.equipamiento; // UI-only field
    delete cleaned.tipo; // Legacy field, redundant with tipo_unidad
    delete cleaned.unidades; // Legacy field
    delete cleaned.inicio; // Legacy field
    delete cleaned.tipoPropiedad; // UI-only field, not in database schema
    // Map estado to estadoComercial (database column name)
    if (cleaned.estado !== undefined) {
      cleaned.estadoComercial = cleaned.estado;
      delete cleaned.estado;
    }
    // Map precioUSD to precio (moneda defaults to USD)
    if (cleaned.precioUSD !== undefined) {
      cleaned.precio = cleaned.precioUSD;
      delete cleaned.precioUSD;
      if (!cleaned.moneda) {
        cleaned.moneda = 'USD';
      }
    }
    // Ensure tipoUnidad maps to tipo_unidad (snake_case conversion handles this)
    // Transform camelCase to snake_case for database
    const dbChanges = this.toSnakeCase(cleaned);
    const { error } = await this.supabase.client
      .from('unidades')
      .update(dbChanges)
      .eq('id', id);
    if (error) throw error;
    const current = { ...(previous as any), ...sanitized };
    await this.events.edit('Unidades', previous as any, current);
  }

  async deleteUnidad(id: string) {
    const previous = await firstValueFrom(this.getUnidadById(id));
    const { error } = await this.supabase.client
      .from('unidades')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await this.events.delete('Unidades', previous as any);
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

  private toSnakeCase(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(v => this.toSnakeCase(v));
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
      result[snakeKey] = this.toSnakeCase(value);
    }
    return result;
  }

  private toCamelCase(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(v => this.toCamelCase(v));
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = this.toCamelCase(value);
    }
    return result;
  }
}
