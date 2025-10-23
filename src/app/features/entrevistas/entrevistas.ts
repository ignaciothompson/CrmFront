import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TypeaheadComponent } from '../../shared/components/typeahead/typeahead';
import { ContactoService } from '../../core/services/contacto';
import { EntrevistaService } from '../../core/services/entrevista';

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TypeaheadComponent],
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.css'
})
export class Entrevistas {
  constructor(private contactoService: ContactoService, private entrevistaService: EntrevistaService) {}
  items: any[] = [];
  all: any[] = [];
  selectedId: string | null = null;
  searchItems: Array<{ id: string; label: string }> = [];

  ngOnInit(): void {
    // Load entrevistas from collection instead of nested in contacto
    this.entrevistaService.getEntrevistas().subscribe(es => {
      this.all = es || [];
      this.items = this.all;
      this.searchItems = this.items.map(e => ({ id: String(e.id), label: String(e?.contactoNombre || e?.contactoId || '') }));
    });
  }

  onSearchChange(): void {
    if (this.selectedId) {
      this.items = this.all.filter(e => String(e.id) === String(this.selectedId));
    } else {
      this.items = this.all;
    }
  }
}


