import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'students', loadComponent: () => import('./pages/students/student-list/student-list.component').then(m => m.StudentListComponent), canActivate: [roleGuard], data: { roles: ['admin', 'teacher'] } },
      { path: 'students/new', loadComponent: () => import('./pages/students/student-form/student-form.component').then(m => m.StudentFormComponent), canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'students/:id', loadComponent: () => import('./pages/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent) },
      { path: 'teachers', loadComponent: () => import('./pages/teachers/teacher-list/teacher-list.component').then(m => m.TeacherListComponent), canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'classes', loadComponent: () => import('./pages/classes/class-list/class-list.component').then(m => m.ClassListComponent) },
      { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'exams', loadComponent: () => import('./pages/exams/exam-list/exam-list.component').then(m => m.ExamListComponent) },
      { path: 'results', loadComponent: () => import('./pages/results/result-list/result-list.component').then(m => m.ResultListComponent) },
      { path: 'fees', loadComponent: () => import('./pages/fees/fee-list/fee-list.component').then(m => m.FeeListComponent), canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'timetable', loadComponent: () => import('./pages/timetable/timetable.component').then(m => m.TimetableComponent) },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/user-list/user-list.component').then(m => m.UserListComponent), canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'audit', loadComponent: () => import('./pages/audit/audit.component').then(m => m.AuditComponent), canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
