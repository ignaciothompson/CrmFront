import { Component, Input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../../core/services/contacto';
import { CiudadService } from '../../../core/services/ciudad.service';
import { BarrioService } from '../../../core/services/barrio.service';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './contacto-form.html',
  styleUrl: './contacto-form.css'
})
export class ContactoForm {
  @Input() contactoId?: string;

  constructor(
    private router: Router, 
    private contactoService: ContactoService,
    private ciudadService: CiudadService,
    private barrioService: BarrioService,
    public activeModal?: NgbActiveModal
  ) {}

  id?: string;
  model: any = {
    Nombre: '', Apellido: '', Celular: '', Mail: '', Pareja: false, familia: false,
    direccion: { Ciudad: '', Barrio: '' },
    preferencia: { Ciudad: '', Barrio: '', TipoResidencia: '', Cuartos: null },
    tipoContacto: 'No seguimiento',
    estado: '',
    ultimoContacto: '',
    proximoContacto: ''
  };
  ciudades: Array<{ value: string; label: string }> = [];
  barriosDireccion: Array<{ value: string; label: string }> = [];
  barriosPreferencia: Array<{ value: string; label: string }> = [];

  ngOnInit(): void {
    // Siempre abrimos como modal - si no hay activeModal, redirigir a contactos
    if (!this.activeModal) {
      this.router.navigate(['/contactos']);
      return;
    }

    // Load ciudades from database
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades.map(c => ({ value: String(c.id), label: c.nombre }));
      },
      error: (error) => {
        alert('Error al cargar las ciudades. Por favor, recargue la página.');
      }
    });

    this.id = this.contactoId;
    if (this.id) {
      this.contactoService.getContactoById(this.id).subscribe(c => {
        if (!c) return;
        this.model = { ...this.model, ...c };
        // Convert timestamps to date strings for date inputs
        if (c.ultimoContacto) {
          this.model.ultimoContacto = new Date(c.ultimoContacto).toISOString().split('T')[0];
        }
        if (c.proximoContacto) {
          this.model.proximoContacto = new Date(c.proximoContacto).toISOString().split('T')[0];
        }
        this.syncFamiliaFlag();
        this.loadBarriosForDireccion();
        this.loadBarriosForPreferencia();
      });
    }
  }

  onCiudadDireccionChange(): void { 
    this.model.direccion.Barrio = ''; 
    this.loadBarriosForDireccion(); 
  }
  
  onCiudadPreferenciaChange(): void { 
    this.model.preferencia.Barrio = ''; 
    this.loadBarriosForPreferencia(); 
  }
  
  onParejaChange(): void { this.syncFamiliaFlag(); }

  private syncFamiliaFlag(): void { if (!this.model.Pareja) this.model.familia = false; }

  private loadBarriosForDireccion(): void {
    const ciudadId = this.model.direccion?.Ciudad;
    if (!ciudadId) {
      this.barriosDireccion = [];
      return;
    }
    const ciudadIdNum = parseInt(String(ciudadId), 10);
    if (isNaN(ciudadIdNum)) {
      this.barriosDireccion = [];
      return;
    }
    this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe({
      next: (barrios) => {
        this.barriosDireccion = barrios.map(b => ({ value: b.nombre, label: b.nombre }));
      },
      error: (error) => {
        this.barriosDireccion = [];
      }
    });
  }

  private loadBarriosForPreferencia(): void {
    const ciudadId = this.model.preferencia?.Ciudad;
    if (!ciudadId) {
      this.barriosPreferencia = [];
      return;
    }
    const ciudadIdNum = parseInt(String(ciudadId), 10);
    if (isNaN(ciudadIdNum)) {
      this.barriosPreferencia = [];
      return;
    }
    this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe({
      next: (barrios) => {
        this.barriosPreferencia = barrios.map(b => ({ value: b.nombre, label: b.nombre }));
      },
      error: (error) => {
        this.barriosPreferencia = [];
      }
    });
  }

  save(): void {
    // Clean payload: ensure nested objects exist and preserve actual values
    const payload: any = {
      Nombre: this.model.Nombre ?? '',
      Apellido: this.model.Apellido ?? '',
      Celular: this.model.Celular ?? '',
      Mail: this.model.Mail ?? '',
      Pareja: this.model.Pareja ?? false,
      familia: this.model.familia ?? false,
      direccion: {
        Ciudad: this.model.direccion?.Ciudad ?? '',
        Barrio: this.model.direccion?.Barrio ?? ''
      },
      preferencia: {
        Ciudad: this.model.preferencia?.Ciudad ?? '',
        Barrio: this.model.preferencia?.Barrio ?? '',
        TipoResidencia: this.model.preferencia?.TipoResidencia ?? '',
        Cuartos: this.model.preferencia?.Cuartos ?? null
      },
      tipoContacto: this.model.tipoContacto ?? 'No seguimiento'
    };

    // Only add seguimiento fields if tipoContacto is 'Seguimiento'
    if (this.model.tipoContacto === 'Seguimiento') {
      payload.estado = this.model.estado ?? '';
      // Convert date strings to timestamps
      if (this.model.ultimoContacto) {
        payload.ultimoContacto = new Date(this.model.ultimoContacto).getTime();
      }
      if (this.model.proximoContacto) {
        payload.proximoContacto = new Date(this.model.proximoContacto).getTime();
      }
    } else {
      // Clear seguimiento fields if not seguimiento
      payload.estado = '';
      payload.ultimoContacto = null;
      payload.proximoContacto = null;
    }

    if (this.id) {
      this.contactoService.updateContacto(this.id, payload).then(() => {
        if (this.activeModal) {
          this.activeModal.close(true);
        }
      }).catch((error) => {
        alert('Error al guardar el contacto. Por favor, intente nuevamente.');
      });
    } else {
      this.contactoService.addContacto(payload).then(() => {
        if (this.activeModal) {
          this.activeModal.close(true);
        }
      }).catch((error) => {
        alert('Error al guardar el contacto. Por favor, intente nuevamente.');
      });
    }
  }

  cancel(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
    } else {
      this.router.navigate(['/contactos']);
    }
  }
}
