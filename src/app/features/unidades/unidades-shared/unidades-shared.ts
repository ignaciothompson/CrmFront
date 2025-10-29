import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProyectoService } from '../../../core/services/proyecto';
import { UnidadService } from '../../../core/services/unidad';

@Component({
  selector: 'app-unidades-shared',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unidades-shared.html',
  styleUrl: './unidades-shared.css'
})
export class UnidadesShared {
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


