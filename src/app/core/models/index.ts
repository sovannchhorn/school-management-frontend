export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Student {
  _id: string;
  user: User;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  class: Class;
  section?: string;
  rollNumber?: string;
  admissionDate: string;
  address: { street?: string; city?: string; state?: string; country?: string };
  phone?: string;
  email?: string;
  avatar?: string;
  parentInfo: { fatherName?: string; motherName?: string; guardianPhone?: string; guardianEmail?: string };
  isActive: boolean;
}

export interface Teacher {
  _id: string;
  user: User;
  teacherId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  subjects: Subject[];
  classes: Class[];
  qualification?: string;
  experience?: number;
  isActive: boolean;
}

export interface Class {
  _id: string;
  name: string;
  grade: number;
  section: string;
  classTeacher?: Teacher;
  subjects: Subject[];
  capacity: number;
  room?: string;
  academicYear: string;
  isActive: boolean;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  teacher?: Teacher;
  class?: Class;
  creditHours: number;
  type: string;
}

export interface Attendance {
  _id: string;
  class: Class;
  subject?: Subject;
  teacher: Teacher;
  date: string;
  records: { student: Student; status: 'present' | 'absent' | 'late' | 'excused'; remark?: string }[];
  academicYear: string;
}

export interface Exam {
  _id: string;
  name: string;
  type: string;
  class: Class;
  subject: Subject;
  teacher?: Teacher;
  date: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  academicYear: string;
  term: string;
  isPublished: boolean;
}

export interface Result {
  _id: string;
  student: Student;
  exam: Exam;
  class: Class;
  subject: Subject;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  academicYear: string;
  term?: string;
}

export interface Fee {
  _id: string;
  student: Student;
  feeType: string;
  amount: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  invoiceNumber: string;
  academicYear: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  sender: User;
  isGlobal: boolean;
  priority: string;
  readBy: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  pages?: number;
  page?: number;
}
