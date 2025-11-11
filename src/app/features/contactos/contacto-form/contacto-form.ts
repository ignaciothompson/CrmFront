import { Component, Input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../../core/services/contacto';

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
  ciudades = [
    { value: 'norte', label: 'Montevideo' },
    { value: 'sur', label: 'Canelones' },
    { value: 'este', label: 'Maldonado' }
  ];
  private barriosCatalog: Record<string, string[]> = {
    norte: [ 'Centro', 'Cordón', 'Parque Rodó', 'Pocitos', 'Punta Carretas', 'Ciudad Vieja', 'Malvín', 'Carrasco' ],
    sur: [ 'Ciudad de la Costa', 'Las Piedras', 'La Paz', 'Pando', 'Barros Blancos' ],
    este: [ 'Punta del Este', 'Maldonado Nuevo', 'San Rafael', 'La Barra', 'Pinares' ]
  };
  barriosDireccion: string[] = [];
  barriosPreferencia: string[] = [];

  ngOnInit(): void {
    // Siempre abrimos como modal - si no hay activeModal, redirigir a contactos
    if (!this.activeModal) {
      this.router.navigate(['/contactos']);
      return;
    }

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
        this.recomputeBarrios();
      });
    }
  }

  onCiudadDireccionChange(): void { this.model.direccion.Barrio = ''; this.recomputeBarrios(); }
  onCiudadPreferenciaChange(): void { this.model.preferencia.Barrio = ''; this.recomputeBarrios(); }
  onParejaChange(): void { this.syncFamiliaFlag(); }

  private syncFamiliaFlag(): void { if (!this.model.Pareja) this.model.familia = false; }

  private recomputeBarrios(): void {
    const dirCity = this.model.direccion.Ciudad;
    const prefCity = this.model.preferencia.Ciudad;
    const curatedDir = new Set<string>(this.barriosCatalog[dirCity] || []);
    const curatedPref = new Set<string>(this.barriosCatalog[prefCity] || []);
    this.barriosDireccion = Array.from(curatedDir).sort();
    this.barriosPreferencia = Array.from(curatedPref).sort();
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
        console.error('Error updating contacto:', error);
        alert('Error al guardar el contacto. Por favor, intente nuevamente.');
      });
    } else {
      this.contactoService.addContacto(payload).then(() => {
        if (this.activeModal) {
          this.activeModal.close(true);
        }
      }).catch((error) => {
        console.error('Error adding contacto:', error);
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
