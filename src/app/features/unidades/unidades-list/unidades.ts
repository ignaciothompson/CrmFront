import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModal } from '../delete-modal/delete-modal';
import { UnidadForm } from '../unidad-form/unidad-form';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SubheaderComponent],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnInit, OnDestroy {
  constructor(
    private unidadService: UnidadService, 
    private proyectoService: ProyectoService, 
    private modal: NgbModal,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];
  initialFilterValues: Record<string, any> = {};

  // Tabs
  activeTab: 'proyectos' | 'unidades' = 'proyectos';

  // Filters
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
    this.initialFilterValues = {
      mostrarVendidas: false
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
      },
      {
        id: 'mostrarVendidas',
        type: 'checkbox',
        label: 'Mostrar vendidas/rentadas',
        values: [
          { value: true, label: 'Mostrar vendidas/rentadas' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    // Update local filter variables from subheader values
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
    
    // Handle mostrarVendidas checkbox
    if (values['mostrarVendidas']) {
      this.mostrarVendidas = Array.isArray(values['mostrarVendidas']) 
        ? values['mostrarVendidas'].includes(true)
        : values['mostrarVendidas'] === true;
    } else {
      this.mostrarVendidas = false;
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
      try {
        for (const u of unidades) await this.unidadService.deleteUnidad(String(u.id));
        await this.proyectoService.deleteProyecto(String(p.id));
        this.toastService.error(`Proyecto "${p.nombre}" y sus unidades eliminados exitosamente`);
        this.recomputeFilters();
      } catch (error) {
        console.error('Error deleting proyecto:', error);
        this.toastService.error('Error al eliminar el proyecto. Por favor, intente nuevamente.');
      }
    }).catch(() => {});
  }

  async eliminar(id: string, event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!id) return;
    
    const unidad = this.allUnidades.find(u => String(u.id) === String(id));
    const nombre = unidad?.nombre || 'esta unidad';
    
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar "${nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    try {
      await this.unidadService.deleteUnidad(String(id));
      // Recargar las unidades después de eliminar
      this.recomputeFilters();
      this.toastService.error(`Unidad "${nombre}" eliminada exitosamente`);
    } catch (error) {
      console.error('Error deleting unidad:', error);
      this.toastService.error('Error al eliminar la unidad. Por favor, intente nuevamente.');
    }
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

  getProyectoNombre(proyectoId: string | number | undefined): string {
    if (!proyectoId) return '';
    const proyecto = this.proyectos.find(p => String(p.id) === String(proyectoId));
    return proyecto?.nombre || '';
  }

  getPrimarySize(u: any): string {
    if (!u) return '';
    if (u.tipoUnidad === 'Apartamento') return (u.m2Totales ?? u.m2Internos ?? '') + (u.m2Totales || u.m2Internos ? ' m²' : '');
    if (u.tipoUnidad === 'Casa') return (u.superficieEdificada ?? u.superficieTerreno ?? '') + (u.superficieEdificada || u.superficieTerreno ? ' m²' : '');
    if (u.tipoUnidad?.startsWith('Chacra')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    if (u.tipoUnidad?.startsWith('Campo')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    return u.tamano || u.size || '';
  }
}
