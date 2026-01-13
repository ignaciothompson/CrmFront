import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { CiudadService } from '../../../core/services/ciudad.service';
import { BarrioService } from '../../../core/services/barrio.service';
import { ComparativaService } from '../../../core/services/comparativa';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModal } from '../delete-modal/delete-modal';
import { UnidadForm } from '../unidad-form/unidad-form';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';
import { FilterSidebarComponent, FilterSidebarConfig } from '../../../shared/components/filter-sidebar/filter-sidebar';
import { EXTRAS_CATALOG } from '../../../core/extras-catalog';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SubheaderComponent, FilterSidebarComponent],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnInit, OnDestroy {
  constructor(
    private unidadService: UnidadService, 
    private proyectoService: ProyectoService,
    private ciudadService: CiudadService,
    private barrioService: BarrioService,
    private comparativaService: ComparativaService,
    private modal: NgbModal,
    private confirmService: ConfirmService,
    private toastService: ToastService
  ) {}

  // Filter configurations for subheader (main filters)
  subheaderFilters: FilterConfig[] = [];
  initialFilterValues: Record<string, any> = {};

  // Secondary filters (Más Filtros)
  secondaryFiltersOpen: boolean = false;
  secondaryFilterConfigs: FilterSidebarConfig[] = [];
  secondaryFilterValues: Record<string, any> = {};

  // Multi-selection
  selectedUnidades: Set<string> = new Set();

  // Main filters
  selectedProyectoId: string | null = null;
  proyectoItems: Array<{ id: string; label: string }> = [];
  selectedCiudadId: string | null = null;
  ciudades: any[] = [];
  ciudadItems: Array<{ id: string; label: string }> = [];
  selectedBarrioId: string | null = null;
  barrios: any[] = [];
  barrioItems: Array<{ id: string; label: string }> = [];
  selectedDisponibilidad: string | null = null;
  disponibilidadOpts: string[] = [
    'Disponible: publicada',
    'Disponible: reventa publicada',
    'Disponible: reventa no publicada',
    'Disponible: con renta publicada',
    'Disponible: con renta no publicada',
    'Reservada para venta',
    'Reservada por promotor',
    'Vendida'
  ];

  // Secondary filters
  filterTipos: Record<string, boolean> = {};
  filterVisibilidad: Record<string, boolean> = {};
  filterCuartos: Record<string, boolean> = {};
  filterBanos: Record<string, boolean> = {};
  filterExtras: Record<string, boolean> = {};
  filterOrientaciones: Record<string, boolean> = {};
  filterDistribuciones: Record<string, boolean> = {};
  filterPisos: Record<string, boolean> = {};
  filterOcupacion: Record<string, boolean> = {};
  sizeMin: number | null = null;
  sizeMax: number | null = null;
  priceMin: number | null = null;
  priceMax: number | null = null;
  expMin: number | null = null;
  expMax: number | null = null;

  tiposResidencia: string[] = ['Casa', 'Apartamento', 'Complejo'];
  visibilidadOpts: string[] = ['Publicado', 'No publicado'];
  banosOpts: number[] = [1, 2, 3, 4];
  orientaciones: string[] = ['Norte', 'Noreste', 'Este', 'Sudeste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
  distribuciones: string[] = ['Frente/Esquinero', 'Frente/Central', 'Contrafrente/Esquinero', 'Contrafrente/Central', 'Lateral', 'Inferior'];
  pisos: string[] = ['Bajo', 'Medio', 'Alto'];
  ocupaciones: string[] = ['A ocupar', '1 a 6 meses', '7 meses 1 año', '1 a 2 años', 'Mas de 2 años'];
  extrasCatalog = EXTRAS_CATALOG.map(e => e.label);
  
  allUnidades: any[] = [];
  filteredUnidades: any[] = [];
  proyectos: any[] = [];
  private sub?: Subscription;
  private psub?: Subscription;
  private ciudadSub?: Subscription;
  private barrioSub?: Subscription;

  ngOnInit(): void {
    this.initialFilterValues = {};
    
    // Load unidades
    this.sub = this.unidadService.getUnidades().subscribe(list => {
      this.allUnidades = list || [];
      this.updateFilterConfigs();
      this.updateSecondaryFilterConfigs();
      this.recomputeFilters();
    });

    // Load proyectos
    this.psub = this.proyectoService.getProyectos().subscribe(list => {
      this.proyectos = list || [];
      this.proyectoItems = this.proyectos.map(p => ({ 
        id: String(p.id), 
        label: String(p.nombre || '') 
      })).filter(x => !!x.label);
      this.updateFilterConfigs();
    });

    // Load ciudades
    this.ciudadSub = this.ciudadService.getCiudades().subscribe(list => {
      this.ciudades = list || [];
      this.ciudadItems = this.ciudades.map(c => ({ 
        id: String(c.id), 
        label: String(c.nombre || '') 
      })).filter(x => !!x.label);
      this.updateFilterConfigs();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'proyecto',
        type: 'typeahead',
        label: 'Proyecto',
        placeholder: 'Buscar proyecto...',
        items: this.proyectoItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'ciudad',
        type: 'select',
        label: 'Ciudad',
        values: [
          { value: '', label: 'Todas' },
          ...this.ciudadItems.map(c => ({ value: c.id, label: c.label }))
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'barrio',
        type: 'select',
        label: 'Barrio',
        values: [
          { value: '', label: 'Todos' },
          ...this.barrioItems.map(b => ({ value: b.id, label: b.label }))
        ],
        disabled: !this.selectedCiudadId,
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'disponibilidad',
        type: 'select',
        label: 'Disponibilidad',
        values: [
          { value: '', label: 'Todas' },
          ...this.disponibilidadOpts.map(d => ({ value: d, label: d }))
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      }
    ];
  }

  private updateSecondaryFilterConfigs(): void {
    this.secondaryFilterConfigs = [
      {
        id: 'f-tipo',
        label: 'Tipo de residencia',
        type: 'checkbox',
        values: this.tiposResidencia.map(t => ({ value: t, label: t })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-vis',
        label: 'Ver',
        type: 'checkbox',
        values: this.visibilidadOpts.map(v => ({ value: v, label: v })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-rooms',
        label: 'Cuartos',
        type: 'checkbox',
        values: [1, 2, 3, 4].map(n => ({ value: n, label: n === 4 ? '4+' : String(n) })),
        getSelectedLabel: (value: number[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.map(n => n === 4 ? '4+' : String(n)).join(', ');
        }
      },
      {
        id: 'f-banos',
        label: 'Baños',
        type: 'checkbox',
        values: this.banosOpts.map(n => ({ value: n, label: String(n) })),
        getSelectedLabel: (value: number[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-size',
        label: 'Tamaño',
        type: 'range',
        placeholder: 'Min',
        validateOnBlur: true,
        getSelectedLabel: (value: any) => {
          if (!value || typeof value !== 'object') return '';
          const from = value.from || value.from === 0 ? value.from : '';
          const to = value.to || value.to === 0 ? value.to : '';
          if (from || to) {
            return `${from || 0} - ${to || '∞'}`;
          }
          return '';
        }
      },
      {
        id: 'f-price',
        label: 'Precio',
        type: 'range',
        placeholder: 'Min',
        validateOnBlur: true,
        getSelectedLabel: (value: any) => {
          if (!value || typeof value !== 'object') return '';
          const from = value.from || value.from === 0 ? value.from : '';
          const to = value.to || value.to === 0 ? value.to : '';
          if (from || to) {
            return `$${from || 0} - $${to || '∞'}`;
          }
          return '';
        }
      },
      {
        id: 'f-exp',
        label: 'Expensas',
        type: 'range',
        placeholder: 'Min',
        validateOnBlur: true,
        getSelectedLabel: (value: any) => {
          if (!value || typeof value !== 'object') return '';
          const from = value.from || value.from === 0 ? value.from : '';
          const to = value.to || value.to === 0 ? value.to : '';
          if (from || to) {
            return `$${from || 0} - $${to || '∞'}`;
          }
          return '';
        }
      },
      {
        id: 'f-extras',
        label: 'Extras',
        type: 'checkbox',
        values: this.extrasCatalog.map(e => ({ value: e, label: e })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-orientacion',
        label: 'Orientación',
        type: 'checkbox',
        values: this.orientaciones.map(o => ({ value: o, label: o })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-distribucion',
        label: 'Distribución',
        type: 'checkbox',
        values: this.distribuciones.map(d => ({ value: d, label: d })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-piso',
        label: 'Piso',
        type: 'checkbox',
        values: this.pisos.map(p => ({ value: p, label: p })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      },
      {
        id: 'f-ocupacion',
        label: 'Ocupación',
        type: 'checkbox',
        values: this.ocupaciones.map(o => ({ value: o, label: o })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      }
    ];

    // Initialize secondary filter values
    this.secondaryFilterValues = {
      'f-tipo': [],
      'f-vis': [],
      'f-rooms': [],
      'f-banos': [],
      'f-size': { from: null, to: null },
      'f-price': { from: null, to: null },
      'f-exp': { from: null, to: null },
      'f-extras': [],
      'f-orientacion': [],
      'f-distribucion': [],
      'f-piso': [],
      'f-ocupacion': []
    };
  }

  onFilterSubmit(values: Record<string, any>): void {
    // Update main filter variables
    this.selectedProyectoId = values['proyecto'] || null;
    this.selectedCiudadId = values['ciudad'] || null;
    this.selectedBarrioId = values['barrio'] || null;
    this.selectedDisponibilidad = values['disponibilidad'] || null;

    // Update barrios when ciudad changes
    if (this.selectedCiudadId) {
      const ciudadIdNum = parseInt(String(this.selectedCiudadId), 10);
      if (!isNaN(ciudadIdNum)) {
        this.barrioSub?.unsubscribe();
        this.barrioSub = this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe(list => {
          this.barrios = list || [];
          this.barrioItems = this.barrios.map(b => ({ 
            id: String(b.id), 
            label: String(b.nombre || '') 
          })).filter(x => !!x.label);
          this.updateFilterConfigs();
        });
      }
    } else {
      this.barrios = [];
      this.barrioItems = [];
      this.selectedBarrioId = null;
      this.updateFilterConfigs();
    }
    
    this.recomputeFilters();
  }

  onSecondaryFilterChange(event: { id: string; value: any }): void {
    this.secondaryFilterValues[event.id] = event.value;
    this.validateAndApplyFilters();
  }

  validateAndApplyFilters(): void {
    // Validate range filters
    const rangeErrors: string[] = [];
    
    const sizeRange = this.secondaryFilterValues['f-size'];
    if (sizeRange && sizeRange.from !== null && sizeRange.to !== null && sizeRange.from > sizeRange.to) {
      rangeErrors.push('El tamaño mínimo no puede ser mayor que el máximo');
    }
    
    const priceRange = this.secondaryFilterValues['f-price'];
    if (priceRange && priceRange.from !== null && priceRange.to !== null && priceRange.from > priceRange.to) {
      rangeErrors.push('El precio mínimo no puede ser mayor que el máximo');
    }
    
    const expRange = this.secondaryFilterValues['f-exp'];
    if (expRange && expRange.from !== null && expRange.to !== null && expRange.from > expRange.to) {
      rangeErrors.push('Las expensas mínimas no pueden ser mayores que las máximas');
    }
    
    if (rangeErrors.length > 0) {
      rangeErrors.forEach(error => this.toastService.warning(error));
      return;
    }

    this.recomputeFilters();
  }

  toggleSecondaryFilters(): void {
    this.secondaryFiltersOpen = !this.secondaryFiltersOpen;
  }

  getActiveSecondaryFilters(): Array<{ label: string; value: string }> {
    const active: Array<{ label: string; value: string }> = [];
    
    for (const config of this.secondaryFilterConfigs) {
      const value = this.secondaryFilterValues[config.id];
      if (!value) continue;
      
      let displayValue = '';
      if (config.getSelectedLabel) {
        displayValue = config.getSelectedLabel(value);
      } else if (Array.isArray(value) && value.length > 0) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        const from = value.from || value.from === 0 ? value.from : '';
        const to = value.to || value.to === 0 ? value.to : '';
        if (from || to) {
          displayValue = `${from || 0} - ${to || '∞'}`;
        }
      }
      
      if (displayValue) {
        active.push({ label: config.label, value: displayValue });
      }
    }
    
    return active;
  }

  recomputeFilters(): void {
    let unidades = this.allUnidades.slice();

    // Main filters
    if (this.selectedProyectoId) {
      unidades = unidades.filter(u => String(u?.proyectoId) === String(this.selectedProyectoId));
    }

    if (this.selectedCiudadId) {
      const ciudadIdNum = parseInt(String(this.selectedCiudadId), 10);
      unidades = unidades.filter(u => {
        const uCiudadId = typeof u?.ciudadId === 'number' ? u.ciudadId : parseInt(String(u?.ciudadId || ''), 10);
        return !isNaN(ciudadIdNum) && !isNaN(uCiudadId) && uCiudadId === ciudadIdNum;
      });
    }

    if (this.selectedBarrioId) {
      const barrioIdNum = parseInt(String(this.selectedBarrioId), 10);
      unidades = unidades.filter(u => {
        const uBarrioId = typeof u?.barrioId === 'number' ? u.barrioId : parseInt(String(u?.barrioId || ''), 10);
        return !isNaN(barrioIdNum) && !isNaN(uBarrioId) && uBarrioId === barrioIdNum;
      });
    }

    if (this.selectedDisponibilidad) {
      unidades = unidades.filter(u => {
        const disp = u?.disponibilidad || '';
        return disp === this.selectedDisponibilidad;
      });
    }

    // Secondary filters
    const activeTipos = Array.isArray(this.secondaryFilterValues['f-tipo']) ? this.secondaryFilterValues['f-tipo'] : [];
    if (activeTipos.length) {
      unidades = unidades.filter(u => activeTipos.includes(String(u?.tipoUnidad || u?.tipo || '')));
    }

    const activeVis = Array.isArray(this.secondaryFilterValues['f-vis']) ? this.secondaryFilterValues['f-vis'] : [];
    if (activeVis.length) {
      unidades = unidades.filter(u => {
        const vis = u?.visibilidad || (u?.publicada ? 'Publicado' : 'No publicado');
        return activeVis.includes(vis);
      });
    }

    const activeCuartos = Array.isArray(this.secondaryFilterValues['f-rooms']) ? this.secondaryFilterValues['f-rooms'].map(Number) : [];
    if (activeCuartos.length) {
      unidades = unidades.filter(u => {
        const d = Number(u?.dormitorios ?? u?.cuartos ?? 0);
        return activeCuartos.some(n => (n === 4 ? d >= 4 : d === n));
      });
    }

    const activeBanos = Array.isArray(this.secondaryFilterValues['f-banos']) ? this.secondaryFilterValues['f-banos'].map(Number) : [];
    if (activeBanos.length) {
      unidades = unidades.filter(u => {
        const b = Number(u?.banos ?? 0);
        return activeBanos.includes(b);
      });
    }

    const sizeRange = this.secondaryFilterValues['f-size'];
    if (sizeRange) {
      if (sizeRange.from !== null) {
        unidades = unidades.filter(u => {
          const size = Number(u?.m2Totales ?? u?.m2Internos ?? u?.superficieEdificada ?? u?.superficieTerreno ?? u?.tamanoM2 ?? 0);
          return size >= sizeRange.from;
        });
      }
      if (sizeRange.to !== null) {
        unidades = unidades.filter(u => {
          const size = Number(u?.m2Totales ?? u?.m2Internos ?? u?.superficieEdificada ?? u?.superficieTerreno ?? u?.tamanoM2 ?? 0);
          return size <= sizeRange.to;
        });
      }
    }

    const priceRange = this.secondaryFilterValues['f-price'];
    if (priceRange) {
      if (priceRange.from !== null) {
        unidades = unidades.filter(u => {
          const precio = Number(u?.precio ?? u?.precioUSD ?? 0);
          return precio >= priceRange.from;
        });
      }
      if (priceRange.to !== null) {
        unidades = unidades.filter(u => {
          const precio = Number(u?.precio ?? u?.precioUSD ?? 0);
          return precio <= priceRange.to;
        });
      }
    }

    const expRange = this.secondaryFilterValues['f-exp'];
    if (expRange) {
      if (expRange.from !== null) {
        unidades = unidades.filter(u => {
          const exp = Number(u?.expensasUSD ?? u?.expensas ?? 0);
          return exp >= expRange.from;
        });
      }
      if (expRange.to !== null) {
        unidades = unidades.filter(u => {
          const exp = Number(u?.expensasUSD ?? u?.expensas ?? 0);
          return exp <= expRange.to;
        });
      }
    }

    const activeExtras = Array.isArray(this.secondaryFilterValues['f-extras']) ? this.secondaryFilterValues['f-extras'] : [];
    if (activeExtras.length) {
      unidades = unidades.filter(u => {
        const amenities: any[] = Array.isArray(u?.amenities) ? u.amenities : [];
        const extrasLabels = amenities.map((a: any) => typeof a === 'string' ? a : (a?.name || a?.label || ''));
        return activeExtras.every(label => extrasLabels.includes(label));
      });
    }

    const activeOrientaciones = Array.isArray(this.secondaryFilterValues['f-orientacion']) ? this.secondaryFilterValues['f-orientacion'] : [];
    if (activeOrientaciones.length) {
      unidades = unidades.filter(u => activeOrientaciones.includes(String(u?.orientacion || '')));
    }

    const activeDistribuciones = Array.isArray(this.secondaryFilterValues['f-distribucion']) ? this.secondaryFilterValues['f-distribucion'] : [];
    if (activeDistribuciones.length) {
      unidades = unidades.filter(u => activeDistribuciones.includes(String(u?.distribucion || '')));
    }

    const activePisos = Array.isArray(this.secondaryFilterValues['f-piso']) ? this.secondaryFilterValues['f-piso'] : [];
    if (activePisos.length) {
      unidades = unidades.filter(u => {
        const piso = u?.piso;
        if (typeof piso === 'number') {
          if (piso <= 3) return activePisos.includes('Bajo');
          if (piso <= 6) return activePisos.includes('Medio');
          return activePisos.includes('Alto');
        }
        return activePisos.includes(String(piso || ''));
      });
    }

    const activeOcupacion = Array.isArray(this.secondaryFilterValues['f-ocupacion']) ? this.secondaryFilterValues['f-ocupacion'] : [];
    if (activeOcupacion.length) {
      // This would need to be implemented based on your data structure
      // unidades = unidades.filter(u => activeOcupacion.includes(String(u?.ocupacion || '')));
    }

    this.filteredUnidades = unidades;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.psub?.unsubscribe();
    this.ciudadSub?.unsubscribe();
    this.barrioSub?.unsubscribe();
  }

  goNuevo(): void {
    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    modalRef.result.then((result: any) => {
      if (result === true) {
        this.recomputeFilters();
      }
    }).catch(() => {});
  }

  goEditar(id: number): void {
    const modalRef = this.modal.open(UnidadForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as UnidadForm;
    component.unidadId = String(id);
    modalRef.result.then((result: any) => {
      if (result === true) {
        this.recomputeFilters();
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
      
      // Remove the deleted unidad from allUnidades array
      this.allUnidades = this.allUnidades.filter(u => String(u.id) !== String(id));
      
      // Also remove from selected unidades if it was selected
      this.selectedUnidades.delete(String(id));
      
      // Recompute filters to update the filtered list
      this.recomputeFilters();
      
      this.toastService.error(`Unidad "${nombre}" eliminada exitosamente`);
    } catch (error: any) {
      console.error('Error deleting unidad:', error);
      // Show more specific error message
      let errorMessage = 'Error al eliminar la unidad. Por favor, intente nuevamente.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === '23503') {
        // Foreign key constraint violation
        errorMessage = 'No se puede eliminar la unidad porque está siendo utilizada en una comparativa. Por favor, elimine primero la comparativa.';
      } else if (error?.code === 'PGRST301') {
        // RLS policy violation
        errorMessage = 'No tiene permisos para eliminar esta unidad.';
      }
      
      this.toastService.error(errorMessage);
    }
  }

  // Multi-selection methods
  isSelected(unidadId: string | number): boolean {
    return this.selectedUnidades.has(String(unidadId));
  }

  toggleSelection(unidadId: string | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const id = String(unidadId);
    if (this.selectedUnidades.has(id)) {
      this.selectedUnidades.delete(id);
    } else {
      this.selectedUnidades.add(id);
    }
  }

  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.filteredUnidades.forEach(u => {
        if (u.id) {
          this.selectedUnidades.add(String(u.id));
        }
      });
    } else {
      this.selectedUnidades.clear();
    }
  }

  isAllSelected(): boolean {
    if (this.filteredUnidades.length === 0) return false;
    return this.filteredUnidades.every(u => !u.id || this.selectedUnidades.has(String(u.id)));
  }

  isIndeterminate(): boolean {
    const selectedCount = this.filteredUnidades.filter(u => u.id && this.selectedUnidades.has(String(u.id))).length;
    return selectedCount > 0 && selectedCount < this.filteredUnidades.length;
  }

  clearSelection(): void {
    this.selectedUnidades.clear();
  }

  verUnidad(u: any): void {
    this.goEditar(u.id);
  }

  getProyectoNombre(unidad: any): string {
    if (unidad?.proyectoId) {
      const proyecto = this.proyectos.find(p => String(p.id) === String(unidad.proyectoId));
      if (proyecto?.nombre) return proyecto.nombre;
    }
    if (unidad?.proyectoNombre) return unidad.proyectoNombre;
    return '';
  }

  getPrimarySize(u: any): string {
    if (!u) return '';
    if (u.tipoUnidad === 'Apartamento') return (u.m2Totales ?? u.m2Internos ?? '') + (u.m2Totales || u.m2Internos ? ' m²' : '');
    if (u.tipoUnidad === 'Casa') return (u.superficieEdificada ?? u.superficieTerreno ?? '') + (u.superficieEdificada || u.superficieTerreno ? ' m²' : '');
    if (u.tipoUnidad?.startsWith('Chacra')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    if (u.tipoUnidad?.startsWith('Campo')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    return u.tamano || u.size || '';
  }

  getCiudadNombre(unidad: any): string {
    if (unidad?.ciudadId) {
      const ciudad = this.ciudades.find(c => c.id === unidad.ciudadId);
      if (ciudad?.nombre) return ciudad.nombre;
    }
    return unidad?.ciudad || unidad?.city || unidad?.localidad || '-';
  }

  getBarrioNombre(unidad: any): string {
    if (unidad?.barrioId) {
      const barrio = this.barrios.find(b => b.id === unidad.barrioId);
      if (barrio?.nombre) return barrio.nombre;
    }
    return unidad?.barrio || '-';
  }

  getExtrasSummary(u: any): string {
    const amenities: any[] = Array.isArray(u?.amenities) ? u.amenities : [];
    if (amenities.length === 0) return '-';
    const labels = amenities.map((a: any) => typeof a === 'string' ? a : (a?.name || a?.label || '')).slice(0, 3);
    return labels.join(', ') + (amenities.length > 3 ? '...' : '');
  }

  // Comparativas
  openCompareModal(event: MouseEvent): void {
    event.stopPropagation();
    const selectedUnits = this.filteredUnidades.filter(u => this.selectedUnidades.has(String(u.id)));
    
    if (selectedUnits.length < 2) {
      this.toastService.warning('Debe seleccionar al menos 2 unidades para comparar');
      return;
    }

    import('../../comparativas/components/compare-modal/compare-modal').then(m => {
      const modalRef = this.modal.open(m.CompareModal, { size: 'lg', backdrop: 'static' });
      (modalRef.componentInstance as any).unidades = selectedUnits;

      modalRef.result.then((result: any) => {
        if (!result) return;
        const contacto = result?.contacto;
        const now = Date.now();
        
        // Only pass unidad IDs - the service will fetch full data via joins
        const unidadesIds = selectedUnits.map(u => ({
          id: String(u.id)
        }));

        const payload = {
          fecha: now, // Use fecha instead of createdAt for DB compatibility
          contactoId: contacto ? String(contacto.id) : null,
          contacto: contacto ? {
            id: String(contacto.id),
            nombre: String(contacto.nombre || ''),
            telefono: String(contacto.telefono || ''),
            mail: contacto.mail || ''
          } : null,
          unidades: unidadesIds
        };

        this.comparativaService.addComparativa(payload).then(ref => {
          this.selectedUnidades.clear();
          const token = (ref as any)?.token || (ref as any)?.id;
          this.toastService.success('Comparativa creada exitosamente');
          if (token) {
            window.open(`/comparacion/${token}`, '_blank');
          }
        }).catch((error: any) => {
          console.error('Error al crear comparativa:', error);
          this.toastService.error('Error al crear la comparativa. Por favor, intente nuevamente.');
        });
      }).catch(() => {});
    });
  }

  private getExtrasArray(u: any): string[] {
    const amenities: any[] = Array.isArray(u?.amenities) ? u.amenities : [];
    return amenities.map((a: any) => typeof a === 'string' ? a : (a?.name || a?.label || ''));
  }
}
