import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);

  get currentUser$(): Observable<User | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map(response => response.data.user)
    );
  }

  get currentUser(): Promise<User | null> {
    return this.supabase.auth.getUser().then(response => response.data.user);
  }

  get session$(): Observable<any> {
    return from(this.supabase.auth.getSession()).pipe(
      map(response => response.data.session)
    );
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}
