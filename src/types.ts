export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: any;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  patientLimitPerDay: number;
  workingHours: string;
}

export type AppointmentStatus = 'scheduled' | 'checked-in' | 'completed' | 'cancelled';
export type SymptomCategory = 'Emergency' | 'Urgent' | 'Non-urgent';

export interface Appointment {
  id: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  symptomCategory: SymptomCategory;
  symptoms: Record<string, any>;
  createdAt: any;
}

export type QueueStatus = 'waiting' | 'calling' | 'serving' | 'completed';

export interface QueueEntry {
  id: string;
  hospitalId: string;
  patientId: string;
  patientName: string;
  queueNumber: number;
  status: QueueStatus;
  checkInTime: any;
}
