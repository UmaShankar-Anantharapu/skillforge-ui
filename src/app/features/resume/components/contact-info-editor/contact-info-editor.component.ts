import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonalInfo } from '../../models/resume.model';

@Component({
  selector: 'app-contact-info-editor',
  templateUrl: './contact-info-editor.component.html',
  styleUrls: ['./contact-info-editor.component.scss']
})
export class ContactInfoEditorComponent implements OnInit {
  @Input() personalInfo?: PersonalInfo;
  @Output() personalInfoChange = new EventEmitter<PersonalInfo>();
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();

  contactForm!: FormGroup;
  countries: string[] = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Netherlands', 'Sweden', 'India', 'Singapore', 'Japan',
    'South Korea', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Other'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscription();
  }

  private initializeForm(): void {
    // Parse fullName into firstName and lastName for form editing
    const nameParts = this.personalInfo?.fullName?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.contactForm = this.fb.group({
      firstName: [firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.personalInfo?.email || '', [Validators.required, Validators.email]],
      phone: [this.personalInfo?.phone || '', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      location: [this.personalInfo?.location || '', Validators.required],
      linkedIn: [this.personalInfo?.linkedIn || '', [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.+/)]],
      github: [this.personalInfo?.github || '', [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.+/)]],
      portfolio: [this.personalInfo?.portfolio || '', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  private setupFormSubscription(): void {
    this.contactForm.valueChanges.subscribe(value => {
      if (this.contactForm.valid) {
        const personalInfo: PersonalInfo = {
          fullName: `${value.firstName} ${value.lastName}`.trim(),
          email: value.email,
          phone: value.phone,
          location: value.location,
          linkedIn: value.linkedIn || '',
          github: value.github || '',
          portfolio: value.portfolio || ''
        };
        this.personalInfoChange.emit(personalInfo);
      }
    });
  }

  onNext(): void {
    if (this.contactForm.valid) {
      this.nextStep.emit();
    } else {
      this.markFormGroupTouched();
    }
  }

  onPrevious(): void {
    this.previousStep.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            control.get(nestedKey)?.markAsTouched();
          });
        }
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return this.getPatternError(fieldName);
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  // Removed getNestedFieldError as location is now a simple string field

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      linkedIn: 'LinkedIn',
      github: 'GitHub',
      portfolio: 'Portfolio'
    };
    return labels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    const patternErrors: { [key: string]: string } = {
      phone: 'Please enter a valid phone number',
      linkedIn: 'Please enter a valid LinkedIn profile URL',
      github: 'Please enter a valid GitHub profile URL',
      portfolio: 'Please enter a valid portfolio URL (starting with http:// or https://)'
    };
    return patternErrors[fieldName] || 'Please enter a valid format';
  }

  get isFormValid(): boolean {
    return this.contactForm.valid;
  }

  get completionPercentage(): number {
    const totalFields = 5; // Required fields: firstName, lastName, email, phone, location
    const optionalFields = 3; // linkedIn, github, portfolio
    
    let completedRequired = 0;
    let completedOptional = 0;

    // Check required fields
    if (this.contactForm.get('firstName')?.valid) completedRequired++;
    if (this.contactForm.get('lastName')?.valid) completedRequired++;
    if (this.contactForm.get('email')?.valid) completedRequired++;
    if (this.contactForm.get('phone')?.valid) completedRequired++;
    if (this.contactForm.get('location')?.valid) completedRequired++;

    // Check optional fields
    if (this.contactForm.get('linkedIn')?.value) completedOptional++;
    if (this.contactForm.get('github')?.value) completedOptional++;
    if (this.contactForm.get('portfolio')?.value) completedOptional++;

    // Weight required fields more heavily (70%) vs optional fields (30%)
    const requiredScore = (completedRequired / totalFields) * 70;
    const optionalScore = (completedOptional / optionalFields) * 30;
    
    return Math.round(requiredScore + optionalScore);
  }
}