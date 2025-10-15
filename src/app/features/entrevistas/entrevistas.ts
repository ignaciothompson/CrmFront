import { Component } from '@angular/core';
import { ContactoService } from '../../core/services/contacto';

@Component({
  selector: 'app-entrevistas',
  standalone: false,
  templateUrl: './entrevistas.html',
  styleUrl: './entrevistas.css'
})
export class Entrevistas {
  constructor(private contactoService: ContactoService) {}
  items: any[] = [];

  ngOnInit(): void {
    this.contactoService.getContactos().subscribe(cs => {
      this.items = (cs || []).filter(c => c?.EntrevistaPendiente || (c?.Entrevista?.Fecha && c?.Entrevista?.Hora));
    });
  }
}


