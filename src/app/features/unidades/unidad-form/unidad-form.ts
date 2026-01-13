import { Component, Input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { FilterComponent } from '../../../shared/components/filter/filter';
import { UnidadService } from '../../../core/services/unidad';
import { ProyectoService } from '../../../core/services/proyecto';
import { CiudadService } from '../../../core/services/ciudad.service';
import { BarrioService } from '../../../core/services/barrio.service';
import { Ciudad, Barrio } from '../../../core/models';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProyectoSelectModal } from '../components/proyecto-select-modal/proyecto-select-modal';

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
  @Input() isImportMode: boolean = false; // Hide "Agregar y Repetir" button when importing

  constructor(
    private router: Router, 
    private unidadService: UnidadService, 
    private proyectoService: ProyectoService,
    private ciudadService: CiudadService,
    private barrioService: BarrioService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private modalService: NgbModal,
    public activeModal?: NgbActiveModal
  ) {}

  // Form tabs
  activeFormTab: 'basicos' | 'proyecto' | 'extras' = 'basicos';

  // Main form model. We keep legacy fields for backward-compat while introducing new dynamic-unit fields
  model: any = {
    // Unidad Values
    // Id
    nombre: '', // saved on unidad
    tipoUnidad: 'Apartamento', // 'Apartamento' | 'Casa' | 'Chacra' | 'Campo' - Default: Apartamento
    estadoComercial: 'En venta', // saved on unidad
    precioUSD: null,
    responsable: '', // saved on unidad
    comision: null, // saved on unidad
    dormitorios: null,
    banos: null,
    orientacion: null,
    distribucion: null,
    m2Internos: null,
    m2Totales: null,
    piso: null,
    superficieEdificada: null,
    superficieTerreno: null,
    plantas: null,
    hectareas: null,
    // deleted at 
    // created at
    // updated at
    barrio: null, // saved on unidad
    ciudad: null, // saved on unidad
    ciudadId: null, // saved on unidad
    barrioId: null, // saved on unidad
    terraza: '',
    garage: 'No',
    tamanoTerraza: null,
    tamanoGarage: null,
    precioGarage: null,
    amenities: [],
    altura: null,
    fechaEntrega: '', // saved on unidad

    // Proyecto values
    proyectoId: '', // saved on proyecto
    proyectoNombre: '',
    // created at
    // updated at
  };
  id?: string;
  proyectoItems: Array<{ id: string; label: string }> = [];
  proyectosAll: any[] = [];

  private refreshProyectoItems(): void {
    if (!this.proyectosAll || this.proyectosAll.length === 0) {
      this.proyectoItems = [];
      return;
    }
    const sorted = [...this.proyectosAll].sort((a, b) => {
      const aTime = a.createdAt || a.created || 0;
      const bTime = b.createdAt || b.created || 0;
      return bTime - aTime; // Más recientes primero
    });
    this.proyectoItems = sorted.map(p => ({ 
      id: String(p.id), 
      label: String(p.nombre || p.name || 'Sin nombre') 
    })).filter(x => x.id && x.id.trim() !== '');
  }
  // Flow control
  proyectoModo: 'existente' | 'nuevo' = 'existente';
  proyectoSelectMode: 'existente' | 'nuevo' = 'existente'; // New field for UI selection
  proyectoFieldsDisabled: boolean = false; // Track if proyecto fields should be disabled
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
  orientaciones = ['Norte', 'Sur', 'Este', 'Oeste'];
  
  // Options for filter components
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
  ciudadFilterOptions: Array<{ value: string; label: string }> = [];
  
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
  terrazaOptions = [
    { value: 'Si', label: 'Si' },
    { value: 'No', label: 'No' }
  ];
  garageOptions = [
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
  
  get barrioFilterOptions(): Array<{ value: string; label: string }> {
    return this.barrios.map(b => ({ value: String(b.id), label: b.nombre }));
  }
  
  get nuevoProyectoBarrioFilterOptions(): Array<{ value: string; label: string }> {
    return this.nuevoProyectoBarrios.map(b => ({ value: String(b.id), label: b.nombre }));
  }
  
  // Session units added during the current flow (for table rendering)
  sessionUnits: any[] = [];
  busy = false;
  projectLocked = false;
  editingProyecto = false;
  barrios: Barrio[] = [];
  nuevoProyectoBarrios: Barrio[] = [];

  ngOnInit(): void {
    // Siempre abrimos como modal - si no hay activeModal, redirigir a unidades
    if (!this.activeModal) {
      this.router.navigate(['/unidades']);
      return;
    }

    // Load ciudades from database
    this.ciudadService.getCiudades().subscribe(ciudadesList => {
      this.ciudadFilterOptions = ciudadesList.map(c => ({ value: String(c.id), label: c.nombre }));
    });

    this.id = this.unidadId;
    const proyectoIdInput = this.proyectoId;
    const editProyectoInput = this.editProyecto;
    
    this.proyectoService.getProyectos().subscribe(ps => {
      this.proyectosAll = ps || [];
      this.refreshProyectoItems();
      
      if (proyectoIdInput) {
        const p = this.proyectosAll.find(x => String(x.id) === String(proyectoIdInput));
        if (p) {
          this.proyectoModo = 'existente';
          this.proyectoSelectMode = 'existente';
          this.model.proyectoId = String(p.id);
          this.loadProyectoData(p);
          this.editingProyecto = editProyectoInput;
          this.projectLocked = false;
          this.proyectoFieldsDisabled = true;
          // Load barrios for nuevo proyecto ciudad
          if (this.nuevoProyecto.localidad) {
            this.loadBarriosForNuevoProyecto(this.nuevoProyecto.localidad);
          }
          this.reloadSessionUnits();
        }
      }
    });
    if (this.id) {
      this.unidadService.getUnidadById(this.id).subscribe(u => {
        if (u) {
          this.model = { ...this.model, ...u };
          // Map ciudad_id/barrio_id to ciudad/barrio strings if needed
          if (u.ciudad_id && !this.model.ciudad) {
            this.model.ciudad = String(u.ciudad_id);
          }
          if (u.barrio_id && !this.model.barrio) {
            this.model.barrio = String(u.barrio_id);
          }
          // Load barrios for the selected ciudad
          if (this.model.ciudad) {
            this.loadBarriosForCiudad(this.model.ciudad);
          }
          // Set proyectoSelectMode based on whether proyectoId exists
          if (this.model.proyectoId) {
            this.proyectoSelectMode = 'existente';
            this.projectLocked = true;
            // Load proyecto data if not already loaded
            const p = this.proyectosAll.find(x => String(x.id) === String(this.model.proyectoId));
            if (p) {
              this.loadProyectoData(p);
              this.proyectoFieldsDisabled = true;
            }
          }
        }
      });
    } else {
      // Si no hay id, es una nueva unidad - asegurar que tipoUnidad tenga valor por defecto
      if (!this.model.tipoUnidad) {
        this.model.tipoUnidad = 'Apartamento';
      }
    }
  }

  onCiudadChange(): void {
    this.model.barrio = null;
    this.loadBarriosForCiudad(this.model.ciudad);
  }

  onNuevoProyectoLocalidadChange(): void {
    this.nuevoProyecto.barrio = null;
    this.loadBarriosForNuevoProyecto(this.nuevoProyecto.localidad);
  }

  private loadBarriosForCiudad(ciudadId: string | null | undefined): void {
    if (!ciudadId) {
      this.barrios = [];
      return;
    }
    const ciudadIdNum = parseInt(String(ciudadId), 10);
    if (isNaN(ciudadIdNum)) {
      this.barrios = [];
      return;
    }
    this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe(barrios => {
      this.barrios = barrios;
    });
  }

  private loadBarriosForNuevoProyecto(ciudadId: string | null | undefined): void {
    if (!ciudadId) {
      this.nuevoProyectoBarrios = [];
      return;
    }
    const ciudadIdNum = parseInt(String(ciudadId), 10);
    if (isNaN(ciudadIdNum)) {
      this.nuevoProyectoBarrios = [];
      return;
    }
    this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe(barrios => {
      this.nuevoProyectoBarrios = barrios;
    });
  }

  async save(): Promise<void> {
    // If in import mode, save as draft (don't persist to database)
    if (this.isImportMode) {
      return this.saveAsDraft();
    }

    // If we're not editing and form is empty but we have saved unidades, just close
    // This handles the case where user clicked "Agregar y Repetir" multiple times
    // and then clicks "Guardar" with an empty form
    if (!this.id && this.savedUnidades.length > 0) {
      const isFormEmpty = !this.model.nombre || this.model.nombre.trim() === '';
      if (isFormEmpty) {
        // Form is empty but we have saved unidades, just close the modal
        if (this.activeModal) {
          this.activeModal.close(true);
        }
        return;
      }
    }
    
    // Validate before saving
    if (!this.validateRequiredFields()) {
      return;
    }

    try {
      this.busy = true;
      
      // Ensure proyecto exists BEFORE building payload (so proyectoId is available)
      // This handles both creating new proyectos and ensuring existing ones are valid
      if (!this.id) {
        await this.ensureProyectoId();
      }
      
      const payload = await this.buildPayloadWithProjectInheritance();
      
      // Si es Apartamento con proyecto, actualizar la fecha de entrega en el proyecto
      if (this.model.tipoUnidad === 'Apartamento' && this.model.proyectoId && this.model.fechaEntrega) {
        await this.proyectoService.updateProyecto(String(this.model.proyectoId), {
          entrega: this.model.fechaEntrega
        });
      }
      
      if (this.id) {
        // Update existing unidad
        const result = await this.unidadService.updateUnidad(this.id, payload);
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
        // Create new unidad
        const result = await this.unidadService.addUnidad(payload);
        this.toastService.success(`Unidad "${payload.nombre}" creada exitosamente`);
      }
      
      // Siempre es modal, cerrarlo con éxito
      if (this.activeModal) {
        this.activeModal.close(true);
      }
    } catch (error: any) {
      console.error('Error saving unidad:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        stack: error?.stack
      });
      
      // Show more specific error message if available
      const errorMessage = error?.message || error?.details || 'Error al guardar la unidad. Por favor, verifique los datos e intente nuevamente.';
      this.toastService.error(errorMessage);
    } finally {
      this.busy = false;
    }
  }

  /**
   * Save as draft (for import mode) - just validate and return model data without persisting
   */
  async saveAsDraft(): Promise<void> {
    // Validate before saving
    if (!this.validateRequiredFields()) {
      return;
    }

    try {
      this.busy = true;
      
      // Handle proyecto validation (check if exists, create if not)
      await this.ensureProyectoIdForDraft();
      
      // Close modal with model data (will be handled by parent component)
      if (this.activeModal) {
        this.activeModal.close({ draft: true, model: { ...this.model } });
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      this.toastService.error(error?.message || 'Error al guardar el borrador');
    } finally {
      this.busy = false;
    }
  }

  /**
   * Ensure proyecto exists for draft mode (check if nombre exists, create if not)
   */
  private async ensureProyectoIdForDraft(): Promise<void> {
    // If proyectoNombre is set but proyectoId is not, check if proyecto exists
    if (this.model.proyectoNombre && !this.model.proyectoId) {
      const proyectos = await firstValueFrom(this.proyectoService.getProyectos());
      const proyectoExistente = proyectos.find(
        (p: any) => p.nombre?.toLowerCase().trim() === this.model.proyectoNombre?.toLowerCase().trim()
      );
      
      if (proyectoExistente) {
        this.model.proyectoId = String(proyectoExistente.id);
      } else {
        // Create new proyecto
        const nuevoProyecto = await this.proyectoService.addProyecto({
          nombre: this.model.proyectoNombre
        });
        this.model.proyectoId = String(nuevoProyecto.id);
      }
    }
  }

  onProyectoSelectModeChange(): void {
    if (this.proyectoSelectMode === 'existente') {
      // Clear new project fields
      this.model.proyectoNombre = '';
      this.proyectoFieldsDisabled = false;
    } else {
      // Clear existing project selection
      this.model.proyectoId = '';
      this.proyectoFieldsDisabled = false;
    }
  }

  onProyectoChange(): void {
    const p = this.proyectosAll.find(x => String(x.id) === String(this.model.proyectoId));
    if (!p) {
      // Clear proyectoNombre if proyecto is cleared
      if (!this.model.proyectoId) {
        this.model.proyectoNombre = '';
        this.proyectoFieldsDisabled = false;
      }
      return;
    }
    // Load proyecto data and disable fields
    this.loadProyectoData(p);
    this.proyectoFieldsDisabled = true;
    this.reloadSessionUnits();
  }

  private loadProyectoData(p: any): void {
    // Denormalize values from proyecto into unidad model for fast filters
    this.model.proyectoNombre = p.nombre || '';
    // Map ciudad_id/barrio_id to ciudad/barrio strings for form
    this.model.ciudad = p.ciudad_id ? String(p.ciudad_id) : (p.ciudad || this.model.ciudad || null);
    this.model.barrio = p.barrio_id ? String(p.barrio_id) : (p.barrio || this.model.barrio || null);
    // Load barrios for the selected ciudad
    if (this.model.ciudad) {
      this.loadBarriosForCiudad(this.model.ciudad);
    }
    // Also update nuevoProyecto for consistency
    this.nuevoProyecto = {
      nombre: p.nombre || '',
      desarrollador: p.desarrollador || '',
      localidad: p.ciudad_id ? String(p.ciudad_id) : (p.ciudad || p.localidad || null),
      barrio: p.barrio_id ? String(p.barrio_id) : (p.barrio || null),
      direccion: p.direccion || '',
      entrega: p.entrega || ''
    };
  }

  async onProyectoNombreBlur(): Promise<void> {
    // Only validate if we're in "new" mode and nombre is filled
    if (this.proyectoSelectMode !== 'nuevo' || !this.model.proyectoNombre || this.model.proyectoNombre.trim() === '') {
      return;
    }

    const nombre = this.model.proyectoNombre.trim();
    
    // Check if a proyecto with this name already exists
    const existingProyectos = this.proyectosAll.filter(p => 
      p.nombre && p.nombre.toLowerCase().trim() === nombre.toLowerCase()
    );

    if (existingProyectos.length > 0) {
      // Show modal to select existing proyecto
      const modalRef = this.modalService.open(ProyectoSelectModal, {
        size: 'md',
        backdrop: 'static',
        keyboard: false
      });
      
      (modalRef.componentInstance as any).proyectos = existingProyectos;
      (modalRef.componentInstance as any).searchTerm = nombre;

      try {
        const selectedProyecto = await modalRef.result;
        if (selectedProyecto) {
          // User selected an existing proyecto
          this.proyectoSelectMode = 'existente';
          this.model.proyectoId = String(selectedProyecto.id);
          this.model.proyectoNombre = selectedProyecto.nombre || '';
          this.loadProyectoData(selectedProyecto);
          this.proyectoFieldsDisabled = true;
          this.reloadSessionUnits();
        }
      } catch {
        // User cancelled - clear the nombre field
        this.model.proyectoNombre = '';
      }
    }
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
        if (this.model.proyectoId) {
          this.proyectoSelectMode = 'existente';
          this.projectLocked = true;
        }
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
    if (this.model.proyectoId) {
      if (this.proyectoSelectMode === 'existente' && !this.model.proyectoId) return false;
      // When creating a new project, require at least project name
      if (this.proyectoSelectMode === 'nuevo' && !this.model.proyectoNombre && !this.nuevoProyecto.nombre) return false;
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
    
    // Campos específicos por tipo
    if (this.model.tipoUnidad === 'Apartamento') {
      if (this.model.m2Internos === null || this.model.m2Internos === undefined) errors.push('El tamaño interior (m²) es obligatorio para apartamentos');
      if (this.model.m2Totales === null || this.model.m2Totales === undefined) errors.push('El tamaño total (m²) es obligatorio para apartamentos');
      if (!this.model.orientacion) errors.push('La orientación es obligatoria para apartamentos');
      if (!this.model.distribucion) errors.push('La distribución es obligatoria para apartamentos');
      if (!this.model.altura || this.model.altura.trim() === '') errors.push('La altura es obligatoria para apartamentos');
    } else if (this.model.tipoUnidad === 'Casa' || this.model.tipoUnidad === 'Campo' || this.model.tipoUnidad === 'Chacra') {
      if (this.model.superficieTerreno === null || this.model.superficieTerreno === undefined) errors.push('Los metros totales son obligatorios');
      if (this.model.superficieEdificada === null || this.model.superficieEdificada === undefined) errors.push('Los metros edificados son obligatorios');
      if (this.model.plantas === null || this.model.plantas === undefined) errors.push('Las plantas son obligatorias');
    }
    
    // Campos comunes obligatorios
    if (!this.model.estadoComercial) errors.push('El estado comercial es obligatorio');
    if (!this.model.responsable || this.model.responsable.trim() === '') errors.push('El responsable es obligatorio');
    if (this.model.precioUSD === null || this.model.precioUSD === undefined) errors.push('El precio (USD) es obligatorio');
    if (this.model.comision === null || this.model.comision === undefined) errors.push('La comisión (%) es obligatoria');

    // Validación de Tab 2 - Solo para Casa o Campo
    if (this.isCasaOrCampoType()) {
      if (!this.model.ciudad) errors.push('La ciudad es obligatoria');
      if (!this.model.barrio) errors.push('El barrio es obligatorio');
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
      'proyectoId', 'ciudad', 'barrio', 'responsable', 'fechaEntrega', 'tipoUnidad',
      // specs by type
      'dormitorios', 'banos', 'm2Internos', 'm2Totales', 'orientacion', // apto
      'superficieEdificada', 'superficieTerreno', 'plantas', // casa
      'hectareas', // chacra/campo
    ];
    const next: any = {};
    for (const k of kept) next[k] = this.model[k];
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
    // Remove fechaEntrega from payload so it's not saved to unidad table
    if (this.model.tipoUnidad === 'Apartamento' && this.model.proyectoId) {
      delete payload.fechaEntrega; // No guardar en la unidad, se guarda en el proyecto
    }
    // For all other cases (Casa, Campo, Chacra, or Apartamento without proyecto), fechaEntrega should be saved
    
    // If proyectoId is not set, check if proyectoNombre is filled (user wants to create proyecto)
    // If proyectoNombre is also empty, proyecto is optional - allow saving without it
    if (!this.model.proyectoId || this.model.proyectoId === '') {
      const nombreProyecto = this.model.proyectoNombre || this.nuevoProyecto.nombre;
      if (!nombreProyecto || nombreProyecto.trim() === '') {
        // No proyectoId and no proyectoNombre - proyecto is optional
        payload.proyectoId = null;
        return payload;
      }
      // proyectoNombre is filled but proyectoId not set - this shouldn't happen if ensureProyectoId() was called
      // But just in case, set proyectoId to null and let ensureProyectoId() handle it
      payload.proyectoId = null;
      return payload;
    }
    
    // Ensure proyectoId is a string
    payload.proyectoId = String(this.model.proyectoId);
    
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
      // Note: desarrollador belongs to proyectos table, not unidades table - do not include it
      // Para apartamentos con proyecto, usar la fecha del modelo (que se guardará en el proyecto)
      if (!(this.model.tipoUnidad === 'Apartamento' && this.model.proyectoId)) {
        payload.fechaEntrega = payload.fechaEntrega || p.entrega;
      }
      // Map ciudad_id/barrio_id to ciudad/barrio strings for form compatibility (UI only, not saved to DB)
      // These are denormalized from proyecto and shouldn't be saved to unidades table
      // Note: ciudad and barrio varchar fields were removed from table, only ciudad_id and barrio_id are saved
      if (!payload.ciudad && p.ciudad_id) {
        payload.ciudad = String(p.ciudad_id);
      }
      if (!payload.barrio && p.barrio_id) {
        payload.barrio = String(p.barrio_id);
      }
    }
    return payload;
  }

  private async ensureProyectoId(): Promise<void> {
    // If proyectoId is already set and not empty, we're good
    if (this.model.proyectoId && this.model.proyectoId !== '') return;
    
    // If we're in "existente" mode but no proyectoId is selected, proyecto is optional
    if (this.proyectoSelectMode === 'existente' && !this.model.proyectoId) {
      return;
    }
    
    // Check if we have a proyectoNombre filled in (indicates user wants to create a new proyecto)
    const nombreProyecto = this.model.proyectoNombre || this.nuevoProyecto.nombre;
    
    // If no proyectoNombre is filled, proyecto is optional - allow saving without it
    if (!nombreProyecto || nombreProyecto.trim() === '') {
      return;
    }
    
    // Validate that the nombre doesn't already exist (should have been caught earlier, but double-check)
    const existingProyectos = this.proyectosAll.filter(p => 
      p.nombre && p.nombre.toLowerCase().trim() === nombreProyecto.toLowerCase().trim()
    );
    
    if (existingProyectos.length > 0) {
      throw new Error(`Ya existe un proyecto con el nombre "${nombreProyecto}". Por favor, seleccione el proyecto existente.`);
    }
    
    // proyectoNombre is filled and doesn't exist, so create a new proyecto
    // Only send nombre and proyectoId (both optional) to proyectos table
    const pPayload: any = {
      nombre: nombreProyecto
      // proyectoId is optional - not setting it here as it's not part of the form
    };
    
    const added = await this.proyectoService.addProyecto(pPayload);
    
    // Ensure proyectoId is set as a string (never empty)
    const newProyectoId = String(added.id);
    if (!newProyectoId || newProyectoId === '') {
      throw new Error('Error al crear el proyecto: no se obtuvo un ID válido');
    }
    this.model.proyectoId = newProyectoId;
    
    // Update proyectoNombre for consistency
    this.model.proyectoNombre = nombreProyecto;
    
    // Refresh proyectos list to include the newly created one
    this.proyectoService.getProyectos().subscribe(ps => {
      this.proyectosAll = ps || [];
      this.refreshProyectoItems();
    });
  }

  // New form methods
  isCasaOrCampoType(): boolean {
    return this.model.tipoUnidad === 'Casa' || this.model.tipoUnidad === 'Campo';
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
      
      // Ensure proyecto exists BEFORE building payload (so proyectoId is available)
      if (this.model.proyectoId) {
        await this.ensureProyectoId();
      }
      
      const payload = await this.buildPayloadWithProjectInheritance();
      
      // Si es Apartamento con proyecto, actualizar la fecha de entrega en el proyecto
      if (this.model.tipoUnidad === 'Apartamento' && this.model.proyectoId && this.model.fechaEntrega) {
        await this.proyectoService.updateProyecto(String(this.model.proyectoId), {
          entrega: this.model.fechaEntrega
        });
      }
      
      // Save the unidad (solo si no estamos editando)
      const addedRef = await this.unidadService.addUnidad(payload);
      const saved = { id: addedRef.id, ...payload };
      
      // Add to sessionUnits if in proyecto mode (for display table)
      if (this.model.proyectoId) {
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
        // Proyecto
        proyectoNombre: this.model.proyectoNombre,
        proyectoId: this.model.proyectoId,
        ciudad: this.model.ciudad,
        barrio: this.model.barrio,
        fechaEntrega: this.model.fechaEntrega,
        // Extras
        terraza: this.model.terraza,
        garage: this.model.garage,
        tamanoTerraza: this.model.tamanoTerraza,
        tamanoGarage: this.model.tamanoGarage,
        precioGarage: this.model.precioGarage,
        amenities: Array.isArray(this.model.amenities) ? [...this.model.amenities] : [],
        // Basic fields that might be reused
        tipoUnidad: this.model.tipoUnidad,
        orientacion: this.model.orientacion,
        distribucion: this.model.distribucion,
        altura: this.model.altura,
        precioUSD: this.model.precioUSD,
        estadoComercial: this.model.estadoComercial,
        responsable: this.model.responsable,
        comision: this.model.comision
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
      
      // Reload barrios if ciudad is set
      if (this.model.ciudad) {
        this.loadBarriosForCiudad(this.model.ciudad);
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
