import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComparativaService } from '../../../../core/services/comparativa';
import { Router } from '@angular/router';
import { UnidadService } from '../../../../core/services/unidad';
import { ProyectoService } from '../../../../core/services/proyecto';
import { EXTRAS_CATALOG } from '../../../../core/extras-catalog';
import { BreakpointService } from '../../../../core/services/breakpoint.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FormValidationService } from '../../../../core/services/form-validation.service';
import { FilterSidebarComponent, FilterSidebarConfig } from '../../../../shared/components/filter-sidebar/filter-sidebar';

@Component({
  selector: 'app-comparativas',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSidebarComponent],
  templateUrl: './comparativas.html',
  styleUrl: './comparativas.css'
})
export class Comparativas {
  constructor(
    private unidadService: UnidadService,
    private proyectoService: ProyectoService,
    private modalService: NgbModal,
    private comparativaService: ComparativaService,
    private router: Router,
    public breakpointService: BreakpointService,
    private toastService: ToastService,
    private validationService: FormValidationService
  ) {}

  // Mobile filters overlay state
  filtersOpen = false;

  // UI helpers
  defaultImg: string = 'assets/img/placeholder.jpg';
  openBlocks: Record<string, boolean> = {
    'f-name': false,
    'f-proyecto': false,
    'f-location': false,
    'f-barrio': false,
    'f-tipo': false,
    'f-vis': false,
    'f-disp': false,
    'f-rooms': false,
    'f-size': false,
    'f-price': false,
    'f-exp': false,
    'f-extras': false,
    'f-venta': false
  };

  // Filters state
  nameSelectedId: string | null = null;
  nameItems: Array<{ id: string; label: string }> = [];
  filterLocations: Record<string, boolean> = {};
  filterTipos: Record<string, boolean> = {};
  filterDisponibilidad: Record<string, boolean> = {};
  filterCuartos: Record<string, boolean> = {};
  filterVentaTipo: Record<string, boolean> = {};
  filterVisibilidad: Record<string, boolean> = {};
  filterInterna: Record<string, boolean> = {};
  filterExtras: Record<string, boolean> = {};
  filterBarrios: Record<string, boolean> = {};
  filterOrientaciones: Record<string, boolean> = {};
  filterDistribuciones: Record<string, boolean> = {};
  filterPisos: Record<string, boolean> = {};
  filterBanos: Record<string, boolean> = {};
  filterOcupacion: Record<string, boolean> = {};
  sizeMin: number | null = null;
  sizeMax: number | null = null;
  priceMin: number | null = null;
  priceMax: number | null = null;
  expMin: number | null = null;
  expMax: number | null = null;
  projectSelectedId: string | null = null;
  projectItems: Array<{ id: string; label: string }> = [];

  // Data and view
  all: any[] = [];
  items: any[] = [];
  cities: string[] = [];
  barrios: string[] = [];
  tiposResidencia: string[] = ['Casa', 'Apartamento', 'Complejo'];
  disponibilidadOpts: string[] = [
    'No disponible',
    'Disponible: publicada',
    'Disponible: reventa publicada',
    'Disponible: reventa no publicada',
    'Disponible: con renta publicada',
    'Disponible: con renta no publicada',
    'Reservada para venta',
    'Reservada por promotor',
    'Vendida'
  ];
  ventaOpts: string[] = ['Venta', 'Renta'];
  visibilidadOpts: string[] = ['Publicado', 'No publicado'];
  internaOpts: string[] = ['Activo', 'Stand By', 'Vendido'];
  extrasCatalog = EXTRAS_CATALOG.map(e => e.label);
  orientaciones: string[] = ['Norte', 'Noreste', 'Este', 'Sudeste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
  distribuciones: string[] = ['Frente/Esquinero', 'Frente/Central', 'Contrafrente/Esquinero', 'Contrafrente/Central', 'Lateral', 'Inferior'];
  pisos: string[] = ['Bajo', 'Medio', 'Alto'];
  ocupaciones: string[] = ['A ocupar', '1 a 6 meses', '7 meses 1 año', '1 a 2 años', 'Mas de 2 años'];

  // Compare selection state
  private selectedIdSet: Set<string> = new Set<string>();

  // Filter sidebar configuration
  filterConfigs: FilterSidebarConfig[] = [];
  filterValues: Record<string, any> = {};

  ngOnInit(): void {
    this.unidadService.getUnidades().subscribe(us => {
      const mapped = (us || []).map(u => this.compatMap(u));
      this.all = mapped;
      this.items = this.all.slice();
      this.cities = Array.from(new Set(this.all.map(u => u.ciudad).filter(Boolean))).sort();
      this.barrios = Array.from(new Set(this.all.map(u => u.barrio).filter(Boolean))).sort();
      this.nameItems = this.all.map(u => ({ id: String(u.id), label: String(u.nombre || 'Unidad') })).filter(x => !!x.label);
      // Initialize filters after data is loaded
      this.initializeFilterConfigs();
    });
    this.proyectoService.getProyectos().subscribe(ps => {
      this.projectItems = (ps || []).map(p => ({ id: String(p.id), label: String(p.nombre) }));
    });
  }

  initializeFilterConfigs(): void {
    // Initialize filter configs
    this.filterConfigs = [
        {
          id: 'f-name',
          label: 'Nombre',
          type: 'typeahead',
          placeholder: 'Buscar unidad...',
          items: this.nameItems,
          idKey: 'id',
          labelKey: 'label'
        },
        {
          id: 'f-location',
          label: 'Localidad',
          type: 'checkbox',
          values: this.cities.map(c => ({ value: c, label: c })),
          getSelectedLabel: (value: string[]) => {
            if (!Array.isArray(value) || value.length === 0) return '';
            return value.join(', ');
          }
        },
        {
          id: 'f-barrio',
          label: 'Barrio',
          type: 'checkbox',
          values: this.barrios.map(b => ({ value: b, label: b })),
          getSelectedLabel: (value: string[]) => {
            if (!Array.isArray(value) || value.length === 0) return '';
            return value.join(', ');
          }
        },
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
        id: 'f-disp',
        label: 'Disponibilidad',
        type: 'checkbox',
        values: this.disponibilidadOpts.map(d => ({ value: d, label: d })),
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
        id: 'f-venta',
        label: 'Tipo de venta',
        type: 'checkbox',
        values: this.ventaOpts.map(v => ({ value: v, label: v })),
        getSelectedLabel: (value: string[]) => {
          if (!Array.isArray(value) || value.length === 0) return '';
          return value.join(', ');
        }
      }
    ];

    // Initialize filter values
    this.filterValues = {
      'f-name': null,
      'f-location': [],
      'f-barrio': [],
      'f-tipo': [],
      'f-vis': [],
      'f-disp': [],
      'f-rooms': [],
      'f-size': { from: null, to: null },
      'f-price': { from: null, to: null },
      'f-exp': { from: null, to: null },
      'f-extras': [],
      'f-venta': []
    };
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src.indexOf(this.defaultImg) === -1) {
      img.src = this.defaultImg;
    }
  }

  toggleOpen(id: string): void {
    this.openBlocks[id] = !this.openBlocks[id];
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  closeFilters(): void {
    this.filtersOpen = false;
  }

  get isMobile(): boolean {
    return this.breakpointService.isMobile();
  }

  onFilterChange(event: { id: string; value: any }): void {
    this.filterValues[event.id] = event.value;
    this.validateAndApplyFilters();
  }

  validateAndApplyFilters(): void {
    // Validate range filters
    const rangeErrors: string[] = [];
    
    const sizeRange = this.filterValues['f-size'];
    if (sizeRange && sizeRange.from !== null && sizeRange.to !== null && sizeRange.from > sizeRange.to) {
      rangeErrors.push('El tamaño mínimo no puede ser mayor que el máximo');
    }
    
    const priceRange = this.filterValues['f-price'];
    if (priceRange && priceRange.from !== null && priceRange.to !== null && priceRange.from > priceRange.to) {
      rangeErrors.push('El precio mínimo no puede ser mayor que el máximo');
    }
    
    const expRange = this.filterValues['f-exp'];
    if (expRange && expRange.from !== null && expRange.to !== null && expRange.from > expRange.to) {
      rangeErrors.push('Las expensas mínimas no pueden ser mayores que las máximas');
    }
    
    if (rangeErrors.length > 0) {
      rangeErrors.forEach(error => this.toastService.warning(error));
      return;
    }

    this.applyFilters();
  }

  applyFilters(): void {
    let res = this.all.slice();
    
    // Name filter (typeahead)
    const nameId = this.filterValues['f-name'];
    if (nameId) res = res.filter(u => String(u.id) === String(nameId));

    // Location filter (checkbox array)
    const activeLocs = Array.isArray(this.filterValues['f-location']) ? this.filterValues['f-location'] : [];
    if (activeLocs.length) res = res.filter(u => activeLocs.includes(String(u.ciudad)));

    // Barrio filter (checkbox array)
    const activeBarrios = Array.isArray(this.filterValues['f-barrio']) ? this.filterValues['f-barrio'] : [];
    if (activeBarrios.length) res = res.filter(u => activeBarrios.includes(String(u.barrio)));

    // Tipo filter (checkbox array)
    const activeTipos = Array.isArray(this.filterValues['f-tipo']) ? this.filterValues['f-tipo'] : [];
    if (activeTipos.length) res = res.filter(u => activeTipos.includes(String(u.tipo)));

    // Visibilidad filter (checkbox array)
    const activeVis = Array.isArray(this.filterValues['f-vis']) ? this.filterValues['f-vis'] : [];
    if (activeVis.length) res = res.filter(u => activeVis.includes(String(u.visibilidad)));

    // Disponibilidad filter (checkbox array)
    const activeDisp = Array.isArray(this.filterValues['f-disp']) ? this.filterValues['f-disp'] : [];
    if (activeDisp.length) res = res.filter(u => activeDisp.includes(String(u.disponibilidad)));

    // Cuartos filter (checkbox array)
    const activeCuartos = Array.isArray(this.filterValues['f-rooms']) ? this.filterValues['f-rooms'].map(Number) : [];
    if (activeCuartos.length) res = res.filter(u => {
      const d = Number(u?.dormitorios ?? u?.cuartos);
      return activeCuartos.some(n => (n === 4 ? d >= 4 : d === n));
    });

    // Size range filter
    const sizeRange = this.filterValues['f-size'];
    if (sizeRange) {
      if (sizeRange.from !== null) res = res.filter(u => Number(u?.tamanoM2) >= sizeRange.from);
      if (sizeRange.to !== null) res = res.filter(u => Number(u?.tamanoM2) <= sizeRange.to);
    }

    // Price range filter
    const priceRange = this.filterValues['f-price'];
    if (priceRange) {
      if (priceRange.from !== null) res = res.filter(u => Number(u?.precioUSD) >= priceRange.from);
      if (priceRange.to !== null) res = res.filter(u => Number(u?.precioUSD) <= priceRange.to);
    }

    // Expensas range filter
    const expRange = this.filterValues['f-exp'];
    if (expRange) {
      if (expRange.from !== null) res = res.filter(u => Number(u?.expensasUSD) >= expRange.from);
      if (expRange.to !== null) res = res.filter(u => Number(u?.expensasUSD) <= expRange.to);
    }

    // Extras filter (checkbox array)
    const activeExtras = Array.isArray(this.filterValues['f-extras']) ? this.filterValues['f-extras'] : [];
    if (activeExtras.length) res = res.filter(u => {
      const extras: string[] = Array.isArray(u.extras) ? u.extras : [];
      return activeExtras.every(label => extras.includes(label));
    });

    // Venta tipo filter (checkbox array)
    const activeVenta = Array.isArray(this.filterValues['f-venta']) ? this.filterValues['f-venta'] : [];
    if (activeVenta.length) {
      // This would need to be implemented based on your data structure
      // res = res.filter(u => activeVenta.includes(String(u.tipoVenta)));
    }

    this.items = res;
  }

  toggle(map: Record<string, boolean>, key: string): void { map[key] = !map[key]; this.applyFilters(); }

  nameSelectedLabel(): string {
    const it = this.nameItems.find(i => String(i.id) === String(this.nameSelectedId));
    return it ? it.label : '';
  }

  selectedLocations(): string {
    return this.cities.filter(c => !!this.filterLocations[c]).join(', ');
  }

  selectedTipos(): string {
    return this.tiposResidencia.filter(t => !!this.filterTipos[t]).join(', ');
  }

  selectedDisponibilidad(): string {
    return this.disponibilidadOpts.filter(d => !!this.filterDisponibilidad[d]).join(', ');
  }

  selectedRooms(): string {
    return [1, 2, 3, 4].filter(n => !!(this.filterCuartos as any)[n]).map(n => (n === 4 ? '4+' : String(n))).join(', ');
  }

  selectedVenta(): string {
    return this.ventaOpts.filter(v => !!this.filterVentaTipo[v]).join(', ');
  }

  selectedBarrios(): string {
    return this.barrios.filter(b => !!this.filterBarrios[b]).join(', ');
  }

  selectedExtras(): string {
    return this.extrasCatalog.filter(x => !!this.filterExtras[x]).join(', ');
  }

  projectSelectedLabel(): string {
    const it = this.projectItems.find(i => String(i.id) === String(this.projectSelectedId));
    return it ? it.label : '';
  }

  selectedVisibilidad(): string {
    return this.visibilidadOpts.filter(v => !!this.filterVisibilidad[v]).join(', ');
  }

  selectedInterna(): string {
    return this.internaOpts.filter(v => !!this.filterInterna[v]).join(', ');
  }

  private compatMap(u: any): any {
    // Map existing docs to canonical fields to avoid breaking filters
    const vendida = Boolean(u?.vendida || u?.sold);
    const visibilidad = u?.visibilidad || (u?.publicada ? 'Publicado' : 'Publicado');
    const publicacionInterna = u?.publicacionInterna || undefined;
    let disponibilidad: string = u?.disponibilidad;
    if (!disponibilidad) {
      disponibilidad = vendida ? 'Vendida' : 'Disponible: publicada';
    }
    return {
      ...u,
      ciudad: u?.ciudad || u?.city || u?.localidad || '',
      barrio: u?.barrio || '',
      tipo: u?.tipoResidencia || u?.tipo || '',
      dormitorios: typeof u?.dormitorios === 'number' ? u.dormitorios : Number(u?.cuartos ?? 0),
      banos: typeof u?.banos === 'number' ? u.banos : Number(u?.banos ?? 1),
      tamanoM2: Number(u?.tamanoM2 ?? u?.tamano ?? u?.size ?? 0) || null,
      precioUSD: Number(u?.precioUSD ?? u?.precio ?? 0) || null,
      expensasUSD: Number(u?.expensasUSD ?? u?.expensas ?? 0) || null,
      extras: Array.isArray(u?.extras) ? u.extras : [],
      visibilidad,
      publicacionInterna,
      disponibilidad,
      proyectoId: u?.proyectoId || ''
    };
  }

  // --- Compare selection methods ---
  isSelected(u: any): boolean { return this.selectedIdSet.has(String(u.id)); }

  toggleSelect(u: any): void {
    const id = String(u?.id);
    if (!id) return;
    if (this.selectedIdSet.has(id)) {
      this.selectedIdSet.delete(id);
    } else {
      this.selectedIdSet.add(id);
    }
  }

  selectedCount(): number { return this.selectedIdSet.size; }

  openCompareModal(event: MouseEvent): void {
    event.stopPropagation();
    const selectedUnits = this.items.filter(u => this.selectedIdSet.has(String(u.id)));
    
    // Validate that at least 2 units are selected
    if (selectedUnits.length < 2) {
      this.toastService.warning('Debe seleccionar al menos 2 unidades para comparar');
      return;
    }

    // Lazy import modal component to avoid circular refs
    import('../../components/compare-modal/compare-modal').then(m => {
      const modalRef = this.modalService.open(m.CompareModal, { size: 'lg', backdrop: 'static' });
      (modalRef.componentInstance as any).unidades = selectedUnits;

      modalRef.result.then((result: any) => {
        if (!result) return;
        const contacto = result?.contacto;
        const now = Date.now();
        const unidadesSnapshot = selectedUnits.map(u => ({
          id: String(u.id),
          nombre: u?.nombre || u?.name || '',
          ciudad: u?.ciudad || u?.city || '',
          barrio: u?.barrio || '',
          dormitorios: u?.dormitorios ?? u?.cuartos ?? null,
          banos: u?.banos ?? null,
          tamanoM2: u?.tamanoM2 ?? u?.tamano ?? null,
          precioUSD: u?.precioUSD ?? u?.precio ?? null,
          expensasUSD: u?.expensasUSD ?? u?.expensas ?? null,
          extras: Array.isArray(u?.extras) ? u.extras : [],
          imagenUrl: u?.imagenUrl || u?.imagen || u?.image || null,
          lat: u?.lat ?? u?.latitude ?? null,
          lng: u?.lng ?? u?.longitude ?? null
        }));

        const payload = {
          createdAt: now,
          contacto: contacto ? {
            id: String(contacto.id),
            nombre: String(contacto.nombre || ''),
            telefono: String(contacto.telefono || ''),
            mail: contacto.mail || ''
          } : null,
          unidades: unidadesSnapshot
        };

        this.comparativaService.addComparativa(payload).then(ref => {
          this.selectedIdSet.clear();
          const id = (ref as any)?.id;
          this.toastService.success('Comparativa creada exitosamente');
          if (id) this.router.navigate(['/comparacion', id]);
        }).catch((error: any) => {
          console.error('Error al crear comparativa:', error);
          this.toastService.error('Error al crear la comparativa. Por favor, intente nuevamente.');
        });
      }).catch(() => {});
    });
  }
}

