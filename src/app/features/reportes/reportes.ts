import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';
import { VentaService, VentaRecord } from '../../core/services/venta';
import demo from './demoData.json';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  constructor(
    private unidadService: UnidadService, 
    private contactoService: ContactoService,
    private ventaService: VentaService
  ) {}

  // Raw data caches
  private allUnidades: any[] = [];
  private allContactos: any[] = [];
  allVentas: VentaRecord[] = [];
  filteredVentas: VentaRecord[] = [];

  // Filters
  startDateStr: string | null = null;
  endDateStr: string | null = null;
  private startDate: Date | null = null;
  private endDate: Date | null = null;

  // Colors
  private colors = ['#0E2954', '#1F6E8C', '#2E8A99', '#84A7A1'];
  private alpha60(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }

  // Line: registradas vs vendidas
  lineData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    elements: { line: { tension: 0.25, borderWidth: 2 }, point: { radius: 3 } },
    scales: { y: { beginAtZero: true } }
  };

  // Bar: entrevistas
  entrevistasXAxisLabel: string = 'Mes';
  barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  // Donut: unidades por ciudad
  pieData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  pieOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } }
  };

  // Grouping mode for entrevistas (independent state)
  entrevistasGroupMode: 'month' | 'week' | 'day' = 'month';
  private entrevistasAutoGroup = true;

  // Grouping mode for unidades line chart (independent state)
  unidadesGroupMode: 'month' | 'week' | 'day' = 'month';
  private unidadesAutoGroup = true;

  ngOnInit(): void {
    // Temporary: use local demo data if collections are empty // CAMBIAR EN PRODUCCION
    this.unidadService.getUnidades().subscribe(us => {
      const demoUnidades = (demo as any)?.unidades ?? [];
      // this.allUnidades = (Array.isArray(us) && us.length > 0) ? us : demoUnidades;
      this.allUnidades = demoUnidades;
      this.applyFilters();
    });

    this.contactoService.getContactos().subscribe(cs => {
      const demoContactos = (demo as any)?.contactos ?? [];
      // this.allContactos = (Array.isArray(cs) && cs.length > 0) ? cs : demoContactos;
      this.allContactos = demoContactos;
      this.applyFilters();
    });

    this.ventaService.getVentas().subscribe(vs => {
      this.allVentas = (vs || []).sort((a, b) => (b?.date || 0) - (a?.date || 0));
      this.applyFilters();
    });
  }

  // No manual resize needed; maintainAspectRatio=false + CSS ensures 100% height

  onStartDateChange(value: any) {
    const v = value != null ? String(value) : '';
    this.startDateStr = v || null;
    this.startDate = v ? this.coerceDate(v) : null;
    this.entrevistasAutoGroup = true;
    this.unidadesAutoGroup = true;
    this.applyFilters();
  }

  onEndDateChange(value: any) {
    const v = value != null ? String(value) : '';
    this.endDateStr = v || null;
    this.endDate = v ? this.coerceDate(v, true) : null;
    this.entrevistasAutoGroup = true;
    this.unidadesAutoGroup = true;
    this.applyFilters();
  }

  resetRange() {
    this.startDateStr = null;
    this.endDateStr = null;
    this.startDate = null;
    this.endDate = null;
    this.entrevistasAutoGroup = true;
    this.unidadesAutoGroup = true;
    this.applyFilters();
  }

  onClickFilter() {
    this.entrevistasAutoGroup = true;
    this.unidadesAutoGroup = true;
    this.applyFilters();
  }

  setEntrevistasGroupMode(mode: 'month' | 'week' | 'day') {
    this.entrevistasGroupMode = mode;
    this.entrevistasAutoGroup = false;
    this.updateEntrevistasData();
  }

  setUnidadesGroupMode(mode: 'month' | 'week' | 'day') {
    this.unidadesGroupMode = mode;
    this.unidadesAutoGroup = false;
    const unidadesFiltered = this.getFilteredUnidades();
    this.updateLineData(unidadesFiltered);
  }

  applyFilters() {
    // Recompute Unidades (line + donut)
    const unidadesFiltered = this.getFilteredUnidades();
    if (this.unidadesAutoGroup) {
      this.unidadesGroupMode = this.determineGroupMode();
    }
    this.updateLineData(unidadesFiltered);
    this.updatePieData(unidadesFiltered);

    // Recompute Entrevistas with auto/manual grouping
    this.updateEntrevistasData();

    // Filter ventas by date range
    this.filteredVentas = this.allVentas.filter(v => {
      if (!v.date) return false;
      const ventaDate = new Date(v.date);
      if (this.startDate && ventaDate < this.startDate) return false;
      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);
        if (ventaDate > end) return false;
      }
      return true;
    });
  }

  getTotalDineroGanado(): number {
    return this.filteredVentas.reduce((sum, v) => {
      if (v?.importe && v?.comision) {
        return sum + (v.importe * v.comision / 100);
      }
      return sum;
    }, 0);
  }

  getTotalVentas(): number {
    return this.filteredVentas.filter(v => v.type === 'venta').length;
  }

  getTotalRentas(): number {
    return this.filteredVentas.filter(v => v.type === 'renta').length;
  }

  private getFilteredUnidades(): any[] {
    return this.allUnidades.filter(u => this.isWithinRange(this.getUnidadDate(u)));
  }

  private updateLineData(unidadesFiltered: any[]) {
    const agg = new Map<string, { registradas: number; vendidas: number }>();
    for (const u of unidadesFiltered) {
      const dt = this.getUnidadDate(u);
      if (!dt) continue;
      let key: string;
      if (this.unidadesGroupMode === 'day') {
        key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      } else if (this.unidadesGroupMode === 'week') {
        const { year, week } = this.getISOYearWeek(dt);
        key = `${year}-W${String(week).padStart(2, '0')}`;
      } else {
        key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      }
      const isSold = !!u?.vendida || !!u?.sold || u?.disponibilidad === 'Vendida';
      const acc = agg.get(key) || { registradas: 0, vendidas: 0 };
      acc.registradas += 1;
      acc.vendidas += isSold ? 1 : 0;
      agg.set(key, acc);
    }
    const buckets = Array.from(agg.keys()).sort((a, b) => a.localeCompare(b));
    this.lineData = {
      labels: buckets,
      datasets: [
        {
          label: 'Registradas',
          data: buckets.map(k => agg.get(k)!.registradas),
          borderColor: this.colors[0],
          backgroundColor: this.alpha60(this.colors[0]),
          fill: false
        },
        {
          label: 'Vendidas',
          data: buckets.map(k => agg.get(k)!.vendidas),
          borderColor: this.colors[1],
          backgroundColor: this.alpha60(this.colors[1]),
          fill: false
        }
      ]
    };
  }

  private updatePieData(unidadesFiltered: any[]) {
    const byCity = new Map<string, number>();
    for (const u of unidadesFiltered) {
      const city = u?.ciudad || u?.city || u?.localidad || 'N/A';
      byCity.set(city, (byCity.get(city) || 0) + 1);
    }
    const cities = Array.from(byCity.entries());
    this.pieData = {
      labels: cities.map(([name]) => name),
      datasets: [
        {
          data: cities.map(([, value]) => value),
          backgroundColor: cities.map((_, i) => this.alpha60(this.colors[i % this.colors.length])),
          borderColor: cities.map((_, i) => this.colors[i % this.colors.length]),
          borderWidth: 2
        }
      ]
    };
  }

  private getFilteredEntrevistaDates(): Date[] {
    return this.allContactos
      .map(c => this.getEntrevistaDate(c))
      .filter((d): d is Date => !!d && !isNaN(d.getTime()))
      .filter(d => this.isWithinRange(d));
  }

  private updateEntrevistasData() {
    const entrevistasFiltered = this.getFilteredEntrevistaDates();
    if (this.entrevistasAutoGroup) {
      this.entrevistasGroupMode = this.determineGroupMode();
    }

    const entrevistasAgg = new Map<string, number>();
    if (this.entrevistasGroupMode === 'day') {
      for (const d of entrevistasFiltered) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        entrevistasAgg.set(key, (entrevistasAgg.get(key) || 0) + 1);
      }
      this.entrevistasXAxisLabel = 'Día';
    } else if (this.entrevistasGroupMode === 'week') {
      for (const d of entrevistasFiltered) {
        const { year, week } = this.getISOYearWeek(d);
        const key = `${year}-W${String(week).padStart(2, '0')}`;
        entrevistasAgg.set(key, (entrevistasAgg.get(key) || 0) + 1);
      }
      this.entrevistasXAxisLabel = 'Semana';
    } else {
      for (const d of entrevistasFiltered) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        entrevistasAgg.set(key, (entrevistasAgg.get(key) || 0) + 1);
      }
      this.entrevistasXAxisLabel = 'Mes';
    }

    const ent = Array.from(entrevistasAgg.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    this.barData = {
      labels: ent.map(([name]) => name),
      datasets: [
        {
          label: 'Entrevistas',
          data: ent.map(([, value]) => value),
          backgroundColor: this.alpha60(this.colors[2]),
          borderColor: this.colors[2],
          borderWidth: 2
        }
      ]
    };
  }

  private determineGroupMode(): 'month' | 'week' | 'day' {
    const start = this.startDate ?? this.earliestDate();
    const end = this.endDate ?? this.latestDate();
    if (!start || !end) return 'month';
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 183) return 'month'; // ~6 months or more
    if (diffDays >= 31) return 'week';   // between ~1 and 6 months
    return 'day';                        // under ~1 month
  }

  private earliestDate(): Date | null {
    const dates = this.allUnidades.map(u => this.getUnidadDate(u)).filter((d): d is Date => !!d);
    if (dates.length === 0) return null;
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }

  private latestDate(): Date | null {
    const dates = this.allUnidades.map(u => this.getUnidadDate(u)).filter((d): d is Date => !!d);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  private isWithinRange(dt: Date | null): boolean {
    if (!dt) return false;
    if (this.startDate && dt < this.startDate) return false;
    if (this.endDate) {
      // Include entire end day
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      if (dt > end) return false;
    }
    return true;
  }

  private coerceDate(value: string, endOfDay: boolean = false): Date {
    // Accept YYYY-MM-DD or ISO strings or timestamps
    const dt = new Date(value);
    if (endOfDay) dt.setHours(23, 59, 59, 999);
    return dt;
  }

  private getUnidadDate(u: any): Date | null {
    const raw = u?.entrega || u?.fecha || u?.createdAt || u?.updatedAt;
    if (!raw) return null;
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private getEntrevistaDate(c: any): Date | null {
    const raw = c?.entrevista?.fechaISO || c?.Entrevista?.Fecha || c?.entrevista?.fecha || c?.fechaEntrevista;
    if (!raw) return null;
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private getISOYearWeek(date: Date): { year: number; week: number } {
    // Copy date to avoid mutation
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
  }
}


