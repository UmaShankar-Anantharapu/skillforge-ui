import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding-layout',
  template: `
    <div class="onboarding-container">
      <router-outlet></router-outlet>
      <button class="skip-button">Skip Now</button>
    </div>
  `,
  styles: ``
})
export class OnboardingLayoutComponent {

}
