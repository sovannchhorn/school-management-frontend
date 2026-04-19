import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  user = this._user.asReadonly();
  token = this._token.asReadonly();
  isLoggedIn = computed(() => !!this._token());
  isAdmin = computed(() => this._user()?.role === 'admin');
  isTeacher = computed(() => this._user()?.role === 'teacher');
  isStudent = computed(() => this._user()?.role === 'student');
  isParent = computed(() => this._user()?.role === 'parent');

  constructor() {
    if (this._token()) this.loadProfile();
  }

  login(email: string, password: string) {
    return this.http.post<{ success: boolean; token: string; data: User }>(`${this.api}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this._token.set(res.token);
        this._user.set(res.data);
      })
    );
  }

  loadProfile() {
    this.http.get<{ success: boolean; data: User }>(`${this.api}/auth/me`).subscribe({
      next: res => this._user.set(res.data),
      error: () => this.logout()
    });
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth']);
  }

  updateProfile(data: Partial<User>) {
    return this.http.put<{ success: boolean; data: User }>(`${this.api}/auth/profile`, data).pipe(
      tap(res => this._user.set(res.data))
    );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(`${this.api}/auth/change-password`, { currentPassword, newPassword });
  }
}
