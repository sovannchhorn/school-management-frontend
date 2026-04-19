import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium animate-fade-in-up cursor-pointer max-w-sm"
          [ngClass]="classes[toast.type]"
          (click)="toastSvc.remove(toast.id)">
          <span>{{ icons[toast.type] }}</span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastSvc = inject(ToastService);
  icons: Record<string,string> = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  classes: Record<string,string> = {
    success: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300',
    error:   'bg-red-900/90 border-red-500/40 text-red-300',
    info:    'bg-blue-900/90 border-blue-500/40 text-blue-300',
    warning: 'bg-amber-900/90 border-amber-500/40 text-amber-300'
  };
}
