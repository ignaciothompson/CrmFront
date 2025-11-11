import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css'
})
export class MobileMenu {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private modal: NgbModal) {}

  async openNuevaVenta(): Promise<void> {
    const { NuevaVentaModal } = await import('../../../features/ventas/nueva-venta/nueva-venta');
    this.modal.open(NuevaVentaModal, { size: 'lg', backdrop: 'static' });
    this.closeMenu.emit();
  }

  onLinkClick(): void {
    this.closeMenu.emit();
  }
}

