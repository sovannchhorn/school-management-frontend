import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToastComponent } from '../../shared/toast/toast.component';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, NavbarComponent, ToastComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-950">
      <!-- Sidebar -->
      <app-sidebar [collapsed]="sidebarCollapsed()" [mobileOpen]="mobileOpen()" (toggle)="toggleSidebar()" (mobileClose)="mobileOpen.set(false)" />

      <!-- Mobile overlay -->
      @if (mobileOpen()) {
        <div class="fixed inset-0 bg-black/50 z-40 lg:hidden" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Main -->
      <div class="flex-1 flex flex-col overflow-hidden" [class.ml-0]="true">
        <app-navbar (menuToggle)="mobileOpen.update(v=>!v)" />
        <main class="flex-1 overflow-y-auto bg-gray-950 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast />
  `
})
export class ShellComponent implements OnInit, OnDestroy {
  private socket = inject(SocketService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  sidebarCollapsed = signal(false);
  mobileOpen = signal(false);

  ngOnInit() {
    this.socket.connect();
    this.socket.notification$.subscribe(n => {
      this.toast.info(n.title);
    });
    this.socket.payment$.subscribe(p => {
      this.toast.success(`Payment received: $${p.amount}`);
    });
  }

  ngOnDestroy() { this.socket.disconnect(); }
  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }
}
