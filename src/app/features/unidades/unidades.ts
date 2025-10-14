import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unidades',
  standalone: false,
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades {
  constructor(private router: Router) {}

  goNuevo(): void {
    this.router.navigate(['/unidades/form']);
  }

  goEditar(id: number): void {
    this.router.navigate(['/unidades/form', id]);
  }
}
