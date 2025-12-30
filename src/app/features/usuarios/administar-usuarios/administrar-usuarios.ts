import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario';
import { UsuarioData } from '../../../core/models';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioEditModal } from '../usuario-modal/usuario-edit-modal';

@Component({
  selector: 'app-administrar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrar-usuarios.html',
  styleUrl: './administrar-usuarios.css'
})
export class AdministrarUsuarios implements OnInit, OnDestroy {
  usuarios: UsuarioData[] = [];
  filteredUsuarios: UsuarioData[] = [];
  showCreateForm = false;
  newUsuario: any = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    canDelete: false,
    localidades: []
  };
  busy = false;
  private sub?: Subscription;
  
  localidadesOptions = [
    { value: 'norte', label: 'Montevideo' },
    { value: 'sur', label: 'Canelones' },
    { value: 'este', label: 'Maldonado' }
  ];

  private supabase = inject(SupabaseService);

  constructor(
    private usuarioService: UsuarioService,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.sub = this.usuarioService.getUsuarios().subscribe(list => {
      this.usuarios = list || [];
      this.filteredUsuarios = [...this.usuarios];
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetNewUsuario();
    }
  }

  resetNewUsuario(): void {
    this.newUsuario = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      canDelete: false,
      localidades: []
    };
  }

  toggleLocalidad(localidad: string): void {
    const index = this.newUsuario.localidades.indexOf(localidad);
    if (index > -1) {
      this.newUsuario.localidades.splice(index, 1);
    } else {
      this.newUsuario.localidades.push(localidad);
    }
  }

  hasLocalidad(localidades: string[] | undefined, localidad: string): boolean {
    return localidades ? localidades.includes(localidad) : false;
  }

  async createUsuario(): Promise<void> {
    if (!this.newUsuario.nombre || !this.newUsuario.apellido || !this.newUsuario.email || !this.newUsuario.password) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.newUsuario.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.busy = true;
    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: this.newUsuario.email,
        password: this.newUsuario.password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile in Supabase using the Supabase Auth UID as document ID
      const usuarioData: UsuarioData = {
        nombre: this.newUsuario.nombre,
        apellido: this.newUsuario.apellido,
        email: this.newUsuario.email,
        telefono: this.newUsuario.telefono || '',
        canDelete: this.newUsuario.canDelete || false,
        localidades: this.newUsuario.localidades || []
      };

      // Use updateUsuario which will create the document if it doesn't exist
      await this.usuarioService.updateUsuario(authData.user.id, usuarioData);
      
      alert('Usuario creado correctamente');
      this.resetNewUsuario();
      this.showCreateForm = false;
    } catch (error: any) {
      console.error('Error creating usuario:', error);
      if (error.message?.includes('already registered') || error.code === '23505') {
        alert('Este email ya está en uso');
      } else {
        alert('Error al crear el usuario. Por favor, intente nuevamente.');
      }
    } finally {
      this.busy = false;
    }
  }

  editUsuario(usuario: UsuarioData): void {
    if (!usuario.id) return;
    const modalRef = this.modal.open(UsuarioEditModal, { size: 'lg', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as UsuarioEditModal;
    component.usuarioId = usuario.id;
    modalRef.result.then((result: any) => {
      if (result === true) {
        // Usuario actualizado, la lista se actualizará automáticamente por la suscripción
      }
    }).catch(() => {
      // Modal cerrado sin guardar
    });
  }

  async deleteUsuario(id: string): Promise<void> {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    this.busy = true;
    try {
      await this.usuarioService.deleteUsuario(id);
      alert('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error deleting usuario:', error);
      alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
    } finally {
      this.busy = false;
    }
  }

  getLocalidadesLabel(localidades: string[] | undefined): string {
    if (!localidades || localidades.length === 0) return 'Ninguna';
    return localidades.map(l => {
      const option = this.localidadesOptions.find(opt => opt.value === l);
      return option ? option.label : l;
    }).join(', ');
  }
}

