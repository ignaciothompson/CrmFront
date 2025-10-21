import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComparativaService } from '../../../../core/services/comparativa';

@Component({
  selector: 'app-comparativa-detail',
  standalone: false,
  templateUrl: './comparativa-detail.html',
  styleUrl: './comparativa-detail.css'
})
export class ComparativaDetailPage {
  constructor(private route: ActivatedRoute, private comparativaService: ComparativaService) {}

  id: string | null = null;
  comparativa: any | null = null;

  // Map options
  mapCenter: google.maps.LatLngLiteral | null = null;
  mapZoom: number = 12;
  markers: Array<{ position: google.maps.LatLngLiteral; label?: string } > = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.id = id;
      if (id) {
        this.comparativaService.getComparativa(id).subscribe(c => {
          this.comparativa = c || null;
          this.computeMap();
        });
      }
    });
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


