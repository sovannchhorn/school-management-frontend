import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Exam } from '../../../core/models';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Exams</h1><p class="page-subtitle">{{ exams().length }} exams scheduled</p></div>
        @if (auth.isAdmin() || auth.isTeacher()) {
          <button class="btn btn-primary" (click)="showForm.set(true)">➕ Create Exam</button>
        }
      </div>

      <!-- Filters -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <select class="form-input w-48" [(ngModel)]="filterClass" (change)="load()">
          <option value="">All Classes</option>
          @for (c of classes(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
        </select>
        <select class="form-input w-36" [(ngModel)]="filterTerm" (change)="load()">
          <option value="">All Terms</option>
          <option value="term1">Term 1</option><option value="term2">Term 2</option><option value="term3">Term 3</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @for (exam of exams(); track exam._id) {
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all">
            <div class="flex justify-between items-start mb-3">
              <span class="badge badge-primary capitalize">{{ exam.type }}</span>
              <span class="badge badge-info capitalize">{{ exam.term }}</span>
            </div>
            <h3 class="font-semibold text-white mb-1">{{ exam.name }}</h3>
            <p class="text-sm text-indigo-400 mb-3">{{ exam.subject?.name }} · {{ exam.class?.name }}</p>
            <div class="space-y-1.5 text-sm mb-4">
              <div class="flex justify-between"><span class="text-gray-500">Date</span><span class="text-white">{{ exam.date | date:'mediumDate' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Duration</span><span class="text-white">{{ exam.duration }} min</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Total Marks</span><span class="text-white">{{ exam.totalMarks }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Pass Marks</span><span class="text-emerald-400">{{ exam.passingMarks }}</span></div>
            </div>
            <div class="flex gap-2">
              @if (auth.isAdmin() || auth.isTeacher()) {
                <button class="btn btn-danger btn-sm flex-1" (click)="delete(exam)">🗑 Delete</button>
              }
            </div>
          </div>
        }
        @empty {
          <div class="col-span-3 text-center py-20 text-gray-500">No exams found</div>
        }
      </div>

      <!-- Modal -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-box p-6" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-white text-lg mb-4">Create Exam</h3>
            <form (ngSubmit)="create()">
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group col-span-2"><label class="form-label">Exam Name *</label><input type="text" class="form-input" [(ngModel)]="newExam.name" name="name" required></div>
                <div class="form-group">
                  <label class="form-label">Type</label>
                  <select class="form-input" [(ngModel)]="newExam.type" name="type">
                    <option value="midterm">Midterm</option><option value="final">Final</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Term</label>
                  <select class="form-input" [(ngModel)]="newExam.term" name="term">
                    <option value="term1">Term 1</option><option value="term2">Term 2</option><option value="term3">Term 3</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Class</label>
                  <select class="form-input" [(ngModel)]="newExam.class" name="class">
                    @for (c of classes(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Subject</label>
                  <select class="form-input" [(ngModel)]="newExam.subject" name="subject">
                    @for (s of subjects(); track s._id) { <option [value]="s._id">{{ s.name }}</option> }
                  </select>
                </div>
                <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" [(ngModel)]="newExam.date" name="date" required></div>
                <div class="form-group"><label class="form-label">Duration (min)</label><input type="number" class="form-input" [(ngModel)]="newExam.duration" name="dur"></div>
                <div class="form-group"><label class="form-label">Total Marks</label><input type="number" class="form-input" [(ngModel)]="newExam.totalMarks" name="total" required></div>
                <div class="form-group"><label class="form-label">Passing Marks</label><input type="number" class="form-input" [(ngModel)]="newExam.passingMarks" name="pass" required></div>
                <div class="form-group col-span-2"><label class="form-label">Academic Year</label><input type="text" class="form-input" [(ngModel)]="newExam.academicYear" name="year" placeholder="2024-2025"></div>
              </div>
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Create</button>
                <button type="button" class="btn btn-secondary" (click)="showForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ExamListComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  exams = signal<Exam[]>([]);
  classes = signal<any[]>([]);
  subjects = signal<any[]>([]);
  showForm = signal(false);
  filterClass = ''; filterTerm = '';
  newExam: any = { type: 'midterm', term: 'term1', duration: 60, academicYear: '2024-2025' };

  ngOnInit() {
    this.api.getClasses().subscribe(r => this.classes.set(r.data));
    this.api.getSubjects().subscribe(r => this.subjects.set(r.data));
    this.load();
  }
  load() { this.api.getExams({ classId: this.filterClass, term: this.filterTerm }).subscribe(r => this.exams.set(r.data)); }
  create() { this.api.createExam(this.newExam).subscribe({ next: () => { this.toast.success('Exam created'); this.showForm.set(false); this.load(); }, error: e => this.toast.error(e.error?.message) }); }
  delete(e: Exam) { if (!confirm('Delete exam?')) return; this.api.deleteExam(e._id).subscribe(() => { this.toast.success('Deleted'); this.load(); }); }
}
