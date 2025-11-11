import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, onAuthStateChanged, User, Unsubscribe } from '@angular/fire/auth';
import { UsuarioService } from '../../core/services/usuario';
import { firstValueFrom } from 'rxjs';

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
  private authUnsubscribe?: Unsubscribe;

  constructor(
    private auth: Auth,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.authUnsubscribe = onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.model.email = user.email || '';
        // Load user profile from Firestore using uid
        const profile = await firstValueFrom(this.usuarioService.getUsuarioById(user.uid));
        if (profile) {
          this.model = { ...this.model, ...profile };
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
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

      if (this.currentUser.uid) {
        await this.usuarioService.updateUsuario(this.currentUser.uid, payload);
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


