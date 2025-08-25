import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetLearningGoalComponent } from './pages/set-learning-goal/set-learning-goal/set-learning-goal.component';
import { ChooseFocusComponent } from './pages/choose-focus/choose-focus/choose-focus.component';
import { CustomizeLearningComponent } from './pages/customize-learning/customize-learning/customize-learning.component';
import { OnboardingLayoutComponent } from './components/onboarding-layout/onboarding-layout/onboarding-layout.component';
import { SkillAssessmentComponent } from './pages/skill-assessment/skill-assessment.component';
import { ResumeUploadComponent } from './pages/resume-upload/resume-upload.component';
import { SkillSelectionComponent } from './pages/skill-selection/skill-selection.component';
import { OnboardingStepperComponent } from './components/onboarding-stepper/onboarding-stepper.component';

const routes: Routes = [
  { path: '', redirectTo: 'stepper', pathMatch: 'full' },
  {
    path: '',
    component: OnboardingLayoutComponent,
    children: [
      { path: 'stepper', component: OnboardingStepperComponent },
      // Keep old routes for backward compatibility
      { path: 'skill-assessment', component: SkillAssessmentComponent },
      { path: 'set-learning-goal', component: SetLearningGoalComponent },
      { path: 'choose-focus', component: ChooseFocusComponent },
      { path: 'customize-learning', component: CustomizeLearningComponent },
      { path: 'resume-upload', component: ResumeUploadComponent },
      { path: 'skill-selection', component: SkillSelectionComponent },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
