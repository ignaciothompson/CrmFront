import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead';

@Component({
  selector: 'app-proyecto-select-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TypeaheadComponent],
  templateUrl: './proyecto-select-modal.html',
  styleUrl: './proyecto-select-modal.css'
})
export class ProyectoSelectModal {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() proyectos: any[] = [];
  @Input() searchTerm: string = '';

  proyectoItems: Array<{ id: string; label: string }> = [];
  selectedProyectoId: string | null = null;

  ngOnInit(): void {
    // Map proyectos to items for typeahead
    this.proyectoItems = this.proyectos.map(p => ({ 
      id: String(p.id), 
      label: String(p.nombre || '') 
    })).filter(x => !!x.label);
  }

  selectProyecto(): void {
    if (this.selectedProyectoId) {
      const proyecto = this.proyectos.find(p => String(p.id) === String(this.selectedProyectoId));
      this.activeModal.close(proyecto);
    } else {
      this.activeModal.dismiss();
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}

