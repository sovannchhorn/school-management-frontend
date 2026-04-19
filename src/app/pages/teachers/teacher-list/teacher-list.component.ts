import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Teacher } from '../../../core/models';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Teachers</h1><p class="page-subtitle">{{ total() }} teachers</p></div>
        <button class="btn btn-primary" (click)="showForm.set(true)">➕ Add Teacher</button>
      </div>

      <!-- Search -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <input type="text" class="form-input" placeholder="🔍 Search teachers..." [(ngModel)]="search" (ngModelChange)="load()">
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          @for (t of teachers(); track t._id) {
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">{{ t.firstName.charAt(0) }}</div>
                  <div>
                    <p class="font-semibold text-white">{{ t.firstName }} {{ t.lastName }}</p>
                    <p class="text-xs text-indigo-400 font-mono">{{ t.teacherId }}</p>
                  </div>
                </div>
                <span class="badge" [ngClass]="t.isActive ? 'badge-success' : 'badge-danger'">{{ t.isActive ? 'Active' : 'Inactive' }}</span>
              </div>
              <div class="space-y-2 text-sm mb-4">
                <div class="flex justify-between"><span class="text-gray-500">Email</span><span class="text-gray-300">{{ t.email ?? '—' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Qualification</span><span class="text-gray-300">{{ t.qualification ?? '—' }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Experience</span><span class="text-gray-300">{{ t.experience ?? 0 }} yrs</span></div>
                <div class="flex gap-1 flex-wrap mt-2">
                  @for (s of t.subjects?.slice(0,3); track s._id) {
                    <span class="badge badge-primary">{{ s.name }}</span>
                  }
                </div>
              </div>
              <button class="btn btn-danger btn-sm w-full" (click)="delete(t)">🗑 Deactivate</button>
            </div>
          }
          @empty {
            <p class="col-span-3 text-center py-12 text-gray-500">No teachers found</p>
          }
        </div>
      }

      <!-- Simple Modal Form -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Add New Teacher</h3>
            <form (ngSubmit)="create()">
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group"><label class="form-label">First Name *</label><input type="text" class="form-input" [(ngModel)]="newTeacher.firstName" name="fn" required></div>
                <div class="form-group"><label class="form-label">Last Name *</label><input type="text" class="form-input" [(ngModel)]="newTeacher.lastName" name="ln" required></div>
                <div class="form-group col-span-2"><label class="form-label">Email *</label><input type="email" class="form-input" [(ngModel)]="newTeacher.email" name="email" required></div>
                <div class="form-group"><label class="form-label">Qualification</label><input type="text" class="form-input" [(ngModel)]="newTeacher.qualification" name="qual"></div>
                <div class="form-group"><label class="form-label">Experience (yrs)</label><input type="number" class="form-input" [(ngModel)]="newTeacher.experience" name="exp"></div>
              </div>
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Create' }}</button>
                <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TeacherListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  teachers = signal<Teacher[]>([]);
  total = signal(0);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  search = '';
  newTeacher: any = { firstName:'', lastName:'', email:'', qualification:'', experience: 0 };

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.getTeachers({ search: this.search }).subscribe({ next: res => { this.teachers.set(res.data); this.total.set(res.total ?? 0); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  create() {
    this.saving.set(true);
    this.api.createTeacher(this.newTeacher).subscribe({ next: () => { this.toast.success('Teacher created'); this.showForm.set(false); this.load(); this.saving.set(false); this.newTeacher = {}; }, error: err => { this.toast.error(err.error?.message); this.saving.set(false); } });
  }
  delete(t: Teacher) {
    if (!confirm('Deactivate this teacher?')) return;
    this.api.deleteTeacher(t._id).subscribe(() => { this.toast.success('Teacher deactivated'); this.load(); });
  }
}
