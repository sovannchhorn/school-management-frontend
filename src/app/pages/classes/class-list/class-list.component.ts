import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Classes & Subjects</h1><p class="page-subtitle">{{ classes().length }} classes</p></div>
        @if (auth.isAdmin()) {
          <button class="btn btn-primary" (click)="showForm.set(true)">➕ Add Class</button>
        }
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @for (cls of classes(); track cls._id) {
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-2xl font-bold text-indigo-400">{{ cls.grade }}</div>
              <span class="badge badge-primary">Section {{ cls.section }}</span>
            </div>
            <h3 class="font-semibold text-white text-lg mb-1">{{ cls.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ cls.academicYear }}</p>
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Capacity</span><span class="text-white">{{ cls.capacity }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Class Teacher</span><span class="text-white">{{ cls.classTeacher?.firstName ?? '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Room</span><span class="text-white">{{ cls.room ?? '—' }}</span></div>
            </div>
            <div class="flex flex-wrap gap-1 mt-3">
              @for (s of cls.subjects?.slice(0,4); track s._id) {
                <span class="badge badge-info text-xs">{{ s.name }}</span>
              }
            </div>
            @if (auth.isAdmin()) {
              <button class="btn btn-danger btn-sm w-full mt-3" (click)="delete(cls._id)">🗑 Delete</button>
            }
          </div>
        }
      </div>

      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Add Class</h3>
            <form (ngSubmit)="create()">
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group"><label class="form-label">Class Name *</label><input type="text" class="form-input" [(ngModel)]="newClass.name" name="name" placeholder="Grade 10A" required></div>
                <div class="form-group"><label class="form-label">Grade *</label><input type="number" class="form-input" [(ngModel)]="newClass.grade" name="grade" required></div>
                <div class="form-group"><label class="form-label">Section *</label><input type="text" class="form-input" [(ngModel)]="newClass.section" name="section" placeholder="A" required></div>
                <div class="form-group"><label class="form-label">Capacity</label><input type="number" class="form-input" [(ngModel)]="newClass.capacity" name="cap"></div>
                <div class="form-group"><label class="form-label">Room</label><input type="text" class="form-input" [(ngModel)]="newClass.room" name="room"></div>
                <div class="form-group"><label class="form-label">Academic Year *</label><input type="text" class="form-input" [(ngModel)]="newClass.academicYear" name="year" placeholder="2024-2025" required></div>
              </div>
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Create</button>
                <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ClassListComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  classes = signal<any[]>([]);
  showForm = signal(false);
  newClass: any = { capacity: 40, academicYear: '2024-2025' };

  ngOnInit() { this.load(); }
  load() { this.api.getClasses().subscribe(r => this.classes.set(r.data)); }
  create() { this.api.createClass(this.newClass).subscribe({ next: () => { this.toast.success('Class created'); this.showForm.set(false); this.load(); }, error: e => this.toast.error(e.error?.message) }); }
  delete(id: string) { if (!confirm('Delete class?')) return; this.api.deleteClass(id).subscribe(() => { this.toast.success('Deleted'); this.load(); }); }
}
