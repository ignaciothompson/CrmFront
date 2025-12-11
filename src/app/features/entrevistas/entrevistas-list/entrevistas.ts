import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../../core/services/contacto';
import { EntrevistaService } from '../../../core/services/entrevista';
import { SubheaderComponent, FilterConfig } from '../../../shared/components/subheader/subheader';

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [FormsModule, RouterModule, SubheaderComponent],
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
  searchItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    // Load entrevistas from collection instead of nested in contacto
    this.entrevistaService.getEntrevistas().subscribe(es => {
      this.all = es || [];
      this.items = this.all;
      // Build unique contact list for typeahead
      const byContacto: Record<string, string> = {};
      for (const e of this.all) {
        const cid = String(e?.contactoId || '');
        if (!cid) continue;
        const label = `${e?.contactoNombre || ''} ${e?.contactoApellido || ''}`.trim() || cid;
        if (!byContacto[cid]) byContacto[cid] = label;
      }
      this.searchItems = Object.entries(byContacto).map(([id, label]) => ({ id, label }));
      this.updateFilterConfigs();
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
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.selectedId = values['contacto'] || null;
    this.selectedDate = values['fecha'] || null;
    this.applyFilters();
  }


  applyFilters(): void {
    let filtered = this.all;
    if (this.selectedId) {
      filtered = filtered.filter(e => String(e?.contactoId) === String(this.selectedId));
    }
    if (this.selectedDate) {
      filtered = filtered.filter(e => String(e?.fecha) === String(this.selectedDate));
    }
    this.items = filtered;
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


