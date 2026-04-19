import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: string; path: string; roles: string[]; badge?: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col z-50 transition-all duration-300"
      [class.w-64]="!collapsed" [class.w-16]="collapsed"
      [class.sidebar]="true"
      [class.mobile-open]="mobileOpen">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-800 h-16">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-lg">E</span>
        </div>
        @if (!collapsed) {
          <div class="overflow-hidden">
            <p class="font-bold text-white text-sm leading-tight">EduManage</p>
            <p class="text-xs text-gray-500">School System</p>
          </div>
        }
        <button class="ml-auto text-gray-500 hover:text-white transition-colors" (click)="toggle.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        @for (item of visibleItems(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-indigo-600 text-white"
            [routerLinkActiveOptions]="{exact: item.path === '/dashboard'}"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all group"
            [title]="collapsed ? item.label : ''"
            (click)="mobileClose.emit()">
            <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
            @if (!collapsed) {
              <span class="text-sm font-medium">{{ item.label }}</span>
              @if (item.badge) {
                <span class="ml-auto badge badge-danger text-xs">{{ item.badge }}</span>
              }
            }
          </a>
        }
      </nav>

      <!-- User info -->
      @if (!collapsed) {
        <div class="border-t border-gray-800 p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {{ auth.user()?.name?.charAt(0) }}
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-white truncate">{{ auth.user()?.name }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ auth.user()?.role }}</p>
            </div>
          </div>
        </div>
      }
    </aside>
  `
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() mobileClose = new EventEmitter<void>();

  auth = inject(AuthService);

  private navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['admin','teacher','student','parent'] },
    { label: 'Students', icon: '🎓', path: '/students', roles: ['admin','teacher'] },
    { label: 'Teachers', icon: '👩‍🏫', path: '/teachers', roles: ['admin'] },
    { label: 'Classes', icon: '🏫', path: '/classes', roles: ['admin','teacher','student'] },
    { label: 'Attendance', icon: '✅', path: '/attendance', roles: ['admin','teacher','student','parent'] },
    { label: 'Exams', icon: '📝', path: '/exams', roles: ['admin','teacher','student'] },
    { label: 'Results', icon: '📈', path: '/results', roles: ['admin','teacher','student','parent'] },
    { label: 'Fees', icon: '💰', path: '/fees', roles: ['admin'] },
    { label: 'Timetable', icon: '📅', path: '/timetable', roles: ['admin','teacher','student'] },
    { label: 'Notifications', icon: '🔔', path: '/notifications', roles: ['admin','teacher','student','parent'] },
    { label: 'Users', icon: '👥', path: '/users', roles: ['admin'] },
    { label: 'Audit Logs', icon: '🔍', path: '/audit', roles: ['admin'] },
    { label: 'Profile', icon: '👤', path: '/profile', roles: ['admin','teacher','student','parent'] },
  ];

  visibleItems() {
    const role = this.auth.user()?.role;
    return this.navItems.filter(i => !role || i.roles.includes(role));
  }
}
