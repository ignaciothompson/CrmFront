import { Component, Input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { EXTRAS_CATALOG } from '../../../core/extras-catalog';

@Component({
  selector: 'app-unidad-form',
  standalone: true,
  imports: [FormsModule, RouterModule, TypeaheadComponent],
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
    public activeModal?: NgbActiveModal
  ) {}

  // Main form model. We keep legacy fields for backward-compat while introducing new dynamic-unit fields
  model: any = {
    // Common
    nombre: '',
    descripcion: '',
    entrega: '',
    ubicacion: '',
    city: '',
    barrio: '',
    responsable: '',
    comision: null,
    // Link to proyecto (when alcance === 'proyecto')
    proyectoId: '',
    // Dynamic typing for units
    tipoUnidad: '', // 'Apartamento' | 'Casa' | 'Chacra' | 'Campo'
    estadoComercial: 'En venta', // En venta | En alquiler | Reservada | Vendida
    // Apartment specifics
    dormitorios: null,
    banos: null,
    m2Internos: null,
    m2Totales: null,
    piso: null,
    orientacion: '',
    // Casa specifics
    superficieEdificada: null,
    superficieTerreno: null,
    antiguedad: null,
    condicion: '', // A estrenar | Reciclado | A reciclar
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
    aptitudSuelo: '',
    indiceProductividad: null,
    mejorasTrabajo: '',
    infraestructuraHabitacional: '',
    fuentesAgua: '',
    // Legacy (kept but not surfaced in new flow unless needed)
    tipo: 'Residencial',
    estado: 'En planificación',
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
  nuevoProyecto: { nombre: string; desarrollador: string; localidad: string; barrio: string; direccion: string; entrega: string } = {
    nombre: '',
    desarrollador: '',
    localidad: '',
    barrio: '',
    direccion: '',
    entrega: ''
  };
  tipoUnidadOptions = ['Apartamento', 'Casa', 'Chacra', 'Campo'];
  estadoComercialOptions = ['En venta', 'En alquiler', 'Reservada', 'Vendida', 'Pre-venta', 'En Pozo'];
  condicionCasaOptions = ['A estrenar', 'Reciclado', 'A reciclar'];
  orientaciones = ['Norte', 'Sur', 'Este', 'Oeste'];
  // Session units added during the current flow (for table rendering)
  sessionUnits: any[] = [];
  busy = false;
  projectLocked = false;
  editingProyecto = false;
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
      this.proyectoItems = this.proyectosAll.map(p => ({ id: String(p.id), label: String(p.nombre) }));
      if (proyectoIdInput) {
        const p = this.proyectosAll.find(x => String(x.id) === String(proyectoIdInput));
        if (p) {
          this.alcance = 'proyecto';
          this.proyectoModo = 'nuevo';
          this.model.proyectoId = String(p.id);
          this.nuevoProyecto = {
            nombre: p.nombre || '',
            desarrollador: p.desarrollador || '',
            localidad: p.ciudad || p.localidad || '',
            barrio: p.barrio || '',
            direccion: p.direccion || '',
            entrega: p.entrega || ''
          };
          this.editingProyecto = editProyectoInput;
          this.projectLocked = false;
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

  async save(): Promise<void> {
    const payload = await this.buildPayloadWithProjectInheritance();
    if (this.alcance === 'proyecto' && this.id) {
      await this.unidadService.updateUnidad(this.id, payload);
      const updated = { id: this.id, ...payload };
      this.upsertSessionUnit(updated);
      this.id = undefined;
      this.prepareNextCloned();
      return;
    }
    if (this.alcance === 'proyecto' && !this.id) {
      await this.ensureProyectoId();
    }
    if (this.id) {
      await this.unidadService.updateUnidad(this.id, payload);
    } else {
      await this.unidadService.addUnidad(payload);
    }
    
    // Siempre es modal, cerrarlo con éxito
    if (this.activeModal) {
      this.activeModal.close(true);
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
    if (!p) return;
    // Denormalize values from proyecto into unidad model for fast filters
    this.model.city = p.ciudad || p.city || this.model.city;
    this.model.barrio = p.barrio || this.model.barrio;
    // If unit type is empty, default from proyecto.tipo when present
    if (!this.model.tipo && p.tipo) this.model.tipo = p.tipo;
    this.recomputeBarrios();
    this.reloadSessionUnits();
  }

  // Project flow: add current unit, then prepare the next one cloning configuration
  async addAndRepeat(): Promise<void> {
    if (this.busy) return;
    if (!this.validateRequiredForAdd()) return;
    try {
      this.busy = true;
      await this.ensureProyectoId();
      const payload = await this.buildPayloadWithProjectInheritance();
      const addedRef = await this.unidadService.addUnidad(payload);
      const saved = { id: addedRef.id, ...payload };
      this.upsertSessionUnit(saved);
      this.prepareNextCloned();
      this.projectLocked = true;
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
    const ok = typeof window !== 'undefined' ? window.confirm('¿Eliminar la unidad seleccionada?') : true;
    if (!ok) return;
    await this.unidadService.deleteUnidad(row.id);
    this.sessionUnits = this.sessionUnits.filter(x => x.id !== row.id);
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
      payload.entrega = payload.entrega || p.entrega;
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
    this.model.city = pPayload.ciudad || this.model.city;
    this.model.barrio = pPayload.barrio || this.model.barrio;
    this.recomputeBarrios();
  }
}
