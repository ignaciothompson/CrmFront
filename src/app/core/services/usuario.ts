import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';
import { UsuarioData } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private supabase = inject(SupabaseService);
  private events = inject(EventMonitorService);

  getUsuarios(): Observable<UsuarioData[]> {
    return from(
      this.supabase.client
        .from('usuarios')
        .select('*')
        .then(response => {
          if (response.error) {
            // Handle table not found error (PGRST205) - table might not exist yet
            if (response.error.code === 'PGRST205') {
              console.warn('Usuarios table does not exist. User profiles may not be configured yet.');
              return [];
            }
            throw response.error;
          }
          return response.data || [];
        })
    );
  }

  async getUsuarioByEmail(email: string): Promise<UsuarioData | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) {
        // Handle table not found error (PGRST205) - table might not exist yet
        if (error.code === 'PGRST205') {
          console.warn('Usuarios table does not exist. User profiles may not be configured yet.');
          return null;
        }
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }
      return data || null;
    } catch (error) {
      console.error('Error getting usuario by email:', error);
      return null;
    }
  }

  getUsuarioById(id: string): Observable<UsuarioData | undefined> {
    return from(
      this.supabase.client
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .then(response => {
          if (response.error) {
            // Handle table not found error (PGRST205) - table might not exist yet
            if (response.error.code === 'PGRST205') {
              console.warn('Usuarios table does not exist. User profiles may not be configured yet.');
              return undefined;
            }
            // Log error for debugging but don't throw for "not found" cases
            if (response.error.code === 'PGRST116' || response.error.code === '42P01') {
              console.warn('Usuario not found:', id, response.error);
              return undefined;
            }
            console.error('Error fetching usuario:', response.error);
            throw response.error;
          }
          return response.data || undefined;
        })
    );
  }

  async addUsuario(usuario: UsuarioData) {
    const payload = {
      ...usuario,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const { data, error } = await this.supabase.client
      .from('usuarios')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    await this.events.new('Usuarios', { id: data.id, ...payload });
    return { id: data.id };
  }

  async updateUsuario(id: string, changes: Partial<UsuarioData>) {
    try {
      const previous = await firstValueFrom(this.getUsuarioById(id));
      if (previous) {
        // Document exists, update it
        const payload = {
          ...changes,
          updatedAt: Date.now()
        };
        const { error } = await this.supabase.client
          .from('usuarios')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        const current = { ...(previous as any), ...payload };
        await this.events.edit('Usuarios', previous as any, current);
      } else {
        // Document doesn't exist, create it
        const payload = {
          ...changes,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const { data, error } = await this.supabase.client
          .from('usuarios')
          .insert({ id, ...payload })
          .select()
          .single();
        if (error) throw error;
        await this.events.new('Usuarios', { id, ...payload });
      }
    } catch (error: any) {
      // If error occurs, try to create the document
      const payload = {
        ...changes,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const { data, error: insertError } = await this.supabase.client
        .from('usuarios')
        .upsert({ id, ...payload })
        .select()
        .single();
      if (insertError) throw insertError;
      await this.events.new('Usuarios', { id, ...payload });
    }
  }

  async deleteUsuario(id: string) {
    const previous = await firstValueFrom(this.getUsuarioById(id));
    const { error } = await this.supabase.client
      .from('usuarios')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await this.events.delete('Usuarios', previous as any);
  }
}

