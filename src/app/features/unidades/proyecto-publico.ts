import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProyectoService } from '../../core/services/proyecto';
import { UnidadService } from '../../core/services/unidad';

@Component({
  selector: 'app-proyecto-publico',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="frame">
    <div class="frame-title">
      <h4>{{ proyecto?.nombre || 'Proyecto' }}</h4>
    </div>
    <div class="frame-body">
      <div class="row">
        <div class="col-xs-12 col-sm-6">
          <div><strong>Desarrollador:</strong> {{ proyecto?.desarrollador || '-' }}</div>
          <div><strong>Entrega:</strong> {{ proyecto?.entrega || '-' }}</div>
        </div>
        <div class="col-xs-12 col-sm-6">
          <div><strong>Localidad:</strong> {{ proyecto?.ciudad || proyecto?.localidad || '-' }}</div>
          <div><strong>Barrio:</strong> {{ proyecto?.barrio || '-' }}</div>
          <div><strong>Dirección:</strong> {{ proyecto?.direccion || '-' }}</div>
        </div>
      </div>
      <h5 class="mt-2">Unidades</h5>
      <div class="table-responsive">
        <table class="table c-table table-striped">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>M2 / Ha</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of unidades">
              <td>{{ u.nombre }}</td>
              <td>{{ u.tipoUnidad }}</td>
              <td>{{ u.estadoComercial }}</td>
              <td>{{ getPrimarySize(u) }}</td>
            </tr>
            <tr *ngIf="!unidades.length">
              <td colspan="4" class="text-center">Sin unidades</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class ProyectoPublico {
  proyecto: any;
  unidades: any[] = [];

  constructor(private route: ActivatedRoute, private proyectoService: ProyectoService, private unidadService: UnidadService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.proyectoService.getProyectoById(id).subscribe(p => this.proyecto = p);
    this.unidadService.getUnidades().subscribe(list => {
      this.unidades = (list || []).filter(u => String(u.proyectoId) === String(id));
    });
  }

  getPrimarySize(u: any): string {
    if (!u) return '';
    if (u.tipoUnidad === 'Apartamento') return (u.m2Totales ?? u.m2Internos ?? '') + (u.m2Totales || u.m2Internos ? ' m²' : '');
    if (u.tipoUnidad === 'Casa') return (u.superficieEdificada ?? u.superficieTerreno ?? '') + (u.superficieEdificada || u.superficieTerreno ? ' m²' : '');
    if (u.tipoUnidad?.startsWith('Chacra')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    if (u.tipoUnidad?.startsWith('Campo')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    return '';
  }
}


