import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { UsuarioService } from '../../../core/services/usuario';
import { firstValueFrom } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css'
})
export class Usuario implements OnInit, OnDestroy {
  currentUser: User | null = null;
  model: any = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  };
  busy = false;
  private supabase = inject(SupabaseService);
  private authSubscription?: { data: { subscription: any } };

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    // Get initial user
    this.loadUser();

    // Subscribe to auth state changes
    const { data } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user ?? null;
      if (session?.user) {
        this.model.email = session.user.email || '';
        // Load user profile from Supabase using uid
        const profile = await firstValueFrom(this.usuarioService.getUsuarioById(session.user.id));
        if (profile) {
          this.model = { ...this.model, ...profile };
        }
      }
    });
    this.authSubscription = { data };
  }

  async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUser = user;
    if (user) {
      this.model.email = user.email || '';
      const profile = await firstValueFrom(this.usuarioService.getUsuarioById(user.id));
      if (profile) {
        this.model = { ...this.model, ...profile };
      }
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription?.data?.subscription) {
      this.authSubscription.data.subscription.unsubscribe();
    }
  }

  async save(): Promise<void> {
    if (!this.currentUser) return;
    if (!this.model.nombre || !this.model.apellido) {
      alert('Por favor complete nombre y apellido');
      return;
    }

    this.busy = true;
    try {
      const payload = {
        nombre: this.model.nombre,
        apellido: this.model.apellido,
        email: this.model.email,
        telefono: this.model.telefono || ''
      };

      if (this.currentUser.id) {
        await this.usuarioService.updateUsuario(this.currentUser.id, payload);
        alert('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil. Por favor, intente nuevamente.');
    } finally {
      this.busy = false;
    }
  }
}


