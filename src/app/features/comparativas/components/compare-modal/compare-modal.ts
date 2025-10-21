import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoService } from '../../../../core/services/contacto';

@Component({
  selector: 'app-compare-modal',
  standalone: false,
  templateUrl: './compare-modal.html',
  styleUrl: './compare-modal.css'
})
export class CompareModal {
  constructor(public activeModal: NgbActiveModal, private contactoService: ContactoService) {}

  @Input() unidades: any[] = [];

  contactos: any[] = [];
  contactoItems: Array<{ id: string; label: string }> = [];
  selectedContactoId: string | null = null;

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.contactos = cs || [];
      this.contactoItems = this.contactos.map(c => ({ id: String(c.id), label: String((c.nombre || '') + (c.apellido ? (' ' + c.apellido) : '')) })).filter(x => !!x.label);
    });
  }

  confirm(): void {
    const contacto = this.contactos.find(c => String(c.id) === String(this.selectedContactoId));
    this.activeModal.close({ contacto });
  }
}


