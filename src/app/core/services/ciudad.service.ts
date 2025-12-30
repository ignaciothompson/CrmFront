import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { Ciudad } from '../models';

@Injectable({ providedIn: 'root' })
export class CiudadService {
  private supabase = inject(SupabaseService);

  getCiudades(): Observable<Ciudad[]> {
    return from(
      this.supabase.client
        .from('ciudades')
        .select('*')
        .order('nombre')
        .then(response => {
          if (response.error) throw response.error;
          return response.data || [];
        })
    );
  }
}

