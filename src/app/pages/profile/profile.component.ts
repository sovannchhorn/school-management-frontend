import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up max-w-2xl mx-auto">
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div class="flex items-center gap-5 mb-6">
          <div class="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
            {{ auth.user()?.name?.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">{{ auth.user()?.name }}</h2>
            <p class="text-gray-400 text-sm">{{ auth.user()?.email }}</p>
            <span class="badge badge-primary capitalize mt-1">{{ auth.user()?.role }}</span>
          </div>
        </div>

        <h3 class="font-semibold text-white mb-4">Update Profile</h3>
        <form (ngSubmit)="updateProfile()">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group col-span-2"><label class="form-label">Full Name</label><input type="text" class="form-input" [(ngModel)]="profileForm.name" name="name"></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" [(ngModel)]="profileForm.phone" name="phone"></div>
            <div class="form-group"><label class="form-label">Address</label><input type="text" class="form-input" [(ngModel)]="profileForm.address" name="address"></div>
          </div>
          <button type="submit" class="btn btn-primary mt-4" [disabled]="saving()">{{ saving() ? 'Saving...' : '💾 Update Profile' }}</button>
        </form>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 class="font-semibold text-white mb-4">Change Password</h3>
        <form (ngSubmit)="changePassword()">
          <div class="form-group"><label class="form-label">Current Password</label><input type="password" class="form-input" [(ngModel)]="pwForm.current" name="current"></div>
          <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-input" [(ngModel)]="pwForm.new" name="new"></div>
          <div class="form-group"><label class="form-label">Confirm Password</label><input type="password" class="form-input" [(ngModel)]="pwForm.confirm" name="confirm"></div>
          @if (pwError()) { <p class="text-red-400 text-sm mb-3">⚠️ {{ pwError() }}</p> }
          <button type="submit" class="btn btn-primary" [disabled]="changingPw()">{{ changingPw() ? 'Changing...' : '🔑 Change Password' }}</button>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);

  saving = signal(false);
  changingPw = signal(false);
  pwError = signal('');

  profileForm = { name: this.auth.user()?.name || '', phone: '', address: '' };
  pwForm = { current: '', new: '', confirm: '' };

  updateProfile() {
    this.saving.set(true);
    this.auth.updateProfile(this.profileForm).subscribe({ next: () => { this.toast.success('Profile updated!'); this.saving.set(false); }, error: () => { this.toast.error('Update failed'); this.saving.set(false); } });
  }

  changePassword() {
    this.pwError.set('');
    if (this.pwForm.new !== this.pwForm.confirm) { this.pwError.set('Passwords do not match'); return; }
    this.changingPw.set(true);
    this.auth.changePassword(this.pwForm.current, this.pwForm.new).subscribe({ next: () => { this.toast.success('Password changed!'); this.changingPw.set(false); this.pwForm = { current:'', new:'', confirm:'' }; }, error: err => { this.toast.error(err.error?.message); this.changingPw.set(false); } });
  }
}
