import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../../core/services/contacto';

@Component({
  selector: 'app-compare-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule, TypeaheadComponent],
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

  removeUnidad(u: any): void {
    const id = String(u?.id);
    this.unidades = (this.unidades || []).filter(x => String(x?.id) !== id);
  }

  confirm(): void {
    const contacto = this.contactos.find(c => String(c.id) === String(this.selectedContactoId));
    this.activeModal.close({ contacto });
  }
}


