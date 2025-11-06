import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnidadService } from '../../core/services/unidad';
import { ProyectoService } from '../../core/services/proyecto';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModal } from './delete-modal/delete-modal';
import { UnidadForm } from './unidad-form/unidad-form';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnDestroy {
  constructor(private unidadService: UnidadService, private proyectoService: ProyectoService, private modal: NgbModal) {}

  localidad: string = '';
  barrios: string[] = [];
  selectedBarrio: string = '';
  mostrarVendidas: boolean = false; // Filtro para mostrar unidades vendidas/rentadas
  allUnidades: any[] = [];
  filteredUnidades: any[] = [];
  proyectos: any[] = [];
  deleteModalOpen = false;
  proyectoToDelete: any = null;
  unidadesToDelete: any[] = [];
  private sub?: Subscription;
  private psub?: Subscription;
  private readonly cityLabelMap: Record<string, string> = { norte: 'Montevideo', sur: 'Canelones', este: 'Maldonado' };

  ngOnInit(): void {
    this.sub = this.unidadService.getUnidades().subscribe(list => {
      this.allUnidades = list || [];
      this.recomputeFilters();
    });
    this.psub = this.proyectoService.getProyectos().subscribe(list => {
      this.proyectos = (list || []).map(p => ({ ...p, unidadesCount: p.unidadesCount || this.countUnitsForProject(p.id) }));
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

  resetFilters(): void {
    this.localidad = '';
    this.selectedBarrio = '';
    this.mostrarVendidas = false;
    this.recomputeFilters();
  }

  applyFilters(): void {
    this.recomputeFilters();
  }

  private recomputeFilters(): void {
    // Primero filtrar por estado (vendidas/rentadas/deshabilitadas)
    let unidades = this.allUnidades;
    if (!this.mostrarVendidas) {
      // Por defecto, excluir unidades vendidas, rentadas o deshabilitadas
      unidades = unidades.filter(u => {
        const vendida = u?.vendida || u?.sold || u?.disponibilidad === 'Vendida';
        const rentada = u?.rented || u?.disponibilidad === 'Rentada';
        const deshabilitada = u?.activo === false;
        return !vendida && !rentada && !deshabilitada;
      });
    }

    // Luego filtrar por ciudad y barrio
    if (this.localidad) {
      const byCity = unidades.filter(u => (u.city || u.localidad) === this.localidad);
      const set = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      this.barrios = Array.from(set).sort();
      this.filteredUnidades = byCity.filter(u => !this.selectedBarrio || u.barrio === this.selectedBarrio);
    } else {
      this.barrios = [];
      this.filteredUnidades = unidades.slice();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.psub?.unsubscribe();
  }

  goNuevo(): void {
    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    modalRef.result.then((result: any) => {
      // Si se guardó exitosamente, recargar las unidades pero mantener los filtros
      if (result === true) {
        this.recomputeFilters();
      }
    }).catch(() => {
      // Modal cerrado sin guardar, mantener filtros
    });
  }

  goEditar(id: number): void {
    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as UnidadForm;
    component.unidadId = String(id);
    modalRef.result.then((result: any) => {
      // Si se guardó exitosamente, recargar las unidades pero mantener los filtros
      if (result === true) {
        this.recomputeFilters();
      }
    }).catch(() => {
      // Modal cerrado sin guardar, mantener filtros
    });
  }

  goEditarProyecto(p: any): void {
    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as UnidadForm;
    component.proyectoId = String(p.id);
    component.editProyecto = true;
    modalRef.result.then((result: any) => {
      // Si se guardó exitosamente, recargar las unidades pero mantener los filtros
      if (result === true) {
        this.recomputeFilters();
      }
    }).catch(() => {
      // Modal cerrado sin guardar, mantener filtros
    });
  }

  shareProyecto(p: any): void {
    window.open(`/proyecto/${p.id}`, '_blank');
  }

  confirmDeleteProyecto(p: any): void {
    const unidades = this.allUnidades.filter(u => String(u.proyectoId) === String(p.id));
    const ref = this.modal.open(DeleteModal, { size: 'lg', backdrop: 'static', keyboard: false });
    (ref.componentInstance as DeleteModal).proyecto = p;
    (ref.componentInstance as DeleteModal).unidades = unidades;
    ref.result.then(async (ok: boolean) => {
      if (!ok) return;
      for (const u of unidades) await this.unidadService.deleteUnidad(String(u.id));
      await this.proyectoService.deleteProyecto(String(p.id));
    }).catch(() => {});
  }

  async eliminar(id: string): Promise<void> {
    if (!id) return;
    const ok = confirm('¿Eliminar esta unidad?');
    if (!ok) return;
    await this.unidadService.deleteUnidad(String(id));
  }

  private countUnitsForProject(projectId: string): number {
    return this.allUnidades.filter(u => String(u.proyectoId) === String(projectId)).length;
  }
}
