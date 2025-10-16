import { Component } from '@angular/core';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  constructor(private unidadService: UnidadService, private contactoService: ContactoService) {}

  // Monthly: registradas as line (multi-series), vendidas as bars (single-series)
  registradasLine: any[] = [];
  vendidasBars: any[] = [];

  // Bar chart for monthly entrevistas
  entrevistasResults: any[] = [];

  // Pie chart for unidades by city
  unidadesByCity: any[] = [];

  ngOnInit(): void {
    this.unidadService.getUnidades().subscribe(us => {
      const meses = new Map<string, { registradas: number; vendidas: number }>();
      (us || []).forEach(u => {
        const fecha = (u?.entrega || u?.fecha || u?.createdAt || '').toString();
        const dt = fecha ? new Date(fecha) : null;
        const key = dt && !isNaN(dt.getTime()) ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}` : 'N/A';
        const sold = !!u?.vendida || !!u?.sold;
        const entry = meses.get(key) || { registradas: 0, vendidas: 0 };
        entry.registradas += 1;
        entry.vendidas += sold ? 1 : 0;
        meses.set(key, entry);
      });
      const categories = Array.from(meses.keys()).sort();
      const lineSeries = categories.map(k => ({ name: k, value: meses.get(k)!.registradas }));
      const barSeries = categories.map(k => ({ name: k, value: meses.get(k)!.vendidas }));
      this.registradasLine = [{ name: 'Registradas', series: lineSeries }];
      this.vendidasBars = barSeries;

      // Pie: group by city
      const byCity = new Map<string, number>();
      (us || []).forEach(u => {
        const city = u?.city || u?.localidad || 'N/A';
        byCity.set(city, (byCity.get(city) || 0) + 1);
      });
      this.unidadesByCity = Array.from(byCity.entries()).map(([name, value]) => ({ name, value }));
    });

    this.contactoService.getContactos().subscribe(cs => {
      const meses = new Map<string, number>();
      (cs || []).forEach(c => {
        const fecha = c?.Entrevista?.Fecha || '';
        if (!fecha) return;
        const dt = new Date(fecha);
        if (isNaN(dt.getTime())) return;
        const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
        meses.set(key, (meses.get(key) || 0) + 1);
      });
      this.entrevistasResults = Array.from(meses.entries()).sort().map(([name, value]) => ({ name, value }));
    });
  }
}


