import { Component, Input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { EXTRAS_CATALOG } from '../../../core/extras-catalog';

@Component({
  selector: 'app-unidad-form',
  standalone: true,
  imports: [FormsModule, RouterModule, FilterComponent],
  templateUrl: './unidad-form.html',
  styleUrl: './unidad-form.css'
})
export class UnidadForm {
  @Input() unidadId?: string;
  @Input() proyectoId?: string;
  @Input() editProyecto: boolean = false;

  constructor(
    private router: Router, 
    private unidadService: UnidadService, 
    private proyectoService: ProyectoService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    public activeModal?: NgbActiveModal
  ) {}

  // Form tabs
  activeFormTab: 'basicos' | 'proyecto' | 'extras' = 'basicos';

  // Main form model. We keep legacy fields for backward-compat while introducing new dynamic-unit fields
  model: any = {
    // Common
    nombre: '',
    descripcion: '',
    entrega: '',
    ubicacion: '',
    city: null,
    barrio: null,
    responsable: '',
    comision: null,
    // Link to proyecto (when alcance === 'proyecto')
    proyectoId: '',
    // Dynamic typing for units
    tipoUnidad: null, // 'Apartamento' | 'Casa' | 'Chacra' | 'Campo'
    tipoPropiedad: null, // 'Edificio' | 'Casa' | 'PH'
    estadoComercial: 'En venta', // En venta | En alquiler | Reservada | Vendida
    // Apartment specifics
    dormitorios: null,
    banos: null,
    m2Internos: null,
    m2Totales: null,
    piso: null,
    orientacion: null,
    distribucion: null,
    altura: null,
    precioUSD: null,
    estado: null,
    proyectoNombre: '',
    pisoProyecto: null,
    unidadesTotales: null,
    terraza: 'No',
    garage: 'No',
    tamanoTerraza: null,
    tamanoGarage: null,
    precioGarage: null,
    areaComun: '',
    equipamiento: '',
    amenities: [],
    // Casa specifics
    superficieEdificada: null,
    superficieTerreno: null,
    plantas: null,
    antiguedad: null,
    condicion: null, // A estrenar | Reciclado | A reciclar
    // Chacra / Rural specifics
    hectareas: null, // shared with Campo
    m2Edificados: null,
    tipoConstruccion: '',
    acceso: '',
    infraestructura: '',
    luz: false,
    agua: false,
    internet: false,
    // Campo specifics
    aptitudSuelo: null,
    indiceProductividad: null,
    mejorasTrabajo: '',
    infraestructuraHabitacional: '',
    fuentesAgua: '',
    // Legacy (kept but not surfaced in new flow unless needed)
    tipo: 'Residencial',
    unidades: null,
    inicio: '',
    extras: []
  };
  id?: string;
  proyectoItems: Array<{ id: string; label: string }> = [];
  proyectosAll: any[] = [];
  extrasCatalog = EXTRAS_CATALOG;
  apartmentExtras = ['Garage', 'Terraza', 'Parrillero', 'Servicio', 'Estufa a Leña', 'Piscina', 'Jacuzzi', 'Loft', 'Dúplex / Tríplex', 'Penthouse'];
  houseExtras = ['Garage', 'Jardín', 'Piscina', 'Parrillero', 'Estufa a Leña', 'Dependencia de Servicio', 'Altillo / Playroom'];
  // Flow control
  alcance: 'proyecto' | 'unica' = 'proyecto';
  proyectoModo: 'existente' | 'nuevo' = 'existente';
  nuevoProyecto: { nombre: string; desarrollador: string; localidad: string | null; barrio: string | null; direccion: string; entrega: string } = {
    nombre: '',
    desarrollador: '',
    localidad: null,
    barrio: null,
    direccion: '',
    entrega: ''
  };
  tipoUnidadOptions = ['Apartamento', 'Casa', 'Chacra', 'Campo'];
  estadoComercialOptions = ['En venta', 'En alquiler', 'Reservada', 'Vendida', 'Pre-venta', 'En Pozo'];
  condicionCasaOptions = ['A estrenar', 'Reciclado', 'A reciclar'];
  orientaciones = ['Norte', 'Sur', 'Este', 'Oeste'];
  
  // Options for filter components
  alcanceOptions = [
    { value: 'proyecto', label: 'Es parte de un Proyecto' },
    { value: 'unica', label: 'Es una Unidad Única' }
  ];
  proyectoModoOptions = [
    { value: 'existente', label: 'Existente' },
    { value: 'nuevo', label: 'Nuevo' }
  ];
  tipoUnidadFilterOptions = [
    { value: 'Apartamento', label: 'Apartamento' },
    { value: 'Casa', label: 'Casa' },
    { value: 'Chacra', label: 'Chacra' },
    { value: 'Campo', label: 'Campo' }
  ];
  estadoComercialFilterOptions = this.estadoComercialOptions.map(s => ({ value: s, label: s }));
  ciudades = [
    { value: 'norte', label: 'Montevideo' },
    { value: 'sur', label: 'Canelones' },
    { value: 'este', label: 'Maldonado' }
  ];
  
  condicionCasaFilterOptions = this.condicionCasaOptions.map(c => ({ value: c, label: c }));
  orientacionFilterOptions = [
    { value: 'Norte', label: 'Norte' },
    { value: 'Noreste', label: 'Noreste' },
    { value: 'Este', label: 'Este' },
    { value: 'Sudeste', label: 'Sudeste' },
    { value: 'Sur', label: 'Sur' },
    { value: 'Suroeste', label: 'Suroeste' },
    { value: 'Oeste', label: 'Oeste' },
    { value: 'Noroeste', label: 'Noroeste' }
  ];
  distribucionFilterOptions = [
    { value: 'Frente/Esquinero', label: 'Frente/Esquinero' },
    { value: 'Frente/Central', label: 'Frente/Central' },
    { value: 'Contrafrente/Esquinero', label: 'Contrafrente/Esquinero' },
    { value: 'Contrafrente/Central', label: 'Contrafrente/Central' },
    { value: 'Lateral', label: 'Lateral' },
    { value: 'Inferior', label: 'Inferior' }
  ];
  tipoProyectoFilterOptions = [
    { value: 'Edificio', label: 'Edificio' },
    { value: 'Barrio', label: 'Barrio' }
  ];
  estadoFilterOptions = [
    { value: 'Construccion', label: 'Construcción' },
    { value: 'Pre-venta', label: 'Pre-venta' },
    { value: 'Venta', label: 'Venta' }
  ];
  terrazaOptions = [
    { value: '', label: 'Seleccione' },
    { value: 'Si', label: 'Si' },
    { value: 'No', label: 'No' }
  ];
  terrazaGarageOptions = [
    { value: 'No', label: 'No' },
    { value: 'Si', label: 'Si' },
    { value: 'Extra', label: 'Extra' }
  ];
  amenitiesList = [
    { key: 'canchaPaddle', label: 'Cancha de Paddle' },
    { key: 'gimnasioCerrado', label: 'Gimnasio cerrado' },
    { key: 'piscinaExteriorClimatizada', label: 'Piscina exterior climatizada' },
    { key: 'piscinaInteriorClimatizada', label: 'Piscina interior climatizada' },
    { key: 'juegosParaNinos', label: 'Juegos para niños' },
    { key: 'salaDeJuegos', label: 'Sala de Juegos' },
    { key: 'detectorHumo', label: 'Detector de humo' },
    { key: 'equipamientoContraIncendios', label: 'Equipamiento contra incendios' },
    { key: 'videoVigilanciaCCTV', label: 'Video vigilancia CCTV' },
    { key: 'barbacoaCerrada', label: 'Barbacoa Cerrada' },
    { key: 'jardinParaMascotas', label: 'Jardín para mascotas' },
    { key: 'lavanderia', label: 'Lavandería' },
    { key: 'recepcion24_7', label: 'Recepción 24/7' },
    { key: 'salaDeReuniones', label: 'Sala de reuniones' },
    { key: 'wifiAreasComunes', label: 'WiFi areas comunes' },
    { key: 'hidromasajes', label: 'Hidromasajes' },
    { key: 'saunaHumedo', label: 'Sauna Húmedo' },
    { key: 'saunaSeco', label: 'Sauna Seco' },
    { key: 'spa', label: 'Spa' }
  ];
  savedUnidades: Array<{ id: string; nombre: string; piso: number | null; m2Internos: number | null; m2Totales: number | null }> = [];
  aptitudSueloOptions = [
    { value: 'Ganadera', label: 'Ganadera' },
    { value: 'Agrícola', label: 'Agrícola' },
    { value: 'Forestal', label: 'Forestal' },
    { value: 'Mixta', label: 'Mixta' }
  ];
  ciudadFilterOptions = this.ciudades.map(c => ({ value: c.value, label: c.label }));
  
  get barrioFilterOptions() {
    if (!this.barrios || this.barrios.length === 0) {
      return [];
    }
    return this.barrios.map(b => ({ value: b, label: b }));
  }
  
  get nuevoProyectoBarrioFilterOptions() {
    if (!this.nuevoProyectoBarrios || this.nuevoProyectoBarrios.length === 0) {
      return [];
    }
    return this.nuevoProyectoBarrios.map(b => ({ value: b, label: b }));
  }
  // Session units added during the current flow (for table rendering)
  sessionUnits: any[] = [];
  busy = false;
  projectLocked = false;
  editingProyecto = false;
  barrios: string[] = [];
  nuevoProyectoBarrios: string[] = [];
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

  ngOnInit(): void {
    // Siempre abrimos como modal - si no hay activeModal, redirigir a unidades
    if (!this.activeModal) {
      this.router.navigate(['/unidades']);
      return;
    }

    this.id = this.unidadId;
    const proyectoIdInput = this.proyectoId;
    const editProyectoInput = this.editProyecto;
    
    this.proyectoService.getProyectos().subscribe(ps => {
      this.proyectosAll = ps || [];
      // Ordenar por fecha de creación (más recientes primero) y mapear
      const sorted = [...this.proyectosAll].sort((a, b) => {
        const aTime = a.createdAt || a.created || 0;
        const bTime = b.createdAt || b.created || 0;
        return bTime - aTime; // Más recientes primero
      });
      this.proyectoItems = sorted.map(p => ({ id: String(p.id), label: String(p.nombre) }));
      if (proyectoIdInput) {
        const p = this.proyectosAll.find(x => String(x.id) === String(proyectoIdInput));
        if (p) {
          this.alcance = 'proyecto';
          this.proyectoModo = 'nuevo';
          this.model.proyectoId = String(p.id);
          this.nuevoProyecto = {
            nombre: p.nombre || '',
            desarrollador: p.desarrollador || '',
            localidad: p.ciudad || p.localidad || null,
            barrio: p.barrio || null,
            direccion: p.direccion || '',
            entrega: p.entrega || ''
          };
          this.editingProyecto = editProyectoInput;
          this.projectLocked = false;
          this.recomputeNuevoProyectoBarrios();
          this.reloadSessionUnits();
        }
      }
    });
    if (this.id) {
      this.unidadService.getUnidadById(this.id).subscribe(u => {
        if (u) {
          this.model = { ...this.model, ...u };
          this.recomputeBarrios();
          this.alcance = this.model.proyectoId ? 'proyecto' : 'unica';
          if (this.alcance === 'proyecto') this.projectLocked = true;
        }
      });
    }
  }

  onCityChange(): void {
    this.model.barrio = null;
    this.recomputeBarrios();
  }

  onNuevoProyectoLocalidadChange(): void {
    this.nuevoProyecto.barrio = null;
    this.recomputeNuevoProyectoBarrios();
  }

  private recomputeNuevoProyectoBarrios(): void {
    if (!this.nuevoProyecto.localidad) {
      this.nuevoProyectoBarrios = [];
      return;
    }
    const curated = this.barriosCatalog[this.nuevoProyecto.localidad] || [];
    this.unidadService.getUnidades().subscribe(list => {
      const byCity = list.filter(u => (u.city || u.localidad) === this.nuevoProyecto.localidad);
      const fromData = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      const merged = Array.from(new Set<string>([...curated, ...Array.from(fromData)])).sort();
      this.nuevoProyectoBarrios = merged;
    });
  }

  private recomputeBarrios(): void {
    if (!this.model.city) {
      this.barrios = [];
      return;
    }
    this.unidadService.getUnidades().subscribe(list => {
      const byCity = list.filter(u => (u.city || u.localidad) === this.model.city);
      const fromData = new Set<string>(byCity.map(u => u.barrio).filter(Boolean));
      const curated = new Set<string>(this.barriosCatalog[this.model.city] || []);
      const merged = Array.from(new Set<string>([...Array.from(curated), ...Array.from(fromData)])).sort();
      this.barrios = merged;
    });
  }

  async save(): Promise<void> {
    // Validate before saving
    if (!this.validateRequiredFields()) {
      return;
    }

    try {
      this.busy = true;
      const payload = await this.buildPayloadWithProjectInheritance();
      
      if (this.alcance === 'proyecto' && this.id) {
        await this.unidadService.updateUnidad(this.id, payload);
        const updated = { id: this.id, ...payload };
        this.upsertSessionUnit(updated);
        // Update in savedUnidades if it exists
        const savedIdx = this.savedUnidades.findIndex(su => su.id === String(this.id));
        if (savedIdx >= 0) {
          this.savedUnidades[savedIdx] = {
            id: String(this.id),
            nombre: payload.nombre || '',
            piso: payload.piso || null,
            m2Internos: payload.m2Internos || null,
            m2Totales: payload.m2Totales || null
          };
        }
        this.id = undefined;
        this.prepareNextCloned();
        this.toastService.success(`Unidad "${payload.nombre}" actualizada exitosamente`);
        return;
      }
      if (this.alcance === 'proyecto' && !this.id) {
        await this.ensureProyectoId();
      }
      
      // Si es Apartamento con proyecto, actualizar la fecha de entrega en el proyecto
      if (this.isApartamentoWithProyecto() && this.model.proyectoId && this.model.entrega) {
        await this.proyectoService.updateProyecto(String(this.model.proyectoId), {
          entrega: this.model.entrega
        });
      }
      
      if (this.id) {
        await this.unidadService.updateUnidad(this.id, payload);
        // Update in savedUnidades if it exists
        const savedIdx = this.savedUnidades.findIndex(su => su.id === String(this.id));
        if (savedIdx >= 0) {
          this.savedUnidades[savedIdx] = {
            id: String(this.id),
            nombre: payload.nombre || '',
            piso: payload.piso || null,
            m2Internos: payload.m2Internos || null,
            m2Totales: payload.m2Totales || null
          };
        }
        this.toastService.success(`Unidad "${payload.nombre}" actualizada exitosamente`);
      } else {
        await this.unidadService.addUnidad(payload);
        this.toastService.success(`Unidad "${payload.nombre}" creada exitosamente`);
      }
      
      // Siempre es modal, cerrarlo con éxito
      if (this.activeModal) {
        this.activeModal.close(true);
      }
    } catch (error) {
      console.error('Error saving unidad:', error);
      this.toastService.error('Error al guardar la unidad. Por favor, verifique los datos e intente nuevamente.');
    } finally {
      this.busy = false;
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
    if (!p) {
      // Clear proyectoNombre if proyecto is cleared
      if (!this.model.proyectoId) {
        this.model.proyectoNombre = '';
      }
      return;
    }
    // Denormalize values from proyecto into unidad model for fast filters
    this.model.proyectoNombre = p.nombre || '';
    this.model.city = p.ciudad || p.city || this.model.city || null;
    this.model.barrio = p.barrio || this.model.barrio || null;
    this.model.ubicacion = p.direccion || this.model.ubicacion || '';
    // If unit type is empty, default from proyecto.tipo when present
    if (!this.model.tipo && p.tipo) this.model.tipo = p.tipo;
    this.recomputeBarrios();
    this.reloadSessionUnits();
  }

  // Project flow: add current unit, then prepare the next one cloning configuration
  async addAndRepeat(): Promise<void> {
    if (this.busy) return;
    if (!this.validateRequiredFields()) return;
    try {
      this.busy = true;
      await this.ensureProyectoId();
      const payload = await this.buildPayloadWithProjectInheritance();
      const addedRef = await this.unidadService.addUnidad(payload);
      const saved = { id: addedRef.id, ...payload };
      this.upsertSessionUnit(saved);
      this.prepareNextCloned();
      this.projectLocked = true;
      this.toastService.success(`Unidad "${payload.nombre}" agregada exitosamente`);
    } catch (error) {
      console.error('Error adding unidad:', error);
      this.toastService.error('Error al agregar la unidad. Por favor, intente nuevamente.');
    } finally {
      this.busy = false;
    }
  }

  editFromTable(row: any): void {
    if (!row?.id) return;
    this.id = row.id;
    this.unidadService.getUnidadById(row.id).subscribe(u => {
      if (u) {
        this.model = { ...this.model, ...u };
        this.alcance = this.model.proyectoId ? 'proyecto' : 'unica';
        if (this.alcance === 'proyecto') this.projectLocked = true;
      }
    });
  }

  async deleteFromTable(row: any): Promise<void> {
    if (!row?.id) return;
    const nombre = row.nombre || 'la unidad seleccionada';
    
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar "${nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    try {
      await this.unidadService.deleteUnidad(row.id);
      this.sessionUnits = this.sessionUnits.filter(x => x.id !== row.id);
      this.toastService.error(`Unidad "${nombre}" eliminada exitosamente`);
    } catch (error) {
      console.error('Error deleting unidad:', error);
      this.toastService.error('Error al eliminar la unidad. Por favor, intente nuevamente.');
    }
  }

  private validateRequiredForAdd(): boolean {
    if (this.alcance === 'proyecto') {
      if (this.proyectoModo === 'existente' && !this.model.proyectoId) return false;
      // When creating a new project, require at least project name
      if (this.proyectoModo === 'nuevo' && !this.nuevoProyecto.nombre) return false;
    }
    if (!this.model.tipoUnidad) return false;
    if (!this.model.nombre) return false;
    if (this.model.comision === null || this.model.comision === undefined || this.model.comision === '') return false;
    return true;
  }

  private validateRequiredFields(): boolean {
    const errors: string[] = [];

    // TODOS LOS CAMPOS DE TAB 1 SON OBLIGATORIOS
    // Validación básica de Tab 1
    if (!this.model.tipoUnidad) errors.push('El tipo de propiedad es obligatorio');
    if (!this.model.nombre || this.model.nombre.trim() === '') errors.push('El nombre es obligatorio');
    if (this.model.tipoUnidad === 'Apartamento' && (this.model.piso === null || this.model.piso === undefined)) {
      errors.push('El piso es obligatorio para apartamentos');
    }
    if (this.model.dormitorios === null || this.model.dormitorios === undefined) errors.push('Los dormitorios son obligatorios');
    if (this.model.banos === null || this.model.banos === undefined) errors.push('Los baños son obligatorios');
    if (this.model.m2Internos === null || this.model.m2Internos === undefined) errors.push('El tamaño interior (m²) es obligatorio');
    if (this.model.m2Totales === null || this.model.m2Totales === undefined) errors.push('El tamaño total (m²) es obligatorio');
    
    // Campos específicos por tipo
    if (this.model.tipoUnidad === 'Apartamento') {
      if (!this.model.orientacion) errors.push('La orientación es obligatoria para apartamentos');
      if (!this.model.distribucion) errors.push('La distribución es obligatoria para apartamentos');
      if (!this.model.altura || this.model.altura.trim() === '') errors.push('La altura es obligatoria para apartamentos');
    } else if (this.model.tipoUnidad === 'Casa' || this.model.tipoUnidad === 'Campo' || this.model.tipoUnidad === 'Chacra') {
      if (this.model.superficieTerreno === null || this.model.superficieTerreno === undefined) errors.push('Los metros totales son obligatorios');
      if (this.model.superficieEdificada === null || this.model.superficieEdificada === undefined) errors.push('Los metros edificados son obligatorios');
      if (this.model.plantas === null || this.model.plantas === undefined) errors.push('Las plantas son obligatorias');
    }
    
    // Campos comunes obligatorios
    if (!this.model.estado) errors.push('El estado es obligatorio');
    if (!this.model.responsable || this.model.responsable.trim() === '') errors.push('El responsable es obligatorio');
    if (this.model.precioUSD === null || this.model.precioUSD === undefined) errors.push('El precio (USD) es obligatorio');
    if (this.model.comision === null || this.model.comision === undefined) errors.push('La comisión (%) es obligatoria');

    // Validación de Tab 2 - Solo para Casa o Campo
    if (this.isCasaOrCampoType()) {
      if (!this.model.city) errors.push('La ciudad es obligatoria');
      if (!this.model.barrio) errors.push('El barrio es obligatorio');
      if (!this.model.ubicacion || this.model.ubicacion.trim() === '') errors.push('La dirección es obligatoria');
    }

    if (errors.length > 0) {
      // Mostrar cada error como un toast
      errors.forEach(error => this.toastService.error(error));
      return false;
    }

    return true;
  }

  private prepareNextCloned(): void {
    const kept = [
      'proyectoId', 'ubicacion', 'city', 'barrio', 'responsable', 'entrega', 'tipoUnidad',
      // specs by type
      'dormitorios', 'banos', 'm2Internos', 'm2Totales', 'orientacion', 'extras', // apto
      'superficieEdificada', 'superficieTerreno', 'antiguedad', 'condicion', // casa
      'hectareas', 'm2Edificados', 'tipoConstruccion', 'acceso', 'infraestructura', 'luz', 'agua', 'internet', // chacra
      'aptitudSuelo', 'indiceProductividad', 'mejorasTrabajo', 'infraestructuraHabitacional', 'fuentesAgua' // campo
    ];
    const next: any = {};
    for (const k of kept) next[k] = this.model[k];
    next.descripcion = this.model.descripcion || '';
    next.comision = this.model.comision;
    // Reset fields
    next.nombre = '';
    next.estadoComercial = 'En venta';
    next.piso = this.model.piso != null && !isNaN(Number(this.model.piso)) ? Number(this.model.piso) + 1 : null;
    this.id = undefined;
    this.model = { ...this.model, ...next };
  }

  private reloadSessionUnits(): void {
    if (!this.model.proyectoId) {
      this.sessionUnits = [];
      return;
    }
    this.unidadService.getUnidades().subscribe(list => {
      this.sessionUnits = (list || []).filter(u => String(u.proyectoId) === String(this.model.proyectoId));
    });
  }

  private upsertSessionUnit(saved: any): void {
    const idx = this.sessionUnits.findIndex(x => x.id === saved.id);
    if (idx >= 0) this.sessionUnits[idx] = saved; else this.sessionUnits.unshift(saved);
  }

  getPrimarySize(u: any): string {
    if (!u) return '';
    if (u.tipoUnidad === 'Apartamento') return (u.m2Totales ?? u.m2Internos ?? '') + (u.m2Totales || u.m2Internos ? ' m²' : '');
    if (u.tipoUnidad === 'Casa') return (u.superficieEdificada ?? u.superficieTerreno ?? '') + (u.superficieEdificada || u.superficieTerreno ? ' m²' : '');
    if (u.tipoUnidad?.startsWith('Chacra')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    if (u.tipoUnidad?.startsWith('Campo')) return (u.hectareas ?? '') + (u.hectareas ? ' ha' : '');
    return '';
  }

  private async buildPayloadWithProjectInheritance(): Promise<any> {
    const payload = { ...this.model };
    
    // Si es Apartamento con proyecto, la fecha de entrega va al proyecto, no a la unidad
    if (this.isApartamentoWithProyecto()) {
      payload.entrega = undefined; // No guardar en la unidad
    }
    
    if (this.alcance !== 'proyecto') return payload;
    let p: any | undefined;
    if (this.model.proyectoId) {
      p = this.proyectosAll.find(x => String(x.id) === String(this.model.proyectoId));
    }
    if (!p && this.proyectoModo === 'nuevo' && this.nuevoProyecto.nombre) {
      p = {
        desarrollador: this.nuevoProyecto.desarrollador,
        entrega: this.nuevoProyecto.entrega,
        ciudad: this.nuevoProyecto.localidad,
        barrio: this.nuevoProyecto.barrio,
        direccion: this.nuevoProyecto.direccion
      };
    }
    if (p) {
      payload.desarrollador = p.desarrollador ?? payload.desarrollador;
      // Para apartamentos con proyecto, usar la fecha del modelo (que se guardará en el proyecto)
      if (!this.isApartamentoWithProyecto()) {
        payload.entrega = payload.entrega || p.entrega;
      }
      payload.city = payload.city || p.ciudad || p.city;
      payload.barrio = payload.barrio || p.barrio;
      payload.ubicacion = payload.ubicacion || p.direccion;
    }
    return payload;
  }

  private async ensureProyectoId(): Promise<void> {
    if (this.alcance !== 'proyecto') return;
    if (this.proyectoModo === 'existente') return;
    if (this.model.proyectoId) return;
    const pPayload = {
      nombre: this.nuevoProyecto.nombre,
      desarrollador: this.nuevoProyecto.desarrollador,
      ciudad: this.nuevoProyecto.localidad,
      barrio: this.nuevoProyecto.barrio,
      direccion: this.nuevoProyecto.direccion,
      entrega: this.nuevoProyecto.entrega
    };
    const added = await this.proyectoService.addProyecto(pPayload);
    this.model.proyectoId = added.id;
    this.model.city = pPayload.ciudad || this.model.city || null;
    this.model.barrio = pPayload.barrio || this.model.barrio || null;
    this.recomputeBarrios();
  }

  // New form methods
  onTipoPropiedadChange(): void {
    // When tipoPropiedad changes, update tipoUnidad if needed
    if (this.model.tipoPropiedad === 'Casa') {
      this.model.tipoUnidad = 'Casa';
    }
  }

  isCasaType(): boolean {
    return this.model.tipoPropiedad === 'Casa' || this.model.tipoUnidad === 'Casa';
  }

  isCasaOrCampoType(): boolean {
    return this.model.tipoUnidad === 'Casa' || this.model.tipoUnidad === 'Campo';
  }

  isApartamentoWithProyecto(): boolean {
    return this.model.tipoUnidad === 'Apartamento' && !!this.model.proyectoId;
  }

  hasTerraza(): boolean {
    return this.model.terraza === 'Si';
  }

  onTerrazaChange(): void {
    if (this.model.terraza !== 'Si' && this.model.terraza !== 'Si') {
      this.model.tamanoTerraza = null;
    }
  }

  hasGarage(): boolean {
    return this.model.garage === 'Si' || this.model.garage === 'Extra';
  }

  onGarageChange(): void {
    if (this.model.garage !== 'Si' && this.model.garage !== 'Extra') {
      this.model.tamanoGarage = null;
      this.model.precioGarage = null;
    } else if (this.model.garage === 'Si') {
      this.model.precioGarage = null;
    }
  }

  hasAmenity(key: string): boolean {
    return (this.model.amenities || []).includes(key);
  }

  toggleAmenity(key: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentAmenities: string[] = Array.isArray(this.model.amenities) ? this.model.amenities.slice() : [];
    if (target.checked && !currentAmenities.includes(key)) {
      this.model.amenities = [...currentAmenities, key];
    } else if (!target.checked && currentAmenities.includes(key)) {
      this.model.amenities = currentAmenities.filter((k: string) => k !== key);
    }
  }

  editSavedUnidad(unidad: any): void {
    if (!unidad?.id) return;
    this.id = unidad.id;
    this.unidadService.getUnidadById(unidad.id).subscribe(u => {
      if (u) {
        this.model = { ...this.model, ...u };
        // Ensure we preserve the current tab and form state
        this.activeFormTab = 'basicos';
        // Remove from savedUnidades since we're editing it
        this.savedUnidades = this.savedUnidades.filter(su => su.id !== unidad.id);
      }
    });
  }

  async deleteSavedUnidad(unidad: any): Promise<void> {
    if (!unidad?.id) return;
    const nombre = unidad.nombre || 'la unidad seleccionada';
    
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar "${nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    try {
      await this.unidadService.deleteUnidad(String(unidad.id));
      this.savedUnidades = this.savedUnidades.filter(u => u.id !== unidad.id);
      this.toastService.error(`Unidad "${nombre}" eliminada exitosamente`);
    } catch (error) {
      console.error('Error deleting unidad:', error);
      this.toastService.error('Error al eliminar la unidad. Por favor, intente nuevamente.');
    }
  }

  async addAndRepeatFromBulk(): Promise<void> {
    if (this.busy) return;
    // No permitir agregar si estamos editando una unidad existente
    if (this.id) {
      this.toastService.error('No se puede agregar una unidad nueva mientras se está editando. Por favor, guarde o cancele la edición primero.');
      return;
    }
    if (!this.validateRequiredFields()) return;
    
    try {
      this.busy = true;
      const payload = await this.buildPayloadWithProjectInheritance();
      
      // Si es Apartamento con proyecto, actualizar la fecha de entrega en el proyecto
      if (this.isApartamentoWithProyecto() && this.model.proyectoId && this.model.entrega) {
        await this.proyectoService.updateProyecto(String(this.model.proyectoId), {
          entrega: this.model.entrega
        });
      }
      
      // Save the unidad (solo si no estamos editando)
      const addedRef = await this.unidadService.addUnidad(payload);
      const saved = { id: addedRef.id, ...payload };
      
      // Add to sessionUnits if in proyecto mode (for display table)
      if (this.alcance === 'proyecto' && this.model.proyectoId) {
        this.upsertSessionUnit(saved);
      }
      
      // Add to savedUnidades table for display
      this.savedUnidades.push({
        id: String(addedRef.id),
        nombre: this.model.nombre || '',
        piso: this.model.piso || null,
        m2Internos: this.model.m2Internos || null,
        m2Totales: this.model.m2Totales || null
      });
      
      // Save data to preserve
      const preservedData = {
        // Proyecto/Ubicacion
        tipoPropiedad: this.model.tipoPropiedad,
        proyectoNombre: this.model.proyectoNombre,
        city: this.model.city,
        barrio: this.model.barrio,
        ubicacion: this.model.ubicacion,
        pisoProyecto: this.model.pisoProyecto,
        unidadesTotales: this.model.unidadesTotales,
        // Extras y Equipamiento
        terraza: this.model.terraza,
        garage: this.model.garage,
        tamanoTerraza: this.model.tamanoTerraza,
        tamanoGarage: this.model.tamanoGarage,
        precioGarage: this.model.precioGarage,
        areaComun: this.model.areaComun,
        equipamiento: this.model.equipamiento,
        amenities: Array.isArray(this.model.amenities) ? [...this.model.amenities] : [],
        // Basic fields that might be reused
        tipoUnidad: this.model.tipoUnidad,
        orientacion: this.model.orientacion,
        distribucion: this.model.distribucion,
        altura: this.model.altura,
        precioUSD: this.model.precioUSD,
        estado: this.model.estado
      };
      
      // Reset basic unit fields
      this.model.nombre = '';
      this.model.piso = null;
      this.model.dormitorios = null;
      this.model.banos = null;
      this.model.m2Internos = null;
      this.model.m2Totales = null;
      
      // Restore preserved data
      Object.assign(this.model, preservedData);
      
      // Reload barrios if city is set
      if (this.model.city) {
        this.recomputeBarrios();
      }
      
      this.toastService.success(`Unidad "${payload.nombre}" agregada exitosamente`);
    } catch (error) {
      console.error('Error adding unidad:', error);
      this.toastService.error('Error al agregar la unidad. Por favor, intente nuevamente.');
    } finally {
      this.busy = false;
    }
  }
}
