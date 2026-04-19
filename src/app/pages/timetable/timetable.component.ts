import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="page-header">
        <div><h1 class="page-title">Timetable</h1><p class="page-subtitle">Weekly schedule</p></div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <select class="form-input w-48" [(ngModel)]="selectedClass" (change)="load()">
          <option value="">Select Class</option>
          @for (c of classes(); track c._id) { <option [value]="c._id">{{ c.name }}</option> }
        </select>
      </div>

      @if (!selectedClass) {
        <div class="text-center py-20 text-gray-500">Select a class to view timetable</div>
      } @else if (loading()) {
        <div class="flex justify-center py-20"><div class="spinner"></div></div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (day of days; track day) {
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 class="font-semibold text-white mb-3 capitalize flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{{ day.slice(0,3).toUpperCase() }}</span>
                {{ day }}
              </h3>
              @if (timetableByDay()[day]?.periods?.length) {
                <div class="flex flex-wrap gap-3">
                  @for (p of timetableByDay()[day].periods; track p.period) {
                    <div class="bg-gray-800 border border-gray-700 rounded-xl p-3 min-w-36">
                      <p class="text-xs text-indigo-400 font-semibold mb-1">Period {{ p.period }}</p>
                      <p class="font-medium text-white text-sm">{{ p.subject?.name ?? '—' }}</p>
                      <p class="text-xs text-gray-500">{{ p.teacher?.firstName }} {{ p.teacher?.lastName }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ p.startTime }} – {{ p.endTime }}</p>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-gray-600 italic">No periods scheduled</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TimetableComponent implements OnInit {
  private api = inject(ApiService);
  classes = signal<any[]>([]);
  timetable = signal<any[]>([]);
  loading = signal(false);
  selectedClass = '';
  days = ['monday','tuesday','wednesday','thursday','friday'];

  ngOnInit() { this.api.getClasses().subscribe(r => this.classes.set(r.data)); }

  load() {
    if (!this.selectedClass) return;
    this.loading.set(true);
    this.api.getTimetable(this.selectedClass).subscribe({ next: r => { this.timetable.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  timetableByDay() {
    const map: any = {};
    this.timetable().forEach(t => { map[t.day] = t; });
    return map;
  }
}
