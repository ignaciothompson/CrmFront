import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../../../core/services/contacto';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-compare-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadComponent],
  templateUrl: './compare-modal.html',
  styleUrl: './compare-modal.css'
})
export class CompareModal {
  constructor(
    public activeModal: NgbActiveModal,
    private contactoService: ContactoService,
    private toastService: ToastService
  ) {}

  @Input() unidades: any[] = [];

  contactos: any[] = [];
  contactoItems: Array<{ id: string; label: string }> = [];
  selectedContactoId: string | null = null;

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.contactos = cs || [];
      this.contactoItems = this.contactos.map(c => {
        // Handle both capitalized and lowercase field names
        const nombre = c.Nombre || c.nombre || '';
        const apellido = c.Apellido || c.apellido || '';
        const label = `${nombre} ${apellido}`.trim();
        return { id: String(c.id), label: label };
      }).filter(x => !!x.label);
    });
  }

  removeUnidad(u: any): void {
    const id = String(u?.id);
    this.unidades = (this.unidades || []).filter(x => String(x?.id) !== id);
  }

  confirm(): void {
    // Note: Contacto is optional, so no validation needed
    // But we can validate that unidades are still present
    if (!this.unidades || this.unidades.length < 2) {
      this.toastService.warning('Debe tener al menos 2 unidades seleccionadas');
      return;
    }

    const contacto = this.selectedContactoId 
      ? this.contactos.find(c => String(c.id) === String(this.selectedContactoId))
      : null;
    
    // Normalize contacto data for consistency
    if (contacto) {
      contacto.nombre = contacto.Nombre || contacto.nombre || '';
      contacto.apellido = contacto.Apellido || contacto.apellido || '';
      contacto.telefono = contacto.Celular || contacto.telefono || '';
      contacto.mail = contacto.Mail || contacto.mail || '';
    }
    
    this.activeModal.close({ contacto });
  }
}


