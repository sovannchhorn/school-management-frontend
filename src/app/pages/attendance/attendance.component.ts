import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Attendance</h1><p class="page-subtitle">Mark and view attendance records</p></div>
      </div>

      <!-- Controls -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <select class="form-input w-48" [(ngModel)]="selectedClass" (change)="onClassChange()">
          <option value="">Select Class</option>
          @for (cls of classes(); track cls._id) {
            <option [value]="cls._id">{{ cls.name }}</option>
          }
        </select>
        <input type="date" class="form-input w-44" [(ngModel)]="selectedDate" (change)="loadAttendance()">
        @if (auth.isAdmin() || auth.isTeacher()) {
          <button class="btn btn-primary ml-auto" (click)="save()" [disabled]="!records().length || saving()">
            {{ saving() ? 'Saving...' : '💾 Save Attendance' }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else if (!selectedClass) {
        <div class="text-center py-20 text-gray-500">Select a class to begin</div>
      } @else if (records().length === 0) {
        <div class="text-center py-12 text-gray-500">No students in this class</div>
      } @else {
        <!-- Summary -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          @for (s of summary(); track s.label) {
            <div class="stat-card text-center">
              <p class="text-2xl font-bold" [ngClass]="s.color">{{ s.count }}</p>
              <p class="text-sm text-gray-400">{{ s.label }}</p>
            </div>
          }
        </div>

        <!-- Attendance Table -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 class="font-semibold text-white">{{ selectedDate | date:'fullDate' }}</h3>
            @if (auth.isAdmin() || auth.isTeacher()) {
              <div class="flex gap-2">
                <button class="btn btn-success btn-sm" (click)="markAll('present')">✅ All Present</button>
                <button class="btn btn-danger btn-sm" (click)="markAll('absent')">❌ All Absent</button>
              </div>
            }
          </div>
          <div class="divide-y divide-gray-800">
            @for (rec of records(); track rec.student._id) {
              <div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/30">
                <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {{ rec.student.firstName.charAt(0) }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-white text-sm">{{ rec.student.firstName }} {{ rec.student.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ rec.student.studentId }}</p>
                </div>
                @if (auth.isAdmin() || auth.isTeacher()) {
                  <div class="flex gap-2">
                    @for (s of statuses; track s.value) {
                      <button class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        [ngClass]="rec.status === s.value ? s.activeClass : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
                        (click)="rec.status = s.value">{{ s.label }}</button>
                    }
                  </div>
                } @else {
                  <span class="badge" [ngClass]="statusBadge(rec.status)">{{ rec.status }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  classes = signal<any[]>([]);
  records = signal<any[]>([]);
  loading = signal(false);
  saving = signal(false);
  selectedClass = '';
  selectedDate = new Date().toISOString().split('T')[0];
  academicYear = '2024-2025';

  statuses = [
    { value: 'present', label: '✅', activeClass: 'bg-emerald-600 text-white' },
    { value: 'absent', label: '❌', activeClass: 'bg-red-600 text-white' },
    { value: 'late', label: '⏰', activeClass: 'bg-amber-600 text-white' },
    { value: 'excused', label: '📋', activeClass: 'bg-blue-600 text-white' }
  ];

  summary() {
    const r = this.records();
    return [
      { label: 'Present', count: r.filter(x => x.status === 'present').length, color: 'text-emerald-400' },
      { label: 'Absent', count: r.filter(x => x.status === 'absent').length, color: 'text-red-400' },
      { label: 'Late', count: r.filter(x => x.status === 'late').length, color: 'text-amber-400' },
      { label: 'Total', count: r.length, color: 'text-indigo-400' }
    ];
  }

  ngOnInit() { this.api.getClasses().subscribe(res => this.classes.set(res.data)); }

  onClassChange() {
    this.api.getStudentsByClass(this.selectedClass).subscribe(res => {
      this.records.set(res.data.map((s: any) => ({ student: s, status: 'present' })));
      this.loadAttendance();
    });
  }

  loadAttendance() {
    if (!this.selectedClass) return;
    this.loading.set(true);
    this.api.getAttendanceByClass(this.selectedClass, { date: this.selectedDate }).subscribe({
      next: res => {
        if (res.data.length > 0) {
          const existing = res.data[0];
          this.records.update(recs => recs.map(r => {
            const found = existing.records.find((e: any) => e.student._id === r.student._id);
            return found ? { ...r, status: found.status } : r;
          }));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markAll(status: string) { this.records.update(r => r.map(x => ({ ...x, status }))); }

  save() {
    this.saving.set(true);
    this.api.markAttendance({ classId: this.selectedClass, date: this.selectedDate, records: this.records().map(r => ({ student: r.student._id, status: r.status })), academicYear: this.academicYear }).subscribe({
      next: () => { this.toast.success('Attendance saved!'); this.saving.set(false); },
      error: err => { this.toast.error(err.error?.message || 'Failed'); this.saving.set(false); }
    });
  }

  statusBadge(s: string) { return { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-info' }[s] || 'badge-info'; }
}
