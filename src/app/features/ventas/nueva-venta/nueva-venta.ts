import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../core/services/contacto';
import { UnidadService } from '../../../core/services/unidad';
import { VentaService, VentaRecord } from '../../../core/services/venta';

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

  contactoItems: Array<{ id: string; label: string }> = [];
  unidadItems: Array<{ id: string; label: string }> = [];
  contactos: any[] = [];
  unidades: any[] = [];

  ventas: VentaRecord[] = [];

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
      this.ventas = (rows || []).sort((a, b) => (b?.date || 0) - (a?.date || 0)).slice(0, 10);
    });
  }

  editRow(r: VentaRecord): void {
    this.selectedType = r?.type || 'venta';
    this.selectedContactoId = r?.contacto?.id || null;
    this.selectedUnidadId = r?.unidad?.id || null;
  }

  async confirmar(): Promise<void> {
    const contacto = this.contactos.find(c => String(c.id) === String(this.selectedContactoId));
    const unidad = this.unidades.find(u => String(u.id) === String(this.selectedUnidadId));
    if (!unidad) return;

    // Update unidad as sold/rented
    const changes: any = {};
    if (this.selectedType === 'venta') changes.vendida = true;
    if (this.selectedType === 'renta') changes.rented = true;
    await this.unidadService.updateUnidad(String(unidad.id), changes);

    // Record venta
    await this.ventaService.addVenta({
      date: Date.now(),
      type: this.selectedType,
      contacto: contacto ? { id: String(contacto.id), nombre: `${contacto?.Nombre || contacto?.nombre || ''} ${contacto?.Apellido || contacto?.apellido || ''}`.trim() } : null,
      unidad: { id: String(unidad.id), nombre: String(unidad?.nombre || unidad?.name || 'Unidad'), localidad: String(unidad?.ciudad || unidad?.city || unidad?.localidad || '') }
    });

    this.activeModal.close(true);
  }
}
