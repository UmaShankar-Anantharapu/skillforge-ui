import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../../../core/services/onboarding.service';

@Component({
  selector: 'app-set-learning-goal',
  templateUrl: './set-learning-goal.component.html',
  styleUrls: ['./set-learning-goal.component.scss']
})
export class SetLearningGoalComponent implements OnInit {
  learningGoalForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.learningGoalForm = this.fb.group({
      skill: ['', Validators.required],
      level: ['', Validators.required],
      dailyTime: ['', [Validators.required, Validators.min(1)]],
      goal: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.learningGoalForm.valid) {
      this.onboardingService.setLearningGoal(this.learningGoalForm.value).subscribe({
        next: (response) => {
          console.log('Learning goal set successfully', response);
          this.router.navigate(['/onboarding/choose-focus']);
        },
        error: (error) => {
          console.error('Error setting learning goal', error);
          // Handle error, e.g., show a message to the user
        }
      });
    }
  }
}
