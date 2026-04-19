import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up max-w-3xl mx-auto">
      <div class="page-header">
        <div>
          <h1 class="page-title">Add New Student</h1>
          <p class="page-subtitle">Fill in the student details below</p>
        </div>
        <a routerLink="/students" class="btn btn-secondary">← Back</a>
      </div>

      <form (ngSubmit)="submit()" class="space-y-6">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 class="font-semibold text-white mb-4">Personal Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">First Name *</label><input type="text" class="form-input" [(ngModel)]="form.firstName" name="firstName" required></div>
            <div class="form-group"><label class="form-label">Last Name *</label><input type="text" class="form-input" [(ngModel)]="form.lastName" name="lastName" required></div>
            <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input" [(ngModel)]="form.email" name="email" required></div>
            <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-input" [(ngModel)]="form.password" name="password" placeholder="Default: student123"></div>
            <div class="form-group"><label class="form-label">Date of Birth *</label><input type="date" class="form-input" [(ngModel)]="form.dateOfBirth" name="dob" required></div>
            <div class="form-group">
              <label class="form-label">Gender *</label>
              <select class="form-input" [(ngModel)]="form.gender" name="gender" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" [(ngModel)]="form.phone" name="phone"></div>
            <div class="form-group">
              <label class="form-label">Class</label>
              <select class="form-input" [(ngModel)]="form.class" name="class">
                <option value="">Select Class</option>
                @for (cls of classes(); track cls._id) {
                  <option [value]="cls._id">{{ cls.name }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 class="font-semibold text-white mb-4">Parent / Guardian Info</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Father Name</label><input type="text" class="form-input" [(ngModel)]="form['parentInfo.fatherName']" name="fatherName"></div>
            <div class="form-group"><label class="form-label">Mother Name</label><input type="text" class="form-input" [(ngModel)]="form['parentInfo.motherName']" name="motherName"></div>
            <div class="form-group"><label class="form-label">Guardian Phone</label><input type="text" class="form-input" [(ngModel)]="form['parentInfo.guardianPhone']" name="guardianPhone"></div>
            <div class="form-group"><label class="form-label">Guardian Email</label><input type="email" class="form-input" [(ngModel)]="form['parentInfo.guardianEmail']" name="guardianEmail"></div>
          </div>
        </div>

        @if (error()) {
          <div class="p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm">⚠️ {{ error() }}</div>
        }

        <div class="flex gap-3">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
            {{ loading() ? 'Saving...' : 'Create Student' }}
          </button>
          <a routerLink="/students" class="btn btn-secondary btn-lg">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class StudentFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  classes = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  form: any = { firstName:'', lastName:'', email:'', password:'', dateOfBirth:'', gender:'', phone:'', class:'' };

  ngOnInit() { this.api.getClasses().subscribe(res => this.classes.set(res.data)); }

  submit() {
    this.loading.set(true);
    this.api.createStudent(this.form).subscribe({
      next: () => { this.toast.success('Student created!'); this.router.navigate(['/students']); },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Failed to create'); }
    });
  }
}
