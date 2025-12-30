import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, firstValueFrom } from 'rxjs';
import { EventMonitorService } from './event-monitor.service';

@Injectable({ providedIn: 'root' })
export class ContactoService {
	private supabase = inject(SupabaseService);
  private events = inject(EventMonitorService);

	getContactos(): Observable<any[]> {
		return from(
			this.supabase.client
				.from('contactos')
				.select('*')
				.then(response => {
					if (response.error) throw response.error;
					return response.data || [];
				})
		);
	}

	async addContacto(contacto: any) {
		const { data, error } = await this.supabase.client
			.from('contactos')
			.insert(contacto)
			.select()
			.single();
		if (error) throw error;
		await this.events.new('Contactos', { id: data.id, ...contacto });
		return { id: data.id };
	}

  getContactoById(id: string): Observable<any | undefined> {
    return from(
      this.supabase.client
        .from('contactos')
        .select('*')
        .eq('id', id)
        .single()
        .then(response => {
          if (response.error) {
            if (response.error.code === 'PGRST116') return undefined; // Not found
            throw response.error;
          }
          return response.data;
        })
    );
  }

	async updateContacto(id: string, changes: any) {
		const previous = await firstValueFrom(this.getContactoById(id));
		const { error } = await this.supabase.client
			.from('contactos')
			.update(changes)
			.eq('id', id);
		if (error) throw error;
		const current = { ...(previous as any), ...changes };
		await this.events.edit('Contactos', previous as any, current);
	}

  async deleteContacto(id: string) {
    const previous = await firstValueFrom(this.getContactoById(id));
    const { error } = await this.supabase.client
      .from('contactos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await this.events.delete('Contactos', previous as any);
  }
}
