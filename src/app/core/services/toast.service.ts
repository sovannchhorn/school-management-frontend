import { Injectable, signal } from '@angular/core';

export interface Toast { id: string; message: string; type: 'success'|'error'|'info'|'warning'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }
  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
  warning(msg: string) { this.show(msg, 'warning'); }
  remove(id: string) { this.toasts.update(t => t.filter(x => x.id !== id)); }
}
