import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../core/services/contacto';
import { SubheaderComponent, FilterConfig } from '../../shared/components/subheader/subheader';
import { BlacklistModal } from './blacklist-modal/blacklist-modal';

@Component({
  selector: 'app-listas-negras',
  standalone: true,
  imports: [FormsModule, SubheaderComponent],
  templateUrl: './listas-negras.html',
  styleUrl: './listas-negras.css'
})
export class ListasNegras {
  constructor(private modal: NgbModal, private contactoService: ContactoService) {}

  // Filter configurations for subheader
  subheaderFilters: FilterConfig[] = [];

  items: any[] = [];
  all: any[] = [];
  selectedId: string | null = null;
  searchItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    // Example: load from contactos with Lista Negra flag
    this.contactoService.getContactos().subscribe(cs => {
      this.all = (cs || []);
      this.items = this.all.filter(c => !!c?.ListaNegra);
      this.searchItems = this.items.map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
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
      }
    ];
  }

  onFilterSubmit(values: Record<string, any>): void {
    this.selectedId = values['contacto'] || null;
    this.applyFilters();
  }

  openAddModal(): void {
    const modalRef = this.modal.open(BlacklistModal, { size: 'lg' });
    const items = (this.items || []);
    this.contactoService.getContactos().subscribe(cs => {
      const options = (cs || []).map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
      modalRef.componentInstance.items = options;
    });
    modalRef.result.then((selectedIds: string[]) => {
      if (!selectedIds || !selectedIds.length) return;
      Promise.all(selectedIds.map(id => this.contactoService.updateContacto(id, { ListaNegra: true })))
        .then(() => {})
        .catch(() => {});
    }).catch(() => {});
  }


  applyFilters(): void {
    if (this.selectedId) {
      this.items = this.all.filter(c => !!c?.ListaNegra && String(c.id) === String(this.selectedId));
    } else {
      this.items = this.all.filter(c => !!c?.ListaNegra);
    }
  }
}


