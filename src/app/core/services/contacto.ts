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
					// Transform database format to app format
					return (response.data || []).map((item: any) => this.fromDbFormat(item));
				})
		);
	}

	async addContacto(contacto: any) {
		// Generate UUID for new contacto if not provided
		if (!contacto.id && !contacto.Id) {
			contacto.id = crypto.randomUUID();
		}
		const dbData = this.toDbFormat(contacto);
		const { data, error } = await this.supabase.client
			.from('contactos')
			.insert(dbData)
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
          return this.fromDbFormat(response.data);
        })
    );
  }

	async updateContacto(id: string, changes: any) {
		const previous = await firstValueFrom(this.getContactoById(id));
		const dbChanges = this.toDbFormat(changes);
		const { error } = await this.supabase.client
			.from('contactos')
			.update(dbChanges)
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

  /**
   * Transform app format to database format
   * Maps capitalized fields to lowercase, handles nested objects
   */
  private toDbFormat(contacto: any): any {
    const dbData: any = {};
    
    // Include id if present (required for inserts)
    if (contacto.id !== undefined) dbData.id = contacto.id;
    if (contacto.Id !== undefined) dbData.id = contacto.Id;
    
    // Map basic fields (capitalized to lowercase)
    if (contacto.Nombre !== undefined) dbData.nombre = contacto.Nombre;
    if (contacto.nombre !== undefined) dbData.nombre = contacto.nombre;
    if (contacto.Apellido !== undefined) dbData.apellido = contacto.Apellido;
    if (contacto.apellido !== undefined) dbData.apellido = contacto.apellido;
    if (contacto.Celular !== undefined) dbData.telefono = contacto.Celular;
    if (contacto.telefono !== undefined) dbData.telefono = contacto.telefono;
    if (contacto.Mail !== undefined) dbData.mail = contacto.Mail;
    if (contacto.mail !== undefined) dbData.mail = contacto.mail;
    if (contacto.Pareja !== undefined) dbData.pareja = contacto.Pareja;
    if (contacto.pareja !== undefined) dbData.pareja = contacto.pareja;
    if (contacto.familia !== undefined) dbData.familia = contacto.familia;
    if (contacto.tipoContacto !== undefined) dbData.tipo_contacto = contacto.tipoContacto;
    if (contacto.tipo_contacto !== undefined) dbData.tipo_contacto = contacto.tipo_contacto;
    if (contacto.estado !== undefined) dbData.estado = contacto.estado;
    
    // Handle direccion object -> JSONB
    if (contacto.direccion) {
      dbData.direccion = {
        ciudad: contacto.direccion.Ciudad || contacto.direccion.ciudad || null,
        barrio: contacto.direccion.Barrio || contacto.direccion.barrio || null
      };
    }
    
    // Handle preferencia object -> JSONB
    if (contacto.preferencia) {
      dbData.preferencia = {
        ciudad: contacto.preferencia.Ciudad || contacto.preferencia.ciudad || null,
        barrio: contacto.preferencia.Barrio || contacto.preferencia.barrio || null,
        tipoResidencia: contacto.preferencia.TipoResidencia || contacto.preferencia.tipoResidencia || null,
        cuartos: contacto.preferencia.Cuartos !== undefined ? contacto.preferencia.Cuartos : (contacto.preferencia.cuartos !== undefined ? contacto.preferencia.cuartos : null)
      };
    }
    
    // Handle seguimiento object -> JSONB
    // Also map to individual columns for backward compatibility
    if (contacto.tipoContacto === 'Seguimiento' || contacto.seguimiento) {
      // Convert timestamp (number) or date string to ISO string
      let ultimoContactoISO: string | null = null;
      if (contacto.ultimoContacto) {
        if (typeof contacto.ultimoContacto === 'number') {
          ultimoContactoISO = new Date(contacto.ultimoContacto).toISOString();
        } else {
          ultimoContactoISO = new Date(contacto.ultimoContacto).toISOString();
        }
      } else if (contacto.seguimiento?.ultimo_contacto) {
        ultimoContactoISO = typeof contacto.seguimiento.ultimo_contacto === 'string' 
          ? contacto.seguimiento.ultimo_contacto 
          : new Date(contacto.seguimiento.ultimo_contacto).toISOString();
      }
      
      let proximoContactoISO: string | null = null;
      if (contacto.proximoContacto) {
        if (typeof contacto.proximoContacto === 'number') {
          proximoContactoISO = new Date(contacto.proximoContacto).toISOString();
        } else {
          proximoContactoISO = new Date(contacto.proximoContacto).toISOString();
        }
      } else if (contacto.seguimiento?.proximo_contacto) {
        proximoContactoISO = typeof contacto.seguimiento.proximo_contacto === 'string'
          ? contacto.seguimiento.proximo_contacto
          : new Date(contacto.seguimiento.proximo_contacto).toISOString();
      }
      
      dbData.seguimiento = {
        tipoSeguimiento: contacto.tipoContacto || contacto.seguimiento?.tipoSeguimiento || null,
        Estado: contacto.estado || contacto.seguimiento?.Estado || null,
        ultimo_contacto: ultimoContactoISO,
        proximo_contacto: proximoContactoISO
      };
      
      // Also set individual timestamp columns for backward compatibility
      dbData.ultimo_contacto = ultimoContactoISO;
      dbData.proximo_contacto = proximoContactoISO;
    } else {
      // Clear seguimiento if not seguimiento type
      dbData.seguimiento = {};
      dbData.ultimo_contacto = null;
      dbData.proximo_contacto = null;
    }
    
    // Handle entrevista_pendiente (if exists in contacto)
    if (contacto.entrevistaPendiente !== undefined) {
      dbData.entrevista_pendiente = contacto.entrevistaPendiente;
    }
    if (contacto.entrevista_pendiente !== undefined) {
      dbData.entrevista_pendiente = contacto.entrevista_pendiente;
    }
    
    // Remove undefined values
    const sanitized: any = {};
    for (const [k, v] of Object.entries(dbData)) {
      if (v !== undefined) {
        sanitized[k] = v;
      }
    }
    
    return sanitized;
  }

  /**
   * Transform database format to app format
   * Maps lowercase fields to capitalized, extracts nested objects
   */
  private fromDbFormat(dbRow: any): any {
    if (!dbRow) return dbRow;
    
    const appData: any = {
      id: dbRow.id,
      Nombre: dbRow.nombre || '',
      Apellido: dbRow.apellido || '',
      Celular: dbRow.telefono || '',
      Mail: dbRow.mail || '',
      Pareja: dbRow.pareja || false,
      familia: dbRow.familia || false,
      tipoContacto: dbRow.tipo_contacto || 'No seguimiento',
      estado: dbRow.estado || '',
      entrevistaPendiente: dbRow.entrevista_pendiente || false
    };
    
    // Extract direccion from JSONB or create empty object
    if (dbRow.direccion && typeof dbRow.direccion === 'object') {
      appData.direccion = {
        Ciudad: dbRow.direccion.ciudad || dbRow.direccion.Ciudad || '',
        Barrio: dbRow.direccion.barrio || dbRow.direccion.Barrio || ''
      };
    } else {
      appData.direccion = { Ciudad: '', Barrio: '' };
    }
    
    // Extract preferencia from JSONB or create empty object
    if (dbRow.preferencia && typeof dbRow.preferencia === 'object') {
      appData.preferencia = {
        Ciudad: dbRow.preferencia.ciudad || dbRow.preferencia.Ciudad || '',
        Barrio: dbRow.preferencia.barrio || dbRow.preferencia.Barrio || '',
        TipoResidencia: dbRow.preferencia.tipoResidencia || dbRow.preferencia.TipoResidencia || '',
        Cuartos: dbRow.preferencia.cuartos !== undefined ? dbRow.preferencia.cuartos : (dbRow.preferencia.Cuartos !== undefined ? dbRow.preferencia.Cuartos : null)
      };
    } else {
      appData.preferencia = { Ciudad: '', Barrio: '', TipoResidencia: '', Cuartos: null };
    }
    
    // Extract seguimiento from JSONB or use individual columns
    if (dbRow.seguimiento && typeof dbRow.seguimiento === 'object') {
      appData.seguimiento = {
        tipoSeguimiento: dbRow.seguimiento.tipoSeguimiento || appData.tipoContacto,
        Estado: dbRow.seguimiento.Estado || dbRow.estado || '',
        ultimo_contacto: dbRow.seguimiento.ultimo_contacto || dbRow.ultimo_contacto,
        proximo_contacto: dbRow.seguimiento.proximo_contacto || dbRow.proximo_contacto
      };
    } else {
      appData.seguimiento = {
        tipoSeguimiento: appData.tipoContacto,
        Estado: appData.estado,
        ultimo_contacto: dbRow.ultimo_contacto,
        proximo_contacto: dbRow.proximo_contacto
      };
    }
    
    // Convert timestamps to date strings for date inputs
    if (dbRow.ultimo_contacto) {
      appData.ultimoContacto = new Date(dbRow.ultimo_contacto).toISOString().split('T')[0];
    }
    if (dbRow.proximo_contacto) {
      appData.proximoContacto = new Date(dbRow.proximo_contacto).toISOString().split('T')[0];
    }
    
    return appData;
  }
}
