import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VentaRecord } from '../../../core/models';

@Component({
  selector: 'app-venta-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venta-info-modal.html',
})
export class VentaInfoModal {
  @Input() venta?: VentaRecord;

  constructor(public activeModal: NgbActiveModal) {}

  getImporte(): number | null {
    return this.venta?.importe ?? null;
  }

  getImporteFormatted(): string {
    const importe = this.getImporte();
    if (importe != null) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(importe);
    }
    return 'N/A';
  }

  getComision(): string {
    if (this.venta?.comision != null) {
      return this.venta.comision + '%';
    }
    return 'N/A';
  }

  hasImporteAndComision(): boolean {
    return (this.venta?.importe != null) && (this.venta?.comision != null);
  }

  getTotalComision(): number {
    if (this.venta?.importe != null && this.venta?.comision != null) {
      return this.venta.importe * this.venta.comision / 100;
    }
    return 0;
  }

  getTotalComisionFormatted(): string {
    const total = this.getTotalComision();
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total);
  }

  getPrecioUnitario(): number {
    return this.venta?.precioUnitario ?? 0;
  }

  getPrecioUnitarioFormatted(): string {
    const precio = this.getPrecioUnitario();
    if (precio > 0) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio);
    }
    return 'N/A';
  }
}

