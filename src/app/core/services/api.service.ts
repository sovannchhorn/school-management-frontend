import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Student, Teacher, Class, Subject, Attendance, Exam, Result, Fee, Notification, User } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Generic helpers
  private get<T>(path: string, params?: any): Observable<T> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => v != null && (p = p.set(k, String(v))));
    return this.http.get<T>(`${this.base}${path}`, { params: p });
  }
  private post<T>(path: string, body: any): Observable<T> { return this.http.post<T>(`${this.base}${path}`, body); }
  private put<T>(path: string, body: any): Observable<T> { return this.http.put<T>(`${this.base}${path}`, body); }
  private patch<T>(path: string, body?: any): Observable<T> { return this.http.patch<T>(`${this.base}${path}`, body || {}); }
  private delete<T>(path: string): Observable<T> { return this.http.delete<T>(`${this.base}${path}`); }

  // Dashboard
  getDashboard(role: string) { return this.get<ApiResponse<any>>(`/dashboard/${role}`); }

  // Students
  getStudents(params?: any): Observable<ApiResponse<Student[]>> { return this.get('/students', params); }
  getStudent(id: string): Observable<ApiResponse<Student>> { return this.get(`/students/${id}`); }
  getStudentsByClass(classId: string): Observable<ApiResponse<Student[]>> { return this.get(`/students/class/${classId}`); }
  createStudent(data: FormData): Observable<ApiResponse<Student>> { return this.http.post<ApiResponse<Student>>(`${this.base}/students`, data); }
  updateStudent(id: string, data: FormData | any): Observable<ApiResponse<Student>> { return this.http.put<ApiResponse<Student>>(`${this.base}/students/${id}`, data); }
  deleteStudent(id: string): Observable<any> { return this.delete(`/students/${id}`); }

  // Teachers
  getTeachers(params?: any): Observable<ApiResponse<Teacher[]>> { return this.get('/teachers', params); }
  getTeacher(id: string): Observable<ApiResponse<Teacher>> { return this.get(`/teachers/${id}`); }
  createTeacher(data: any): Observable<ApiResponse<Teacher>> { return this.post('/teachers', data); }
  updateTeacher(id: string, data: any): Observable<ApiResponse<Teacher>> { return this.put(`/teachers/${id}`, data); }
  deleteTeacher(id: string): Observable<any> { return this.delete(`/teachers/${id}`); }

  // Classes
  getClasses(params?: any): Observable<ApiResponse<Class[]>> { return this.get('/classes', params); }
  getClass(id: string): Observable<ApiResponse<Class>> { return this.get(`/classes/${id}`); }
  createClass(data: any): Observable<ApiResponse<Class>> { return this.post('/classes', data); }
  updateClass(id: string, data: any): Observable<ApiResponse<Class>> { return this.put(`/classes/${id}`, data); }
  deleteClass(id: string): Observable<any> { return this.delete(`/classes/${id}`); }

  // Subjects
  getSubjects(): Observable<ApiResponse<Subject[]>> { return this.get('/subjects'); }
  createSubject(data: any): Observable<ApiResponse<Subject>> { return this.post('/subjects', data); }
  updateSubject(id: string, data: any): Observable<ApiResponse<Subject>> { return this.put(`/subjects/${id}`, data); }
  deleteSubject(id: string): Observable<any> { return this.delete(`/subjects/${id}`); }

  // Attendance
  markAttendance(data: any): Observable<ApiResponse<Attendance>> { return this.post('/attendance', data); }
  getAttendanceByClass(classId: string, params?: any): Observable<ApiResponse<Attendance[]>> { return this.get(`/attendance/class/${classId}`, params); }
  getStudentAttendance(studentId: string, params?: any): Observable<any> { return this.get(`/attendance/student/${studentId}`, params); }
  getAttendanceReport(params: any): Observable<any> { return this.get('/attendance/report', params); }

  // Exams
  getExams(params?: any): Observable<ApiResponse<Exam[]>> { return this.get('/exams', params); }
  getExam(id: string): Observable<ApiResponse<Exam>> { return this.get(`/exams/${id}`); }
  createExam(data: any): Observable<ApiResponse<Exam>> { return this.post('/exams', data); }
  updateExam(id: string, data: any): Observable<ApiResponse<Exam>> { return this.put(`/exams/${id}`, data); }
  deleteExam(id: string): Observable<any> { return this.delete(`/exams/${id}`); }

  // Results
  enterResults(data: any): Observable<any> { return this.post('/results/enter', data); }
  getStudentResults(studentId: string, params?: any): Observable<any> { return this.get(`/results/student/${studentId}`, params); }
  getClassResults(classId: string, examId: string): Observable<any> { return this.get(`/results/class/${classId}/exam/${examId}`); }
  getReportCard(studentId: string, academicYear: string, term: string): Observable<any> { return this.get(`/results/report-card/${studentId}/${academicYear}/${term}`); }

  // Fees
  getFees(params?: any): Observable<ApiResponse<Fee[]>> { return this.get('/fees', params); }
  getStudentFees(studentId: string): Observable<any> { return this.get(`/fees/student/${studentId}`); }
  getFeeStats(): Observable<any> { return this.get('/fees/stats'); }
  createFee(data: any): Observable<ApiResponse<Fee>> { return this.post('/fees', data); }
  recordPayment(feeId: string, data: any): Observable<any> { return this.post(`/fees/${feeId}/payment`, data); }
  deleteFee(id: string): Observable<any> { return this.delete(`/fees/${id}`); }

  // Timetable
  getTimetable(classId: string): Observable<any> { return this.get(`/timetables/class/${classId}`); }
  saveTimetable(data: any): Observable<any> { return this.post('/timetables', data); }

  // Notifications
  getNotifications(): Observable<any> { return this.get('/notifications'); }
  createNotification(data: any): Observable<any> { return this.post('/notifications', data); }
  markNotificationRead(id: string): Observable<any> { return this.patch(`/notifications/${id}/read`); }
  markAllRead(): Observable<any> { return this.patch('/notifications/read-all'); }

  // Users
  getUsers(params?: any): Observable<ApiResponse<User[]>> { return this.get('/users', params); }
  toggleUserStatus(id: string): Observable<any> { return this.patch(`/users/${id}/toggle-status`); }

  // Audit Logs
  getAuditLogs(params?: any): Observable<any> { return this.get('/audit', params); }
}
