import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OnboardingStep, OnboardingConfig } from '../../models/onboarding.models';
import { OnboardingService } from '@app/core/services/onboarding.service';

interface SkillEntry {
  coreSkillQuery: string;
  coreSkillSuggestions: string[];
  showCoreSkillDropdown: boolean;
  selectedCoreSkill: string;
  proficiencyQuery: string;
  proficiencySuggestions: string[];
  showProficiencyDropdown: boolean;
  selectedProficiency: string;
}

interface CareerEntry {
  company: string;
  position: string;
  yearsOfExperience: number | null;
  skillsWorkedOn: string[];
  skillsInput: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

@Component({
  selector: 'app-step-renderer',
  templateUrl: './step-renderer.component.html',
  styleUrls: ['./step-renderer.component.scss']
})
export class StepRendererComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() stepData: OnboardingStep | null = null;
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() config: OnboardingConfig | null = null;
  @Input() sessionId: string = '';
  @Input() currentStep: number = 0;
  @Input() steps: Array<{title: string, subtitle: string}> = [];
  @Input() collectedData: any = {};

  @Output() formValid = new EventEmitter<boolean>();
  @Output() startOnboarding = new EventEmitter<'manual' | 'resume'>();

  // Component state
  loading = false;
  skillSuggestions: any[] = [];

  // Step 1: Indian languages typeahead
  languages: string[] = [
    'Hindi','Bengali','Marathi','Telugu','Tamil','Gujarati','Kannada','Malayalam','Odia','Punjabi',
    'Assamese','Urdu','Sanskrit','Maithili','Konkani','Sindhi','Kashmiri','Bodo','Dogri','Manipuri','Santali','Nepali'
  ];
  languageQuery = '';
  languageSuggestions: string[] = [];
  showLangDropdown = false;

  // Step 2: Core skills and proficiency typeahead
  proficiencyLevels: string[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  // Dynamic skill entries
  skillEntries: SkillEntry[] = [];
  careerEntries: CareerEntry[] = [];
  
  // Legacy properties for backward compatibility
  coreSkillQuery = '';
  coreSkillSuggestions: string[] = [];
  showCoreSkillDropdown = false;
  selectedCoreSkill = '';
  proficiencyQuery = '';
  proficiencySuggestions: string[] = [];
  showProficiencyDropdown = false;
  selectedProficiency = '';
  generatingSubSkills = false;

  onLanguageInput(value: string): void {
    this.languageQuery = value;
    const q = value.trim().toLowerCase();
    const selected = new Set<string>((this.formGroup.get('preferredLanguages')?.value || []) as string[]);
    this.languageSuggestions = q
      ? this.languages.filter(l => l.toLowerCase().includes(q) && !selected.has(l))
      : this.languages.filter(l => !selected.has(l));
    this.showLangDropdown = this.languageSuggestions.length > 0;
  }
  addLanguage(lang: string): void {
    const control = this.formGroup.get('preferredLanguages');
    const current: string[] = (control?.value || []) as string[];
    const next = Array.from(new Set([...current, lang]));
    control?.setValue(next);
    control?.markAsTouched();
    control?.updateValueAndValidity();
    this.languageQuery = '';
    this.languageSuggestions = this.languages.filter(l => !next.includes(l));
    this.showLangDropdown = false;
  }
  removeLanguage(lang: string): void {
    const control = this.formGroup.get('preferredLanguages');
    const current: string[] = (control?.value || []) as string[];
    const next = current.filter(l => l !== lang);
    control?.setValue(next);
    control?.markAsTouched();
    control?.updateValueAndValidity();
    this.languageSuggestions = this.languages.filter(l => !next.includes(l));
  }

  // Dynamic skill entries management
  addNewSkillEntry(): void {
    this.skillEntries.push(this.createEmptySkillEntry());
  }

  removeSkillEntry(index: number): void {
    if (this.skillEntries.length > 1) {
      this.skillEntries.splice(index, 1);
    }
  }

  trackBySkillEntry(index: number, entry: SkillEntry): number {
    return index;
  }

  trackByCareerEntry(index: number, entry: CareerEntry): number {
    return index;
  }

  initializeCareerEntries() {
    if (this.careerEntries.length === 0) {
      this.careerEntries = [this.createEmptyCareerEntry()];
    }
  }

  createEmptyCareerEntry(): CareerEntry {
    return {
      company: '',
      position: '',
      yearsOfExperience: null,
      skillsWorkedOn: [],
      skillsInput: '',
      isCurrent: false,
      description: ''
    };
  }

  addNewCareerEntry(): void {
    this.careerEntries.push(this.createEmptyCareerEntry());
  }

  removeCareerEntry(index: number): void {
    if (this.careerEntries.length > 1) {
      this.careerEntries.splice(index, 1);
      this.updateCareerBackground();
    }
  }

  updateCareerBackground(): void {
    const careerBackground = this.careerEntries
      .filter(entry => entry.company && entry.position)
      .map(entry => ({
        company: entry.company,
        position: entry.position,
        yearsOfExperience: entry.yearsOfExperience || 0,
        skillsWorkedOn: entry.skillsWorkedOn,
        startDate: entry.startDate,
        endDate: entry.isCurrent ? undefined : entry.endDate,
        isCurrent: entry.isCurrent,
        description: entry.description
      }));
    
    this.formGroup.patchValue({ careerBackground });
  }

  addSkillToEntry(entryIndex: number, event: any): void {
    // Prevent form submission on Enter key
    if (event.type === 'keydown' && event.key === 'Enter') {
      event.preventDefault();
    }
    
    const input = event.target.value.trim();
    if (input && input.length > 0) {
      // Check if skill already exists
      if (!this.careerEntries[entryIndex].skillsWorkedOn.includes(input)) {
        this.careerEntries[entryIndex].skillsWorkedOn.push(input);
        this.updateCareerBackground();
      }
      // Clear the input field
      this.careerEntries[entryIndex].skillsInput = '';
      event.target.value = '';
    }
  }

  removeSkillFromEntry(entryIndex: number, skillIndex: number): void {
    this.careerEntries[entryIndex].skillsWorkedOn.splice(skillIndex, 1);
    this.updateCareerBackground();
  }

  removeExperience(experience: any): void {
    const currentBackground = this.formGroup.get('careerBackground')?.value || [];
    const updatedBackground = currentBackground.filter((exp: any) => 
      !(exp.company === experience.company && exp.position === experience.position)
    );
    this.formGroup.patchValue({ careerBackground: updatedBackground });
  }

  private createEmptySkillEntry(): SkillEntry {
    return {
      coreSkillQuery: '',
      coreSkillSuggestions: [],
      showCoreSkillDropdown: false,
      selectedCoreSkill: '',
      proficiencyQuery: '',
      proficiencySuggestions: [],
      showProficiencyDropdown: false,
      selectedProficiency: ''
    };
  }

  // Step 2: Core skill typeahead methods
  onCoreSkillInput(value: string, entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.coreSkillQuery = value;
      const q = value.trim().toLowerCase();
      entry.coreSkillSuggestions = q
        ? this.getCommonSkills().filter(skill => skill.toLowerCase().includes(q))
        : this.getCommonSkills();
      entry.showCoreSkillDropdown = entry.coreSkillSuggestions.length > 0 && !entry.selectedCoreSkill;
    } else {
      // Legacy support
      this.coreSkillQuery = value;
      const q = value.trim().toLowerCase();
      this.coreSkillSuggestions = q
        ? this.getCommonSkills().filter(skill => skill.toLowerCase().includes(q))
        : this.getCommonSkills();
      this.showCoreSkillDropdown = this.coreSkillSuggestions.length > 0 && !this.selectedCoreSkill;
    }
  }

  selectCoreSkill(skill: string, entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.selectedCoreSkill = skill;
      entry.coreSkillQuery = '';
      entry.showCoreSkillDropdown = false;
    } else {
      // Legacy support
      this.selectedCoreSkill = skill;
      this.coreSkillQuery = '';
      this.showCoreSkillDropdown = false;
    }
  }

  removeCoreSkill(entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.selectedCoreSkill = '';
      entry.coreSkillQuery = '';
      entry.selectedProficiency = '';
      entry.proficiencyQuery = '';
    } else {
      // Legacy support
      this.selectedCoreSkill = '';
      this.coreSkillQuery = '';
      this.selectedProficiency = '';
      this.proficiencyQuery = '';
    }
  }

  // Step 2: Proficiency typeahead methods
  onProficiencyInput(value: string, entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.proficiencyQuery = value;
      const q = value.trim().toLowerCase();
      entry.proficiencySuggestions = q
        ? this.proficiencyLevels.filter(level => level.toLowerCase().includes(q))
        : this.proficiencyLevels;
      entry.showProficiencyDropdown = entry.proficiencySuggestions.length > 0 && !entry.selectedProficiency;
    } else {
      // Legacy support
      this.proficiencyQuery = value;
      const q = value.trim().toLowerCase();
      this.proficiencySuggestions = q
        ? this.proficiencyLevels.filter(level => level.toLowerCase().includes(q))
        : this.proficiencyLevels;
      this.showProficiencyDropdown = this.proficiencySuggestions.length > 0 && !this.selectedProficiency;
    }
  }

  selectProficiency(level: string, entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.selectedProficiency = level;
      entry.proficiencyQuery = '';
      entry.showProficiencyDropdown = false;
    } else {
      // Legacy support
      this.selectedProficiency = level;
      this.proficiencyQuery = '';
      this.showProficiencyDropdown = false;
    }
  }

  removeProficiency(entryIndex?: number): void {
    if (entryIndex !== undefined && this.skillEntries[entryIndex]) {
      const entry = this.skillEntries[entryIndex];
      entry.selectedProficiency = '';
      entry.proficiencyQuery = '';
    } else {
      // Legacy support
      this.selectedProficiency = '';
      this.proficiencyQuery = '';
    }
  }



  isSubSkillSelected(skillName: string, subSkill: string): boolean {
    const currentSkills = (this.formGroup.get('currentSkills')?.value || []) as any[];
    const skill = currentSkills.find(s => s.skillName === skillName);
    return skill && skill.subSkills && skill.subSkills.includes(subSkill);
  }

  // Step 2: sub-skill suggestions
  subskillMap: Record<string, { prerequisites: string[]; subSkills: string[] }> = {};
  fetchingSubSkill: Record<string, boolean> = {};
  unfamiliarPrerequisites: Record<string, string[]> = {}; // skillName -> array of unfamiliar prerequisites

  async fetchSubSkills(skillName: string): Promise<void> {
    if (!skillName) return;
    if (this.subskillMap[skillName]) return; // cache
    this.fetchingSubSkill[skillName] = true;
    try {
      const resp = await this.onboardingService.getSubSkills({ skillName }).toPromise();
      const prereqs = resp.prerequisites || [];
      const subs = resp.subSkills || [];
      this.subskillMap[skillName] = { prerequisites: prereqs, subSkills: subs };
      // also attach prerequisites to the matching currentSkills entry so it persists
      const currentSkills = (this.formGroup.get('currentSkills')?.value || []) as any[];
      const idx = currentSkills.findIndex(s => s.skillName === skillName);
      if (idx >= 0) {
        const updated = [...currentSkills];
        updated[idx] = { ...updated[idx], prerequisites: prereqs };
        this.formGroup.patchValue({ currentSkills: updated });
      }
    } catch (e) {
      console.error('Failed to fetch sub-skills', e);
      this.subskillMap[skillName] = { prerequisites: [], subSkills: [] };
    } finally {
      this.fetchingSubSkill[skillName] = false;
    }
  }

  toggleSubSkill(skillName: string, sub: string, checked: boolean): void {
    const currentSkills = (this.formGroup.get('currentSkills')?.value || []) as any[];
    const idx = currentSkills.findIndex(s => s.skillName === skillName);
    if (idx < 0) return;
    const entry = { ...currentSkills[idx] };
    const selected: string[] = Array.isArray(entry.subSkills) ? entry.subSkills : [];
    entry.subSkills = checked
      ? Array.from(new Set([...(selected || []), sub]))
      : (selected || []).filter((x: string) => x !== sub);
    const updated = [...currentSkills];
    updated[idx] = entry;
    this.formGroup.patchValue({ currentSkills: updated });
  }


  constructor(private onboardingService: OnboardingService) {}

  ngOnInit(): void {
    this.setupFormValidation();
    this.loadStepSpecificData();
    
    // Initialize entries for Step 2
    if (this.currentStep === 2) {
      if (this.skillEntries.length === 0) {
        this.skillEntries.push(this.createEmptySkillEntry());
      }
      this.initializeCareerEntries();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormValidation(): void {
    // Watch form changes and emit validity
    this.formGroup.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.formValid.emit(status === 'VALID');
      });
  }

  private loadStepSpecificData(): void {
    const stepNumber = this.currentStep;

    // Load specific data based on step
    switch (stepNumber) {
      case 2:
        this.loadSkillSuggestions();
        break;
      case 4:
        this.loadSkillRequirements();
        break;
    }
  }

  private getCurrentStepNumber(): number {
    return this.currentStep;
  }

  private loadSkillSuggestions(): void {
    if (!this.config?.commonSkills) return;

    this.skillSuggestions = this.config.commonSkills.map(skill => ({
      skillName: skill,
      selected: false,
      proficiencyLevel: 'Beginner'
    }));
  }

  private loadSkillRequirements(): void {
    const currentSkills = this.formGroup.get('currentSkills')?.value || [];
    const primaryGoal = this.formGroup.get('primaryGoal')?.value;

    if (primaryGoal && currentSkills.length > 0) {
      this.loading = true;

      this.onboardingService.getSkillSuggestions({
        goal: primaryGoal,
        currentSkills: currentSkills,
        targetRole: this.formGroup.get('targetRole')?.value
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.skillSuggestions = response.suggestions || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load skill suggestions:', error);
          this.loading = false;
        }
      });
    }
  }

  // Step-specific methods
  isStep(stepNumber: number): boolean {
    return this.getCurrentStepNumber() === stepNumber;
  }

  getCountriesTimezones(): any[] {
    return this.config?.countriesTimezones || [];
  }

  getCommonSkills(): string[] {
    return this.config?.commonSkills || [];
  }

  // Skill management methods
  addSkill(skillName: string, proficiencyLevel: string = 'Beginner'): void {
    const currentSkills = this.formGroup.get('currentSkills')?.value || [];

    if (!currentSkills.find((skill: any) => skill.skillName === skillName)) {
      const newSkill = {
        skillName,
        proficiencyLevel,
        yearsOfExperience: 0,
        lastUsed: 'Currently using'
      };

      this.formGroup.patchValue({
        currentSkills: [...currentSkills, newSkill]
      });
    }
  }

  removeSkill(skillName: string): void {
    const currentSkills = this.formGroup.get('currentSkills')?.value || [];
    const filteredSkills = currentSkills.filter((skill: any) => skill.skillName !== skillName);

    this.formGroup.patchValue({
      currentSkills: filteredSkills
    });
  }

  updateSkillProficiency(skillName: string, proficiencyLevel: string): void {
    const currentSkills = this.formGroup.get('currentSkills')?.value || [];
    const updatedSkills = currentSkills.map((skill: any) =>
      skill.skillName === skillName
        ? { ...skill, proficiencyLevel }
        : skill
    );

    this.formGroup.patchValue({
      currentSkills: updatedSkills
    });
  }



  // Validation helpers
  isFieldRequired(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return control?.hasError('required') || false;
  }

  getFieldError(fieldName: string): string | null {
    const control = this.formGroup.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control?.hasError('min')) {
      return `Minimum value is ${control.errors?.['min'].min}`;
    }

    if (control?.hasError('max')) {
      return `Maximum value is ${control.errors?.['max'].max}`;
    }

    return null;
  }

  // Prerequisite management methods
   togglePrerequisiteUnfamiliarity(skillName: string, prerequisite: string): void {
     if (!this.unfamiliarPrerequisites[skillName]) {
       this.unfamiliarPrerequisites[skillName] = [];
     }

     const unfamiliarList = this.unfamiliarPrerequisites[skillName];
     const isCurrentlyUnfamiliar = unfamiliarList.includes(prerequisite);
     
     if (isCurrentlyUnfamiliar) {
       // Remove from unfamiliar list
       this.unfamiliarPrerequisites[skillName] = unfamiliarList.filter(p => p !== prerequisite);
     } else {
       // Add to unfamiliar list
       this.unfamiliarPrerequisites[skillName].push(prerequisite);
     }

     // Update the form data
     const currentSkills = this.formGroup.get('currentSkills')?.value || [];
     const skillIndex = currentSkills.findIndex((s: any) => s.skillName === skillName);
     
     if (skillIndex >= 0) {
       const updatedSkills = [...currentSkills];
       updatedSkills[skillIndex] = {
         ...updatedSkills[skillIndex],
         unfamiliarPrerequisites: this.unfamiliarPrerequisites[skillName]
       };
       
       this.formGroup.get('currentSkills')?.setValue(updatedSkills);
       this.formGroup.get('currentSkills')?.markAsTouched();
     }
   }

   isPrerequisiteUnfamiliar(skillName: string, prerequisite: string): boolean {
     const unfamiliarList = this.unfamiliarPrerequisites[skillName] || [];
     return unfamiliarList.includes(prerequisite);
   }

   getPrerequisites(skillName: string): string[] {
     return this.subskillMap[skillName]?.prerequisites || [];
   }

   getUnfamiliarPrerequisites(skillName: string): string[] {
    return this.unfamiliarPrerequisites[skillName] || [];
  }

  getSummaryData(stepKey: string): any {
    return this.collectedData[stepKey] || null;
  }
}