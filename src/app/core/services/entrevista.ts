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
        .select('*')
        .then(response => {
          if (response.error) throw response.error;
          return response.data || [];
        })
    );
  }

  async addEntrevista(entrevista: any) {
    // Map camelCase to snake_case for database
    const dbData: any = {
      contacto_id: entrevista.contactoId || entrevista.contacto_id,
      unidad_id: entrevista.unidadId || entrevista.unidad_id,
      comentario: entrevista.comentario,
      fecha_iso: entrevista.fechaISO || entrevista.fecha_iso || entrevista.fecha,
      hora: entrevista.hora,
      lugar: entrevista.lugar || entrevista.location
    };
    const { data, error } = await this.supabase.client
      .from('contacto_entrevistas')
      .insert(dbData)
      .select()
      .single();
    if (error) throw error;
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
    const { error } = await this.supabase.client
      .from('contacto_entrevistas')
      .update(dbChanges)
      .eq('id', id);
    if (error) throw error;
    const current = { ...(previous as any), ...changes };
    await this.events.edit('Entrevistas', previous as any, current);
  }

  async deleteEntrevista(id: string) {
    const previous = await firstValueFrom(this.getEntrevistaById(id));
    const { error } = await this.supabase.client
      .from('contacto_entrevistas')
      .delete()
      .eq('id', id);
    if (error) throw error;
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
            location: data.lugar
          };
        })
    );
  }
}


