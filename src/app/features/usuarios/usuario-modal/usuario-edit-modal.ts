import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioService, UsuarioData } from '../../../core/services/usuario';

@Component({
  selector: 'app-usuario-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-edit-modal.html',
  styleUrl: './usuario-edit-modal.css'
})
export class UsuarioEditModal implements OnInit {
  @Input() usuarioId?: string;

  activeModal = inject(NgbActiveModal);
  private usuarioService = inject(UsuarioService);

  model: UsuarioData = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    canDelete: false,
    localidades: []
  };
  busy = false;

  localidadesOptions = [
    { value: 'norte', label: 'Montevideo' },
    { value: 'sur', label: 'Canelones' },
    { value: 'este', label: 'Maldonado' }
  ];

  ngOnInit(): void {
    if (this.usuarioId) {
      this.usuarioService.getUsuarioById(this.usuarioId).subscribe((usuario: UsuarioData | undefined) => {
        if (usuario) {
          this.model = {
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            email: usuario.email || '',
            telefono: usuario.telefono || '',
            canDelete: usuario.canDelete || false,
            localidades: usuario.localidades || []
          };
        }
      });
    }
  }

  toggleLocalidad(localidad: string): void {
    if (!this.model.localidades) {
      this.model.localidades = [];
    }
    const index = this.model.localidades.indexOf(localidad);
    if (index > -1) {
      this.model.localidades.splice(index, 1);
    } else {
      this.model.localidades.push(localidad);
    }
  }

  hasLocalidad(localidad: string): boolean {
    return this.model.localidades ? this.model.localidades.includes(localidad) : false;
  }

  async save(): Promise<void> {
    if (!this.usuarioId || !this.model.nombre || !this.model.apellido) {
      alert('Por favor complete nombre y apellido');
      return;
    }

    this.busy = true;
    try {
      const changes: Partial<UsuarioData> = {
        nombre: this.model.nombre,
        apellido: this.model.apellido,
        telefono: this.model.telefono || '',
        canDelete: this.model.canDelete || false,
        localidades: this.model.localidades || []
      };

      await this.usuarioService.updateUsuario(this.usuarioId, changes);
      this.activeModal.close(true);
    } catch (error) {
      console.error('Error updating usuario:', error);
      alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
    } finally {
      this.busy = false;
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
