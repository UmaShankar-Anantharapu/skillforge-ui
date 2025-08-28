import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfessionalSummary, SummaryGenerationRequest, GeneratedSummary } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-professional-summary-editor',
  templateUrl: './professional-summary-editor.component.html',
  styleUrls: ['./professional-summary-editor.component.scss']
})
export class ProfessionalSummaryEditorComponent implements OnInit {
  @Input() professionalSummary?: ProfessionalSummary;
  @Input() userSkills: string[] = [];
  @Output() professionalSummaryChange = new EventEmitter<ProfessionalSummary>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();

  summaryForm!: FormGroup;
  generatedSummaries: GeneratedSummary[] = [];
  selectedSummaryType: string = '';
  isGenerating = false;
  showCustomEditor = false;
  
  // Summary types specifically for technical/developer roles
  summaryTypes = [
    {
      id: 'fresh-graduate',
      title: 'Fresh Graduate',
      description: 'Perfect for new graduates entering the tech industry',
      icon: 'school',
      focus: 'Education, projects, and eagerness to learn'
    },
    {
      id: 'junior-developer',
      title: 'Junior Developer',
      description: 'For developers with 0-2 years of experience',
      icon: 'code',
      focus: 'Technical skills, learning mindset, and potential'
    },
    {
      id: 'mid-level-developer',
      title: 'Mid-Level Developer',
      description: 'For developers with 2-5 years of experience',
      icon: 'build',
      focus: 'Technical expertise, project delivery, and leadership potential'
    },
    {
      id: 'senior-developer',
      title: 'Senior Developer',
      description: 'For experienced developers with 5+ years',
      icon: 'engineering',
      focus: 'Technical leadership, architecture, and mentoring'
    },
    {
      id: 'full-stack-developer',
      title: 'Full-Stack Developer',
      description: 'For developers working across the entire stack',
      icon: 'layers',
      focus: 'End-to-end development, versatility, and system thinking'
    },
    {
      id: 'frontend-specialist',
      title: 'Frontend Specialist',
      description: 'For developers focused on user interfaces',
      icon: 'web',
      focus: 'UI/UX implementation, modern frameworks, and user experience'
    },
    {
      id: 'backend-specialist',
      title: 'Backend Specialist',
      description: 'For developers focused on server-side development',
      icon: 'storage',
      focus: 'Server architecture, databases, and API development'
    },
    {
      id: 'devops-engineer',
      title: 'DevOps Engineer',
      description: 'For professionals bridging development and operations',
      icon: 'settings',
      focus: 'Infrastructure, automation, and deployment pipelines'
    }
  ];

  industries = [
    'Technology/Software',
    'Financial Services',
    'Healthcare',
    'E-commerce',
    'Gaming',
    'Fintech',
    'EdTech',
    'Startup',
    'Enterprise',
    'Consulting',
    'Other'
  ];

  experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' }
  ];

  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscription();
  }

  private initializeForm(): void {
    this.summaryForm = this.fb.group({
      careerFocus: [this.selectedSummaryType || '', Validators.required],
      experienceLevel: ['', Validators.required],
      industry: ['', Validators.required],
      keySkills: [this.userSkills.slice(0, 5).join(', '), Validators.required],
      achievements: [''],
      customSummary: [this.professionalSummary?.content || '']
    });

    // Set initial values if professional summary exists
    if (this.professionalSummary) {
      this.selectedSummaryType = this.professionalSummary.type;
      this.showCustomEditor = this.professionalSummary.isCustom;
    }
  }

  private setupFormSubscription(): void {
    this.summaryForm.valueChanges.subscribe(value => {
      if (this.showCustomEditor && value.customSummary) {
        const summary: ProfessionalSummary = {
          content: value.customSummary,
          type: 'custom',
          isCustom: true
        };
        this.professionalSummaryChange.emit(summary);
      }
    });
  }

  selectSummaryType(typeId: string): void {
    this.selectedSummaryType = typeId;
    this.summaryForm.patchValue({ careerFocus: typeId });
    this.generatedSummaries = [];
    this.showCustomEditor = false;
  }

  async generateSummaries(): Promise<void> {
    if (!this.summaryForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.summaryForm.value;
    const request: SummaryGenerationRequest = {
      careerFocus: formValue.careerFocus,
      experienceLevel: formValue.experienceLevel,
      skills: formValue.keySkills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      industry: formValue.industry,
      achievements: formValue.achievements ? formValue.achievements.split(',').map((s: string) => s.trim()) : []
    };

    try {
      this.isGenerating = true;
      const response = await this.resumeService.generateSummaries(request).toPromise();
      this.generatedSummaries = response?.summaries || [];
    } catch (error) {
      console.error('Error generating summaries:', error);
      // Handle error - maybe show a toast or error message
    } finally {
      this.isGenerating = false;
    }
  }

  selectGeneratedSummary(summary: GeneratedSummary): void {
    const professionalSummary: ProfessionalSummary = {
      content: summary.content,
      type: summary.type,
      isCustom: false
    };
    this.professionalSummaryChange.emit(professionalSummary);
  }

  toggleCustomEditor(): void {
    this.showCustomEditor = !this.showCustomEditor;
    if (this.showCustomEditor) {
      this.generatedSummaries = [];
    }
  }

  onNext(): void {
    if (this.professionalSummary?.content) {
      this.nextStep.emit();
    }
  }

  onPrevious(): void {
    this.previousStep.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.summaryForm.controls).forEach(key => {
      const control = this.summaryForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.summaryForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      careerFocus: 'Career Focus',
      experienceLevel: 'Experience Level',
      industry: 'Industry',
      keySkills: 'Key Skills'
    };
    return labels[fieldName] || fieldName;
  }

  get selectedSummaryTypeInfo() {
    return this.summaryTypes.find(type => type.id === this.selectedSummaryType);
  }

  get canGenerateSummaries(): boolean {
    return this.selectedSummaryType && 
           this.summaryForm.get('experienceLevel')?.value && 
           this.summaryForm.get('industry')?.value && 
           this.summaryForm.get('keySkills')?.value;
  }

  get hasSummarySelected(): boolean {
    return !!(this.professionalSummary?.content);
  }

  get completionPercentage(): number {
    let completed = 0;
    const total = 4; // careerFocus, experienceLevel, industry, final summary

    if (this.selectedSummaryType) completed++;
    if (this.summaryForm.get('experienceLevel')?.value) completed++;
    if (this.summaryForm.get('industry')?.value) completed++;
    if (this.hasSummarySelected) completed++;

    return Math.round((completed / total) * 100);
  }
}