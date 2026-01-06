import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { ComparativaService } from '../../../../core/services/comparativa';

@Component({
  selector: 'app-comparativa-detail',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './comparativa-detail.html',
  styleUrl: './comparativa-detail.css'
})
export class ComparativaDetailPage {
  constructor(
    private route: ActivatedRoute, 
    private comparativaService: ComparativaService,
    private router: Router
  ) {}

  id: string | null = null;
  comparativa: any | null = null;
  isExpired: boolean = false;

  // Map options
  mapCenter: google.maps.LatLngLiteral | null = null;
  mapZoom: number = 12;
  markers: Array<{ position: google.maps.LatLngLiteral; label?: string } > = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.id = id;
      if (id) {
        this.comparativaService.getComparativa(id).subscribe({
          next: (c) => {
            console.log('Comparativa loaded:', c);
            console.log('Unidades:', c?.unidades);
            this.comparativa = c || null;
            
            // Set CSS variable for equal column width calculation
            if (this.comparativa?.unidades?.length) {
              document.documentElement.style.setProperty('--num-columns', String(this.comparativa.unidades.length));
            }
            
            // Check expiration (7 days)
            const fecha = this.comparativa?.fecha || this.comparativa?.createdAt;
            if (fecha) {
              const fechaTimestamp = typeof fecha === 'number' 
                ? fecha 
                : typeof fecha === 'string'
                ? new Date(fecha).getTime()
                : new Date(fecha).getTime();
              const now = Date.now();
              const daysDiff = (now - fechaTimestamp) / (1000 * 60 * 60 * 24);
              
              if (daysDiff > 7) {
                this.isExpired = true;
                // Redirect to expired page
                this.router.navigate(['/comparacion-expired'], { 
                  queryParams: { id: id },
                  replaceUrl: true 
                });
                return;
              }
            }
            
            this.computeMap();
          },
          error: (error) => {
            console.error('Error loading comparativa:', error);
          }
        });
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/img/placeholder.jpg';
    }
  }

  verProyecto(unidadId: string): void {
    if (unidadId) {
      window.open(`/unidad/${unidadId}`, '_blank');
    }
  }

  private computeMap(): void {
    const units = Array.isArray(this.comparativa?.unidades) ? this.comparativa.unidades : [];
    const withCoords = units.filter((u: any) => typeof u?.lat === 'number' && typeof u?.lng === 'number');
    if (withCoords.length) {
      const avgLat = withCoords.reduce((sum: number, u: any) => sum + u.lat, 0) / withCoords.length;
      const avgLng = withCoords.reduce((sum: number, u: any) => sum + u.lng, 0) / withCoords.length;
      this.mapCenter = { lat: avgLat, lng: avgLng };
      this.markers = withCoords.map((u: any) => ({ position: { lat: u.lat, lng: u.lng }, label: u?.nombre || '' }));
    } else {
      this.mapCenter = null;
      this.markers = [];
    }
  }
}


