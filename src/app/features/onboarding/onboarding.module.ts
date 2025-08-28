import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@app/shared/material.module';

import { OnboardingRoutingModule } from './onboarding-routing.module';

// Components
import { OnboardingModalComponent } from './components/onboarding-modal/onboarding-modal.component';
import { StepRendererComponent } from './components/step-renderer/step-renderer.component';

// Pages
import { OnboardingPageComponent } from './pages/onboarding-page/onboarding-page.component';
import { GetStartedPageComponent } from './pages/get-started-page/get-started-page.component';

// Services
import { OnboardingModalService } from './services/onboarding-modal.service';

@NgModule({
  declarations: [
    OnboardingModalComponent,
    StepRendererComponent,
    OnboardingPageComponent,
    GetStartedPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OnboardingRoutingModule,
    MaterialModule
  ],
  providers: [
    OnboardingModalService
  ],
  exports: [
    OnboardingModalComponent,
    StepRendererComponent,
    OnboardingPageComponent,
    GetStartedPageComponent
  ]
})
export class OnboardingModule { }
