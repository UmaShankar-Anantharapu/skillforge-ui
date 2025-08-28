import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Resume, PersonalInfo, ProfessionalSummary, Experience, Education, Skills, Project, ResumeTemplate } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-resume-wizard',
  template: `
    <div class="wizard-container">
      <div class="wizard-header">
        <h2>{{isEditing ? 'Edit Resume' : 'Create New Resume'}}</h2>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="getProgressPercentage()"></div>
        </div>
        <div class="step-indicator">
          Step {{currentStep}} of {{totalSteps}}
        </div>
      </div>

      <div class="wizard-content">
        <div class="step-navigation">
          <div 
            *ngFor="let step of steps; let i = index"
            class="step-item"
            [class.active]="currentStep === i + 1"
            [class.completed]="isStepCompleted(i + 1)"
            (click)="goToStep(i + 1)">
            <div class="step-number">{{i + 1}}</div>
            <div class="step-label">{{step.label}}</div>
          </div>
        </div>

        <div class="step-content">
          <!-- Step 1: Template Selection -->
          <div *ngIf="currentStep === 1" class="step-panel">
            <app-template-selector
              [selectedTemplate]="resume.template"
              (templateSelected)="onTemplateSelected($event)">
            </app-template-selector>
          </div>

          <!-- Step 2: Contact Information -->
          <div *ngIf="currentStep === 2" class="step-panel">
            <app-contact-info-editor
              [personalInfo]="resume.personalInfo"
              (personalInfoChange)="onPersonalInfoChange($event)">
            </app-contact-info-editor>
          </div>

          <!-- Step 3: Professional Summary -->
          <div *ngIf="currentStep === 3" class="step-panel">
            <app-professional-summary
              [professionalSummary]="resume.professionalSummary"
              (summaryChange)="onProfessionalSummaryChange($event)">
            </app-professional-summary>
          </div>

          <!-- Step 4: Experience -->
          <div *ngIf="currentStep === 4" class="step-panel">
            <app-experience-editor
              [experience]="resume.experience"
              (experienceChange)="onExperienceChange($event)">
            </app-experience-editor>
          </div>

          <!-- Step 5: Education -->
          <div *ngIf="currentStep === 5" class="step-panel">
            <app-education-editor
              [education]="resume.education"
              (educationChange)="onEducationChange($event)">
            </app-education-editor>
          </div>

          <!-- Step 6: Skills -->
          <div *ngIf="currentStep === 6" class="step-panel">
            <app-skills-editor
              [skills]="resume.skills"
              (skillsChange)="onSkillsChange($event)">
            </app-skills-editor>
          </div>

          <!-- Step 7: Projects -->
          <div *ngIf="currentStep === 7" class="step-panel">
            <app-projects-editor
              [projects]="resume.projects"
              (projectsChange)="onProjectsChange($event)">
            </app-projects-editor>
          </div>
        </div>
      </div>

      <div class="wizard-footer">
        <div class="navigation-buttons">
          <button 
            type="button" 
            class="btn btn-secondary"
            [disabled]="currentStep === 1"
            (click)="previousStep()">
            Previous
          </button>
          
          <div class="center-buttons">
            <button 
              type="button" 
              class="btn btn-outline"
              (click)="saveAsDraft()"
              [disabled]="isSaving">
              <span *ngIf="isSaving">Saving...</span>
              <span *ngIf="!isSaving">Save as Draft</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-outline"
              (click)="previewResume()">
              Preview
            </button>
          </div>
          
          <button 
            *ngIf="currentStep < totalSteps"
            type="button" 
            class="btn btn-primary"
            (click)="nextStep()">
            Next
          </button>
          
          <button 
            *ngIf="currentStep === totalSteps"
            type="button" 
            class="btn btn-success"
            (click)="completeResume()"
            [disabled]="isSaving">
            <span *ngIf="isSaving">Completing...</span>
            <span *ngIf="!isSaving">Complete Resume</span>
          </button>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="modal-overlay" *ngIf="showPreview" (click)="closePreview()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Resume Preview</h3>
            <button type="button" class="close-btn" (click)="closePreview()">&times;</button>
          </div>
          <div class="modal-body">
            <app-resume-preview [resume]="resume"></app-resume-preview>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>{{loadingMessage}}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="errorMessage">
        <div class="error-content">
          <strong>Error:</strong> {{errorMessage}}
          <button type="button" class="close-error" (click)="clearError()">&times;</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .wizard-header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .wizard-header h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }

    .step-indicator {
      text-align: right;
      color: #666;
      font-size: 14px;
    }

    .wizard-content {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .step-navigation {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 8px;
    }

    .step-item:hover {
      background: #f8f9fa;
    }

    .step-item.active {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
    }

    .step-item.completed {
      background: #e8f5e8;
    }

    .step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e0e0e0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .step-item.active .step-number {
      background: #007bff;
      color: white;
    }

    .step-item.completed .step-number {
      background: #28a745;
      color: white;
    }

    .step-label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .step-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .step-panel {
      padding: 0;
    }

    .wizard-footer {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .center-buttons {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #218838;
    }

    .btn-outline {
      background: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .btn-outline:hover {
      background: #007bff;
      color: white;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 0;
      max-height: calc(90vh - 80px);
      overflow-y: auto;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    /* Error Message */
    .error-message {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1002;
    }

    .error-content {
      background: #f8d7da;
      color: #721c24;
      padding: 15px 20px;
      border-radius: 6px;
      border: 1px solid #f5c6cb;
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 400px;
    }

    .close-error {
      background: none;
      border: none;
      color: #721c24;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      margin-left: auto;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .wizard-container {
        padding: 10px;
      }

      .wizard-content {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .step-navigation {
        display: flex;
        overflow-x: auto;
        padding: 15px;
      }

      .step-item {
        flex-shrink: 0;
        margin-right: 10px;
        margin-bottom: 0;
      }

      .navigation-buttons {
        flex-direction: column;
        gap: 15px;
      }

      .center-buttons {
        order: -1;
        justify-content: center;
      }

      .modal-content {
        max-width: 95vw;
        max-height: 95vh;
      }
    }
  `]
})
export class ResumeWizardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  resume: Resume = {
    personalInfo: {},
    professionalSummary: { content: '', type: '', isCustom: false },
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
    certifications: []
  };
  
  currentStep = 1;
  totalSteps = 7;
  isEditing = false;
  resumeId: string | null = null;
  
  isLoading = false;
  isSaving = false;
  showPreview = false;
  errorMessage = '';
  loadingMessage = 'Loading...';
  
  steps = [
    { label: 'Template', key: 'template' },
    { label: 'Contact Info', key: 'personalInfo' },
    { label: 'Summary', key: 'professionalSummary' },
    { label: 'Experience', key: 'experience' },
    { label: 'Education', key: 'education' },
    { label: 'Skills', key: 'skills' },
    { label: 'Projects', key: 'projects' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resumeService: ResumeService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.resumeId = params['id'];
        this.isEditing = true;
        this.loadResume(this.resumeId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadResume(id: string) {
    this.isLoading = true;
    this.loadingMessage = 'Loading resume...';
    
    try {
      this.resume = await this.resumeService.getResume(id).toPromise();
    } catch (error) {
      this.errorMessage = 'Failed to load resume. Please try again.';
      console.error('Error loading resume:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  isStepCompleted(step: number): boolean {
    // Basic validation for each step
    switch (step) {
      case 1: return !!this.resume.template;
      case 2: return !!(this.resume.personalInfo?.fullName || this.resume.personalInfo?.name);
      case 3: return !!this.resume.professionalSummary?.content;
      case 4: return this.resume.experience?.length > 0;
      case 5: return this.resume.education?.length > 0;
      case 6: return this.hasSkills();
      case 7: return this.resume.projects?.length > 0;
      default: return false;
    }
  }

  hasSkills(): boolean {
    const skills = this.resume.skills;
    return !!(skills?.technical?.length || skills?.frameworks?.length || 
             skills?.databases?.length || skills?.tools?.length || 
             skills?.soft_skills?.length);
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Event handlers for data changes
  onTemplateSelected(template: ResumeTemplate) {
    this.resume.template = template;
    this.resume.templateId = template.id;
    this.autoSave();
  }

  onPersonalInfoChange(personalInfo: PersonalInfo) {
    this.resume.personalInfo = personalInfo;
    this.autoSave();
  }

  onProfessionalSummaryChange(summary: ProfessionalSummary) {
    this.resume.professionalSummary = summary;
    this.autoSave();
  }

  onExperienceChange(experience: Experience[]) {
    this.resume.experience = experience;
    this.autoSave();
  }

  onEducationChange(education: Education[]) {
    this.resume.education = education;
    this.autoSave();
  }

  onSkillsChange(skills: Skills) {
    this.resume.skills = skills;
    this.autoSave();
  }

  onProjectsChange(projects: Project[]) {
    this.resume.projects = projects;
    this.autoSave();
  }

  async autoSave() {
    if (this.isSaving) return;
    
    try {
      this.isSaving = true;
      await this.resumeService.autoSaveResume(this.resume).toPromise();
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async saveAsDraft() {
    this.isSaving = true;
    this.loadingMessage = 'Saving draft...';
    
    try {
      if (this.isEditing && this.resumeId) {
        await this.resumeService.updateResume(this.resumeId, this.resume).toPromise();
      } else {
        const savedResume = await this.resumeService.createResume(this.resume).toPromise();
        this.resumeId = savedResume.id!;
        this.isEditing = true;
      }
      
      // Show success message briefly
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Failed to save draft. Please try again.';
      console.error('Error saving draft:', error);
    } finally {
      this.isSaving = false;
    }
  }

  previewResume() {
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
  }

  async completeResume() {
    this.isSaving = true;
    this.loadingMessage = 'Completing resume...';
    
    try {
      // Mark resume as active/completed
      this.resume.isActive = true;
      
      if (this.isEditing && this.resumeId) {
        await this.resumeService.updateResume(this.resumeId, this.resume).toPromise();
      } else {
        const savedResume = await this.resumeService.createResume(this.resume).toPromise();
        this.resumeId = savedResume.id!;
      }
      
      // Navigate to resume list or detail view
      this.router.navigate(['/resume/list']);
    } catch (error) {
      this.errorMessage = 'Failed to complete resume. Please try again.';
      console.error('Error completing resume:', error);
    } finally {
      this.isSaving = false;
    }
  }

  clearError() {
    this.errorMessage = '';
  }
}