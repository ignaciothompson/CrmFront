import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  currentRoute: string = '';

  private routerSubscription?: Subscription;

  constructor(
    private modal: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get initial route
    this.currentRoute = this.router.url;

    // Subscribe to route changes (including browser back/forward)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  isActive(route: string): boolean {
    // Exact match
    if (this.currentRoute === route) {
      return true;
    }
    // Check if current route starts with the route + '/' to handle child routes
    // This prevents false positives (e.g., /contactos matching /contactos-seguimiento)
    return this.currentRoute.startsWith(route + '/');
  }

  async openNuevaVenta(): Promise<void> {
    const { NuevaVentaModal } = await import('../../../features/ventas/nueva-venta/nueva-venta');
    this.modal.open(NuevaVentaModal, { size: 'lg', backdrop: 'static' });
  }
}
