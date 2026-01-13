import { Component } from '@angular/core';

import { ComparativaService } from '../../../../core/services/comparativa';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubheaderComponent, FilterConfig } from '../../../../shared/components/subheader/subheader';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
  selector: 'app-comparativas-list',
  standalone: true,
  imports: [FormsModule, SubheaderComponent],
  templateUrl: './comparativas-list.html',
  styleUrl: './comparativas-list.css'
})
export class ComparativasListPage {
  constructor(
    private comparativaService: ComparativaService, 
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmService
  ) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  comparativas: any[] = [];
  filtered: any[] = [];
  // Filters
  selectedContactoId: string | null = null;
  contactoItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    this.comparativaService.getComparativas().subscribe({
      next: (cs) => {
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
      },
      error: (error) => {
        console.error('ComparativasListPage - Error loading comparativas:', error);
      }
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
    // Use token if available, otherwise fallback to ID (for backward compatibility)
    const identifier = c?.token || c?.id;
    const url = window.location.origin + '/comparacion/' + identifier;
    navigator.clipboard?.writeText(url).then(() => {
      this.toastService.success('Link copiado al portapapeles');
    }).catch(() => {
      this.toastService.error('Error al copiar el link');
    });
  }

  async regenerate(c: any): Promise<void> {
    if (!c?.id) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Regenerar comparativa',
      message: '¿Regenerar esta comparativa? Se creará una nueva comparativa con las mismas unidades.',
      confirmText: 'Regenerar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) return;

    try {
      const now = Date.now();
      // Extract only unidad IDs from the comparativa
      const unidadesIds = Array.isArray(c?.unidades) 
        ? c.unidades.map((u: any) => ({ id: String(u.id) }))
        : [];
      
      const payload = {
        fecha: now,
        contactoId: c?.contacto?.id ? String(c.contacto.id) : null,
        contacto: c?.contacto || null,
        unidades: unidadesIds
      };

      const ref = await this.comparativaService.addComparativa(payload);
      const token = (ref as any)?.token || (ref as any)?.id;
      
      if (token) {
        this.toastService.success('Comparativa regenerada exitosamente');
        window.open(`/comparacion/${token}`, '_blank');
        // Reload comparativas list
        this.comparativaService.getComparativas().subscribe(cs => {
          this.comparativas = (cs || []).sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
          this.applyFilters();
        });
      }
    } catch (error) {
      console.error('Error regenerating comparativa:', error);
      this.toastService.error('Error al regenerar la comparativa. Por favor, intente nuevamente.');
    }
  }

  async delete(c: any): Promise<void> {
    if (!c?.id) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Confirmar eliminación',
      message: '¿Eliminar esta comparativa? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'btn-danger'
    });
    
    if (!confirmed) return;
    
    try {
      await this.comparativaService.deleteComparativa(String(c.id));
      this.toastService.success('Comparativa eliminada exitosamente');
      // Reload comparativas list
      this.comparativaService.getComparativas().subscribe(cs => {
        this.comparativas = (cs || []).sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
        this.applyFilters();
      });
    } catch (error) {
      console.error('Error deleting comparativa:', error);
      this.toastService.error('Error al eliminar la comparativa. Por favor, intente nuevamente.');
    }
  }


  applyFilters(): void {
    let list = this.comparativas;
    if (this.selectedContactoId) {
      list = list.filter(c => String(c?.contacto?.id || c?.contactoId) === String(this.selectedContactoId));
    }
    this.filtered = list;
  }
}


