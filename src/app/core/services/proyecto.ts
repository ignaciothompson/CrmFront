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
    // Transform ciudad/barrio strings to ciudad_id/barrio_id if needed
    const dbData: any = { ...proyecto };
    
    // Generate ID if not provided (proyectos table requires id)
    if (!dbData.id) {
      // Generate a UUID-like string ID
      dbData.id = crypto.randomUUID();
    }
    
    // Handle ciudad_id - convert string to number if needed
    if (dbData.ciudad_id !== undefined) {
      dbData.ciudad_id = typeof dbData.ciudad_id === 'string' ? parseInt(dbData.ciudad_id, 10) : dbData.ciudad_id;
      if (isNaN(dbData.ciudad_id)) delete dbData.ciudad_id;
    } else if (dbData.ciudad !== undefined) {
      // Legacy support: if ciudad is provided as string ID, convert it
      const ciudadId = typeof dbData.ciudad === 'string' ? parseInt(dbData.ciudad, 10) : dbData.ciudad;
      if (!isNaN(ciudadId)) {
        dbData.ciudad_id = ciudadId;
        delete dbData.ciudad;
      }
    }
    
    // Handle barrio_id - convert string to number if needed
    if (dbData.barrio_id !== undefined) {
      dbData.barrio_id = typeof dbData.barrio_id === 'string' ? parseInt(dbData.barrio_id, 10) : dbData.barrio_id;
      if (isNaN(dbData.barrio_id)) delete dbData.barrio_id;
    } else if (dbData.barrio !== undefined) {
      // Legacy support: if barrio is provided as string ID, convert it
      const barrioId = typeof dbData.barrio === 'string' ? parseInt(dbData.barrio, 10) : dbData.barrio;
      if (!isNaN(barrioId)) {
        dbData.barrio_id = barrioId;
        delete dbData.barrio;
      }
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
    // Transform ciudad/barrio strings to ciudad_id/barrio_id if needed
    const dbChanges: any = { ...changes };
    
    // Handle ciudad_id - convert string to number if needed
    if (dbChanges.ciudad_id !== undefined) {
      dbChanges.ciudad_id = typeof dbChanges.ciudad_id === 'string' ? parseInt(dbChanges.ciudad_id, 10) : dbChanges.ciudad_id;
      if (isNaN(dbChanges.ciudad_id)) delete dbChanges.ciudad_id;
    } else if (dbChanges.ciudad !== undefined) {
      // Legacy support: if ciudad is provided as string ID, convert it
      const ciudadId = typeof dbChanges.ciudad === 'string' ? parseInt(dbChanges.ciudad, 10) : dbChanges.ciudad;
      if (!isNaN(ciudadId)) {
        dbChanges.ciudad_id = ciudadId;
        delete dbChanges.ciudad;
      }
    }
    
    // Handle barrio_id - convert string to number if needed
    if (dbChanges.barrio_id !== undefined) {
      dbChanges.barrio_id = typeof dbChanges.barrio_id === 'string' ? parseInt(dbChanges.barrio_id, 10) : dbChanges.barrio_id;
      if (isNaN(dbChanges.barrio_id)) delete dbChanges.barrio_id;
    } else if (dbChanges.barrio !== undefined) {
      // Legacy support: if barrio is provided as string ID, convert it
      const barrioId = typeof dbChanges.barrio === 'string' ? parseInt(dbChanges.barrio, 10) : dbChanges.barrio;
      if (!isNaN(barrioId)) {
        dbChanges.barrio_id = barrioId;
        delete dbChanges.barrio;
      }
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


