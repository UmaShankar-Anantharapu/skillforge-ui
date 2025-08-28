import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resume, ResumeTemplate, SummaryGenerationRequest, GeneratedSummary } from '../models/resume.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private apiUrl = `${environment.apiUrl}/resume`;

  constructor(private http: HttpClient) {}

  // Resume CRUD operations
  createResume(resume: Resume): Observable<Resume> {
    return this.http.post<Resume>(`${this.apiUrl}/create`, resume);
  }

  getResumeList(): Observable<{ resumes: Resume[] }> {
    return this.http.get<{ resumes: Resume[] }>(`${this.apiUrl}`);
  }

  getResume(id: string): Observable<Resume> {
    return this.http.get<Resume>(`${this.apiUrl}/${id}`);
  }

  updateResume(id: string, resume: Resume): Observable<Resume> {
    return this.http.put<Resume>(`${this.apiUrl}/${id}`, resume);
  }

  deleteResume(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  duplicateResume(id: string): Observable<Resume> {
    return this.http.post<Resume>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  // Template operations
  getTemplates(): Observable<{ templates: ResumeTemplate[] }> {
    return this.http.get<{ templates: ResumeTemplate[] }>(`${this.apiUrl}/templates/list`);
  }

  getTemplatesByCategory(category: string): Observable<{ templates: ResumeTemplate[] }> {
    return this.http.get<{ templates: ResumeTemplate[] }>(`${this.apiUrl}/templates?category=${category}`);
  }

  // Professional summary generation
  generateSummaries(request: SummaryGenerationRequest): Observable<{ summaries: GeneratedSummary[] }> {
    return this.http.post<{ summaries: GeneratedSummary[] }>(`${this.apiUrl}/generate-summary`, request);
  }

  // Export operations
  exportToPdf(id: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${id}/export/pdf`, {}, {
      responseType: 'blob'
    });
  }

  exportToWord(id: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${id}/export/word`, {}, {
      responseType: 'blob'
    });
  }

  // Utility methods
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Auto-save functionality
  autoSaveResume(resume: Resume): Observable<Resume> {
    if (resume.id) {
      return this.updateResume(resume.id, resume);
    } else {
      return this.createResume(resume);
    }
  }

  // Validation helpers
  validateResumeSection(section: string, data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;

    switch (section) {
      case 'personalInfo':
        if (!data.fullName?.trim()) {
          errors.push('Full name is required');
          isValid = false;
        }
        if (!data.email?.trim()) {
          errors.push('Email is required');
          isValid = false;
        }
        if (data.email && !this.isValidEmail(data.email)) {
          errors.push('Please enter a valid email address');
          isValid = false;
        }
        break;
      
      case 'professionalSummary':
        if (!data.content?.trim()) {
          errors.push('Professional summary is required');
          isValid = false;
        }
        if (data.content && data.content.length < 50) {
          errors.push('Professional summary should be at least 50 characters');
          isValid = false;
        }
        break;
      
      case 'experience':
        if (!Array.isArray(data) || data.length === 0) {
          errors.push('At least one work experience is required');
          isValid = false;
        } else {
          data.forEach((exp, index) => {
            if (!exp.company?.trim()) {
              errors.push(`Company name is required for experience ${index + 1}`);
              isValid = false;
            }
            if (!exp.position?.trim()) {
              errors.push(`Position is required for experience ${index + 1}`);
              isValid = false;
            }
          });
        }
        break;
      
      case 'education':
        if (!Array.isArray(data) || data.length === 0) {
          errors.push('At least one education entry is required');
          isValid = false;
        }
        break;
      
      case 'skills':
        if (!data.technical || data.technical.length === 0) {
          errors.push('At least one technical skill is required');
          isValid = false;
        }
        break;
    }

    return { isValid, errors };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get resume completion percentage
  getResumeCompletionPercentage(resume: Resume): number {
    let completedSections = 0;
    const totalSections = 7; // personalInfo, summary, experience, education, skills, projects, template

    // Check personal info
    if (resume.personalInfo.fullName && resume.personalInfo.email) {
      completedSections++;
    }

    // Check professional summary
    if (resume.professionalSummary.content) {
      completedSections++;
    }

    // Check experience
    if (resume.experience.length > 0) {
      completedSections++;
    }

    // Check education
    if (resume.education.length > 0) {
      completedSections++;
    }

    // Check skills
    if (resume.skills.technical.length > 0) {
      completedSections++;
    }

    // Check projects (optional but adds to completion)
    if (resume.projects.length > 0) {
      completedSections++;
    }

    // Check template selection
    if (resume.templateId) {
      completedSections++;
    }

    return Math.round((completedSections / totalSections) * 100);
  }
}