import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnidadService } from '../../core/services/unidad';
import { ProyectoService } from '../../core/services/proyecto';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModal } from './delete-modal/delete-modal';
import { UnidadForm } from './unidad-form/unidad-form';
import { SubheaderComponent, FilterConfig } from '../../shared/components/subheader/subheader';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SubheaderComponent],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnInit, OnDestroy {
  constructor(private unidadService: UnidadService, private proyectoService: ProyectoService, private modal: NgbModal) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];
  initialFilterValues: Record<string, any> = {};

  // Tabs
  activeTab: 'proyectos' | 'unidades' = 'proyectos';

  // Filters
  dateFrom: string | null = null;
  dateTo: string | null = null;
  localidad: string = '';
  barrios: string[] = [];
  selectedBarrio: string = '';
  tamano: string = '';
  precioMin: number | null = null;
  precioMax: number | null = null;
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
    // Set default date range: 7 days ago to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    this.dateFrom = sevenDaysAgo.toISOString().slice(0, 10);
    this.dateTo = today.toISOString().slice(0, 10);
    
    this.initialFilterValues = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    
    this.sub = this.unidadService.getUnidades().subscribe(list => {
      this.allUnidades = list || [];
      this.updateFilterConfigs();
      this.recomputeFilters();
    });
    this.psub = this.proyectoService.getProyectos().subscribe(list => {
      this.proyectos = (list || []).map(p => ({ ...p, unidadesCount: p.unidadesCount || this.countUnitsForProject(p.id) }));
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'dateFrom',
        type: 'date',
        label: 'Desde',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'dateTo',
        type: 'date',
        label: 'Hasta',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'localidad',
        type: 'select',
        label: 'Ciudad',
        values: [
          { value: '', label: 'Todas' },
          { value: 'norte', label: 'Montevideo' },
          { value: 'sur', label: 'Canelones' },
          { value: 'este', label: 'Maldonado' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'barrio',
        type: 'select',
        label: 'Barrio',
        values: this.barrios.map(b => ({ value: b, label: b })),
        disabled: !this.localidad,
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'tamano',
        type: 'select',
        label: 'Tamaño',
        values: [
          { value: '', label: 'Todos' },
          { value: 'pequeno', label: 'Pequeño' },
          { value: 'mediano', label: 'Mediano' },
          { value: 'grande', label: 'Grande' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'precio',
        type: 'range',
        label: 'Precio',
        placeholder: 'Precio',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    // Update local filter variables from subheader values
    this.dateFrom = values['dateFrom'] || null;
    this.dateTo = values['dateTo'] || null;
    this.localidad = values['localidad'] || '';
    this.selectedBarrio = values['barrio'] || '';
    this.tamano = values['tamano'] || '';
    
    // Handle precio range
    if (values['precio']) {
      this.precioMin = values['precio']?.from || null;
      this.precioMax = values['precio']?.to || null;
    } else {
      this.precioMin = null;
      this.precioMax = null;
    }
    
    // Update barrios list when ciudad changes
    if (this.localidad) {
      const byCity = this.allUnidades.filter(u => (u.city || u.localidad) === this.localidad);
      const set = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      this.barrios = Array.from(set).sort();
      this.updateFilterConfigs(); // Update barrio options
    } else {
      this.barrios = [];
      this.selectedBarrio = '';
      this.updateFilterConfigs();
    }
    
    this.recomputeFilters();
  }

  labelForCity(value: string): string {
    return this.cityLabelMap[value] || value || '';
  }

  recomputeFilters(): void {
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

    // Filtrar por ciudad
    if (this.localidad) {
      unidades = unidades.filter(u => (u.city || u.localidad) === this.localidad);
    }

    // Filtrar por barrio
    if (this.selectedBarrio) {
      unidades = unidades.filter(u => u.barrio === this.selectedBarrio);
    }

    // Filtrar por tamaño
    if (this.tamano) {
      unidades = unidades.filter(u => {
        const tamano = (u.tamano || u.size || '').toLowerCase();
        return tamano === this.tamano.toLowerCase();
      });
    }

    // Filtrar por precio
    if (this.precioMin !== null) {
      unidades = unidades.filter(u => {
        const precio = u.precio || 0;
        return precio >= this.precioMin!;
      });
    }
    if (this.precioMax !== null) {
      unidades = unidades.filter(u => {
        const precio = u.precio || 0;
        return precio <= this.precioMax!;
      });
    }

    // Filtrar por fecha (si hay filtros de fecha)
    if (this.dateFrom) {
      const from = new Date(this.dateFrom + 'T00:00:00').getTime();
      unidades = unidades.filter(u => {
        const fechaEntrega = u.entrega || u.fechaEntrega;
        if (!fechaEntrega) return false;
        const fecha = new Date(fechaEntrega).getTime();
        return fecha >= from;
      });
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo + 'T23:59:59').getTime();
      unidades = unidades.filter(u => {
        const fechaEntrega = u.entrega || u.fechaEntrega;
        if (!fechaEntrega) return false;
        const fecha = new Date(fechaEntrega).getTime();
        return fecha <= to;
      });
    }

    this.filteredUnidades = unidades;
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

  setActiveTab(tab: 'proyectos' | 'unidades'): void {
    this.activeTab = tab;
  }

  verProyecto(p: any): void {
    // Switch to unidades tab and filter by project
    this.activeTab = 'unidades';
    // You could add filtering logic here if needed
  }

  verUnidad(u: any): void {
    this.goEditar(u.id);
  }
}
