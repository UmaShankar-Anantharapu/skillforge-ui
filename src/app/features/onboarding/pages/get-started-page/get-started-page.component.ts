import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { AuthService } from '@app/core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-get-started-page',
  templateUrl: './get-started-page.component.html',
  styleUrls: ['./get-started-page.component.scss']
})
export class GetStartedPageComponent implements OnInit {
  private destroy$ = new Subject<void>();
  
  isLoading = false;
  error: string | null = null;
  userProfile: any = null;

  constructor(
    private router: Router,
    private onboardingService: OnboardingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkOnboardingStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkOnboardingStatus(): void {
    this.onboardingService.getOnboardingStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          if (status.isComplete) {
            // If onboarding is already complete, redirect to dashboard
            this.router.navigate(['/dashboard']);
          }
          // Otherwise, stay on Get Started page
        },
        error: (err) => {
          console.error('Error checking onboarding status:', err);
          // Continue to show Get Started page even if status check fails
        }
      });
  }

  startOnboarding(): void {
    this.isLoading = true;
    this.error = null;

    this.onboardingService.startOnboarding()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigate to onboarding flow
          this.router.navigate(['/onboarding']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to start onboarding. Please try again.';
          console.error('Error starting onboarding:', err);
        }
      });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}