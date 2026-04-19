import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <header class="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
      <!-- Mobile menu button -->
      <button class="lg:hidden text-gray-400 hover:text-white" (click)="menuToggle.emit()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Page title area -->
      <div class="flex-1">
        <p class="text-sm text-gray-400">Welcome back, <span class="text-white font-semibold">{{ auth.user()?.name }}</span> 👋</p>
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-3">
        <!-- Theme toggle -->
        <button class="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-indigo-500 transition-all flex items-center justify-center" (click)="toggleTheme()">
          {{ dark() ? '☀️' : '🌙' }}
        </button>

        <!-- Notifications -->
        <a routerLink="/notifications" class="relative w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-indigo-500 transition-all flex items-center justify-center">
          🔔
        </a>

        <!-- Avatar -->
        <div class="relative" (click)="menuOpen.update(v=>!v)">
          <button class="flex items-center gap-2 cursor-pointer">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {{ auth.user()?.name?.charAt(0) }}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          @if (menuOpen()) {
            <div class="absolute right-0 top-12 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-in">
              <div class="px-4 py-3 border-b border-gray-700">
                <p class="font-semibold text-white text-sm">{{ auth.user()?.name }}</p>
                <p class="text-xs text-gray-400 capitalize">{{ auth.user()?.role }}</p>
              </div>
              <a routerLink="/profile" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" (click)="menuOpen.set(false)">👤 Profile</a>
              <button class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 transition-colors" (click)="logout()">🚪 Sign Out</button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  auth = inject(AuthService);
  menuOpen = signal(false);
  dark = signal(true);

  toggleTheme() {
    this.dark.update(v => !v);
    document.documentElement.classList.toggle('dark', this.dark());
  }

  logout() { this.auth.logout(); }
}
