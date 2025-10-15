import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../core/services/contacto';
import { BlacklistModal } from './components/blacklist-modal/blacklist-modal';

@Component({
  selector: 'app-listas-negras',
  standalone: false,
  templateUrl: './listas-negras.html',
  styleUrl: './listas-negras.css'
})
export class ListasNegras {
  constructor(private modal: NgbModal, private contactoService: ContactoService) {}

  items: any[] = [];

  ngOnInit(): void {
    // Example: load from contactos with Lista Negra flag
    this.contactoService.getContactos().subscribe(cs => {
      this.items = (cs || []).filter(c => !!c?.ListaNegra);
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
}


