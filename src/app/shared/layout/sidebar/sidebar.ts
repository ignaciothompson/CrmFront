import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  constructor(private modal: NgbModal) {}

  async openNuevaVenta(): Promise<void> {
    const { NuevaVentaModal } = await import('../../../features/ventas/nueva-venta/nueva-venta');
    this.modal.open(NuevaVentaModal, { size: 'lg', backdrop: 'static' });
  }
}
