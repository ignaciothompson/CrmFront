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
					return (response.data || []).map((item: any) => {
						const camelCaseItem = this.toCamelCase(item);
						return this.addComputedProperties(camelCaseItem);
					});
				})
		);
	}

	async addUnidad(unidad: any) {
		const sanitized = this.removeUndefinedDeep(unidad);
		
		// Remove fields that don't exist in the database table
		const cleaned = { ...sanitized };
		// Keep ciudad, barrio, ciudadId, barrioId - these are sent to unidades table
		// Keep desarrollador - this is sent to unidades table
		// Keep altura, tamanoTerraza, tamanoGarage, precioGarage - these are sent to unidades table
		delete cleaned.proyectoNombre; // This is just for UI
		// Map fechaEntrega to entrega (database column name)
		if (cleaned.fechaEntrega !== undefined && cleaned.fechaEntrega !== null && cleaned.fechaEntrega !== '') {
			cleaned.entrega = cleaned.fechaEntrega;
		} else if (cleaned.fechaEntrega === '' || cleaned.fechaEntrega === null) {
			// Explicitly set to null if empty string or null
			cleaned.entrega = null;
		}
		// Always remove fechaEntrega, use entrega instead
		delete cleaned.fechaEntrega;
		// Remove UI-only fields that don't exist in database schema
		delete cleaned.acceso;
		delete cleaned.infraestructura;
		delete cleaned.tipoConstruccion;
		delete cleaned.mejorasTrabajo;
		delete cleaned.infraestructuraHabitacional;
		delete cleaned.fuentesAgua;
		delete cleaned.extras; // Legacy field, not used
		// Remove luz, agua, internet - these are not saved to database
		delete cleaned.luz;
		delete cleaned.agua;
		delete cleaned.internet;
		// Keep amenities - transform to array format with id and name
		// amenities is an array of strings (keys), we need to transform it to array of {id, name}
		// Keep terraza, garage - these are stored in unidades table
		// terraza and garage are strings (Si/No/Extra)
		// Remove fields that were removed from database
		delete cleaned.antiguedad; // Removed from database
		delete cleaned.condicion; // Removed from database
		delete cleaned.aptitudSuelo; // Removed from database
		delete cleaned.indiceProductividad; // Removed from database
		// Remove legacy fields that are removed from tables and UI
		delete cleaned.tipo; // Removed from tables and UI
		delete cleaned.unidades; // Removed from tables and UI
		delete cleaned.inicio; // Removed from tables and UI
		// Map estado to estadoComercial (database column name)
		if (cleaned.estado !== undefined) {
			cleaned.estadoComercial = cleaned.estado;
			delete cleaned.estado;
		}
		// Map precioUSD to precio (always USD, no need to store moneda)
		// IMPORTANT: Do this BEFORE deleting precioUSD
		if (cleaned.precioUSD !== undefined && cleaned.precioUSD !== null && cleaned.precioUSD !== '') {
			cleaned.precio = cleaned.precioUSD;
		}
		// Delete precioUSD after mapping (it's redundant with precio)
		delete cleaned.precioUSD;
		// Remove moneda field - we only manage USD, no need to store it
		delete cleaned.moneda;
		// Ensure precio is set (required field)
		if (cleaned.precio === undefined || cleaned.precio === null || cleaned.precio === '') {
			throw new Error('El precio es obligatorio');
		}
		
		// Transform amenities array to format [{id: string, name: string}]
		if (cleaned.amenities && Array.isArray(cleaned.amenities)) {
			cleaned.amenities = cleaned.amenities.map((key: string) => ({
				id: key,
				name: key
			}));
		} else {
			cleaned.amenities = [];
		}
		
		// Ensure tipoUnidad maps to tipo_unidad (snake_case conversion handles this)
		// Generate UUID for new unidad if not provided
		if (!cleaned.id) {
			cleaned.id = crypto.randomUUID();
		}
		
		// Add timestamps (will be converted to created_at, updated_at, deleted_at by toSnakeCase)
		const now = new Date().toISOString();
		cleaned.createdAt = now;
		cleaned.updatedAt = now;
		// deleted_at is null by default (not deleted) - must be explicitly set
		cleaned.deletedAt = null;
		
		// Ensure proyectoId is included if present (will be converted to proyecto_id)
		// proyectoId is already in cleaned from sanitized, just ensure it's a string if present
		if (cleaned.proyectoId !== undefined && cleaned.proyectoId !== null && cleaned.proyectoId !== '') {
			cleaned.proyectoId = String(cleaned.proyectoId);
		} else {
			cleaned.proyectoId = null;
		}
		
		// Map ciudad/barrio IDs to ciudad_id/barrio_id (foreign keys)
		// ciudad and barrio from form are ID strings, need to convert to integers for foreign keys
		if (cleaned.ciudadId !== undefined && cleaned.ciudadId !== null && cleaned.ciudadId !== '') {
			cleaned.ciudadId = parseInt(String(cleaned.ciudadId), 10);
			if (isNaN(cleaned.ciudadId)) {
				delete cleaned.ciudadId;
			}
		} else if (cleaned.ciudad !== undefined && cleaned.ciudad !== null && cleaned.ciudad !== '') {
			// ciudad is the ID string from the select dropdown
			const ciudadIdNum = parseInt(String(cleaned.ciudad), 10);
			if (!isNaN(ciudadIdNum)) {
				cleaned.ciudadId = ciudadIdNum;
			}
			// Keep ciudad as string (name) if it's not a number, otherwise delete it
			if (!isNaN(parseInt(String(cleaned.ciudad), 10))) {
				delete cleaned.ciudad; // Remove ID string, we have ciudad_id
			}
		} else {
			cleaned.ciudadId = null;
		}
		// Always remove ciudad varchar field (removed from table, only ciudad_id is saved)
		delete cleaned.ciudad;
		
		if (cleaned.barrioId !== undefined && cleaned.barrioId !== null && cleaned.barrioId !== '') {
			cleaned.barrioId = parseInt(String(cleaned.barrioId), 10);
			if (isNaN(cleaned.barrioId)) {
				delete cleaned.barrioId;
			}
		} else if (cleaned.barrio !== undefined && cleaned.barrio !== null && cleaned.barrio !== '') {
			// barrio is the ID string from the select dropdown
			const barrioIdNum = parseInt(String(cleaned.barrio), 10);
			if (!isNaN(barrioIdNum)) {
				cleaned.barrioId = barrioIdNum;
			}
		} else {
			cleaned.barrioId = null;
		}
		// Always remove barrio varchar field (removed from table, only barrio_id is saved)
		delete cleaned.barrio;
		
		// Transform camelCase to snake_case for database
		const dbData = this.toSnakeCase(cleaned);
		
		// Debug: Log the data being sent to Supabase
		console.log('Fields being sent to Supabase (unidades table):', Object.keys(dbData));
		console.log('Full payload:', dbData);
		
		const { data, error } = await this.supabase.client
			.from('unidades')
			.insert(dbData)
			.select()
			.single();
		
		if (error) {
			console.error('Supabase insert error:', error);
			console.error('Error details:', {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code
			});
			throw error;
		}
		
		if (!data || !data.id) {
			console.error('Insert succeeded but no data returned:', { data, error });
			throw new Error('Error al crear la unidad: no se recibió respuesta del servidor');
		}
		
		console.log('Unidad creada exitosamente:', data);
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
          const camelCaseItem = this.toCamelCase(response.data);
          return this.addComputedProperties(camelCaseItem);
        })
    );
  }

  async updateUnidad(id: string, changes: any) {
    const previous = await firstValueFrom(this.getUnidadById(id));
    const sanitized = this.removeUndefinedDeep(changes);
    // Remove fields that don't exist in the database table
    const cleaned = { ...sanitized };
    // Keep ciudad, barrio, ciudadId, barrioId - these are sent to unidades table
    // Keep desarrollador - this is sent to unidades table
    // Keep altura, tamanoTerraza, tamanoGarage, precioGarage - these are sent to unidades table
    delete cleaned.proyectoNombre; // This is just for UI
    // Map fechaEntrega to entrega (database column name)
    if (cleaned.fechaEntrega !== undefined && cleaned.fechaEntrega !== null && cleaned.fechaEntrega !== '') {
      cleaned.entrega = cleaned.fechaEntrega;
    } else if (cleaned.fechaEntrega === '' || cleaned.fechaEntrega === null) {
      // Explicitly set to null if empty string or null
      cleaned.entrega = null;
    }
    // Always remove fechaEntrega, use entrega instead
    delete cleaned.fechaEntrega;
    // Remove UI-only fields that don't exist in database schema
    delete cleaned.acceso;
    delete cleaned.infraestructura;
    delete cleaned.tipoConstruccion;
    delete cleaned.mejorasTrabajo;
    delete cleaned.infraestructuraHabitacional;
    delete cleaned.fuentesAgua;
    delete cleaned.extras; // Legacy field, not used
    // Remove luz, agua, internet - these are not saved to database
    delete cleaned.luz;
    delete cleaned.agua;
    delete cleaned.internet;
    // Keep amenities - transform to array format with id and name
    // Keep terraza, garage - these are stored in unidades table
    // Remove fields that were removed from database
    delete cleaned.antiguedad; // Removed from database
    delete cleaned.condicion; // Removed from database
    delete cleaned.aptitudSuelo; // Removed from database
    delete cleaned.indiceProductividad; // Removed from database
    // Remove legacy fields that are removed from tables and UI
    delete cleaned.tipo; // Removed from tables and UI
    delete cleaned.unidades; // Removed from tables and UI
    delete cleaned.inicio; // Removed from tables and UI
    // Map estado to estadoComercial (database column name)
    if (cleaned.estado !== undefined) {
      cleaned.estadoComercial = cleaned.estado;
      delete cleaned.estado;
    }
    // Map precioUSD to precio (always USD, no need to store moneda)
    // IMPORTANT: Do this BEFORE deleting precioUSD
    if (cleaned.precioUSD !== undefined && cleaned.precioUSD !== null && cleaned.precioUSD !== '') {
      cleaned.precio = cleaned.precioUSD;
    }
    // Delete precioUSD after mapping (it's redundant with precio)
    delete cleaned.precioUSD;
    // Remove moneda field - we only manage USD, no need to store it
    delete cleaned.moneda;
    
    // Map ciudad/barrio IDs to ciudad_id/barrio_id (foreign keys)
    // ciudad and barrio from form are ID strings, need to convert to integers for foreign keys
    if (cleaned.ciudadId !== undefined && cleaned.ciudadId !== null && cleaned.ciudadId !== '') {
      cleaned.ciudadId = parseInt(String(cleaned.ciudadId), 10);
      if (isNaN(cleaned.ciudadId)) {
        delete cleaned.ciudadId;
      }
    } else if (cleaned.ciudad !== undefined && cleaned.ciudad !== null && cleaned.ciudad !== '') {
      // ciudad is the ID string from the select dropdown
      const ciudadIdNum = parseInt(String(cleaned.ciudad), 10);
      if (!isNaN(ciudadIdNum)) {
        cleaned.ciudadId = ciudadIdNum;
      }
      // Keep ciudad as string (name) if it's not a number, otherwise delete it
      if (!isNaN(parseInt(String(cleaned.ciudad), 10))) {
        delete cleaned.ciudad; // Remove ID string, we have ciudad_id
      }
    } else {
      // If ciudad is explicitly null/empty, set ciudad_id to null
      if (cleaned.ciudad === null || cleaned.ciudad === '') {
        cleaned.ciudadId = null;
        delete cleaned.ciudad;
      }
    }
    
    if (cleaned.barrioId !== undefined && cleaned.barrioId !== null && cleaned.barrioId !== '') {
      cleaned.barrioId = parseInt(String(cleaned.barrioId), 10);
      if (isNaN(cleaned.barrioId)) {
        delete cleaned.barrioId;
      }
    } else if (cleaned.barrio !== undefined && cleaned.barrio !== null && cleaned.barrio !== '') {
      // barrio is the ID string from the select dropdown
      const barrioIdNum = parseInt(String(cleaned.barrio), 10);
      if (!isNaN(barrioIdNum)) {
        cleaned.barrioId = barrioIdNum;
      }
      // Keep barrio as string (name) if it's not a number, otherwise delete it
      if (!isNaN(parseInt(String(cleaned.barrio), 10))) {
        delete cleaned.barrio; // Remove ID string, we have barrio_id
      }
    } else {
      // If barrio is explicitly null/empty, set barrio_id to null
      if (cleaned.barrio === null || cleaned.barrio === '') {
        cleaned.barrioId = null;
        delete cleaned.barrio;
      }
    }
    
    // Transform amenities array to format [{id: string, name: string}]
    if (cleaned.amenities && Array.isArray(cleaned.amenities)) {
      cleaned.amenities = cleaned.amenities.map((key: string) => ({
        id: key,
        name: key
      }));
    } else if (cleaned.amenities === undefined || cleaned.amenities === null) {
      // Don't update amenities if not provided
      delete cleaned.amenities;
    }
    
    // Update timestamp
    cleaned.updatedAt = new Date().toISOString();
    
    // Ensure proyectoId is included if present (will be converted to proyecto_id)
    if (cleaned.proyectoId !== undefined && cleaned.proyectoId !== null && cleaned.proyectoId !== '') {
      cleaned.proyectoId = String(cleaned.proyectoId);
    } else if (cleaned.proyectoId === '') {
      cleaned.proyectoId = null;
    }
    
    // Map ciudad/barrio IDs to ciudad_id/barrio_id (foreign keys)
    // ciudad and barrio from form are ID strings, need to convert to integers for foreign keys
    if (cleaned.ciudadId !== undefined && cleaned.ciudadId !== null && cleaned.ciudadId !== '') {
      cleaned.ciudadId = parseInt(String(cleaned.ciudadId), 10);
      if (isNaN(cleaned.ciudadId)) {
        delete cleaned.ciudadId;
      }
    } else if (cleaned.ciudad !== undefined && cleaned.ciudad !== null && cleaned.ciudad !== '') {
      // ciudad is the ID string from the select dropdown
      const ciudadIdNum = parseInt(String(cleaned.ciudad), 10);
      if (!isNaN(ciudadIdNum)) {
        cleaned.ciudadId = ciudadIdNum;
      }
      // Keep ciudad as string (name) if it's not a number, otherwise delete it
      if (!isNaN(parseInt(String(cleaned.ciudad), 10))) {
        delete cleaned.ciudad; // Remove ID string, we have ciudad_id
      }
    } else {
      // If ciudad is explicitly null/empty, set ciudad_id to null
      cleaned.ciudadId = null;
    }
    // Always remove ciudad varchar field (removed from table, only ciudad_id is saved)
    delete cleaned.ciudad;
    
    if (cleaned.barrioId !== undefined && cleaned.barrioId !== null && cleaned.barrioId !== '') {
      cleaned.barrioId = parseInt(String(cleaned.barrioId), 10);
      if (isNaN(cleaned.barrioId)) {
        delete cleaned.barrioId;
      }
    } else if (cleaned.barrio !== undefined && cleaned.barrio !== null && cleaned.barrio !== '') {
      // barrio is the ID string from the select dropdown
      const barrioIdNum = parseInt(String(cleaned.barrio), 10);
      if (!isNaN(barrioIdNum)) {
        cleaned.barrioId = barrioIdNum;
      }
      // Keep barrio as string (name) if it's not a number, otherwise delete it
      if (!isNaN(parseInt(String(cleaned.barrio), 10))) {
        delete cleaned.barrio; // Remove ID string, we have barrio_id
      }
    } else {
      // If barrio is explicitly null/empty, set barrio_id to null
      cleaned.barrioId = null;
    }
    // Always remove barrio varchar field (removed from table, only barrio_id is saved)
    delete cleaned.barrio;
    
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

  /**
   * Add computed properties based on estadoComercial for backward compatibility
   * These properties don't exist in the database but are used throughout the app
   */
  private addComputedProperties(unidad: any): any {
    if (!unidad || typeof unidad !== 'object') return unidad;
    
    const estadoComercial = unidad.estadoComercial || '';
    const estadoLower = estadoComercial.toLowerCase();
    
    // Compute vendida: true if estadoComercial is 'Vendida'
    unidad.vendida = estadoLower === 'vendida';
    unidad.sold = unidad.vendida; // Alias for compatibility
    
    // Compute rented: true if estadoComercial is 'En alquiler'
    unidad.rented = estadoLower === 'en alquiler';
    
    // Compute activo: true if unidad is not deleted (deletedAt is null)
    // Note: activo is not stored in DB, but we derive it from deletedAt
    unidad.activo = unidad.deletedAt == null;
    
    // Set disponibilidad based on estadoComercial for compatibility
    if (!unidad.disponibilidad) {
      if (unidad.vendida) {
        unidad.disponibilidad = 'Vendida';
      } else if (unidad.rented) {
        unidad.disponibilidad = 'Rentada';
      } else {
        unidad.disponibilidad = 'Disponible: publicada';
      }
    }
    
    return unidad;
  }
}
