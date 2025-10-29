import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css'
})
export class DeleteModal {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() proyecto: any;
  @Input() unidades: any[] = [];

  confirm(): void {
    this.activeModal.close(true);
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}


