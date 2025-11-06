import { Component, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../core/services/contacto';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoForm } from './contacto-form/contacto-form';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [FormsModule, RouterModule, TypeaheadComponent],
  templateUrl: './contactos.html',
  styleUrl: './contactos.css'
})
export class Contactos implements OnDestroy {
  constructor(private contactoService: ContactoService, private modal: NgbModal) {}

  localidad: string = '';
  selectedBarrio: string = '';
  barrios: string[] = [];
  all: any[] = [];
  filtered: any[] = [];
  nameSelectedId: string | null = null;
  nameItems: Array<{ id: string; label: string }> = [];
  tipoResidencia: string = '';
  cuartos: number | null = null;
  private sub?: Subscription;
  private readonly cityLabelMap: Record<string, string> = { norte: 'Montevideo', sur: 'Canelones', este: 'Maldonado' };

  ngOnInit(): void {
    this.sub = this.contactoService.getContactos().subscribe(list => {
      this.all = list || [];
      this.nameItems = this.all
        .map(c => ({
          id: String(c.id),
          label: `${c?.Nombre || c?.nombre || ''} ${c?.Apellido || c?.apellido || ''}`.trim()
        }))
        .filter(it => !!it.label);
      this.recompute();
    });
  }

  onCiudadChange(): void {
    this.selectedBarrio = '';
    this.recompute();
  }

  onBarrioChange(): void {
    this.recompute();
  }

  labelForCity(value: string): string { return this.cityLabelMap[value] || value || ''; }

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

  resetFilters(): void {
    this.localidad = '';
    this.selectedBarrio = '';
    this.recompute();
  }

  applyFilters(): void {
    this.recompute();
  }

  private recompute(): void {
    if (this.localidad) {
      const byCity = this.all.filter(c => (c?.direccion?.Ciudad || c.localidad || c.city) === this.localidad);
      const set = new Set<string>(byCity.map(c => c?.direccion?.Barrio || c.barrio).filter(Boolean));
      this.barrios = Array.from(set).sort();
      this.filtered = byCity;
    } else {
      this.barrios = [];
      this.filtered = this.all.slice();
    }

    // Apply barrio filter
    if (this.selectedBarrio) {
      this.filtered = this.filtered.filter(c => (c?.direccion?.Barrio || c.barrio) === this.selectedBarrio);
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
