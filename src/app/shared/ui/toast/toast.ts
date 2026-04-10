import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService, Toast } from '../../../core/services/ui.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of uiService.toasts(); track toast.id) {
        <div class="toast-item" [class]="toast.type" (click)="uiService.removeToast(toast.id)">
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button class="toast-close">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      pointer-events: none;
      direction: rtl;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-radius: 16px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      min-width: 280px;
      max-width: 400px;
      border: 1px solid rgba(0,0,0,0.05);
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      transition: all 0.2s;
    }

    .toast-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    .toast-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      font-family: 'Cairo', sans-serif;
    }

    .toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    /* Types */
    .success { border-right: 4px solid #10b981; }
    .success .toast-icon { background: #f0fdf4; color: #10b981; }

    .error { border-right: 4px solid #ef4444; }
    .error .toast-icon { background: #fef2f2; color: #ef4444; }

    .warning { border-right: 4px solid #f59e0b; }
    .warning .toast-icon { background: #fffbeb; color: #f59e0b; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  public uiService = inject(UiService);
}
