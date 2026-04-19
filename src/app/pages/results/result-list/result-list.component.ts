import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Results</h1><p class="page-subtitle">Exam results & report cards</p></div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <select class="form-input w-48" [(ngModel)]="selectedClass" (change)="loadExams()">
          <option value="">Select Class</option>
          @for (c of classes(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
        </select>
        <select class="form-input w-48" [(ngModel)]="selectedExam" (change)="loadResults()">
          <option value="">Select Exam</option>
          @for (e of exams(); track e._id) { <option [value]="e._id">{{ e.name }}</option> }
        </select>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else if (results().length) {
        <!-- Summary Stats -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="stat-card"><p class="text-2xl font-bold text-white">{{ results().length }}</p><p class="text-sm text-gray-400">Students</p></div>
          <div class="stat-card"><p class="text-2xl font-bold text-emerald-400">{{ passCount() }}</p><p class="text-sm text-gray-400">Passed</p></div>
          <div class="stat-card"><p class="text-2xl font-bold text-red-400">{{ results().length - passCount() }}</p><p class="text-sm text-gray-400">Failed</p></div>
          <div class="stat-card"><p class="text-2xl font-bold text-indigo-400">{{ avgPercent() }}%</p><p class="text-sm text-gray-400">Class Average</p></div>
        </div>

        <div class="table-wrap bg-gray-900">
          <table>
            <thead><tr><th>#</th><th>Student</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>GPA</th><th>Status</th></tr></thead>
            <tbody>
              @for (r of results(); track r._id; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <div>
                      <p class="font-medium text-white">{{ r.student?.firstName }} {{ r.student?.lastName }}</p>
                      <p class="text-xs text-gray-500">{{ r.student?.studentId }}</p>
                    </div>
                  </td>
                  <td><span class="font-semibold text-white">{{ r.marksObtained }}/{{ r.totalMarks }}</span></td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-20 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" [style.width.%]="r.percentage" [ngClass]="r.percentage >= 50 ? 'bg-emerald-500' : 'bg-red-500'"></div>
                      </div>
                      <span>{{ r.percentage }}%</span>
                    </div>
                  </td>
                  <td><span class="badge" [ngClass]="gradeClass(r.grade)">{{ r.grade }}</span></td>
                  <td>{{ r.gpa }}</td>
                  <td><span class="badge" [ngClass]="r.marksObtained >= (selectedExamData()?.passingMarks ?? 0) ? 'badge-success' : 'badge-danger'">{{ r.marksObtained >= (selectedExamData()?.passingMarks ?? 0) ? 'Pass' : 'Fail' }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (selectedExam()) {
        <div class="text-center py-16 text-gray-500">No results yet for this exam</div>
      } @else {
        <div class="text-center py-16 text-gray-500">Select a class and exam to view results</div>
      }
    </div>
  `
})
export class ResultListComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  classes = signal<any[]>([]);
  exams = signal<any[]>([]);
  results = signal<any[]>([]);
  loading = signal(false);
  selectedClass = '';
  selectedExam = '';

  ngOnInit() { this.api.getClasses().subscribe(r => this.classes.set(r.data)); }

  loadExams() {
    if (!this.selectedClass) return;
    this.api.getExams({ classId: this.selectedClass }).subscribe(r => this.exams.set(r.data));
    this.results.set([]);
  }

  loadResults() {
    if (!this.selectedClass || !this.selectedExam) return;
    this.loading.set(true);
    this.api.getClassResults(this.selectedClass, this.selectedExam).subscribe({ next: r => { this.results.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  selectedExamData() { return this.exams().find(e => e._id === this.selectedExam); }
  passCount() { const p = this.selectedExamData()?.passingMarks ?? 0; return this.results().filter(r => r.marksObtained >= p).length; }
  avgPercent() { const r = this.results(); return r.length ? (r.reduce((s, x) => s + x.percentage, 0) / r.length).toFixed(1) : 0; }
  gradeClass(g: string) { return ['A+','A'].includes(g) ? 'badge-success' : ['B+','B'].includes(g) ? 'badge-info' : ['C+','C'].includes(g) ? 'badge-warning' : 'badge-danger'; }
}
