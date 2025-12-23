import { Component, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactoService } from '../../../core/services/contacto';
import { CiudadService } from '../../../core/services/ciudad.service';
import { BarrioService } from '../../../core/services/barrio.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';
import { ContactoForm } from '../contacto-form/contacto-form';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [FormsModule, RouterModule, SubheaderComponent],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css'
})
export class Contactos implements OnDestroy {
  constructor(
    private contactoService: ContactoService, 
    private ciudadService: CiudadService,
    private barrioService: BarrioService,
    private modal: NgbModal
  ) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  localidad: string = '';
  selectedBarrio: string = '';
  barrios: Array<{ value: string; label: string }> = [];
  ciudades: Array<{ value: string; label: string }> = [];
  all: any[] = [];
  filtered: any[] = [];
  nameSelectedId: string | null = null;
  nameItems: Array<{ id: string; label: string }> = [];
  tipoResidencia: string = '';
  cuartos: number | null = null;
  private sub?: Subscription;

  ngOnInit(): void {
    // Load ciudades from database
    this.ciudadService.getCiudades().subscribe(ciudadesList => {
      this.ciudades = ciudadesList.map(c => ({ value: String(c.id), label: c.nombre }));
      this.updateFilterConfigs();
    });

    this.sub = this.contactoService.getContactos().subscribe(list => {
      this.all = list || [];
      this.nameItems = this.all
        .map(c => ({
          id: String(c.id),
          label: `${c?.Nombre || c?.nombre || ''} ${c?.Apellido || c?.apellido || ''}`.trim()
        }))
        .filter(it => !!it.label);
      this.updateFilterConfigs();
      this.recompute();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'nombre',
        type: 'typeahead',
        label: 'Nombre/Apellido',
        placeholder: 'Escriba para filtrar...',
        items: this.nameItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'localidad',
        type: 'select',
        label: 'Ciudad',
        values: [
          { value: '', label: 'Todas' },
          ...this.ciudades
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'barrio',
        type: 'select',
        label: 'Barrio',
        values: [
          { value: '', label: 'Todos' },
          ...this.barrios
        ],
        disabled: !this.localidad,
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'tipoResidencia',
        type: 'select',
        label: 'Tipo de residencia',
        values: [
          { value: '', label: 'Todas' },
          { value: 'Apartamento', label: 'Apartamento' },
          { value: 'Casa', label: 'Casa' },
          { value: 'Duplex', label: 'Duplex' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'cuartos',
        type: 'select',
        label: 'Cuartos',
        values: [
          { value: null, label: 'Todos' },
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4+' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.nameSelectedId = values['nombre'] || null;
    this.localidad = values['localidad'] || '';
    this.selectedBarrio = values['barrio'] || '';
    this.tipoResidencia = values['tipoResidencia'] || '';
    this.cuartos = values['cuartos'] !== undefined && values['cuartos'] !== null ? values['cuartos'] : null;
    
    // Update barrios list when ciudad changes - load from database
    if (this.localidad) {
      const ciudadIdNum = parseInt(String(this.localidad), 10);
      if (!isNaN(ciudadIdNum)) {
        this.barrioService.getBarriosByCiudad(ciudadIdNum).subscribe(barriosList => {
          this.barrios = barriosList.map(b => ({ value: b.nombre, label: b.nombre }));
          this.updateFilterConfigs(); // Update barrio options
        });
      } else {
        this.barrios = [];
        this.updateFilterConfigs();
      }
    } else {
      this.barrios = [];
      this.selectedBarrio = '';
      this.updateFilterConfigs();
    }
    
    this.recompute();
  }

  labelForCity(value: string): string { 
    const ciudad = this.ciudades.find(c => c.value === value);
    return ciudad ? ciudad.label : value || ''; 
  }

  goNuevo(): void {
    const modalRef = this.modal.open(ContactoForm, { size: 'xl', backdrop: 'static', keyboard: false });
    modalRef.result.then((result: any) => {
      // Si se guardó exitosamente, recargar los contactos pero mantener los filtros
      if (result === true) {
        this.recompute();
      }
    }).catch(() => {
      // Modal cerrado sin guardar, mantener filtros
    });
  }

  goEditar(id: string): void {
    const modalRef = this.modal.open(ContactoForm, { size: 'xl', backdrop: 'static', keyboard: false });
    const component = modalRef.componentInstance as ContactoForm;
    component.contactoId = String(id);
    modalRef.result.then((result: any) => {
      // Si se guardó exitosamente, recargar los contactos pero mantener los filtros
      if (result === true) {
        this.recompute();
      }
    }).catch(() => {
      // Modal cerrado sin guardar, mantener filtros
    });
  }

  async eliminar(id: string): Promise<void> {
    if (!id) return;
    const ok = confirm('¿Eliminar este contacto?');
    if (!ok) return;
    await this.contactoService.deleteContacto(String(id));
  }


  private recompute(): void {
    if (this.localidad) {
      const byCity = this.all.filter(c => {
        const ciudadId = c?.direccion?.Ciudad || c.localidad || c.city;
        return String(ciudadId) === String(this.localidad);
      });
      // Extract unique barrio names from filtered contacts
      const barrioSet = new Set<string>(byCity.map(c => c?.direccion?.Barrio || c.barrio).filter(Boolean));
      // Match barrios from database with the ones found in contacts
      const barrioNames = Array.from(barrioSet).sort();
      this.barrios = barrioNames.map(b => ({ value: b, label: b }));
      this.filtered = byCity;
    } else {
      this.barrios = [];
      this.filtered = this.all.slice();
    }

    // Apply barrio filter
    if (this.selectedBarrio) {
      this.filtered = this.filtered.filter(c => {
        const barrio = c?.direccion?.Barrio || c.barrio;
        return String(barrio) === String(this.selectedBarrio);
      });
    }

    // Apply name selection filter (from typeahead by id)
    if (this.nameSelectedId) {
      this.filtered = this.filtered.filter(c => String(c.id) === String(this.nameSelectedId));
    }

    // Apply tipo residencia filter
    if (this.tipoResidencia) {
      this.filtered = this.filtered.filter(c => (c?.preferencia?.TipoResidencia || c?.tipoResidencia) === this.tipoResidencia);
    }

    // Apply cuartos filter
    if (this.cuartos != null) {
      const rooms = this.cuartos;
      this.filtered = this.filtered.filter(c => {
        const val = Number(c?.preferencia?.Cuartos ?? c?.cuartos);
        if (!isFinite(val)) return false;
        if (rooms === 4) return val >= 4;
        return val === rooms;
      });
    }
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
