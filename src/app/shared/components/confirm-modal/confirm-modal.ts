import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css'
})
export class ConfirmModal {
  constructor(public activeModal: NgbActiveModal) {}

  @Input() title: string = 'Confirmar';
  @Input() message: string = '¿Está seguro que desea continuar?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmButtonClass: string = 'btn-primary';
  @Input() cancelButtonClass: string = 'btn-default';

  confirm(): void {
    this.activeModal.close(true);
  }

  cancel(): void {
    this.activeModal.dismiss(false);
  }
}
