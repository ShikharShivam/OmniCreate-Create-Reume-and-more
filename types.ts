export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    period: string;
    details: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  skills: string[];
}

export enum AppMode {
  HOME = 'HOME',
  RESUME = 'RESUME',
  POSTER = 'POSTER',
  FORM = 'FORM',
  HISTORY = 'HISTORY',
}

export interface HistoryItem {
  id: string;
  type: 'RESUME' | 'POSTER' | 'FORM';
  timestamp: number;
  data: any;
  preview?: string; // For images
  summary?: string; // For text
}

export interface FormFillResult {
  filledText: string;
  fields: Record<string, string>;
}