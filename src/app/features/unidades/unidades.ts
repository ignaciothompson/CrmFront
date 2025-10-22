import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { UnidadService } from '../../core/services/unidad';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnDestroy {
  constructor(private router: Router, private unidadService: UnidadService) {}

  localidad: string = '';
  barrios: string[] = [];
  selectedBarrio: string = '';
  allUnidades: any[] = [];
  filteredUnidades: any[] = [];
  private sub?: Subscription;
  private readonly cityLabelMap: Record<string, string> = { norte: 'Montevideo', sur: 'Canelones', este: 'Maldonado' };

  ngOnInit(): void {
    this.sub = this.unidadService.getUnidades().subscribe(list => {
      this.allUnidades = list || [];
      this.recomputeFilters();
    });
  }

  onCiudadChange(): void {
    this.selectedBarrio = '';
    this.recomputeFilters();
  }

  onBarrioChange(): void {
    this.recomputeFilters();
  }

  labelForCity(value: string): string {
    return this.cityLabelMap[value] || value || '';
  }

  private recomputeFilters(): void {
    if (this.localidad) {
      const byCity = this.allUnidades.filter(u => (u.city || u.localidad) === this.localidad);
      const set = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      this.barrios = Array.from(set).sort();
      this.filteredUnidades = byCity.filter(u => !this.selectedBarrio || u.barrio === this.selectedBarrio);
    } else {
      this.barrios = [];
      this.filteredUnidades = this.allUnidades.slice();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goNuevo(): void {
    this.router.navigate(['/unidades/form']);
  }

  goEditar(id: number): void {
    this.router.navigate(['/unidades/form', id]);
  }
}
