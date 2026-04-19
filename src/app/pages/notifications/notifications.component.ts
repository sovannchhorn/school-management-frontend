import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Notifications</h1><p class="page-subtitle">{{ unread() }} unread</p></div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" (click)="markAll()">✅ Mark All Read</button>
          @if (auth.isAdmin() || auth.isTeacher()) {
            <button class="btn btn-primary" (click)="showForm.set(true)">📢 Announce</button>
          }
        </div>
      </div>

      <div class="space-y-3">
        @for (n of notifications(); track n._id) {
          <div class="bg-gray-900 border rounded-2xl p-5 transition-all cursor-pointer"
            [ngClass]="isRead(n) ? 'border-gray-800' : 'border-indigo-500/40 bg-indigo-950/20'"
            (click)="read(n)">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" [ngClass]="typeIcon(n.type).bg">{{ typeIcon(n.type).icon }}</div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h4 class="font-semibold text-white">{{ n.title }}</h4>
                  <span class="badge" [ngClass]="priorityClass(n.priority)">{{ n.priority }}</span>
                </div>
                <p class="text-sm text-gray-400 mt-1">{{ n.message }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span>From: {{ n.sender?.name }}</span>
                  <span>{{ n.createdAt | date:'medium' }}</span>
                  @if (!isRead(n)) { <span class="text-indigo-400 font-semibold">● New</span> }
                </div>
              </div>
            </div>
          </div>
        }
        @empty {
          <div class="text-center py-20 text-gray-500">🔔 No notifications</div>
        }
      </div>

      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Create Announcement</h3>
            <form (ngSubmit)="create()">
              <div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-input" [(ngModel)]="newNotif.title" name="title" required></div>
              <div class="form-group"><label class="form-label">Message *</label><textarea class="form-input h-24 resize-none" [(ngModel)]="newNotif.message" name="message" required></textarea></div>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label class="form-label">Type</label>
                  <select class="form-input" [(ngModel)]="newNotif.type" name="type">
                    <option value="announcement">Announcement</option><option value="general">General</option><option value="exam">Exam</option><option value="fee">Fee</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select class="form-input" [(ngModel)]="newNotif.priority" name="priority">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Target Roles</label>
                <div class="flex gap-3 flex-wrap mt-1">
                  @for (r of roles; track r) {
                    <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input type="checkbox" [value]="r" (change)="toggleRole(r)"> {{ r }}
                    </label>
                  }
                </div>
              </div>
              <label class="flex items-center gap-2 text-sm text-gray-300 mt-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="newNotif.isGlobal" name="global"> Send to everyone
              </label>
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Send</button>
                <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  notifications = signal<Notification[]>([]);
  unread = signal(0);
  showForm = signal(false);
  roles = ['admin','teacher','student','parent'];
  newNotif: any = { type: 'announcement', priority: 'medium', targetRoles: [], isGlobal: false };

  ngOnInit() { this.load(); }

  load() {
    this.api.getNotifications().subscribe(r => { this.notifications.set(r.data); this.unread.set(r.unread); });
  }

  isRead(n: Notification) { const uid = (this.auth.user() as any)?._id; return n.readBy?.includes(uid); }
  read(n: Notification) { if (!this.isRead(n)) { this.api.markNotificationRead(n._id).subscribe(() => this.load()); } }
  markAll() { this.api.markAllRead().subscribe(() => this.load()); }
  toggleRole(r: string) { const arr = this.newNotif.targetRoles; const i = arr.indexOf(r); i > -1 ? arr.splice(i,1) : arr.push(r); }

  create() {
    this.api.createNotification(this.newNotif).subscribe({ next: () => { this.toast.success('Announcement sent!'); this.showForm.set(false); this.load(); this.newNotif = { type: 'announcement', priority: 'medium', targetRoles: [], isGlobal: false }; }, error: e => this.toast.error(e.error?.message) });
  }

  typeIcon(t: string) {
    const map: any = { announcement: { icon: '📢', bg: 'bg-indigo-600/20' }, fee: { icon: '💰', bg: 'bg-amber-600/20' }, exam: { icon: '📝', bg: 'bg-blue-600/20' }, attendance: { icon: '✅', bg: 'bg-emerald-600/20' }, general: { icon: '🔔', bg: 'bg-gray-600/20' } };
    return map[t] || map['general'];
  }
  priorityClass(p: string) { return { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' }[p] || 'badge-info'; }
}
