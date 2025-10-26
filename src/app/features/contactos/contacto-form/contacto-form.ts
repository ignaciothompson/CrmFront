import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ContactoService } from '../../../core/services/contacto';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './contacto-form.html',
  styleUrl: './contacto-form.css'
})
export class ContactoForm {
  constructor(private route: ActivatedRoute, private router: Router, private contactoService: ContactoService) {}

  id?: string;
  model: any = {
    Nombre: '', Apellido: '', Celular: '', Mail: '', Pareja: false, familia: false,
    direccion: { Ciudad: '', Barrio: '' },
    preferencia: { Ciudad: '', Barrio: '', TipoResidencia: '', Cuartos: null }
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
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    if (this.id) {
      this.contactoService.getContactoById(this.id).subscribe(c => {
        if (!c) return;
        this.model = { ...this.model, ...c };
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
    const payload = { ...this.model };
    if (this.id) {
      this.contactoService.updateContacto(this.id, payload).then(() => this.router.navigate(['/contactos']));
    } else {
      this.contactoService.addContacto(payload).then(() => this.router.navigate(['/contactos']));
    }
  }
}
