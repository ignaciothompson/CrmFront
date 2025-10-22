import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ProyectoService } from '../../core/services/proyecto';
import { UnidadService } from '../../core/services/unidad';
import { ContactoService } from '../../core/services/contacto';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './importar.html',
  styleUrl: './importar.css'
})
export class Importar {
  excelData: any[] = [];
  preview: any[] = [];
  target: 'proyectos' | 'unidades' | 'contactos' = 'proyectos';
  isSaving: boolean = false;
  resultMsg: string = '';

  constructor(private proyectoService: ProyectoService, private unidadService: UnidadService, private contactoService: ContactoService) {}

  onFileChange(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.preview = this.excelData.slice(0, 20);
    };
    reader.readAsBinaryString(file);
  }

  // Basic mappers from generic Excel rows to our schemas
  private mapProyecto(row: any) {
    return {
      nombre: row.nombre || row.Nombre || row.Project || '',
      tipoProyecto: row.tipoProyecto || row.TipoProyecto || 'Multiple',
      ciudad: row.ciudad || row.Ciudad || 'Montevideo',
      barrio: row.barrio || row.Barrio || '',
      tipo: row.tipo || row.Tipo || 'Apartamento',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private mapUnidad(row: any) {
    return {
      proyectoId: String(row.proyectoId || row.ProyectoId || row.proyecto || ''),
      ciudad: row.ciudad || row.Ciudad || 'Montevideo',
      barrio: row.barrio || row.Barrio || '',
      nombre: row.nombre || row.Nombre || '',
      tipo: row.tipo || row.Tipo || 'Apartamento',
      orientacion: row.orientacion || row.Orientacion || undefined,
      distribucion: row.distribucion || row.Distribucion || undefined,
      dormitorios: Number(row.dormitorios ?? row.Dormitorios ?? row.cuartos ?? 1),
      banos: Number(row.banos ?? row.Banos ?? 1),
      pisoCategoria: row.pisoCategoria || row.Piso || undefined,
      tamanoM2: row.tamanoM2 != null ? Number(row.tamanoM2) : undefined,
      precioUSD: row.precioUSD != null ? Number(row.precioUSD) : undefined,
      expensasUSD: row.expensasUSD != null ? Number(row.expensasUSD) : undefined,
      extras: this.parseExtras(row.extras || row.Extras),
      visibilidad: row.visibilidad || 'Publicado',
      publicacionInterna: row.publicacionInterna || undefined,
      disponibilidad: row.disponibilidad || 'Disponible: publicada',
      ocupacion: row.ocupacion || undefined,
      imagenUrl: row.imagenUrl || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private parseExtras(val: any): string[] | undefined {
    if (!val) return undefined;
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') return val.split(',').map(x => x.trim()).filter(Boolean);
    return undefined;
  }

  private mapContacto(row: any) {
    const excelSerialToDate = (serial: any): string | undefined => {
      if (serial == null || serial === '') return undefined;
      const num = Number(serial);
      if (!isFinite(num)) return undefined;
      const epoch = new Date(Date.UTC(1899, 11, 30)); // Excel epoch
      const ms = num * 24 * 60 * 60 * 1000;
      const d = new Date(epoch.getTime() + ms);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    const excelFractionToTime = (fraction: any): string | undefined => {
      if (fraction == null || fraction === '') return undefined;
      const num = Number(fraction);
      if (!isFinite(num)) return undefined;
      const totalMinutes = Math.round(num * 24 * 60);
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const mm = String(totalMinutes % 60).padStart(2, '0');
      return `${hh}:${mm}`;
    };
    return {
      nombre: row.nombre || row.Nombre || '',
      apellido: row.apellido || row.Apellido || '',
      edad: row.edad != null ? Number(row.edad) : undefined,
      telefono: row.telefono || row.Celular || row.Telefono || '',
      mail: row.mail || row.Mail || undefined,
      pareja: Boolean(row.pareja ?? row.Pareja ?? false),
      familia: Boolean(row.familia ?? row.Familia ?? false),
      preferencias: {
        ciudad: row.pref_ciudad || row.PrefCiudad || undefined,
        barrio: row.pref_barrio || row.PrefBarrio || undefined,
        tipo: row.pref_tipo || row.PrefTipo || undefined,
        cuartos: row.pref_cuartos != null ? Number(row.pref_cuartos) : undefined,
        precio: {
          min: row.pref_precio_min != null ? Number(row.pref_precio_min) : undefined,
          max: row.pref_precio_max != null ? Number(row.pref_precio_max) : undefined
        }
      },
      entrevista: (row.Entrevista || row.ent_fecha || row.ent_hora || row.ent_comentario || row.ent_proyectoId || row.ent_unidadId || row.ent_lugar) ? {
        proyectoId: row.ent_proyectoId || undefined,
        unidadId: row.ent_unidadId || undefined,
        comentario: row.ent_comentario || undefined,
        fechaISO: typeof row.ent_fecha === 'number' ? excelSerialToDate(row.ent_fecha) : (row.ent_fecha || undefined),
        hora: typeof row.ent_hora === 'number' ? excelFractionToTime(row.ent_hora) : (row.ent_hora || undefined),
        lugar: row.ent_lugar || undefined
      } : undefined,
      entrevistaPendiente: Boolean(row.entrevistaPendiente || row.EntrevistaPendiente || false),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  async importar(): Promise<void> {
    this.isSaving = true;
    this.resultMsg = '';
    try {
      const rows = this.excelData || [];
      if (!rows.length) { this.resultMsg = 'No hay datos para importar.'; return; }
      if (this.target === 'proyectos') {
        for (const r of rows) await this.proyectoService.addProyecto(this.mapProyecto(r));
      } else if (this.target === 'unidades') {
        for (const r of rows) await this.unidadService.addUnidad(this.mapUnidad(r));
      } else if (this.target === 'contactos') {
        for (const r of rows) await this.contactoService.addContacto(this.mapContacto(r));
      }
      this.resultMsg = `Importación completada: ${rows.length} registros en ${this.target}.`;
    } catch (e: any) {
      this.resultMsg = 'Error al importar: ' + (e?.message || e);
    } finally {
      this.isSaving = false;
    }
  }

  async seedDemo(target: 'proyectos' | 'unidades' | 'contactos'): Promise<void> {
    this.isSaving = true;
    this.resultMsg = '';
    try {
      if (target === 'proyectos') {
        const demo = [
          { nombre: 'Residencial Solaria', tipoProyecto: 'Multiple', ciudad: 'Montevideo', barrio: 'Pocitos', tipo: 'Apartamento' },
          { nombre: 'Complejo Verde', tipoProyecto: 'Multiple', ciudad: 'Canelones', barrio: 'Ciudad de la Costa', tipo: 'Complejo' },
          { nombre: 'Casa Única Prado', tipoProyecto: 'Unico', ciudad: 'Montevideo', barrio: 'Prado', tipo: 'Casa' },
        ];
        for (const p of demo) await this.proyectoService.addProyecto({ ...p, createdAt: Date.now(), updatedAt: Date.now() });
        this.resultMsg = 'Proyectos demo generados.';
      }
      if (target === 'unidades') {
        const unidades = [
          { proyectoId: '', ciudad: 'Montevideo', barrio: 'Pocitos', nombre: 'Apto 302', tipo: 'Apartamento', dormitorios: 2, banos: 1, tamanoM2: 65, precioUSD: 175000, expensasUSD: 120, extras: ['Terraza'], visibilidad: 'Publicado', disponibilidad: 'Disponible: publicada' },
          { proyectoId: '', ciudad: 'Canelones', barrio: 'Ciudad de la Costa', nombre: 'Casa 12', tipo: 'Casa', dormitorios: 3, banos: 2, tamanoM2: 120, precioUSD: 260000, expensasUSD: 0, extras: ['Parrillero', 'Piscina'], visibilidad: 'Publicado', disponibilidad: 'Reservada para venta' },
          { proyectoId: '', ciudad: 'Montevideo', barrio: 'Prado', nombre: 'Casa Prado', tipo: 'Casa', dormitorios: 4, banos: 3, tamanoM2: 180, precioUSD: 350000, expensasUSD: 0, extras: ['Garage'], visibilidad: 'No publicado', publicacionInterna: 'Activo', disponibilidad: 'Disponible: reventa no publicada' }
        ];
        for (const u of unidades) await this.unidadService.addUnidad({ ...u, createdAt: Date.now(), updatedAt: Date.now() });
        this.resultMsg = 'Unidades demo generadas.';
      }
      if (target === 'contactos') {
        const contactos = [
          { nombre: 'Juan', apellido: 'Pérez', telefono: '+59891000001', mail: 'juan@example.com', pareja: true, familia: false, preferencias: { ciudad: 'Montevideo', barrio: 'Pocitos', tipo: 'Apartamento', cuartos: 2, precio: { min: 150000, max: 220000 } } },
          { nombre: 'María', apellido: 'García', telefono: '+59892000002', mail: 'maria@example.com', pareja: false, familia: true, preferencias: { ciudad: 'Canelones', barrio: 'Ciudad de la Costa', tipo: 'Casa', cuartos: 3, precio: { min: 200000, max: 300000 } } },
          { nombre: 'Carlos', apellido: 'López', telefono: '+59893000003', pareja: false, familia: false }
        ];
        for (const c of contactos) await this.contactoService.addContacto({ ...c, createdAt: Date.now(), updatedAt: Date.now() });
        this.resultMsg = 'Contactos demo generados.';
      }
    } catch (e: any) {
      this.resultMsg = 'Error al generar demo: ' + (e?.message || e);
    } finally {
      this.isSaving = false;
    }
  }
}


