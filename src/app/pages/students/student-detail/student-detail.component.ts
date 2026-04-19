import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Student } from '../../../core/models';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else if (student()) {
        <div class="page-header">
          <div class="flex items-center gap-4">
            <a routerLink="/students" class="btn btn-secondary btn-sm">← Back</a>
            <div>
              <h1 class="page-title">{{ student()!.firstName }} {{ student()!.lastName }}</h1>
              <p class="page-subtitle">Student ID: {{ student()!.studentId }}</p>
            </div>
          </div>
          <span class="badge" [ngClass]="student()!.isActive ? 'badge-success' : 'badge-danger'">
            {{ student()!.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Profile Card -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <div class="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {{ student()!.firstName.charAt(0) }}
            </div>
            <h2 class="text-xl font-bold text-white">{{ student()!.firstName }} {{ student()!.lastName }}</h2>
            <p class="text-gray-400 text-sm mt-1">{{ student()!.class?.name ?? 'No class assigned' }}</p>
            <p class="text-indigo-400 text-sm font-mono mt-2">{{ student()!.studentId }}</p>
            <div class="mt-4 space-y-2 text-left">
              <div class="flex justify-between text-sm"><span class="text-gray-500">Gender</span><span class="text-white capitalize">{{ student()!.gender }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">DOB</span><span class="text-white">{{ student()!.dateOfBirth | date:'mediumDate' }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Phone</span><span class="text-white">{{ student()!.phone ?? '—' }}</span></div>
              <div class="flex justify-between text-sm"><span class="text-gray-500">Email</span><span class="text-white">{{ student()!.email ?? '—' }}</span></div>
            </div>
          </div>

          <!-- Details -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Parent Info -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 class="font-semibold text-white mb-4">Parent / Guardian</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><p class="text-gray-500">Father</p><p class="text-white mt-1">{{ student()!.parentInfo?.fatherName ?? '—' }}</p></div>
                <div><p class="text-gray-500">Mother</p><p class="text-white mt-1">{{ student()!.parentInfo?.motherName ?? '—' }}</p></div>
                <div><p class="text-gray-500">Guardian Phone</p><p class="text-white mt-1">{{ student()!.parentInfo?.guardianPhone ?? '—' }}</p></div>
                <div><p class="text-gray-500">Guardian Email</p><p class="text-white mt-1">{{ student()!.parentInfo?.guardianEmail ?? '—' }}</p></div>
              </div>
            </div>

            <!-- Address -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 class="font-semibold text-white mb-4">Address</h3>
              <p class="text-gray-300 text-sm">
                {{ student()!.address?.street ?? '' }}
                {{ student()!.address?.city ? ', ' + student()!.address?.city : '' }}
                {{ student()!.address?.country ?? '' }}
              </p>
            </div>

            <!-- Quick Links -->
            <div class="grid grid-cols-3 gap-3">
              <a [routerLink]="['/attendance']" [queryParams]="{studentId: student()!._id}" class="btn btn-secondary justify-center">✅ Attendance</a>
              <a [routerLink]="['/results']" [queryParams]="{studentId: student()!._id}" class="btn btn-secondary justify-center">📈 Results</a>
              <a [routerLink]="['/fees']" [queryParams]="{studentId: student()!._id}" class="btn btn-secondary justify-center">💰 Fees</a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  student = signal<Student | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getStudent(id).subscribe({
      next: res => { this.student.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
