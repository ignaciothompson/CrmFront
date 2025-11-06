import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { VentaService, VentaRecord } from '../../core/services/venta';
import { ContactoService } from '../../core/services/contacto';
import { UnidadService } from '../../core/services/unidad';
import { VentaInfoModal } from './venta-info-modal/venta-info-modal';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadComponent],
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

  // Filters
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
    this.ventaService.getVentas().subscribe(rows => {
      this.all = (rows || []).sort((a, b) => (b?.date || 0) - (a?.date || 0));
      this.filtered = this.all;
    });
    this.contactoService.getContactos().subscribe(cs => {
      this.contactoItems = (cs || []).map(c => ({ id: String(c.id), label: `${c?.Nombre || c?.nombre || ''} ${c?.Apellido || c?.apellido || ''}`.trim() }));
    });
    this.unidadService.getUnidades().subscribe(us => {
      this.unidadItems = (us || []).map(u => ({ id: String(u.id), label: `${u?.nombre || u?.name || 'Unidad'} — ${u?.barrio || ''}`.trim() }));
    });
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
