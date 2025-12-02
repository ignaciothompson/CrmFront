import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModal } from '../components/confirm-modal/confirm-modal';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private modal: NgbModal) {}

  /**
   * Muestra un modal de confirmación y retorna una promesa que se resuelve con true si el usuario confirma, o false si cancela
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.modal.open(ConfirmModal, { 
      size: 'md', 
      backdrop: 'static', 
      keyboard: false 
    });
    
    const component = ref.componentInstance as ConfirmModal;
    component.title = options.title || 'Confirmar';
    component.message = options.message;
    component.confirmText = options.confirmText || 'Confirmar';
    component.cancelText = options.cancelText || 'Cancelar';
    component.confirmButtonClass = options.confirmButtonClass || 'btn-danger';
    component.cancelButtonClass = options.cancelButtonClass || 'btn-default';
    
    return ref.result.then((result: boolean) => {
      return result === true;
    }).catch(() => {
      return false;
    });
  }
}
