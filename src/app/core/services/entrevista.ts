import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class EntrevistaService {
  private supabase = inject(SupabaseService);
  private events = inject(EventMonitorService);

  getEntrevistas(): Observable<any[]> {
    return from(
      this.supabase.client
        .from('contacto_entrevistas')
        .select(`
          *,
          contactos:contacto_id (
            id,
            nombre,
            apellido
          ),
          unidades:unidad_id (
            id,
            nombre,
            proyecto_id,
            proyectos:proyecto_id (
              id,
              nombre
            )
          )
        `)
        .then(response => {
          if (response.error) throw response.error;
          // Transform to app format with related data
          return (response.data || []).map((item: any) => {
            const contacto = item.contactos;
            const unidad = item.unidades;
            const proyecto = unidad?.proyectos;
            
            return {
              id: item.id,
              contactoId: item.contacto_id,
              unidadId: item.unidad_id,
              comentario: item.comentario,
              fechaISO: item.fecha_iso,
              fecha: item.fecha_iso,
              hora: item.hora,
              lugar: item.lugar,
              location: item.lugar,
              pendiente: item.pendiente !== undefined ? item.pendiente : true, // Default to true if not set
              // Contacto data
              contactoNombre: contacto?.nombre || '',
              contactoApellido: contacto?.apellido || '',
              // Unidad data
              unidadNombre: unidad?.nombre || '',
              proyectoNombre: proyecto?.nombre || ''
            };
          });
        })
    );
  }

  async addEntrevista(entrevista: any) {
    // Map camelCase to snake_case for database
    // Only include fields that are not null/undefined/empty string
    const dbData: any = {};
    
    const contactoId = entrevista.contactoId || entrevista.contacto_id;
    
    if (contactoId) {
      dbData.contacto_id = contactoId;
    }
    
    if (entrevista.unidadId || entrevista.unidad_id) {
      dbData.unidad_id = entrevista.unidadId || entrevista.unidad_id;
    }
    
    if (entrevista.comentario !== undefined && entrevista.comentario !== null && entrevista.comentario !== '') {
      dbData.comentario = entrevista.comentario;
    }
    
    if (entrevista.fechaISO || entrevista.fecha_iso || entrevista.fecha) {
      dbData.fecha_iso = entrevista.fechaISO || entrevista.fecha_iso || entrevista.fecha;
    }
    
    if (entrevista.hora !== undefined && entrevista.hora !== null && entrevista.hora !== '') {
      dbData.hora = entrevista.hora;
    }
    
    if (entrevista.lugar || entrevista.location) {
      dbData.lugar = entrevista.lugar || entrevista.location;
    }
    
    // Set pendiente to true by default when creating
    dbData.pendiente = entrevista.pendiente !== undefined ? entrevista.pendiente : true;
    
    const { data, error } = await this.supabase.client
      .from('contacto_entrevistas')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    
    // Update contacto to set entrevista_pendiente = true
    if (contactoId) {
      const { error: contactoError } = await this.supabase.client
        .from('contactos')
        .update({ entrevista_pendiente: true })
        .eq('id', contactoId);
      
      if (contactoError) {
        console.error('Error updating contacto entrevista_pendiente:', contactoError);
        // Don't throw - the entrevista was created successfully
      }
    }
    
    const current = { id: data.id, ...entrevista };
    await this.events.new('Entrevistas', current);
    return { id: data.id };
  }

  async updateEntrevista(id: string, changes: any) {
    const previous = await firstValueFrom(this.getEntrevistaById(id));
    // Map camelCase to snake_case
    const dbChanges: any = {};
    if (changes.contactoId !== undefined) dbChanges.contacto_id = changes.contactoId;
    if (changes.unidadId !== undefined) dbChanges.unidad_id = changes.unidadId;
    if (changes.comentario !== undefined) dbChanges.comentario = changes.comentario;
    if (changes.fechaISO !== undefined || changes.fecha !== undefined) {
      dbChanges.fecha_iso = changes.fechaISO || changes.fecha;
    }
    if (changes.hora !== undefined) dbChanges.hora = changes.hora;
    if (changes.lugar !== undefined || changes.location !== undefined) {
      dbChanges.lugar = changes.lugar || changes.location;
    }
    if (changes.pendiente !== undefined) {
      dbChanges.pendiente = changes.pendiente;
    }
    const { error } = await this.supabase.client
      .from('contacto_entrevistas')
      .update(dbChanges)
      .eq('id', id);
    if (error) throw error;
    const current = { ...(previous as any), ...changes };
    await this.events.edit('Entrevistas', previous as any, current);
  }

  async marcarCompletada(id: string): Promise<void> {
    const entrevista = await firstValueFrom(this.getEntrevistaById(id));
    if (!entrevista) throw new Error('Entrevista no encontrada');
    
    const contactoId = entrevista.contactoId;
    
    // Update entrevista to pendiente = false
    const { error: entrevistaError } = await this.supabase.client
      .from('contacto_entrevistas')
      .update({ pendiente: false })
      .eq('id', id);
    
    if (entrevistaError) throw entrevistaError;
    
    // Update contacto to entrevista_pendiente = false
    if (contactoId) {
      // Check if there are other pending entrevistas for this contacto
      const { data: otrasEntrevistas, error: checkError } = await this.supabase.client
        .from('contacto_entrevistas')
        .select('id')
        .eq('contacto_id', contactoId)
        .eq('pendiente', true);
      
      if (!checkError) {
        // Only set entrevista_pendiente to false if no other pending entrevistas exist
        if (!otrasEntrevistas || otrasEntrevistas.length === 0) {
          const { error: contactoError } = await this.supabase.client
            .from('contactos')
            .update({ entrevista_pendiente: false })
            .eq('id', contactoId);
          
          if (contactoError) {
            console.error('Error updating contacto entrevista_pendiente:', contactoError);
            // Don't throw - the entrevista was updated successfully
          }
        }
      }
    }
    
    await this.events.edit('Entrevistas', entrevista, { ...entrevista, pendiente: false });
  }

  async deleteEntrevista(id: string) {
    const previous = await firstValueFrom(this.getEntrevistaById(id));
    if (!previous) throw new Error('Entrevista no encontrada');
    
    const contactoId = previous.contactoId;
    
    const { error } = await this.supabase.client
      .from('contacto_entrevistas')
      .delete()
      .eq('id', id);
    if (error) throw error;
    
    // Check if there are other pending entrevistas for this contacto
    if (contactoId) {
      const { data: otrasEntrevistas, error: checkError } = await this.supabase.client
        .from('contacto_entrevistas')
        .select('id')
        .eq('contacto_id', contactoId)
        .eq('pendiente', true);
      
      if (!checkError) {
        // Only set entrevista_pendiente to false if no other pending entrevistas exist
        if (!otrasEntrevistas || otrasEntrevistas.length === 0) {
          const { error: contactoError } = await this.supabase.client
            .from('contactos')
            .update({ entrevista_pendiente: false })
            .eq('id', contactoId);
          
          if (contactoError) {
            console.error('Error updating contacto entrevista_pendiente:', contactoError);
            // Don't throw - the entrevista was deleted successfully
          }
        }
      }
    }
    
    await this.events.delete('Entrevistas', previous as any);
  }

  private getEntrevistaById(id: string): Observable<any | undefined> {
    return from(
      this.supabase.client
        .from('contacto_entrevistas')
        .select('*')
        .eq('id', id)
        .single()
        .then(response => {
          if (response.error) {
            if (response.error.code === 'PGRST116') return undefined; // Not found
            throw response.error;
          }
          // Map snake_case back to camelCase for app compatibility
          const data = response.data;
          return {
            id: data.id,
            contactoId: data.contacto_id,
            unidadId: data.unidad_id,
            comentario: data.comentario,
            fechaISO: data.fecha_iso,
            fecha: data.fecha_iso,
            hora: data.hora,
            lugar: data.lugar,
            location: data.lugar,
            pendiente: data.pendiente !== undefined ? data.pendiente : true
          };
        })
    );
  }
}


