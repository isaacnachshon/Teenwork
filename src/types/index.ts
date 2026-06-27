export interface Location {
  lat: number;
  lng: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  coordinates?: Location;
  salary: number;
  type: 'קייטרינג' | 'ניקיון' | 'בייביסיטר' | 'שיעורים' | 'מלצרות' | 'סבלות';
  description: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  skills?: string[];
  experience?: string;
  applicantsCount?: number;
  distance?: number;
}

export interface Applicant {
  id: string;
  name: string;
  age: number;
  jobTitle: string;
  profileImageUrl: string;
  status: 'new' | 'viewed' | 'contacted';
  coordinates?: Location;
}

export interface UserProfile {
  name: string;
  age: number;
  birthDate?: string;
  idNumber?: string;
  phone?: string;
  location: string;
  address?: string;
  city?: string;
  school?: string;
  studyStatus?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelation?: string;
  parentAddress?: string;
  coordinates?: Location;
  profileImageUrl: string;
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
  bio: string;
  skills: string[];
  preferredJobTypes?: Job['type'][];
  workHistory: {
    id: string;
    title: string;
    company: string;
    duration: string;
  }[];
  reviews: {
    id: string;
    reviewer: string;
    rating: number;
    comment: string;
  }[];
}