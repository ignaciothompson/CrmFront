import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SubheaderComponent],
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.css'
})
export class Entrevistas {
  constructor(
    private contactoService: ContactoService,
    private entrevistaService: EntrevistaService,
    private modal: NgbModal
  ) {}
  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  items: any[] = [];
  all: any[] = [];
  selectedId: string | null = null; // contactoId
  selectedDate: string | null = null; // YYYY-MM-DD
  showCompletadas: boolean = false; // Checkbox para ver completadas
  searchItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    // Load contactos for typeahead (all contactos, not just those with entrevistas)
    this.contactoService.getContactos().subscribe(contactos => {
      this.searchItems = (contactos || []).map(c => ({
        id: String(c.id),
        label: `${c?.nombre || c?.Nombre || ''} ${c?.apellido || c?.Apellido || ''}`.trim() || String(c.id)
      }));
      this.updateFilterConfigs();
    });

    // Load entrevistas from collection instead of nested in contacto
    this.entrevistaService.getEntrevistas().subscribe(es => {
      this.all = es || [];
      this.applyFilters();
    });
  }

  private updateFilterConfigs(): void {
    this.subheaderFilters = [
      {
        id: 'contacto',
        type: 'typeahead',
        label: 'Contacto',
        placeholder: 'Escriba para filtrar...',
        items: this.searchItems,
        idKey: 'id',
        labelKey: 'label',
        columnClass: 'col-xs-12 col-sm-6 col-md-3'
      },
      {
        id: 'fecha',
        type: 'date',
        label: 'Fecha',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      },
      {
        id: 'showCompletadas',
        type: 'checkbox',
        label: 'Ver entrevistas completadas',
        columnClass: 'col-xs-12 col-sm-6 col-md-2'
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.selectedId = values['contacto'] || null;
    this.selectedDate = values['fecha'] || null;
    this.showCompletadas = values['showCompletadas'] === true || values['showCompletadas'] === 'true' || values['showCompletadas'] === 1;
    this.applyFilters();
  }


  applyFilters(): void {
    let filtered = this.all;
    
    // Filter by pendiente status (show only pending by default, or all if showCompletadas is true)
    if (!this.showCompletadas) {
      filtered = filtered.filter(e => e?.pendiente !== false);
    }
    
    if (this.selectedId) {
      filtered = filtered.filter(e => String(e?.contactoId) === String(this.selectedId));
    }
    if (this.selectedDate) {
      filtered = filtered.filter(e => String(e?.fechaISO || e?.fecha) === String(this.selectedDate));
    }
    this.items = filtered;
  }


  async marcarCompletada(it: any): Promise<void> {
    try {
      await this.entrevistaService.marcarCompletada(String(it.id));
      // Reload entrevistas
      this.entrevistaService.getEntrevistas().subscribe(es => {
        this.all = es || [];
        this.applyFilters();
      });
    } catch (error: any) {
      console.error('Error al marcar entrevista como completada:', error);
      alert('Error al marcar la entrevista como completada. Por favor, intente nuevamente.');
    }
  }

  async eliminarEntrevista(it: any): Promise<void> {
    if (!confirm('¿Está seguro que desea eliminar esta entrevista?')) {
      return;
    }
    
    try {
      await this.entrevistaService.deleteEntrevista(String(it.id));
      // Reload entrevistas
      this.entrevistaService.getEntrevistas().subscribe(es => {
        this.all = es || [];
        this.applyFilters();
      });
    } catch (error: any) {
      console.error('Error al eliminar entrevista:', error);
      alert('Error al eliminar la entrevista. Por favor, intente nuevamente.');
    }
  }

  getContactoNombreCompleto(it: any): string {
    const nombre = it?.contactoNombre || '';
    const apellido = it?.contactoApellido || '';
    const completo = `${nombre} ${apellido}`.trim();
    return completo || '-';
  }

  getUnidadProyecto(it: any): string {
    const unidadNombre = it?.unidadNombre || '';
    const proyectoNombre = it?.proyectoNombre || '';
    if (unidadNombre && proyectoNombre) {
      return `${unidadNombre}, ${proyectoNombre}`;
    }
    if (unidadNombre) {
      return unidadNombre;
    }
    if (proyectoNombre) {
      return proyectoNombre;
    }
    return '-';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  }

  goNuevo(): void {
    import('../form/entrevista-form').then(m => {
      const modalRef = this.modal.open(m.EntrevistaForm, { size: 'xl', backdrop: 'static', keyboard: false });
      modalRef.result.then((result: any) => {
        // Reload entrevistas if saved successfully
        if (result === true) {
          this.entrevistaService.getEntrevistas().subscribe(es => {
            this.all = es || [];
            this.applyFilters();
          });
        }
      }).catch(() => {
        // Modal closed without saving
      });
    });
  }
}


