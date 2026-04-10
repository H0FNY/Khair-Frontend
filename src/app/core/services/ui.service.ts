import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // Toasts State
  private toastsSignal = signal<Toast[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  // Confirmation Modal State
  private confirmModalSignal = signal<{ config: ConfirmConfig; resolve: (value: boolean) => void } | null>(null);
  public readonly confirmModal = this.confirmModalSignal.asReadonly();

  private toastIdCounter = 0;

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 4000) {
    const id = ++this.toastIdCounter;
    const newToast: Toast = { id, message, type, duration };
    
    this.toastsSignal.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id: number) {
    this.toastsSignal.update(current => current.filter(t => t.id !== id));
  }

  confirm(config: ConfirmConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmModalSignal.set({ config, resolve });
    });
  }

  closeConfirm(result: boolean) {
    const state = this.confirmModalSignal();
    if (state) {
      state.resolve(result);
      this.confirmModalSignal.set(null);
    }
  }

  showError(error: any, defaultMessage: string = 'حدث خطأ غير متوقع.') {
    let message = defaultMessage;

    if (error) {
      if (typeof error === 'string') {
        message = error;
      } else if (error.error) {
        if (typeof error.error === 'string') {
          message = error.error;
        } else if (error.error.message) {
          message = error.error.message;
        } else if (error.error.errors) {
          // Handle ASP.NET Validation errors
          const errors = error.error.errors;
          message = Object.values(errors).flat().join(' | ');
        }
      } else if (error.message) {
        message = error.message;
      }
    }

    this.showToast(message, 'error');
  }
}
