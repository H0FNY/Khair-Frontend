import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (uiService.confirmModal(); as modal) {
      <div class="modal-overlay" (click)="uiService.closeConfirm(false)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-icon" [class.destructive]="modal.config.isDestructive">
              @if (modal.config.isDestructive) {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              } @else {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              }
            </div>
            <h3>{{ modal.config.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ modal.config.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="uiService.closeConfirm(false)">
              {{ modal.config.cancelText || 'إلغاء' }}
            </button>
            <button class="confirm-btn" [class.destructive]="modal.config.isDestructive" (click)="uiService.closeConfirm(true)">
              {{ modal.config.confirmText || 'تأكيد' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
      direction: rtl;
    }

    .modal-container {
      background: white;
      width: 90%;
      max-width: 440px;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .modal-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon.destructive {
      background: #fef2f2;
      color: #ef4444;
    }

    .modal-header h3 {
      font-size: 20px;
      font-weight: 800;
      color: #1e293b;
      font-family: 'Cairo', sans-serif;
    }

    .modal-body {
      text-align: center;
      color: #64748b;
      font-size: 15px;
      line-height: 1.6;
      font-family: 'Cairo', sans-serif;
      font-weight: 500;
      padding: 0 8px;
    }

    .modal-footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn {
      padding: 14px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Cairo', sans-serif;
      transition: all 0.2s;
    }

    .cancel-btn {
      padding: 14px;
      border-radius: 14px;
      border: 1.5px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-weight: 700;
      cursor: pointer;
    }

    .cancel-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .confirm-btn {
      padding: 14px;
      border-radius: 14px;
      border: none;
      background: #10b981;
      color: white;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    .confirm-btn:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .confirm-btn.destructive {
      background: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }

    .confirm-btn.destructive:hover {
      background: #dc2626;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmModalComponent {
  public uiService = inject(UiService);

  @HostListener('window:keydown.escape')
  onEscape() {
    this.uiService.closeConfirm(false);
  }
}
