export interface PersonalInfo {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface ProfessionalSummary {
  content: string;
  type: string; // 'technical-lead', 'full-stack', 'fresh-graduate', etc.
  isCustom: boolean;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  relevant_coursework: string[];
}

export interface Skills {
  technical: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  soft_skills: string[];
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  highlights: string[];
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: Date;
  credential_id?: string;
  url?: string;
}

export interface Resume {
  id?: string;
  userId?: string;
  templateId?: string;
  title?: string;
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
  template?: ResumeTemplate;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: string; // 'technical', 'creative', 'minimal', 'modern'
  description: string;
  preview_image: string;
  target_audience: string[]; // 'developers', 'freshers', 'senior', etc.
  sections: TemplateSection[];
  styling: TemplateStyle;
  isActive: boolean;
  createdAt: Date;
}

export interface TemplateSection {
  name: string;
  required: boolean;
  order: number;
  customizable: boolean;
}

export interface TemplateStyle {
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: string; // 'single-column', 'two-column', 'sidebar'
}

export interface SummaryGenerationRequest {
  careerFocus: string;
  experienceLevel: string;
  skills: string[];
  industry: string;
  achievements?: string[];
}

export interface GeneratedSummary {
  type: string;
  content: string;
  focus: string;
}