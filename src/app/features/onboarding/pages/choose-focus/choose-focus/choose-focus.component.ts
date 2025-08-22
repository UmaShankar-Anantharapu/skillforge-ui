import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../../../core/services/onboarding.service';

@Component({
  selector: 'app-choose-focus',
  templateUrl: './choose-focus.component.html',
  styleUrls: ['./choose-focus.component.scss']
})
export class ChooseFocusComponent implements OnInit {
  focusAreas = [
    'Frontend Development',
    'Backend Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Cloud Computing',
    'Cybersecurity',
    'Game Development'
  ];
  focusForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.focusForm = this.fb.group({
      selectedFocusAreas: this.fb.array([], Validators.required)
    });
  }

  onCheckboxChange(event: any): void {
    const selectedFocusAreas = (this.focusForm.controls['selectedFocusAreas'] as FormArray);
    if (event.target.checked) {
      selectedFocusAreas.push(new FormControl(event.target.value));
    } else {
      const index = selectedFocusAreas.controls.findIndex(x => x.value === event.target.value);
      selectedFocusAreas.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.focusForm.valid) {
      const learningGoal = this.focusForm.value.selectedFocusAreas;
      this.onboardingService.chooseFocus(learningGoal).subscribe({
        next: (response) => {
          console.log('Focus areas chosen successfully', response);
          this.router.navigate(['/onboarding/customize-learning']);
        },
        error: (error) => {
          console.error('Error choosing focus areas', error);
          // Handle error
        }
      });
    }
  }
}
