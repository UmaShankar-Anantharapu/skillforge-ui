import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { OnboardingConfig, OnboardingStep } from '../../models/onboarding.models';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-onboarding-page',
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss']
})
export class OnboardingPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentStep$ = new BehaviorSubject<number>(1);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  config: OnboardingConfig | null = null;
  currentStepData: OnboardingStep | null = null;
  sessionId = '';

  stepForm: FormGroup = this.fb.group({});
  isSubmitting = false;
  canProceed = false;
  
  // Store collected data for summary step
  collectedData: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private onboardingService: OnboardingService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeOnboarding();
    this.currentStep$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadCurrentStep());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeOnboarding(): void {
    this.loading$.next(true);
    // First check current onboarding status to resume from last position
    this.onboardingService.getOnboardingStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          if (status.isComplete) {
            // If onboarding is complete, redirect to dashboard
            this.router.navigate(['/dashboard']);
            return;
          }
          
          // Start onboarding session
          this.onboardingService.startOnboarding(status.sessionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.config = response.config;
                this.sessionId = response.profile.sessionId;
                // Resume from current step, but ensure minimum step is 1
                const resumeStep = Math.max(status.currentStep || 1, 1);
                this.currentStep$.next(resumeStep);
                this.loadCurrentStep();
              },
              error: () => {
                this.error$.next('Failed to initialize onboarding. Please try again.');
                this.loading$.next(false);
              }
            });
        },
        error: () => {
          // If status check fails, start fresh from step 1
          this.onboardingService.startOnboarding(undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.config = response.config;
                this.sessionId = response.profile.sessionId;
                this.currentStep$.next(1);
                this.loadCurrentStep();
              },
              error: () => {
                this.error$.next('Failed to initialize onboarding. Please try again.');
                this.loading$.next(false);
              }
            });
        }
      });
  }

  private loadCurrentStep(): void {
    const step = this.currentStep$.value;
    if (!this.config) return;

    // Handle summary step (step 3) differently
     if (step === 3) {
       this.currentStepData = {
         title: 'Summary',
         description: 'Review your information before completing setup',
         fields: [],
         data: {}
       };
       this.canProceed = true;
       this.loading$.next(false);
       return;
     }

    this.loading$.next(true);
    this.error$.next(null);
    this.onboardingService.getStepConfiguration(step)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.currentStepData = res.step;
          this.buildStepForm();
          this.loading$.next(false);
        },
        error: () => {
          this.error$.next('Failed to load step data. Please try again.');
          this.loading$.next(false);
        }
      });
  }

  private buildStepForm(): void {
    if (!this.currentStepData) return;

    // Ensure Step 1 includes required fields even if backend config misses them
    const backendFields = Array.isArray(this.currentStepData.fields) ? this.currentStepData.fields : [];
    const fieldsSet = new Set<string>(backendFields as string[]);
    if (this.currentStep$.value === 1) {
      ['fullName','email','country','timezone','age','preferredLanguages'].forEach(f => fieldsSet.add(f));
    }
    const fields = Array.from(fieldsSet);

    const formControls: any = {};
    fields.forEach(field => {
      const validators = [] as any[];
      if (this.isFieldRequired(field)) validators.push(Validators.required);
      if (field === 'email') validators.push(Validators.email);
      if (field === 'age') validators.push(Validators.min(16), Validators.max(100));

      let initialValue = this.getFieldValue(field);
      if (field === 'preferredLanguages' && initialValue == null) initialValue = [];
      if (field === 'currentSkills' && initialValue == null) initialValue = [];
      if (field === 'careerBackground' && initialValue == null) initialValue = [];

      formControls[field] = [initialValue, validators];
    });

    this.stepForm = this.fb.group(formControls);
    
    // Set initial canProceed state based on form validity
    this.canProceed = this.stepForm.valid;
    
    this.stepForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.canProceed = this.stepForm.valid;
    });
  }

  private isFieldRequired(field: string): boolean {
    const requiredFields: any = {
      1: ['fullName', 'email', 'country', 'timezone', 'age', 'preferredLanguages'],
      2: ['careerBackground'],
      3: ['primaryGoal', 'motivationLevel'],
      4: ['requiredSkills'],
      5: ['timeline'],
      6: ['learningPreferences']
    };
    return requiredFields[this.currentStep$.value]?.includes(field) || false;
  }

  private getFieldValue(field: string): any {
    if (!this.currentStepData?.data) return null;
    const data = this.currentStepData.data as any;
    return data[field] ?? null;
  }

  nextStep(): void {
    const step = this.currentStep$.value;
    if (!this.canProceed || this.isSubmitting) return;

    // Handle step 3 (summary) - complete onboarding
    if (step === 3) {
      this.completeOnboarding();
      return;
    }

    this.isSubmitting = true;
    const payload = { sessionId: this.sessionId, ...this.stepForm.value };
    
    // Store data for summary step
    this.collectedData[`step${step}`] = this.stepForm.value;
    
    this.onboardingService.saveStepData(step, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          if (step < 3) this.currentStep$.next(step + 1); else this.completeOnboarding();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error$.next(err.error?.message || 'Failed to save step data. Please try again.');
        }
      });
  }

  previousStep(): void {
    const step = this.currentStep$.value;
    if (step > 1) {
      this.currentStep$.next(step - 1);
    }
  }

  navigateToStep(targetStep: number): void {
    const currentStep = this.currentStep$.value;
    // Only allow navigation to completed steps (steps less than current step)
    if (targetStep < currentStep && targetStep >= 1) {
      this.currentStep$.next(targetStep);
    }
  }

  completeOnboarding(): void {
    this.loading$.next(true);
    this.onboardingService.completeOnboarding(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading$.next(false);
          this.router.navigate(['/skills']);
        },
        error: () => {
          this.loading$.next(false);
          this.error$.next('Failed to complete onboarding. Please try again.');
        }
      });
  }

  getStepList(): Array<{title: string, subtitle: string}> {
    return [
      { title: 'About You', subtitle: 'Tell us about yourself' },
      { title: 'Career Background', subtitle: 'Your professional experience' },
      { title: 'Summary', subtitle: 'Review your information' }
    ];
  }

  getStepTitle(): string { return this.currentStepData?.title || 'Get Started'; }
  getStepDescription(): string { return this.currentStepData?.description || 'Welcome to your personalized learning journey'; }
  canGoBack(): boolean { return this.currentStep$.value > 1; }
  canGoNext(): boolean { return this.canProceed && !this.isSubmitting; }
  isLastStep(): boolean { return this.currentStep$.value === 3; }
  isSummaryStep(): boolean { return this.currentStep$.value === 3; }

  startFromWelcome(mode: 'manual' | 'resume'): void {
    if (mode === 'manual') {
      this.currentStep$.next(1);
      return;
    }
    // Resume upload flow: open file picker programmatically
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;
      const file = input.files[0];
      try {
        this.loading$.next(true);
        const formData = new FormData();
        formData.append('file', file);
        // Use fetch here to avoid HttpClient typing; backend expects auth header
        const token = this.auth.getToken();
        const resp = await fetch(`${(window as any).ENV?.apiUrl || 'http://localhost:5000/api'}/onboarding/resume-upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData
        });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || 'Failed to process resume');

        // Pre-fill relevant step data from extracted payload
        const data = json.data || {};
        // Move to step 1 and rebuild form with extracted personal info
        this.currentStep$.next(1);
        // Load step config then patch values
        this.onboardingService.getStepConfiguration(1).pipe(takeUntil(this.destroy$)).subscribe({
          next: (res) => {
            this.currentStepData = res.step;
            this.buildStepForm();
            const pi = data.personalInfo || {};
            this.stepForm.patchValue({
              fullName: pi.fullName || '',
              email: pi.email || '',
              country: pi.country || '',
              timezone: pi.timezone || ''
            });
            this.loading$.next(false);
          },
          error: () => {
            this.loading$.next(false);
            this.error$.next('Failed to load step after resume processing.');
          }
        });
      } catch (e: any) {
        this.loading$.next(false);
        this.error$.next(e?.message || 'Failed to process resume. Please try manual mode.');
      }
    };
    input.click();
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
