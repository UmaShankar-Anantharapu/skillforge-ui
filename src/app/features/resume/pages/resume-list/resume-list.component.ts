import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { Resume } from '../../models/resume.model';

@Component({
  selector: 'app-resume-list',
  templateUrl: './resume-list.component.html',
  styleUrl: './resume-list.component.scss'
})
export class ResumeListComponent implements OnInit {
  resumes: Resume[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private resumeService: ResumeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.resumeService.getResumeList().subscribe({
      next: (response) => {
        this.resumes = response.resumes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading resumes:', error);
        this.error = 'Failed to load resumes. Please try again.';
        this.isLoading = false;
      }
    });
  }

  createNewResume(): void {
    this.router.navigate(['/resume/builder']);
  }

  editResume(resume: Resume): void {
    this.router.navigate(['/resume/edit', resume.id]);
  }

  duplicateResume(resume: Resume): void {
    if (!resume.id) return;
    
    this.resumeService.duplicateResume(resume.id).subscribe({
      next: (duplicatedResume) => {
        this.loadResumes(); // Refresh the list
      },
      error: (error) => {
        console.error('Error duplicating resume:', error);
      }
    });
  }

  deleteResume(resume: Resume): void {
    if (!resume.id) return;
    
    if (confirm('Are you sure you want to delete this resume?')) {
      this.resumeService.deleteResume(resume.id).subscribe({
        next: () => {
          this.loadResumes(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting resume:', error);
        }
      });
    }
  }

  exportToPdf(resume: Resume): void {
    if (!resume.id) return;
    
    this.resumeService.exportToPdf(resume.id).subscribe({
      next: (blob) => {
        this.resumeService.downloadFile(blob, `${resume.title || 'resume'}.pdf`);
      },
      error: (error) => {
        console.error('Error exporting to PDF:', error);
      }
    });
  }

  getCompletionPercentage(resume: Resume): number {
    return this.resumeService.getResumeCompletionPercentage(resume);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }
}