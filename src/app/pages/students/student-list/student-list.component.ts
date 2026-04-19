import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../core/models';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Students</h1>
          <p class="page-subtitle">{{ total() }} students enrolled</p>
        </div>
        @if (auth.isAdmin()) {
          <a routerLink="/students/new" class="btn btn-primary">➕ Add Student</a>
        }
      </div>

      <!-- Filters -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input type="text" class="form-input pl-9" placeholder="Search students..." [(ngModel)]="search" (ngModelChange)="onSearch()">
        </div>
        <select class="form-input w-48" [(ngModel)]="selectedGender" (change)="load()">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select class="form-input w-48" [(ngModel)]="selectedClass" (change)="load()">
          <option value="">All Classes</option>
          @for (cls of classes(); track cls._id) {
            <option [value]="cls._id">{{ cls.name }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else {
        <div class="table-wrap bg-gray-900">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>ID</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of students(); track s._id) {
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {{ s.firstName.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-white">{{ s.firstName }} {{ s.lastName }}</p>
                        <p class="text-xs text-gray-500">{{ s.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td><span class="font-mono text-indigo-400 text-xs">{{ s.studentId }}</span></td>
                  <td>{{ s.class?.name ?? '—' }}</td>
                  <td><span class="badge" [ngClass]="s.gender === 'male' ? 'badge-info' : 'badge-primary'">{{ s.gender }}</span></td>
                  <td>{{ s.phone ?? '—' }}</td>
                  <td><span class="badge" [ngClass]="s.isActive ? 'badge-success' : 'badge-danger'">{{ s.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td>
                    <div class="flex gap-1">
                      <a [routerLink]="['/students', s._id]" class="btn btn-secondary btn-sm">👁 View</a>
                      @if (auth.isAdmin()) {
                        <button class="btn btn-danger btn-sm" (click)="delete(s)">🗑</button>
                      }
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="7" class="text-center py-12 text-gray-500">No students found</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-gray-400">Showing {{ students().length }} of {{ total() }}</p>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" [disabled]="page() === 1" (click)="changePage(-1)">← Prev</button>
            <span class="btn btn-secondary btn-sm">{{ page() }} / {{ pages() }}</span>
            <button class="btn btn-secondary btn-sm" [disabled]="page() >= pages()" (click)="changePage(1)">Next →</button>
          </div>
        </div>
      }
    </div>
  `
})
export class StudentListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  students = signal<Student[]>([]);
  classes = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  search = '';
  selectedGender = '';
  selectedClass = '';
  private searchTimeout: any;

  ngOnInit() {
    this.api.getClasses().subscribe(res => this.classes.set(res.data));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getStudents({ page: this.page(), search: this.search, gender: this.selectedGender, classId: this.selectedClass }).subscribe({
      next: res => {
        this.students.set(res.data);
        this.total.set(res.total ?? 0);
        this.pages.set(res.pages ?? 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => { this.page.set(1); this.load(); }, 400); }
  changePage(dir: number) { this.page.update(p => p + dir); this.load(); }

  delete(student: Student) {
    if (!confirm(`Delete student ${student.firstName} ${student.lastName}?`)) return;
    this.api.deleteStudent(student._id).subscribe(() => {
      this.toast.success('Student deactivated');
      this.load();
    });
  }
}
