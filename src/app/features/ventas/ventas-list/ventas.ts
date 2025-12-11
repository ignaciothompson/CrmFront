import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VentaService, VentaRecord } from '../../../core/services/venta';
import { ContactoService } from '../../../core/services/contacto';
import { UnidadService } from '../../../core/services/unidad';
import { VentaInfoModal } from '../venta-info-modal/venta-info-modal';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, SubheaderComponent],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasPage {
  constructor(
    private ventaService: VentaService, 
    private contactoService: ContactoService, 
    private unidadService: UnidadService,
    private modal: NgbModal
  ) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];
  initialFilterValues: Record<string, any> = {};

  // Filters (kept for backward compatibility with applyFilters logic)
  dateFrom: string | null = null; // YYYY-MM-DD
  dateTo: string | null = null;   // YYYY-MM-DD
  selectedContactoId: string | null = null;
  selectedUnidadId: string | null = null;
  selectedType: '' | 'venta' | 'renta' = '';

  contactoItems: Array<{ id: string; label: string }> = [];
  unidadItems: Array<{ id: string; label: string }> = [];

  // Data
  all: VentaRecord[] = [];
  filtered: VentaRecord[] = [];

  ngOnInit(): void {
    // Set default date range: 7 days ago to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    this.dateFrom = sevenDaysAgo.toISOString().slice(0, 10);
    this.dateTo = today.toISOString().slice(0, 10);
    this.initialFilterValues = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    
    this.ventaService.getVentas().subscribe(rows => {
      this.all = (rows || []).sort((a, b) => (b?.date || 0) - (a?.date || 0));
      this.filtered = this.all;
    });
    this.contactoService.getContactos().subscribe(cs => {
      this.contactoItems = (cs || []).map(c => ({ id: String(c.id), label: `${c?.Nombre || c?.nombre || ''} ${c?.Apellido || c?.apellido || ''}`.trim() }));
      this.updateFilterConfigs();
    });
    this.unidadService.getUnidades().subscribe(us => {
      this.unidadItems = (us || []).map(u => ({ id: String(u.id), label: `${u?.nombre || u?.name || 'Unidad'} — ${u?.barrio || ''}`.trim() }));
      this.updateFilterConfigs();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'dateFrom',
        type: 'date',
        label: 'Desde',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'dateTo',
        type: 'date',
        label: 'Hasta',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'contacto',
        type: 'typeahead',
        label: 'Contacto',
        placeholder: 'Buscar contacto...',
        items: this.contactoItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'unidad',
        type: 'typeahead',
        label: 'Unidad',
        placeholder: 'Buscar unidad...',
        items: this.unidadItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'tipo',
        type: 'select',
        label: 'Tipo',
        placeholder: 'Todos',
        values: [
          { value: '', label: 'Todos' },
          { value: 'venta', label: 'Venta' },
          { value: 'renta', label: 'Renta' }
        ],
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    // Update local filter variables from subheader values
    this.dateFrom = values['dateFrom'] || null;
    this.dateTo = values['dateTo'] || null;
    this.selectedType = (values['tipo'] || '') as '' | 'venta' | 'renta';
    this.selectedContactoId = values['contacto'] || null;
    this.selectedUnidadId = values['unidad'] || null;
    
    this.applyFilters();
  }

  onFilterReset(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.selectedType = '';
    this.selectedContactoId = null;
    this.selectedUnidadId = null;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.all;
    if (this.selectedContactoId) list = list.filter(r => String(r?.contacto?.id) === String(this.selectedContactoId));
    if (this.selectedUnidadId) list = list.filter(r => String(r?.unidad?.id) === String(this.selectedUnidadId));
    if (this.selectedType) list = list.filter(r => r.type === this.selectedType);
    if (this.dateFrom) {
      const from = new Date(this.dateFrom + 'T00:00:00').getTime();
      list = list.filter(r => (r.date || 0) >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo + 'T23:59:59').getTime();
      list = list.filter(r => (r.date || 0) <= to);
    }
    this.filtered = list;
  }

  verInfo(r: VentaRecord): void {
    const modalRef = this.modal.open(VentaInfoModal, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.venta = r;
  }

  getTotalGanado(): number {
    return this.filtered.reduce((sum, r) => {
      if (r?.importe && r?.comision) {
        return sum + (r.importe * r.comision / 100);
      }
      return sum;
    }, 0);
  }
}
