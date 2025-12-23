import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public messages$: Observable<ToastMessage[]> = this.messagesSubject.asObservable();

  private defaultDuration = 4000; // 4 seconds

  /**
   * Show a success toast message
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast message
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 5000); // Errors stay longer
  }

  /**
   * Show a warning toast message
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast message
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a toast message
   */
  private show(message: string, type: ToastMessage['type'], duration?: number): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      message,
      type,
      duration: duration || this.defaultDuration
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  /**
   * Remove a toast message
   */
  remove(id: string): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next(currentMessages.filter(msg => msg.id !== id));
  }

  /**
   * Clear all toast messages
   */
  clear(): void {
    this.messagesSubject.next([]);
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

