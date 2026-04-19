import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up">
      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of your school management system</p>
        </div>
        <div class="flex gap-2">
          <span class="badge badge-success">Academic Year 2024-2025</span>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          @for (stat of stats(); track stat.label) {
            <div class="stat-card">
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" [style.background]="stat.bg">
                  {{ stat.icon }}
                </div>
                <span class="badge" [ngClass]="stat.trend >= 0 ? 'badge-success' : 'badge-danger'">
                  {{ stat.trend >= 0 ? '↑' : '↓' }} {{ stat.trend | number:'1.0-0' }}%
                </span>
              </div>
              <p class="text-3xl font-bold text-white mb-1">{{ stat.value }}</p>
              <p class="text-sm text-gray-400">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- Row 2: Quick Actions + Recent -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <!-- Quick Actions -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 class="font-semibold text-white mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-3">
              @for (action of quickActions(); track action.label) {
                <a [routerLink]="action.path" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500/50 transition-all group">
                  <span class="text-2xl">{{ action.icon }}</span>
                  <span class="text-xs text-gray-400 group-hover:text-white transition-colors text-center">{{ action.label }}</span>
                </a>
              }
            </div>
          </div>

          <!-- Fee Overview -->
          @if (auth.isAdmin()) {
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 xl:col-span-2">
              <h3 class="font-semibold text-white mb-4">Fee Collection Overview</h3>
              @if (dashData()?.stats?.fees) {
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-400">Collected</span>
                      <span class="text-emerald-400 font-semibold">\${{ dashData().stats.fees.totalCollected | number:'1.0-0' }}</span>
                    </div>
                    <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                        [style.width.%]="feePercent()"></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-4 pt-2">
                    <div class="text-center">
                      <p class="text-2xl font-bold text-white">\${{ dashData().stats.fees.totalCollected | number:'1.0-0' }}</p>
                      <p class="text-xs text-gray-500">Collected</p>
                    </div>
                    <div class="text-center">
                      <p class="text-2xl font-bold text-amber-400">\${{ dashData().stats.fees.totalPending | number:'1.0-0' }}</p>
                      <p class="text-xs text-gray-500">Pending</p>
                    </div>
                    <div class="text-center">
                      <p class="text-2xl font-bold text-indigo-400">\${{ dashData().stats.fees.totalExpected | number:'1.0-0' }}</p>
                      <p class="text-xs text-gray-500">Expected</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Notifications -->
        @if (dashData()?.recentNotifications?.length) {
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-white">Recent Announcements</h3>
              <a routerLink="/notifications" class="text-indigo-400 text-sm hover:text-indigo-300">View all →</a>
            </div>
            <div class="space-y-3">
              @for (n of dashData().recentNotifications; track n._id) {
                <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ n.sender?.name?.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ n.title }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ n.message | slice:0:80 }}...</p>
                    <p class="text-xs text-gray-600 mt-1">{{ n.createdAt | date:'mediumDate' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  loading = signal(true);
  dashData = signal<any>(null);
  stats = signal<any[]>([]);

  quickActions = signal<any[]>([]);

  ngOnInit() {
    const role = this.auth.user()?.role || 'student';
    this.api.getDashboard(role).subscribe({
      next: res => {
        this.dashData.set(res.data);
        this.buildStats(res.data);
        this.buildQuickActions(role);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  buildStats(data: any) {
    if (this.auth.isAdmin()) {
      this.stats.set([
        { icon: '🎓', label: 'Total Students', value: data.stats?.totalStudents ?? 0, trend: 12, bg: 'rgba(99,102,241,0.15)' },
        { icon: '👩‍🏫', label: 'Total Teachers', value: data.stats?.totalTeachers ?? 0, trend: 5, bg: 'rgba(16,185,129,0.15)' },
        { icon: '🏫', label: 'Total Classes', value: data.stats?.totalClasses ?? 0, trend: 0, bg: 'rgba(245,158,11,0.15)' },
        { icon: '💰', label: 'Fee Collected', value: `$${(data.stats?.fees?.totalCollected ?? 0).toLocaleString()}`, trend: 8, bg: 'rgba(236,72,153,0.15)' }
      ]);
    } else if (this.auth.isStudent()) {
      this.stats.set([
        { icon: '📚', label: 'My Class', value: data.student?.class?.name ?? 'N/A', trend: 0, bg: 'rgba(99,102,241,0.15)' },
        { icon: '💰', label: 'Pending Fees', value: data.fees?.filter((f:any) => f.status === 'pending').length ?? 0, trend: 0, bg: 'rgba(245,158,11,0.15)' }
      ]);
    }
  }

  buildQuickActions(role: string) {
    const actions: Record<string, any[]> = {
      admin: [
        { icon: '➕', label: 'Add Student', path: '/students/new' },
        { icon: '👩‍🏫', label: 'Add Teacher', path: '/teachers' },
        { icon: '✅', label: 'Attendance', path: '/attendance' },
        { icon: '💰', label: 'Fee Management', path: '/fees' },
        { icon: '📝', label: 'Exams', path: '/exams' },
        { icon: '🔔', label: 'Notify', path: '/notifications' }
      ],
      teacher: [
        { icon: '✅', label: 'Mark Attendance', path: '/attendance' },
        { icon: '📝', label: 'Exams', path: '/exams' },
        { icon: '📈', label: 'Results', path: '/results' },
        { icon: '📅', label: 'Timetable', path: '/timetable' }
      ],
      student: [
        { icon: '✅', label: 'My Attendance', path: '/attendance' },
        { icon: '📈', label: 'My Results', path: '/results' },
        { icon: '📅', label: 'Timetable', path: '/timetable' },
        { icon: '💰', label: 'My Fees', path: '/fees' }
      ],
      parent: [
        { icon: '🎓', label: 'My Children', path: '/students' },
        { icon: '✅', label: 'Attendance', path: '/attendance' },
        { icon: '💰', label: 'Fees', path: '/fees' },
        { icon: '📈', label: 'Results', path: '/results' }
      ]
    };
    this.quickActions.set(actions[role] || []);
  }

  feePercent() {
    const fees = this.dashData()?.stats?.fees;
    if (!fees?.totalExpected) return 0;
    return Math.min(100, (fees.totalCollected / fees.totalExpected) * 100);
  }
}
