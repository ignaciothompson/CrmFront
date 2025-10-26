import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../core/services/contacto';
import { BlacklistModal } from './blacklist-modal/blacklist-modal';

@Component({
  selector: 'app-listas-negras',
  standalone: true,
  imports: [FormsModule, TypeaheadComponent],
  templateUrl: './listas-negras.html',
  styleUrl: './listas-negras.css'
})
export class ListasNegras {
  constructor(private modal: NgbModal, private contactoService: ContactoService) {}

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
    });
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

  resetFilters(): void {
    this.selectedId = null;
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.selectedId) {
      this.items = this.all.filter(c => !!c?.ListaNegra && String(c.id) === String(this.selectedId));
    } else {
      this.items = this.all.filter(c => !!c?.ListaNegra);
    }
  }
}


