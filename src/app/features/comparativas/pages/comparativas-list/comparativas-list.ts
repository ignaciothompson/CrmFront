import { Component } from '@angular/core';

import { ComparativaService } from '../../../../core/services/comparativa';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead';
import { SubheaderComponent, FilterConfig } from '../../../../shared/components/subheader/subheader';

@Component({
  selector: 'app-comparativas-list',
  standalone: true,
  imports: [FormsModule, TypeaheadComponent, SubheaderComponent],
  templateUrl: './comparativas-list.html',
  styleUrl: './comparativas-list.css'
})
export class ComparativasListPage {
  constructor(private comparativaService: ComparativaService, private router: Router) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  comparativas: any[] = [];
  filtered: any[] = [];
  // Filters
  selectedContactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    this.comparativaService.getComparativas().subscribe(cs => {
      this.comparativas = (cs || []).sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
      this.filtered = this.comparativas;
      const byContacto: Record<string, string> = {};
      for (const c of this.comparativas) {
        const id = String(c?.contacto?.id || c?.contactoId || '');
        if (!id) continue;
        const name = c?.contacto?.nombre || c?.contactoNombre || id;
        const last = c?.contacto?.apellido || c?.contactoApellido || '';
        const label = `${name} ${last}`.trim();
        if (!byContacto[id]) byContacto[id] = label;
      }
      this.contactoItems = Object.entries(byContacto).map(([id, label]) => ({ id, label }));
      this.updateFilterConfigs();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'contacto',
        type: 'typeahead',
        label: 'Contacto',
        placeholder: 'Escriba para filtrar...',
        items: this.contactoItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.selectedContactoId = values['contacto'] || null;
    this.applyFilters();
  }

  formatDate(ts?: number): string {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  unitsSummary(c: any): string {
    const us = Array.isArray(c?.unidades) ? c.unidades : [];
    return us.map((u: any) => String(u?.nombre || u?.id || 'Unidad')).join(', ');
  }

  copyLink(c: any): void {
    const url = window.location.origin + '/comparacion/' + c?.id;
    navigator.clipboard?.writeText(url);
  }

  delete(c: any): void {
    if (!c?.id) return;
    const ok = confirm('¿Eliminar esta comparativa? Esta acción no se puede deshacer.');
    if (!ok) return;
    this.comparativaService.deleteComparativa(String(c.id));
  }


  applyFilters(): void {
    let list = this.comparativas;
    if (this.selectedContactoId) {
      list = list.filter(c => String(c?.contacto?.id || c?.contactoId) === String(this.selectedContactoId));
    }
    this.filtered = list;
  }
}


