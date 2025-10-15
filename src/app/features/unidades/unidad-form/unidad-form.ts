import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnidadService } from '../../../core/services/unidad';

@Component({
  selector: 'app-unidad-form',
  standalone: false,
  templateUrl: './unidad-form.html',
  styleUrl: './unidad-form.css'
})
export class UnidadForm {
  constructor(private route: ActivatedRoute, private router: Router, private unidadService: UnidadService) {}

  model: any = { nombre: '', tipo: 'Residencial', descripcion: '', estado: 'En planificación', unidades: null, entrega: '', ubicacion: '', inicio: '', city: '', barrio: '' };
  id?: string;
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
}
