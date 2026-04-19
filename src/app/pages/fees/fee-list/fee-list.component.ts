import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Fee } from '../../../core/models';

@Component({
  selector: 'app-fee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Fee Management</h1><p class="page-subtitle">{{ total() }} records</p></div>
        <button class="btn btn-primary" (click)="showForm.set(true)">➕ Add Fee</button>
      </div>

      <!-- Stats -->
      @if (stats()) {
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          @for (s of feeStats(); track s.label) {
            <div class="stat-card"><p class="text-2xl font-bold" [ngClass]="s.color">${{ s.amount | number:'1.0-0' }}</p><p class="text-sm text-gray-400">{{ s.label }}</p></div>
          }
        </div>
      }

      <!-- Filters -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <select class="form-input w-44" [(ngModel)]="filterStatus" (change)="load()">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
        <select class="form-input w-44" [(ngModel)]="filterType" (change)="load()">
          <option value="">All Types</option>
          <option value="tuition">Tuition</option>
          <option value="transport">Transport</option>
          <option value="exam">Exam</option>
          <option value="misc">Misc</option>
        </select>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else {
        <div class="table-wrap bg-gray-900">
          <table>
            <thead><tr><th>Student</th><th>Type</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Invoice</th><th>Actions</th></tr></thead>
            <tbody>
              @for (fee of fees(); track fee._id) {
                <tr>
                  <td>{{ fee.student?.firstName }} {{ fee.student?.lastName }}</td>
                  <td class="capitalize">{{ fee.feeType }}</td>
                  <td>
                    <div><p class="font-semibold text-white">\${{ fee.netAmount | number:'1.2-2' }}</p><p class="text-xs text-gray-500">Paid: \${{ fee.paidAmount | number:'1.2-2' }}</p></div>
                  </td>
                  <td>{{ fee.dueDate | date:'mediumDate' }}</td>
                  <td><span class="badge" [ngClass]="statusClass(fee.status)">{{ fee.status }}</span></td>
                  <td><span class="font-mono text-xs text-indigo-400">{{ fee.invoiceNumber }}</span></td>
                  <td>
                    <div class="flex gap-1">
                      @if (fee.status !== 'paid') {
                        <button class="btn btn-success btn-sm" (click)="selectedFee.set(fee); showPayment.set(true)">💳 Pay</button>
                      }
                      <button class="btn btn-danger btn-sm" (click)="delete(fee)">🗑</button>
                    </div>
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="7" class="text-center py-12 text-gray-500">No fee records</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Add Fee Modal -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Create Fee Record</h3>
            <form (ngSubmit)="createFee()">
              <div class="form-group"><label class="form-label">Student ID</label><input type="text" class="form-input" [(ngModel)]="newFee.student" name="student" placeholder="Paste student _id" required></div>
              <div class="form-group">
                <label class="form-label">Fee Type</label>
                <select class="form-input" [(ngModel)]="newFee.feeType" name="type" required>
                  <option value="tuition">Tuition</option><option value="transport">Transport</option><option value="library">Library</option><option value="sports">Sports</option><option value="exam">Exam</option><option value="misc">Misc</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group"><label class="form-label">Amount</label><input type="number" class="form-input" [(ngModel)]="newFee.amount" name="amount" required></div>
                <div class="form-group"><label class="form-label">Discount</label><input type="number" class="form-input" [(ngModel)]="newFee.discount" name="discount"></div>
                <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-input" [(ngModel)]="newFee.dueDate" name="due" required></div>
                <div class="form-group"><label class="form-label">Academic Year</label><input type="text" class="form-input" [(ngModel)]="newFee.academicYear" name="year" placeholder="2024-2025"></div>
              </div>
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Create</button>
                <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Record Payment Modal -->
      @if (showPayment() && selectedFee()) {
        <div class="modal-overlay" (click)="showPayment.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Record Payment</h3>
            <p class="text-gray-400 text-sm mb-4">Due: <span class="text-white font-semibold">\${{ selectedFee()!.dueAmount | number:'1.2-2' }}</span></p>
            <div class="form-group"><label class="form-label">Amount</label><input type="number" class="form-input" [(ngModel)]="payAmount" [max]="selectedFee()!.dueAmount"></div>
            <div class="form-group">
              <label class="form-label">Method</label>
              <select class="form-input" [(ngModel)]="payMethod">
                <option value="cash">Cash</option><option value="bank">Bank</option><option value="online">Online</option>
              </select>
            </div>
            <div class="flex gap-2 mt-4">
              <button class="btn btn-success" (click)="pay()">✅ Record Payment</button>
              <button class="btn btn-secondary" (click)="showPayment.set(false)">Cancel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FeeListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  fees = signal<Fee[]>([]);
  total = signal(0);
  loading = signal(true);
  showForm = signal(false);
  showPayment = signal(false);
  selectedFee = signal<Fee | null>(null);
  stats = signal<any>(null);
  filterStatus = '';
  filterType = '';
  payAmount = 0;
  payMethod = 'cash';
  newFee: any = { feeType: 'tuition', academicYear: '2024-2025' };

  feeStats() {
    const s = this.stats();
    if (!s?.length) return [];
    const map: any = {};
    s.forEach((x: any) => { map[x._id] = x; });
    return [
      { label: 'Total Expected', amount: s.reduce((a: number, x: any) => a + x.totalAmount, 0), color: 'text-indigo-400' },
      { label: 'Collected', amount: map['paid']?.paidAmount ?? 0, color: 'text-emerald-400' },
      { label: 'Pending', amount: (map['pending']?.totalAmount ?? 0) + (map['overdue']?.totalAmount ?? 0), color: 'text-amber-400' },
      { label: 'Overdue', amount: map['overdue']?.totalAmount ?? 0, color: 'text-red-400' }
    ];
  }

  ngOnInit() { this.load(); this.api.getFeeStats().subscribe(res => this.stats.set(res.data)); }

  load() {
    this.loading.set(true);
    this.api.getFees({ status: this.filterStatus, feeType: this.filterType }).subscribe({ next: res => { this.fees.set(res.data); this.total.set(res.total ?? 0); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  createFee() {
    this.api.createFee(this.newFee).subscribe({ next: () => { this.toast.success('Fee created'); this.showForm.set(false); this.load(); this.newFee = { feeType: 'tuition', academicYear: '2024-2025' }; }, error: err => this.toast.error(err.error?.message) });
  }

  pay() {
    const fee = this.selectedFee()!;
    this.api.recordPayment(fee._id, { amount: this.payAmount, paymentMethod: this.payMethod }).subscribe({ next: () => { this.toast.success('Payment recorded!'); this.showPayment.set(false); this.load(); }, error: err => this.toast.error(err.error?.message) });
  }

  delete(fee: Fee) {
    if (!confirm('Delete this fee record?')) return;
    this.api.deleteFee(fee._id).subscribe(() => { this.toast.success('Deleted'); this.load(); });
  }

  statusClass(s: string) { return { pending: 'badge-warning', paid: 'badge-success', overdue: 'badge-danger', partial: 'badge-info' }[s] || 'badge-info'; }
}
