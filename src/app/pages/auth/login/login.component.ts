import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService as _skip } from '../../../core/services/toast.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <!-- Background orbs -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <span class="text-white font-bold text-2xl">E</span>
          </div>
          <h1 class="text-3xl font-bold text-white">EduManage</h1>
          <p class="text-gray-400 mt-1">School Management System</p>
        </div>

        <!-- Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 class="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form (ngSubmit)="login()" #f="ngForm">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" placeholder="admin@school.com" [(ngModel)]="email" name="email" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="relative">
                <input [type]="showPw() ? 'text' : 'password'" class="form-input pr-10" placeholder="••••••••" [(ngModel)]="password" name="password" required>
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" (click)="showPw.update(v=>!v)">
                  {{ showPw() ? '🙈' : '👁' }}
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm">
                ⚠️ {{ error() }}
              </div>
            }

            <button type="submit" class="btn btn-primary w-full py-3 text-base" [disabled]="loading()">
              @if (loading()) {
                <div class="spinner !w-5 !h-5"></div>
              } @else {
                Sign In
              }
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 p-4 bg-gray-800/60 rounded-xl border border-gray-700">
            <p class="text-xs text-gray-400 font-semibold uppercase mb-2">Demo Credentials</p>
            <div class="grid grid-cols-2 gap-2">
              @for (cred of demoCredentials; track cred.role) {
                <button type="button" class="text-left p-2 rounded-lg hover:bg-gray-700 transition-colors" (click)="fillDemo(cred)">
                  <p class="text-xs font-semibold text-indigo-400 capitalize">{{ cred.role }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ cred.email }}</p>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = 'admin@school.com';
  password = 'admin123';
  loading = signal(false);
  error = signal('');
  showPw = signal(false);

  demoCredentials = [
    { role: 'admin', email: 'admin@school.com', password: 'admin123' },
    { role: 'teacher', email: 'teacher@school.com', password: 'teacher123' },
    { role: 'student', email: 'student@school.com', password: 'student123' },
    { role: 'parent', email: 'parent@school.com', password: 'parent123' }
  ];

  fillDemo(cred: any) { this.email = cred.email; this.password = cred.password; }

  login() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.loading.set(false); this.toast.success('Welcome back! 👋'); this.router.navigate(['/dashboard']); },
      error: err => { this.loading.set(false); this.error.set(err.error?.message || 'Login failed'); }
    });
  }
}

// Suppress unused import warning
const CartService = _skip;
