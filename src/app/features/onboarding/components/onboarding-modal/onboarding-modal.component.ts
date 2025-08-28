import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { OnboardingStep, OnboardingConfig, OnboardingStatus } from '../../models/onboarding.models';

export interface OnboardingModalData {
  startStep?: number;
  sessionId?: string;
}

@Component({
  selector: 'app-onboarding-modal',
  templateUrl: './onboarding-modal.component.html',
  styleUrls: ['./onboarding-modal.component.scss']
})
export class OnboardingModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State management
  currentStep$ = new BehaviorSubject<number>(0);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Data
  config: OnboardingConfig | null = null;
  currentStepData: OnboardingStep | null = null;
  sessionId: string = '';

  // Form
  stepForm: FormGroup = this.fb.group({});

  // UI State
  isSubmitting = false;
  canProceed = false;

  constructor(
    private dialogRef: MatDialogRef<OnboardingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OnboardingModalData,
    private fb: FormBuilder,
    private onboardingService: OnboardingService
  ) {
    // Configure dialog
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('70vw', '70vh');
  }

  ngOnInit(): void {
    this.initializeOnboarding();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeOnboarding(): void {
    this.loading$.next(true);

    // Start onboarding session
    this.onboardingService.startOnboarding(this.data.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.config = response.config;
          this.sessionId = response.profile.sessionId;
          // Always show Welcome (step 0) first unless an explicit startStep is provided
          const startStep = (this.data.startStep !== undefined) ? this.data.startStep : 0;
          this.currentStep$.next(startStep);
          this.loadCurrentStep();
        },
        error: (error) => {
          this.error$.next('Failed to initialize onboarding. Please try again.');
          this.loading$.next(false);
        }
      });
  }

  private setupSubscriptions(): void {
    // Listen to step changes
    this.currentStep$
      .pipe(takeUntil(this.destroy$))
      .subscribe(step => {
        this.loadCurrentStep();
      });
  }

  private loadCurrentStep(): void {
    const currentStep = this.currentStep$.value;

    if (!this.config) return;

    // For Welcome (step 0), do not fetch step configuration; just stop loading
    if (currentStep === 0) {
      this.currentStepData = null;
      this.stepForm = this.fb.group({});
      this.canProceed = true; // allow starting actions
      this.loading$.next(false);
      return;
    }

    this.loading$.next(true);
    this.error$.next(null);

    this.onboardingService.getStepConfiguration(currentStep)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentStepData = response.step;
          this.buildStepForm();
          this.loading$.next(false);
        },
        error: (error) => {
          this.error$.next('Failed to load step data. Please try again.');
          this.loading$.next(false);
        }
      });
  }

  private buildStepForm(): void {
    if (!this.currentStepData) return;

    const formControls: any = {};

    // Build form controls based on step fields
    this.currentStepData.fields.forEach(field => {
      const validators = [];

      // Add validators based on field requirements
      if (this.isFieldRequired(field)) {
        validators.push(Validators.required);
      }

      // Add specific validators
      if (field === 'email') {
        validators.push(Validators.email);
      }

      if (field === 'age') {
        validators.push(Validators.min(16), Validators.max(100));
      }

      // Set initial value from existing data
      const initialValue = this.getFieldValue(field);
      formControls[field] = [initialValue, validators];
    });

    this.stepForm = this.fb.group(formControls);

    // Set initial canProceed state based on form validity
    this.canProceed = this.stepForm.valid;

    // Watch form changes to enable/disable proceed button
    this.stepForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.canProceed = this.stepForm.valid;
      });
  }

  private isFieldRequired(field: string): boolean {
    const requiredFields = {
      1: ['fullName', 'email', 'country', 'timezone'],
      2: ['careerBackground'],
      3: ['primaryGoal', 'motivationLevel'],
      4: ['requiredSkills'],
      5: ['timeline'],
      6: ['learningPreferences']
    };

    const currentStep = this.currentStep$.value;
    return requiredFields[currentStep as keyof typeof requiredFields]?.includes(field) || false;
  }

  private getFieldValue(field: string): any {
    if (!this.currentStepData?.data) return null;

    const data = this.currentStepData.data as any;
    return data[field] || null;
  }

  // Navigation methods
  nextStep(): void {
    const currentStep = this.currentStep$.value;

    // From welcome (step 0), simply go to step 1 without submission
    if (currentStep === 0) {
      this.currentStep$.next(1);
      return;
    }

    if (!this.canProceed || this.isSubmitting) return;

    this.isSubmitting = true;
    this.error$.next(null);

    const formData = this.stepForm.value;

    // Add session ID to form data
    const stepData = {
      sessionId: this.sessionId,
      ...formData
    };

    this.onboardingService.saveStepData(currentStep, stepData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;

          if (currentStep < 7) {
            // Move to next step
            this.currentStep$.next(currentStep + 1);
          } else {
            // Complete onboarding
            this.completeOnboarding();
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error$.next(error.error?.message || 'Failed to save step data. Please try again.');
        }
      });
  }

  previousStep(): void {
    const currentStep = this.currentStep$.value;
    if (currentStep > 0) {
      this.currentStep$.next(currentStep - 1);
    }
  }

  private completeOnboarding(): void {
    this.loading$.next(true);

    this.onboardingService.completeOnboarding(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading$.next(false);
          // Close modal and redirect to skills
    this.dialogRef.close({ completed: true, redirectTo: '/skills' });
        },
        error: (error) => {
          this.loading$.next(false);
          this.error$.next('Failed to complete onboarding. Please try again.');
        }
      });
  }

  // Utility methods
  getStepTitle(): string {
    return this.currentStepData?.title || 'Loading...';
  }

  getStepDescription(): string {
    return this.currentStepData?.description || '';
  }

  getProgressPercentage(): number {
    const currentStep = this.currentStep$.value;
    return Math.round((currentStep / 7) * 100);
  }

  canGoBack(): boolean {
    return this.currentStep$.value > 0;
  }

  canGoNext(): boolean {
    return this.canProceed && !this.isSubmitting;
  }

  isLastStep(): boolean {
    return this.currentStep$.value === 2;
  }

  // Handle welcome page start actions
  onStartOnboarding(mode: 'manual' | 'resume'): void {
    // For now both routes jump to step 1; later we can branch for resume upload flow
    this.currentStep$.next(1);
  }


  // Close modal
  closeModal(): void {
    this.dialogRef.close({ completed: false });
  }

  // Get step list for navigation
  getStepList(): Array<{title: string, subtitle: string}> {
    return [
      { title: 'About You', subtitle: 'Tell us about yourself' },
      { title: 'Career Background', subtitle: 'Your professional experience' }
    ];
  }
}