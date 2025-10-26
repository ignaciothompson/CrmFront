import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { EXTRAS_CATALOG } from '../../../core/extras-catalog';

@Component({
  selector: 'app-unidad-form',
  standalone: true,
  imports: [FormsModule, RouterModule, TypeaheadComponent],
  templateUrl: './unidad-form.html',
  styleUrl: './unidad-form.css'
})
export class UnidadForm {
  constructor(private route: ActivatedRoute, private router: Router, private unidadService: UnidadService, private proyectoService: ProyectoService) {}

  model: any = { nombre: '', tipo: 'Residencial', descripcion: '', estado: 'En planificación', unidades: null, entrega: '', ubicacion: '', inicio: '', city: '', barrio: '', proyectoId: '', extras: [] };
  id?: string;
  proyectoItems: Array<{ id: string; label: string }> = [];
  proyectosAll: any[] = [];
  extrasCatalog = EXTRAS_CATALOG;
  ciudades = [
    { value: 'norte', label: 'Montevideo' },
    { value: 'sur', label: 'Canelones' },
    { value: 'este', label: 'Maldonado' }
  ];
  private barriosCatalog: Record<string, string[]> = {
    norte: [
      'Centro', 'Cordón', 'Parque Rodó', 'Pocitos', 'Punta Carretas', 'Ciudad Vieja', 'Malvín', 'Carrasco'
    ],
    sur: [
      'Ciudad de la Costa', 'Las Piedras', 'La Paz', 'Pando', 'Barros Blancos'
    ],
    este: [
      'Punta del Este', 'Maldonado Nuevo', 'San Rafael', 'La Barra', 'Pinares'
    ]
  };
  barrios: string[] = [];

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.proyectoService.getProyectos().subscribe(ps => {
      this.proyectosAll = ps || [];
      this.proyectoItems = this.proyectosAll.map(p => ({ id: String(p.id), label: String(p.nombre) }));
    });
    if (this.id) {
      this.unidadService.getUnidadById(this.id).subscribe(u => {
        if (u) {
          this.model = { ...this.model, ...u };
          this.recomputeBarrios();
        }
      });
    }
  }

  onCityChange(): void {
    this.model.barrio = '';
    this.recomputeBarrios();
  }

  private recomputeBarrios(): void {
    this.unidadService.getUnidades().subscribe(list => {
      const byCity = list.filter(u => (u.city || u.localidad) === this.model.city);
      const fromData = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      const curated = new Set<string>(this.barriosCatalog[this.model.city] || []);
      const merged = Array.from(new Set<string>([...Array.from(curated), ...Array.from(fromData)])).sort();
      this.barrios = merged;
    });
  }

  save(): void {
    const payload = { ...this.model };
    if (this.id) {
      this.unidadService.updateUnidad(this.id, payload).then(() => this.router.navigate(['/unidades']));
    } else {
      this.unidadService.addUnidad(payload).then(() => this.router.navigate(['/unidades']));
    }
  }

  onExtraChange(extraLabel: string, isChecked: boolean): void {
    const currentExtras: string[] = Array.isArray(this.model.extras) ? this.model.extras.slice() : [];
    const alreadyIncluded = currentExtras.includes(extraLabel);
    if (isChecked && !alreadyIncluded) {
      this.model.extras = [...currentExtras, extraLabel];
      return;
    }
    if (!isChecked && alreadyIncluded) {
      this.model.extras = currentExtras.filter((existingLabel: string) => existingLabel !== extraLabel);
    }
  }

  onProyectoChange(): void {
    const p = this.proyectosAll.find(x => String(x.id) === String(this.model.proyectoId));
    if (!p) return;
    // Denormalize values from proyecto into unidad model for fast filters
    this.model.city = p.ciudad || p.city || this.model.city;
    this.model.barrio = p.barrio || this.model.barrio;
    // If unit type is empty, default from proyecto.tipo when present
    if (!this.model.tipo && p.tipo) this.model.tipo = p.tipo;
    this.recomputeBarrios();
  }
}
