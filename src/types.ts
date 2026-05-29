export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  tags: string[];
  deployedUrl: string;
  githubUrl: string;
  category: string;
  status?: 'Completed' | 'In-Progress' | 'Pending';
  order?: number;
  createdAt: string;
  metrics: {
    stars: number;
    downloads?: string;
    users?: string;
  };
}

export interface Feedback {
  id: string;
  projectId: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  companyName?: string;
  date: string;
  timeSlot: string;
  projectType: 'web' | 'mobile' | 'consulting' | 'other';
  description: string;
  createdAt: string;
  status: 'Pending' | 'Confirmed';
  budget?: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type UserRole = "admin" | "editor" | "viewer";

export interface SponsorshipRequest {
  id: string;
  sponsorName: string;
  sponsorEmail: string;
  companyName: string;
  fundingAmount: number;
  durationMonths: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Elite';
  message?: string;
  createdAt: string;
}

export interface Sponsorship {
  id: string;
  name: string;
  organization?: string;
  tier: string;
  amount: number;
  website?: string;
  createdAt: string;
}
