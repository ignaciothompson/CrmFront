import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-meet-modal',
  standalone: false,
  templateUrl: './meet-modal.html',
  styleUrl: './meet-modal.css'
})
export class MeetModal {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() contacto: any;
  @Input() meet: { Fecha?: string; Hora?: string; Comentario?: string; Unidad?: any; Location?: string } | null = null;
}


