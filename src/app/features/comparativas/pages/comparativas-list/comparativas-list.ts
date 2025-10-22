import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComparativaService } from '../../../../core/services/comparativa';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comparativas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comparativas-list.html',
  styleUrl: './comparativas-list.css'
})
export class ComparativasListPage {
  constructor(private comparativaService: ComparativaService, private router: Router) {}

  comparativas: any[] = [];

  ngOnInit(): void {
    this.comparativaService.getComparativas().subscribe(cs => {
      this.comparativas = (cs || []).sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
    });
  }

  formatDate(ts?: number): string {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  unitsSummary(c: any): string {
    const us = Array.isArray(c?.unidades) ? c.unidades : [];
    return us.map((u: any) => String(u?.nombre || u?.id || 'Unidad')).join(', ');
  }

  copyLink(c: any): void {
    const url = window.location.origin + '/comparacion/' + c?.id;
    navigator.clipboard?.writeText(url);
  }

  delete(c: any): void {
    if (!c?.id) return;
    const ok = confirm('¿Eliminar esta comparativa? Esta acción no se puede deshacer.');
    if (!ok) return;
    this.comparativaService.deleteComparativa(String(c.id));
  }
}


