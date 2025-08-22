import { Component, OnInit, HostBinding } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OnboardingService, OnboardingData } from '../../../../core/services/onboarding.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-onboarding-stepper',
  templateUrl: './onboarding-stepper.component.html',
  styleUrl: './onboarding-stepper.component.scss',
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ])
  ]
})
export class OnboardingStepperComponent implements OnInit {
  // Current step
  currentStep = 0;
  
  // Theme detection
  @HostBinding('class.dark-theme') isDarkTheme = false;
  
  // Forms for each step
  getStartedForm: FormGroup;
  basicProfileForm: FormGroup;
  learningGoalsForm: FormGroup;
  learningPreferencesForm: FormGroup;
  scheduleForm: FormGroup;
  skillsSetupForm: FormGroup;
  backgroundForm: FormGroup;
  successMetricsForm: FormGroup;
  skillAssessmentForm: FormGroup;
  finalSetupForm: FormGroup;

  // Step titles
  stepTitles = [
    'Get Started',
    'Welcome & Basic Profile',
    'Learning Goals & Context',
    'Learning Preferences',
    'Schedule & Availability',
    'Skills Assessment Setup',
    'Background & Experience',
    'Success Metrics & Preferences',
    'Skill Assessment',
    'Final Setup & Preferences'
  ];
  
  // Form data
  formData: Partial<OnboardingData> = {};
  
  // Selected input method
  selectedInputMethod: 'manual' | 'resume' = 'manual';
  
  // Skill details form
  skillDetailsForm = new FormGroup({
    skills: new FormControl<string[]>([])
  });
  
  // Skill selection
  skillCtrl = new FormControl('');
  availableSkills: string[] = [
    'JavaScript', 'Python', 'Java', 'C#', 'C++', 'TypeScript',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js',
    'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD',
    'Machine Learning', 'Data Science', 'Artificial Intelligence',
    'Blockchain', 'Cybersecurity', 'DevOps', 'Agile', 'Scrum'
  ];
  filteredSkills: Observable<string[]>;
  selectedSkills: string[] = [];
  
  // Industry options
  industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Government', 'Non-profit', 'Entertainment', 'Transportation',
    'Construction', 'Agriculture', 'Energy', 'Telecommunications', 'Other'
  ];
  
  // Resume upload
  selectedFile: File | null = null;
  isDragover = false;
  isAnalyzing = false;
  resumeAnalysisComplete = false;
  identifiedSkills: string[] = [];

  // Submission state
  isSubmitting = false;
  
  // Loading state
  isLoading = false;

  // Step tooltips
  stepTooltips = [
    '', // Get Started (no tooltip needed)
    'Build your basic profile to personalize your learning experience',
    'Define what you want to achieve with your learning journey',
    'Tell us how you learn best for optimized content delivery',
    'Set your learning schedule to maintain consistency',
    'Identify the skills you want to develop or improve',
    'Share your experience to tailor content to your level',
    'Define how you want to measure your learning success',
    'Assess your current skill levels for personalized recommendations',
    'Final preferences to complete your learning profile'
  ];
  
  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private router: Router
  ) {
    // Initialize forms
    this.getStartedForm = this.fb.group({});
    
    // Step 1: Welcome & Basic Profile
    this.basicProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      jobTitle: ['', Validators.required],
      company: [''],
      industry: ['', Validators.required],
      yearsExperience: ['', Validators.required],
      preferredLanguage: ['English', Validators.required]
    });
    
    // Step 2: Learning Goals & Context
    this.learningGoalsForm = this.fb.group({
      primaryLearningGoal: ['', Validators.required],
      targetRole: [''],
      timeline: ['', Validators.required],
      motivationLevel: ['', Validators.required],
      currentChallenge: ['', Validators.required]
    });
    
    // Step 3: Learning Preferences
    this.learningPreferencesForm = this.fb.group({
      learningStyle: ['', Validators.required],
      contentFormat: ['', Validators.required],
      sessionDuration: ['', Validators.required],
      difficultyPreference: ['', Validators.required],
      primaryDevice: ['', Validators.required]
    });
    
    // Step 4: Schedule & Availability
    this.scheduleForm = this.fb.group({
      availableTimePerDay: ['', Validators.required],
      bestLearningTimes: [[], Validators.required],
      daysPerWeek: ['', Validators.required],
      timeZone: ['', Validators.required],
      reminderMethod: ['', Validators.required]
    });
    
    // Step 5: Skills Assessment Setup
    this.skillsSetupForm = this.fb.group({
      primarySkillCategory: ['', Validators.required],
      skillsToLearn: [[], Validators.required],
      currentSkillLevels: [[], Validators.required],
      relatedSkills: [[]],
      prioritySkills: [[], Validators.required]
    });
    
    // Step 6: Background & Experience
    this.backgroundForm = this.fb.group({
      educationLevel: ['', Validators.required],
      certifications: [[]],
      previousLearningExperience: ['', Validators.required],
      teamRole: ['', Validators.required],
      learningBudget: ['', Validators.required]
    });
    
    // Step 7: Success Metrics & Preferences
    this.successMetricsForm = this.fb.group({
      successMeasurement: ['', Validators.required],
      progressTracking: ['', Validators.required],
      communityParticipation: ['', Validators.required],
      accessibilityRequirements: [[]],
      communicationPreferences: [[], Validators.required]
    });
    
    // Step 8: Skill Assessment
    this.skillAssessmentForm = this.fb.group({
      skillAssessments: [[]]
    });
    
    // Step 9: Final Setup & Preferences
    this.finalSetupForm = this.fb.group({
      profilePrivacy: ['', Validators.required],
      'dataSharing.analytics': [false, Validators.required],
      'dataSharing.marketing': [false, Validators.required],
      'dataSharing.thirdParty': [false, Validators.required],
      'notificationPreferences.email': [true, Validators.required],
      'notificationPreferences.push': [true, Validators.required],
      'notificationPreferences.sms': [false, Validators.required],
      themePreference: ['Light mode', Validators.required],
      betaFeatures: [false, Validators.required]
    });

    // Initialize filtered skills observable
    this.filteredSkills = this.skillCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSkills(value || ''))
    );
  }

  ngOnInit(): void {
    // Detect theme preference
    this.detectTheme();
    
    // Initialize filtered skills observable
    this.filteredSkills = this.skillCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSkills(value || ''))
    );
    
    // Initialize form groups for all steps
    this.getStartedForm = this.fb.group({});
    
    this.basicProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      jobTitle: ['', Validators.required],
      company: [''],
      industry: ['', Validators.required],
      yearsExperience: ['', Validators.required],
      preferredLanguage: ['English', Validators.required]
    });
    
    this.learningGoalsForm = this.fb.group({
      primaryLearningGoal: ['', Validators.required],
      targetRole: [''],
      timeline: ['', Validators.required],
      motivationLevel: ['', Validators.required],
      currentChallenge: ['', Validators.required]
    });
    
    this.learningPreferencesForm = this.fb.group({
      learningStyle: ['', Validators.required],
      contentFormat: ['', Validators.required],
      sessionDuration: ['', Validators.required],
      difficultyPreference: ['', Validators.required],
      primaryDevice: ['', Validators.required]
    });
    
    this.scheduleForm = this.fb.group({
      availableTimePerDay: ['', Validators.required],
      bestLearningTimes: [[], Validators.required],
      daysPerWeek: ['', Validators.required],
      timeZone: ['', Validators.required],
      reminderMethod: ['', Validators.required]
    });
    
    this.skillsSetupForm = this.fb.group({
      primarySkillCategory: ['', Validators.required],
      skillsToLearn: [[], Validators.required],
      currentSkillLevels: [[]],
      relatedSkills: [[]],
      prioritySkills: [[], Validators.required]
    });
    
    this.backgroundForm = this.fb.group({
      educationLevel: ['', Validators.required],
      certifications: [[]],
      previousLearningExperience: ['', Validators.required],
      teamRole: ['', Validators.required],
      learningBudget: ['', Validators.required]
    });
    
    this.successMetricsForm = this.fb.group({
      successMeasurement: ['', Validators.required],
      progressTracking: ['', Validators.required],
      communityParticipation: ['', Validators.required],
      accessibilityRequirements: [[]],
      communicationPreferences: [[], Validators.required]
    });
    
    this.skillAssessmentForm = this.fb.group({
      skillAssessments: this.fb.array([])
    });
    
    this.finalSetupForm = this.fb.group({
      profilePrivacy: ['', Validators.required],
      'dataSharing.analytics': [false, Validators.required],
      'dataSharing.marketing': [false, Validators.required],
      'dataSharing.thirdParty': [false, Validators.required],
      'notificationPreferences.email': [true, Validators.required],
      'notificationPreferences.push': [true, Validators.required],
      'notificationPreferences.sms': [false, Validators.required],
      themePreference: ['light', Validators.required],
      betaFeatures: [false, Validators.required]
    });
  }
  
  // Navigation methods
  nextStep(): void {
    // Save current step data
    this.saveCurrentStepData()
      .subscribe({
        next: () => {
          // Proceed to next step
          if (this.currentStep < this.stepTitles.length - 1) {
            this.currentStep++;
          }
        },
        error: (error) => {
          console.error('Error saving step data:', error);
          // Handle error (show message to user)
        }
      });
  }
  
  /**
   * Save current step data to backend
   */
  saveCurrentStepData(): Observable<any> {
    // Get the current form data based on step
    let currentFormData: any = {};
    
    switch (this.currentStep) {
      case 1:
        currentFormData = this.basicProfileForm.value;
        this.formData.personalInfo = currentFormData;
        break;
      case 2:
        currentFormData = this.learningGoalsForm.value;
        this.formData.learningGoals = currentFormData;
        break;
      case 3:
        currentFormData = this.learningPreferencesForm.value;
        this.formData.learningPreferences = currentFormData;
        break;
      case 4:
        currentFormData = this.scheduleForm.value;
        this.formData.schedule = currentFormData;
        break;
      case 5:
        currentFormData = this.skillsSetupForm.value;
        this.formData.skillsSetup = currentFormData;
        break;
      case 6:
        currentFormData = this.backgroundForm.value;
        this.formData.background = currentFormData;
        break;
      case 7:
        currentFormData = this.successMetricsForm.value;
        this.formData.successMetrics = currentFormData;
        break;
      case 8:
        currentFormData = this.skillAssessmentForm.value;
        this.formData.skillAssessments = currentFormData;
        break;
      case 9:
        currentFormData = this.finalSetupForm.value;
        this.formData.finalSetup = currentFormData;
        break;
      default:
        return new Observable(observer => observer.next(null));
    }
    
    // Save to backend
    return this.onboardingService.saveOnboardingData(this.currentStep, currentFormData);
  }
  
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  
  goToStep(step: number): void {
    if (step >= 0 && step < this.stepTitles.length) {
      this.saveCurrentStep();
      this.currentStep = step;
    }
  }
  
  // Save current step data
  saveCurrentStep(): void {
    switch (this.currentStep) {
      case 0: // Get Started
        // Nothing to save
        break;
      case 1: // Welcome & Basic Profile
        if (this.basicProfileForm.valid) {
          this.formData.personalInfo = this.basicProfileForm.value;
          this.onboardingService.saveBasicProfile(this.basicProfileForm.value).subscribe();
        }
        break;
      case 2: // Learning Goals & Context
        if (this.learningGoalsForm.valid) {
          this.formData.learningGoals = this.learningGoalsForm.value;
          this.onboardingService.saveLearningGoals(this.learningGoalsForm.value).subscribe();
        }
        break;
      case 3: // Learning Preferences
        if (this.learningPreferencesForm.valid) {
          this.formData.learningPreferences = this.learningPreferencesForm.value;
          this.onboardingService.saveLearningPreferences(this.learningPreferencesForm.value).subscribe();
        }
        break;
      case 4: // Schedule & Availability
        if (this.scheduleForm.valid) {
          this.formData.schedule = this.scheduleForm.value;
          this.onboardingService.saveSchedule(this.scheduleForm.value).subscribe();
        }
        break;
      case 5: // Skills Assessment Setup
        if (this.skillsSetupForm.valid) {
          this.formData.skillsSetup = this.skillsSetupForm.value;
          this.onboardingService.saveSkillsSetup(this.skillsSetupForm.value).subscribe();
        }
        break;
      case 6: // Background & Experience
        if (this.backgroundForm.valid) {
          this.formData.background = this.backgroundForm.value;
          this.onboardingService.saveBackground(this.backgroundForm.value).subscribe();
        }
        break;
      case 7: // Success Metrics & Preferences
        if (this.successMetricsForm.valid) {
          this.formData.successMetrics = this.successMetricsForm.value;
          this.onboardingService.saveSuccessMetrics(this.successMetricsForm.value).subscribe();
        }
        break;
      case 8: // Skill Assessment
        if (this.skillAssessmentForm.valid) {
          this.formData.skillAssessments = this.skillAssessmentForm.value.skillAssessments;
          this.onboardingService.saveSkillAssessment(this.skillAssessmentForm.value.skillAssessments).subscribe();
        }
        break;
      case 9: // Final Setup & Preferences
        if (this.finalSetupForm.valid) {
          const formValue = this.finalSetupForm.value;
          const finalSetup = {
            profilePrivacy: formValue.profilePrivacy,
            dataSharing: {
              analytics: formValue['dataSharing.analytics'],
              marketing: formValue['dataSharing.marketing'],
              thirdParty: formValue['dataSharing.thirdParty']
            },
            notificationPreferences: {
              email: formValue['notificationPreferences.email'],
              push: formValue['notificationPreferences.push'],
              sms: formValue['notificationPreferences.sms']
            },
            themePreference: formValue.themePreference,
            betaFeatures: formValue.betaFeatures
          };
          this.formData.finalSetup = finalSetup;
          this.onboardingService.saveFinalSetup(finalSetup).subscribe(() => {
            // Navigate to dashboard after completing all steps
            this.router.navigate(['/dashboard']);
          });
        }
        break;
    }
  }
  
  // Complete onboarding
  completeOnboarding(): void {
    this.saveCurrentStep();
    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  // Option selection methods
  selectOption(option: 'manual' | 'resume'): void {
    this.selectedInputMethod = option;
  }
  
  startManually(): void {
    this.onboardingService.startManually().subscribe({
      next: (response) => {
        // Pre-fill forms with draft data
        if (response) {
          this.formData = response;
          
          // Patch forms with the received data
          if (response.personalInfo) {
            this.basicProfileForm.patchValue(response.personalInfo);
          }
          
          if (response.learningGoals) {
            this.learningGoalsForm.patchValue(response.learningGoals);
          }
          
          if (response.background) {
            this.backgroundForm.patchValue(response.background);
          }
          
          if (response.skillsSetup && response.skillsSetup.skillsToLearn) {
            this.selectedSkills = response.skillsSetup.skillsToLearn;
            this.skillsSetupForm.patchValue({
              skillsToLearn: response.skillsSetup.skillsToLearn
            });
          }
        }
        
        // Move to the next step
        this.nextStep();
      },
      error: (error) => {
        console.error('Error starting onboarding manually:', error);
        // Still proceed to next step even if there's an error
        this.nextStep();
      }
    });
  }
  
  // Resume upload methods
  uploadResume(): void {
    if (this.selectedFile) {
      this.analyzeResume(this.selectedFile);
    }
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (this.isValidResumeFile(file)) {
        this.selectedFile = file;
        this.analyzeResume(file);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isValidResumeFile(file)) {
        this.selectedFile = file;
        this.analyzeResume(file);
      }
    }
  }

  isValidResumeFile(file: File): boolean {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    return allowedTypes.includes(fileExtension.toLowerCase());
  }

  removeFile(): void {
    this.selectedFile = null;
    this.resumeAnalysisComplete = false;
    this.identifiedSkills = [];
  }
  
  removeSelectedFile(): void {
    this.removeFile();
  }

  analyzeResume(file: File): void {
    this.isAnalyzing = true;
    
    // Call the service to analyze the resume
    this.onboardingService.analyzeResume(file).subscribe({
      next: (response) => {
        this.isAnalyzing = false;
        this.resumeAnalysisComplete = true;
        
        // Extract skills from response
        if (response.skillsSetup && response.skillsSetup.skillsToLearn) {
          this.identifiedSkills = response.skillsSetup.skillsToLearn;
          this.selectedSkills = [...this.identifiedSkills];
          this.skillDetailsForm.patchValue({ skills: this.selectedSkills });
        } else if (response.skills) {
          // Fallback for backward compatibility
          this.identifiedSkills = response.skills;
          this.selectedSkills = [...this.identifiedSkills];
          this.skillDetailsForm.patchValue({ skills: this.selectedSkills });
        }
        
        // Pre-fill forms with extracted data
        this.formData = { ...this.formData, ...response };
        
        // Patch forms with the received data
        if (response.personalInfo) {
          this.basicProfileForm.patchValue(response.personalInfo);
        }
        
        if (response.learningGoals) {
          this.learningGoalsForm.patchValue(response.learningGoals);
        }
        
        if (response.background) {
          this.backgroundForm.patchValue(response.background);
        }
        
        // Move to the next step after successful analysis
        this.nextStep();
      },
      error: (error) => {
        console.error('Error analyzing resume:', error);
        this.isAnalyzing = false;
        // Handle error - maybe show a message to the user
      }
    });
  }

  // Skill selection methods
  private _filterSkills(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableSkills.filter(skill => 
      skill.toLowerCase().includes(filterValue) && 
      !this.selectedSkills.includes(skill)
    );
  }
  
  /**
   * Get tooltip text for a specific step
   */
  getStepTooltip(stepIndex: number): string {
    return this.stepTooltips[stepIndex] || '';
  }
  
  /**
   * Detect user's theme preference
   */
  detectTheme(): void {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkTheme = prefersDark;
    
    // Listen for changes in theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.isDarkTheme = event.matches;
    });
  }
  
  /**
   * Close the onboarding component
   */
  closeOnboarding(): void {
    // Navigate away or emit an event to parent component
    this.router.navigate(['/dashboard']);
  }
  
  /**
   * Start the onboarding process
   */
  startOnboarding(): void {
    this.currentStep = 1;
  }

  addSkill(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.viewValue;
    if (skill && !this.selectedSkills.includes(skill)) {
      this.selectedSkills.push(skill);
      this.skillCtrl.setValue('');
      this.skillDetailsForm.patchValue({ skills: this.selectedSkills });
    }
  }

  removeSkill(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index >= 0) {
      this.selectedSkills.splice(index, 1);
      this.skillDetailsForm.patchValue({ skills: this.selectedSkills });
    }
  }

  // Validation methods
  isSkillInputValid(): boolean {
    if (this.selectedInputMethod === 'manual') {
      return this.selectedSkills.length > 0;
    } else if (this.selectedInputMethod === 'resume') {
      return this.resumeAnalysisComplete && this.identifiedSkills.length > 0;
    }
    return false;
  }

  // Submit onboarding data
  submitOnboarding(): void {
    // Save the final step data
    this.saveCurrentStep();
    
    this.isSubmitting = true;

    // Submit to the service
    this.onboardingService.completeOnboarding(this.formData as OnboardingData).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Navigate to dashboard or next page
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error submitting onboarding data:', error);
        this.isSubmitting = false;
        // Handle error
      }
    });
  }
}
