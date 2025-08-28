import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResumeService } from '../../services/resume.service';
import { Resume } from '../../models/resume.model';

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html',
  styleUrl: './resume-builder.component.scss'
})
export class ResumeBuilderComponent implements OnInit {
  currentStep = 0;
  totalSteps = 8;
  resumeId: string | null = null;
  resume: Resume | null = null;
  isLoading = false;
  isSaving = false;

  steps = [
    { title: 'Template', description: 'Choose your resume template' },
    { title: 'Contact', description: 'Personal information' },
    { title: 'Summary', description: 'Professional summary' },
    { title: 'Experience', description: 'Work experience' },
    { title: 'Education', description: 'Educational background' },
    { title: 'Skills', description: 'Technical skills' },
    { title: 'Projects', description: 'Personal projects' },
    { title: 'Preview', description: 'Review and export' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private resumeService: ResumeService
  ) {}

  ngOnInit(): void {
    this.resumeId = this.route.snapshot.paramMap.get('id');
    if (this.resumeId) {
      this.loadResume();
    } else {
      this.initializeNewResume();
    }
  }

  private loadResume(): void {
    if (!this.resumeId) return;
    
    this.isLoading = true;
    this.resumeService.getResume(this.resumeId).subscribe({
      next: (resume) => {
        this.resume = resume;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading resume:', error);
        this.isLoading = false;
        this.router.navigate(['/resume/list']);
      }
    });
  }

  private initializeNewResume(): void {
    this.resume = {
      id: '',
      userId: '',
      templateId: '',
      title: 'My Resume',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        github: '',
        portfolio: ''
      },
      professionalSummary: {
        content: '',
        type: '',
        isCustom: false
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        frameworks: [],
        databases: [],
        tools: [],
        soft_skills: []
      },
      projects: [],
      certifications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 0 && step < this.totalSteps) {
      this.currentStep = step;
    }
  }

  saveResume(): void {
    if (!this.resume) return;

    this.isSaving = true;
    const saveOperation = this.resumeId 
      ? this.resumeService.updateResume(this.resumeId, this.resume)
      : this.resumeService.createResume(this.resume);

    saveOperation.subscribe({
      next: (savedResume) => {
        this.resume = savedResume;
        this.resumeId = savedResume.id;
        this.isSaving = false;
        // Show success message
      },
      error: (error) => {
        console.error('Error saving resume:', error);
        this.isSaving = false;
        // Show error message
      }
    });
  }

  onResumeDataChange(data: any): void {
    if (this.resume) {
      this.resume = { ...this.resume, ...data };
      this.resume.updatedAt = new Date();
    }
  }

  canProceedToNext(): boolean {
    // Add validation logic based on current step
    switch (this.currentStep) {
      case 0: // Template selection
        return !!this.resume?.templateId;
      case 1: // Contact info
        return !!(this.resume?.personalInfo.fullName && this.resume?.personalInfo.email);
      case 2: // Professional summary
        return !!this.resume?.professionalSummary.content;
      default:
        return true;
    }
  }

  getStepProgress(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}