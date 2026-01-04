import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { Barrio } from '../models';

@Injectable({ providedIn: 'root' })
export class BarrioService {
  private supabase = inject(SupabaseService);

  getBarrios(): Observable<Barrio[]> {
    return from(
      this.supabase.client
        .from('barrios')
        .select('*')
        .order('nombre')
        .then(response => {
          if (response.error) throw response.error;
          return response.data || [];
        })
    );
  }

  getBarriosByCiudad(ciudadId: number): Observable<Barrio[]> {
    return from(
      this.supabase.client
        .from('barrios')
        .select('*')
        .eq('ciudad_id', ciudadId)
        .order('nombre')
        .then(response => {
          if (response.error) {
            console.error('Error fetching barrios by ciudad:', response.error);
            throw response.error;
          }
          console.log(`Barrios fetched for ciudad ${ciudadId}:`, response.data);
          return response.data || [];
        })
    );
  }
}

