import { Timestamp } from 'firebase/firestore';

// ── Core User Model ──

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'teen' | 'employer' | 'admin';
  phone: string;
  city: string;
  birthDate: string;
  profileCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  status: 'active' | 'disabled';
}

export interface TeenProfile extends UserProfile {
  role: 'teen';
  name: string;
  age?: number;
  idNumber?: string;
  location?: string;
  address?: string;
  school?: string;
  studyStatus?: string;
  bio?: string;
  skills: string[];
  availability?: string[];
  profileImageUrl: string;
  cvUrl?: string;
  cvFileName?: string;
  preferredJobTypes?: JobType[];
  coordinates?: Location;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelation?: string;
  parentAddress?: string;
  parentalConsentUrl?: string;
  parentalConsentStatus?: 'pending' | 'approved' | 'rejected';
  parentalConsentUploadedAt?: string;
  parentalConsentReviewedAt?: string;
  parentalConsentReviewer?: string;
  paymentInfo?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  bankId?: string;
  workHistory?: WorkHistoryItem[];
  reviews?: ReviewItem[];
}

export interface EmployerProfile extends UserProfile {
  role: 'employer';
  companyName: string;
  companyLogoUrl?: string;
  companyDescription?: string;
}

export interface AdminProfile extends UserProfile {
  role: 'admin';
}

// ── Supporting Types ──

export interface Location {
  lat: number;
  lng: number;
}

export type JobType = 'קייטרינג' | 'ניקיון' | 'בייביסיטר' | 'שיעורים' | 'מלצרות' | 'סבלות';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  coordinates?: Location;
  salary: number;
  type: JobType;
  description: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  skills?: string[];
  experience?: string;
  applicantsCount?: number;
  distance?: number;
  employerId?: string;
}

export interface Applicant {
  id: string;
  name: string;
  age: number;
  jobTitle: string;
  profileImageUrl: string;
  status: 'new' | 'viewed' | 'contacted' | 'interview' | 'accepted' | 'rejected';
  coordinates?: Location;
}

export interface WorkHistoryItem {
  id: string;
  title: string;
  company: string;
  duration: string;
}

export interface ReviewItem {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
}
