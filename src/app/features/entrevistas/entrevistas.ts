import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../core/services/contacto';

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TypeaheadComponent],
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.css'
})
export class Entrevistas {
  constructor(private contactoService: ContactoService) {}
  items: any[] = [];
  all: any[] = [];
  selectedId: string | null = null;
  searchItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.all = (cs || []);
      this.items = this.all.filter(c => c?.EntrevistaPendiente || (c?.Entrevista?.Fecha && c?.Entrevista?.Hora));
      this.searchItems = this.items.map(c => ({ id: String(c.id), label: `${c?.Nombre || ''} ${c?.Apellido || ''}`.trim() }));
    });
  }

  onSearchChange(): void {
    if (this.selectedId) {
      this.items = this.all.filter(c => (c?.EntrevistaPendiente || (c?.Entrevista?.Fecha && c?.Entrevista?.Hora)) && String(c.id) === String(this.selectedId));
    } else {
      this.items = this.all.filter(c => c?.EntrevistaPendiente || (c?.Entrevista?.Fecha && c?.Entrevista?.Hora));
    }
  }
}


