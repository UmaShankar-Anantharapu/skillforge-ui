import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/shared/material.module';

import { OnboardingRoutingModule } from './onboarding-routing.module';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { SetLearningGoalComponent } from './pages/set-learning-goal/set-learning-goal/set-learning-goal.component';
import { ChooseFocusComponent } from './pages/choose-focus/choose-focus/choose-focus.component';
import { CustomizeLearningComponent } from './pages/customize-learning/customize-learning/customize-learning.component';
import { OnboardingLayoutComponent } from './components/onboarding-layout/onboarding-layout/onboarding-layout.component';
import { SkillAssessmentComponent } from './pages/skill-assessment/skill-assessment.component';
import { ResumeUploadComponent } from './pages/resume-upload/resume-upload.component';
import { SkillSelectionComponent } from './pages/skill-selection/skill-selection.component';
import { OnboardingStepperComponent } from './components/onboarding-stepper/onboarding-stepper.component';


@NgModule({
  declarations: [
    WelcomeComponent,
    SetLearningGoalComponent,
    ChooseFocusComponent,
    CustomizeLearningComponent,
    OnboardingLayoutComponent,
    SkillAssessmentComponent,
    ResumeUploadComponent,
    SkillSelectionComponent,
    OnboardingStepperComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OnboardingRoutingModule,
    MaterialModule
  ]
})
export class OnboardingModule { }
