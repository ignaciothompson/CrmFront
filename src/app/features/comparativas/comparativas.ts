import { Component } from '@angular/core';
import { UnidadService } from '../../core/services/unidad';
import { ProyectoService } from '../../core/services/proyecto';
import { EXTRAS_CATALOG } from '../../core/extras-catalog';

@Component({
  selector: 'app-comparativas',
  standalone: false,
  templateUrl: './comparativas.html',
  styleUrl: './comparativas.css'
})
export class Comparativas {
  constructor(private unidadService: UnidadService, private proyectoService: ProyectoService) {}

  // Filters state
  nameSelectedId: string | null = null;
  nameItems: Array<{ id: string; label: string }> = [];
  filterLocations: Record<string, boolean> = {};
  filterTipos: Record<string, boolean> = {};
  filterDisponibilidad: Record<string, boolean> = {};
  filterCuartos: Record<string, boolean> = {};
  filterVentaTipo: Record<string, boolean> = {};
  filterVisibilidad: Record<string, boolean> = {};
  filterInterna: Record<string, boolean> = {};
  filterExtras: Record<string, boolean> = {};
  filterBarrios: Record<string, boolean> = {};
  filterOrientaciones: Record<string, boolean> = {};
  filterDistribuciones: Record<string, boolean> = {};
  filterPisos: Record<string, boolean> = {};
  filterBanos: Record<string, boolean> = {};
  filterOcupacion: Record<string, boolean> = {};
  sizeMin: number | null = null;
  sizeMax: number | null = null;
  priceMin: number | null = null;
  priceMax: number | null = null;
  expMin: number | null = null;
  expMax: number | null = null;
  projectSelectedId: string | null = null;
  projectItems: Array<{ id: string; label: string }> = [];

  // Data and view
  all: any[] = [];
  items: any[] = [];
  cities: string[] = [];
  barrios: string[] = [];
  tiposResidencia: string[] = ['Casa', 'Apartamento', 'Complejo'];
  disponibilidadOpts: string[] = [
    'No disponible',
    'Disponible: publicada',
    'Disponible: reventa publicada',
    'Disponible: reventa no publicada',
    'Disponible: con renta publicada',
    'Disponible: con renta no publicada',
    'Reservada para venta',
    'Reservada por promotor',
    'Vendida'
  ];
  ventaOpts: string[] = ['Venta', 'Renta'];
  visibilidadOpts: string[] = ['Publicado', 'No publicado'];
  internaOpts: string[] = ['Activo', 'Stand By', 'Vendido'];
  extrasCatalog = EXTRAS_CATALOG.map(e => e.label);
  orientaciones: string[] = ['Norte', 'Noreste', 'Este', 'Sudeste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
  distribuciones: string[] = ['Frente/Esquinero', 'Frente/Central', 'Contrafrente/Esquinero', 'Contrafrente/Central', 'Lateral', 'Inferior'];
  pisos: string[] = ['Bajo', 'Medio', 'Alto'];
  ocupaciones: string[] = ['A ocupar', '1 a 6 meses', '7 meses 1 año', '1 a 2 años', 'Mas de 2 años'];

  ngOnInit(): void {
    this.unidadService.getUnidades().subscribe(us => {
      const mapped = (us || []).map(u => this.compatMap(u));
      this.all = mapped;
      this.items = this.all.slice();
      this.cities = Array.from(new Set(this.all.map(u => u.ciudad).filter(Boolean))).sort();
      this.barrios = Array.from(new Set(this.all.map(u => u.barrio).filter(Boolean))).sort();
      this.nameItems = this.all.map(u => ({ id: String(u.id), label: String(u.nombre || 'Unidad') })).filter(x => !!x.label);
    });
    this.proyectoService.getProyectos().subscribe(ps => {
      this.projectItems = (ps || []).map(p => ({ id: String(p.id), label: String(p.nombre) }));
    });
  }

  applyFilters(): void {
    let res = this.all.slice();
    if (this.nameSelectedId) res = res.filter(u => String(u.id) === String(this.nameSelectedId));
    if (this.projectSelectedId) res = res.filter(u => String(u.proyectoId) === String(this.projectSelectedId));

    const activeLocs = Object.keys(this.filterLocations).filter(k => this.filterLocations[k]);
    if (activeLocs.length) res = res.filter(u => activeLocs.includes(String(u.ciudad)));

    const activeBarrios = Object.keys(this.filterBarrios).filter(k => this.filterBarrios[k]);
    if (activeBarrios.length) res = res.filter(u => activeBarrios.includes(String(u.barrio)));

    const activeTipos = Object.keys(this.filterTipos).filter(k => this.filterTipos[k]);
    if (activeTipos.length) res = res.filter(u => activeTipos.includes(String(u.tipo)));

    const activeVis = Object.keys(this.filterVisibilidad).filter(k => this.filterVisibilidad[k]);
    if (activeVis.length) res = res.filter(u => activeVis.includes(String(u.visibilidad)));

    const activeInterna = Object.keys(this.filterInterna).filter(k => this.filterInterna[k]);
    if (activeInterna.length) res = res.filter(u => (u.visibilidad === 'No publicado') && activeInterna.includes(String(u.publicacionInterna)));

    const activeDisp = Object.keys(this.filterDisponibilidad).filter(k => this.filterDisponibilidad[k]);
    if (activeDisp.length) res = res.filter(u => activeDisp.includes(String(u.disponibilidad)));

    const activeOri = Object.keys(this.filterOrientaciones).filter(k => this.filterOrientaciones[k]);
    if (activeOri.length) res = res.filter(u => activeOri.includes(String(u.orientacion)));

    const activeDist = Object.keys(this.filterDistribuciones).filter(k => this.filterDistribuciones[k]);
    if (activeDist.length) res = res.filter(u => activeDist.includes(String(u.distribucion)));

    const activePisos = Object.keys(this.filterPisos).filter(k => this.filterPisos[k]);
    if (activePisos.length) res = res.filter(u => activePisos.includes(String(u.pisoCategoria)));

    const activeExtras = Object.keys(this.filterExtras).filter(k => this.filterExtras[k]);
    if (activeExtras.length) res = res.filter(u => {
      const extras: string[] = Array.isArray(u.extras) ? u.extras : [];
      return activeExtras.every(label => extras.includes(label));
    });

    const activeCuartos = Object.keys(this.filterCuartos).filter(k => this.filterCuartos[k]).map(Number);
    if (activeCuartos.length) res = res.filter(u => {
      const d = Number(u?.dormitorios ?? u?.cuartos);
      return activeCuartos.some(n => (n === 4 ? d >= 4 : d === n));
    });

    const activeBanos = Object.keys(this.filterBanos).filter(k => this.filterBanos[k]).map(Number);
    if (activeBanos.length) res = res.filter(u => {
      const b = Number(u?.banos);
      return activeBanos.some(n => (n === 4 ? b >= 4 : b === n));
    });

    const activeOcup = Object.keys(this.filterOcupacion).filter(k => this.filterOcupacion[k]);
    if (activeOcup.length) res = res.filter(u => activeOcup.includes(String(u.ocupacion)));

    if (this.sizeMin != null) res = res.filter(u => Number(u?.tamanoM2) >= this.sizeMin!);
    if (this.sizeMax != null) res = res.filter(u => Number(u?.tamanoM2) <= this.sizeMax!);
    if (this.priceMin != null) res = res.filter(u => Number(u?.precioUSD) >= this.priceMin!);
    if (this.priceMax != null) res = res.filter(u => Number(u?.precioUSD) <= this.priceMax!);
    if (this.expMin != null) res = res.filter(u => Number(u?.expensasUSD) >= this.expMin!);
    if (this.expMax != null) res = res.filter(u => Number(u?.expensasUSD) <= this.expMax!);

    this.items = res;
  }

  toggle(map: Record<string, boolean>, key: string): void { map[key] = !map[key]; this.applyFilters(); }

  nameSelectedLabel(): string {
    const it = this.nameItems.find(i => String(i.id) === String(this.nameSelectedId));
    return it ? it.label : '';
  }

  selectedLocations(): string {
    return this.cities.filter(c => !!this.filterLocations[c]).join(', ');
  }

  selectedTipos(): string {
    return this.tiposResidencia.filter(t => !!this.filterTipos[t]).join(', ');
  }

  selectedDisponibilidad(): string {
    return this.disponibilidadOpts.filter(d => !!this.filterDisponibilidad[d]).join(', ');
  }

  selectedRooms(): string {
    return [1, 2, 3, 4].filter(n => !!(this.filterCuartos as any)[n]).map(n => (n === 4 ? '4+' : String(n))).join(', ');
  }

  selectedVenta(): string {
    return this.ventaOpts.filter(v => !!this.filterVentaTipo[v]).join(', ');
  }

  selectedBarrios(): string {
    return this.barrios.filter(b => !!this.filterBarrios[b]).join(', ');
  }

  selectedExtras(): string {
    return this.extrasCatalog.filter(x => !!this.filterExtras[x]).join(', ');
  }

  projectSelectedLabel(): string {
    const it = this.projectItems.find(i => String(i.id) === String(this.projectSelectedId));
    return it ? it.label : '';
  }

  selectedVisibilidad(): string {
    return this.visibilidadOpts.filter(v => !!this.filterVisibilidad[v]).join(', ');
  }

  selectedInterna(): string {
    return this.internaOpts.filter(v => !!this.filterInterna[v]).join(', ');
  }

  private compatMap(u: any): any {
    // Map existing docs to canonical fields to avoid breaking filters
    const vendida = Boolean(u?.vendida || u?.sold);
    const visibilidad = u?.visibilidad || (u?.publicada ? 'Publicado' : 'Publicado');
    const publicacionInterna = u?.publicacionInterna || undefined;
    let disponibilidad: string = u?.disponibilidad;
    if (!disponibilidad) {
      disponibilidad = vendida ? 'Vendida' : 'Disponible: publicada';
    }
    return {
      ...u,
      ciudad: u?.ciudad || u?.city || u?.localidad || '',
      barrio: u?.barrio || '',
      tipo: u?.tipoResidencia || u?.tipo || '',
      dormitorios: typeof u?.dormitorios === 'number' ? u.dormitorios : Number(u?.cuartos ?? 0),
      banos: typeof u?.banos === 'number' ? u.banos : Number(u?.banos ?? 1),
      tamanoM2: Number(u?.tamanoM2 ?? u?.tamano ?? u?.size ?? 0) || null,
      precioUSD: Number(u?.precioUSD ?? u?.precio ?? 0) || null,
      expensasUSD: Number(u?.expensasUSD ?? u?.expensas ?? 0) || null,
      extras: Array.isArray(u?.extras) ? u.extras : [],
      visibilidad,
      publicacionInterna,
      disponibilidad,
      proyectoId: u?.proyectoId || ''
    };
  }
}

