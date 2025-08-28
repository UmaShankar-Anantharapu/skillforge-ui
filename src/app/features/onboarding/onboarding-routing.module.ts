import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingPageComponent
  }
];

// Note: get-started route removed - redirecting directly to onboarding flow

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingRoutingModule {}
