import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">User Management</h1><p class="page-subtitle">{{ total() }} users</p></div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <select class="form-input w-44" [(ngModel)]="filterRole" (change)="load()">
          <option value="">All Roles</option>
          <option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="parent">Parent</option>
        </select>
      </div>
      <div class="table-wrap bg-gray-900">
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            @for (u of users(); track u._id) {
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">{{ u.name.charAt(0) }}</div>
                    <div><p class="font-medium text-white">{{ u.name }}</p><p class="text-xs text-gray-500">{{ u.email }}</p></div>
                  </div>
                </td>
                <td><span class="badge badge-primary capitalize">{{ u.role }}</span></td>
                <td>{{ u.lastLogin ? (u.lastLogin | date:'mediumDate') : 'Never' }}</td>
                <td><span class="badge" [ngClass]="u.isActive ? 'badge-success' : 'badge-danger'">{{ u.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <button class="btn btn-sm" [ngClass]="u.isActive ? 'btn-danger' : 'btn-success'" (click)="toggleStatus(u)">
                    {{ u.isActive ? '🔒 Disable' : '🔓 Enable' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  users = signal<User[]>([]);
  total = signal(0);
  filterRole = '';

  ngOnInit() { this.load(); }
  load() { this.api.getUsers({ role: this.filterRole }).subscribe(r => { this.users.set(r.data); this.total.set(r.total ?? 0); }); }
  toggleStatus(u: User) { this.api.toggleUserStatus(u._id).subscribe(() => { this.toast.success('Status updated'); this.load(); }); }
}
