import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { OnboardingService } from 'src/app/core/services/onboarding.service';

@Component({
  selector: 'app-resume-upload',
  templateUrl: './resume-upload.component.html',
  styleUrl: './resume-upload.component.scss'
})
export class ResumeUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() skillsExtracted = new EventEmitter<string[]>();
  
  file: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  dragOver = false;
  errorMessage = '';
  extractedSkills: string[] = [];
  isAnalyzing = false;

  constructor(private onboardingService: OnboardingService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  processFile(file: File): void {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, DOC, and DOCX files are allowed';
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 10MB';
      return;
    }

    this.file = file;
    this.errorMessage = '';
    this.uploadAndAnalyze();
  }

  uploadAndAnalyze(): void {
    if (!this.file) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.analyzeResume();
      }
    }, 200);
  }

  analyzeResume(): void {
    if (!this.file) return;
    
    this.isAnalyzing = true;
    this.onboardingService.analyzeResume(this.file).subscribe({
      next: (response) => {
        this.extractedSkills = response.skills;
        this.skillsExtracted.emit(this.extractedSkills);
        this.isAnalyzing = false;
      },
      error: (error) => {
        console.error('Error analyzing resume:', error);
        this.errorMessage = 'Failed to analyze resume. Please try again or enter skills manually.';
        this.isAnalyzing = false;
      }
    });
  }

  removeFile(): void {
    this.file = null;
    this.extractedSkills = [];
    this.errorMessage = '';
    this.uploadProgress = 0;
  }
}
