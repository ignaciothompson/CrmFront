import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../core/services/contacto';
import { UnidadService } from '../../../core/services/unidad';
import { VentaService } from '../../../core/services/venta';
import { VentaRecord } from '../../../core/models';

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadComponent],
  templateUrl: './nueva-venta.html',
  styleUrl: './nueva-venta.css'
})
export class NuevaVentaModal {
  constructor(
    public activeModal: NgbActiveModal,
    private contactoService: ContactoService,
    private unidadService: UnidadService,
    private ventaService: VentaService,
  ) {}

  // Selections
  selectedContactoId: string | null = null;
  selectedUnidadId: string | null = null;
  selectedType: 'venta' | 'renta' = 'venta';
  importe: number | null = null;
  comision: number | null = null; // Porcentaje de comisión
  precioUnitario: number | null = null; // Precio de la unidad seleccionada
  meses: number | null = null; // Meses de renta (solo para tipo renta)

  contactoItems: Array<{ id: string; label: string }> = [];
  unidadItems: Array<{ id: string; label: string }> = [];
  contactos: any[] = [];
  unidades: any[] = [];

  ventas: VentaRecord[] = [];
  ventasAgregadas: VentaRecord[] = []; // Ventas agregadas en esta sesión

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.contactos = cs || [];
      this.contactoItems = this.contactos.map(c => ({ id: String(c.id), label: `${c?.Nombre || c?.nombre || ''} ${c?.Apellido || c?.apellido || ''}`.trim() }));
    });
    this.unidadService.getUnidades().subscribe(us => {
      this.unidades = us || [];
      this.unidadItems = this.unidades.map(u => ({ id: String(u.id), label: `${u?.nombre || u?.name || 'Unidad'} — ${u?.barrio || ''}`.trim() }));
    });
    this.ventaService.getVentas().subscribe(rows => {
      this.ventas = (rows || []).sort((a, b) => {
        const dateA = typeof a?.date === 'number' ? a.date : 0;
        const dateB = typeof b?.date === 'number' ? b.date : 0;
        return dateB - dateA;
      }).slice(0, 10);
    });
  }

  editRow(r: VentaRecord): void {
    this.selectedType = r?.type || 'venta';
    this.selectedContactoId = r?.contacto?.id || null;
    this.selectedUnidadId = r?.unidad?.id || null;
    this.importe = r?.importe || null;
    this.comision = r?.comision || null;
    this.precioUnitario = r?.precioUnitario || null;
    this.meses = r?.meses || null;
  }

  onUnidadSelected(): void {
    if (this.selectedUnidadId) {
      const unidad = this.unidades.find(u => String(u.id) === String(this.selectedUnidadId));
      if (unidad) {
        this.precioUnitario = unidad?.precioUSD || unidad?.precio || null;
        // Si no hay importe, usar el precio de la unidad
        if (!this.importe && this.precioUnitario) {
          this.importe = this.precioUnitario;
        }
        // Cargar la comisión de la unidad si existe y no hay una comisión ya establecida
        if (unidad?.comision != null && this.comision == null) {
          this.comision = unidad.comision;
        }
      }
    } else {
      this.precioUnitario = null;
    }
  }

  agregar(): void {
    if (!this.selectedUnidadId) return;
    
    // Validar que si es renta, tenga meses especificados
    if (this.selectedType === 'renta' && (!this.meses || this.meses <= 0)) {
      alert('Por favor, especifica la cantidad de meses para la renta.');
      return;
    }

    const contacto = this.contactos.find(c => String(c.id) === String(this.selectedContactoId));
    const unidad = this.unidades.find(u => String(u.id) === String(this.selectedUnidadId));
    if (!unidad) return;

    // Crear venta temporal (sin guardar aún)
    const nuevaVenta: VentaRecord = {
      date: Date.now(),
      type: this.selectedType,
      contacto: contacto ? { id: String(contacto.id), nombre: `${contacto?.Nombre || contacto?.nombre || ''} ${contacto?.Apellido || contacto?.apellido || ''}`.trim() } : null,
      unidad: { id: String(unidad.id), nombre: String(unidad?.nombre || unidad?.name || 'Unidad'), localidad: String(unidad?.ciudad || unidad?.city || unidad?.localidad || '') },
      importe: this.importe || undefined,
      comision: this.comision || undefined,
      precioUnitario: this.precioUnitario || undefined,
      meses: this.selectedType === 'renta' ? (this.meses || undefined) : undefined
    };

    // Agregar a la lista temporal
    this.ventasAgregadas.unshift(nuevaVenta);

    // Resetear formulario
    this.resetForm();
  }

  resetForm(): void {
    this.selectedContactoId = null;
    this.selectedUnidadId = null;
    this.selectedType = 'venta';
    this.importe = null;
    this.comision = null;
    this.precioUnitario = null;
    this.meses = null;
  }

  eliminarDeLista(index: number): void {
    this.ventasAgregadas.splice(index, 1);
  }

  async confirmar(): Promise<void> {
    if (this.ventasAgregadas.length === 0) {
      // Si no hay ventas agregadas, intentar agregar la actual
      if (this.selectedUnidadId) {
        this.agregar();
      } else {
        return;
      }
    }

    const errores: string[] = [];
    const exitosas: string[] = [];

    // Procesar todas las ventas agregadas
    for (const venta of this.ventasAgregadas) {
      if (!venta.unidad || !venta.unidad.id) {
        errores.push('Unidad no especificada en la venta');
        continue;
      }
      
      const unidad = this.unidades.find(u => String(u.id) === String(venta.unidad!.id));
      if (!unidad) {
        errores.push(`Unidad ${venta.unidad.nombre || venta.unidad.id} no encontrada`);
        continue;
      }

      try {
        // Primero guardar la venta
        const ventaDoc = await this.ventaService.addVenta(venta);
        console.log('Venta guardada exitosamente:', ventaDoc.id);

        // Solo si la venta se guardó exitosamente, actualizar la unidad
        const changes: any = {};
        if (venta.type === 'venta') {
          // Actualizar estado comercial a 'Vendida' cuando se vende una unidad
          changes.estadoComercial = 'Vendida';
        }
        if (venta.type === 'renta') {
          // Actualizar estado comercial a 'En alquiler' cuando se renta una unidad
          changes.estadoComercial = 'En alquiler';
        }
        await this.unidadService.updateUnidad(String(unidad.id), changes);
        console.log('Unidad actualizada exitosamente:', unidad.id);
        exitosas.push(`Venta para ${venta.unidad.nombre || unidad.nombre || 'unidad'} guardada correctamente`);
      } catch (error: any) {
        console.error('Error al guardar venta:', error);
        const mensajeError = error?.message || 'Error desconocido';
        errores.push(`${venta.unidad.nombre || venta.unidad.id}: ${mensajeError}`);
      }
    }

    // Mostrar resultados
    if (errores.length > 0) {
      const mensaje = `Se guardaron ${exitosas.length} venta(s) correctamente.\n\nErrores:\n${errores.join('\n')}`;
      alert(mensaje);
      // Si hubo errores pero también exitosas, cerrar el modal de todas formas
      if (exitosas.length > 0) {
        this.activeModal.close(true);
      }
    } else {
      // Todo exitoso
      if (exitosas.length > 0) {
        this.activeModal.close(true);
      }
    }
  }
}
