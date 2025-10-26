import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../core/services/contacto';
import { EntrevistaService } from '../../core/services/entrevista';

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [FormsModule, RouterModule, TypeaheadComponent],
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.css'
})
export class Entrevistas {
  constructor(private contactoService: ContactoService, private entrevistaService: EntrevistaService) {}
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
    });
  }

  resetFilters(): void {
    this.selectedId = null;
    this.selectedDate = null;
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
}


