import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private supabase = inject(SupabaseService);

  getProyectos(): Observable<any[]> {
    return from(
      this.supabase.client
        .from('proyectos')
        .select('*')
        .then(response => {
          if (response.error) {
            console.error('Error fetching proyectos:', response.error);
            throw response.error;
          }
          // Map ciudad_id/barrio_id to ciudad/barrio for backward compatibility
          return (response.data || []).map((p: any) => ({
            ...p,
            ciudad: p.ciudad_id ? String(p.ciudad_id) : p.ciudad,
            barrio: p.barrio_id ? String(p.barrio_id) : p.barrio
          }));
        })
    );
  }

  async addProyecto(proyecto: any) {
    // Only save proyectoNombre and proyectoId (both optional) to proyectos table
    const dbData: any = {};
    
    // Generate ID if not provided (proyectos table requires id)
    if (!proyecto.id) {
      // Generate a UUID-like string ID
      dbData.id = crypto.randomUUID();
    } else {
      dbData.id = proyecto.id;
    }
    
    // Only include proyectoNombre if provided (optional)
    if (proyecto.nombre !== undefined && proyecto.nombre !== null && proyecto.nombre !== '') {
      dbData.nombre = proyecto.nombre;
    }
    
    // proyectoId is optional - only include if provided
    // Note: proyectoId might refer to a parent proyecto or similar, but based on requirements
    // we only save nombre and proyectoId (if proyectoId field exists in proyectos table)
    if (proyecto.proyectoId !== undefined && proyecto.proyectoId !== null && proyecto.proyectoId !== '') {
      dbData.proyecto_id = proyecto.proyectoId;
    }
    
    const { data, error } = await this.supabase.client
      .from('proyectos')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
    return { id: data.id };
  }

  getProyectoById(id: string): Observable<any | undefined> {
    return from(
      this.supabase.client
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single()
        .then(response => {
          if (response.error) {
            if (response.error.code === 'PGRST116') return undefined; // Not found
            throw response.error;
          }
          // Map ciudad_id/barrio_id to ciudad/barrio for backward compatibility
          const data = response.data;
          return {
            ...data,
            ciudad: data.ciudad_id ? String(data.ciudad_id) : data.ciudad,
            barrio: data.barrio_id ? String(data.barrio_id) : data.barrio
          };
        })
    );
  }

  async updateProyecto(id: string, changes: any) {
    // Only update proyectoNombre and proyectoId (both optional) in proyectos table
    const dbChanges: any = {};
    
    // Only include nombre if provided
    if (changes.nombre !== undefined && changes.nombre !== null && changes.nombre !== '') {
      dbChanges.nombre = changes.nombre;
    }
    
    // proyectoId is optional - only include if provided
    if (changes.proyectoId !== undefined && changes.proyectoId !== null && changes.proyectoId !== '') {
      dbChanges.proyecto_id = changes.proyectoId;
    } else if (changes.proyectoId === null || changes.proyectoId === '') {
      // Explicitly set to null if provided as empty/null
      dbChanges.proyecto_id = null;
    }
    
    // Only update if there are changes
    if (Object.keys(dbChanges).length === 0) {
      return; // No changes to apply
    }
    
    const { error } = await this.supabase.client
      .from('proyectos')
      .update(dbChanges)
      .eq('id', id);
    if (error) throw error;
  }

  async deleteProyecto(id: string) {
    const { error } = await this.supabase.client
      .from('proyectos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}


