import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Audit Logs</h1><p class="page-subtitle">System activity trail</p></div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex gap-3">
        <select class="form-input w-44" [(ngModel)]="resource" (change)="load()">
          <option value="">All Resources</option>
          <option value="student">Students</option><option value="teacher">Teachers</option><option value="fee">Fees</option>
        </select>
      </div>
      <div class="table-wrap bg-gray-900">
        <table>
          <thead><tr><th>User</th><th>Action</th><th>Resource</th><th>Status</th><th>IP</th><th>Time</th></tr></thead>
          <tbody>
            @for (log of logs(); track log._id) {
              <tr>
                <td>{{ log.user?.name ?? 'System' }}</td>
                <td><span class="badge badge-primary">{{ log.action }}</span></td>
                <td>{{ log.resource }}</td>
                <td><span class="badge" [ngClass]="log.status === 'success' ? 'badge-success' : 'badge-danger'">{{ log.status }}</span></td>
                <td><span class="font-mono text-xs text-gray-500">{{ log.ipAddress }}</span></td>
                <td>{{ log.createdAt | date:'medium' }}</td>
              </tr>
            }
            @empty { <tr><td colspan="6" class="text-center py-12 text-gray-500">No logs</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditComponent implements OnInit {
  private api = inject(ApiService);
  logs = signal<any[]>([]);
  resource = '';
  ngOnInit() { this.load(); }
  load() { this.api.getAuditLogs({ resource: this.resource }).subscribe(r => this.logs.set(r.data)); }
}
