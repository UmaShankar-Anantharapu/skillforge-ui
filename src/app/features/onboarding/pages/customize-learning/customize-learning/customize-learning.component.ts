import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../../../core/services/onboarding.service';

@Component({
  selector: 'app-customize-learning',
  templateUrl: './customize-learning.component.html',
  styleUrls: ['./customize-learning.component.scss']
})
export class CustomizeLearningComponent implements OnInit {
  customizeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customizeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      occupation: [''],
      company: ['']
    });
  }

  onSubmit(): void {
    if (this.customizeForm.valid) {
      this.onboardingService.customizeProfile(this.customizeForm.value).subscribe({
        next: (response) => {
          console.log('Profile customized successfully', response);
          this.router.navigate(['/dashboard']); // Redirect to dashboard or home page
        },
        error: (error) => {
          console.error('Error customizing profile', error);
          // Handle error
        }
      });
    }
  }
}
