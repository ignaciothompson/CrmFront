import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-blacklist-modal',
  standalone: false,
  templateUrl: './blacklist-modal.html',
  styleUrl: './blacklist-modal.css'
})
export class BlacklistModal {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() items: Array<{ id: string; label: string }> = [];
  query: string = '';
  selectedIds = new Set<string>();

  get filtered() {
    const q = (this.query || '').toLowerCase();
    if (!q) return this.items;
    return this.items.filter(i => i.label.toLowerCase().includes(q));
  }

  toggle(id: string): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id); else this.selectedIds.add(id);
  }

  confirm(): void {
    this.activeModal.close(Array.from(this.selectedIds));
  }
}


