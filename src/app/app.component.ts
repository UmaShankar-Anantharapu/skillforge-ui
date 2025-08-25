import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Toast, ToastService } from './core/services/toast.service';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';
import { OnboardingService } from './core/services/onboarding.service';
import { overlayFadeScale } from './shared/animations/animations';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [overlayFadeScale]
})
export class AppComponent implements OnInit {
  title = 'skillforge-ui';
  toasts: Toast[] = [];
  currentRoute = '';
  overlayOpen = false;

  constructor(
    private readonly toastSvc: ToastService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly onboardingService: OnboardingService,
    private readonly themeService: ThemeService
  ) {
    this.toastSvc.stream.subscribe((t) => {
      this.toasts = [...this.toasts, t];
      setTimeout(() => { this.toasts = this.toasts.slice(1); }, 2500);
    });

    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  shouldShowHeader(): boolean {
    // Hide header on landing page and auth pages
    return !['/', '/auth/login', '/auth/signup'].includes(this.currentRoute);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    this.checkOnboardingStatus();
    this.onboardingService.overlayOpen$.subscribe(open => this.overlayOpen = open);
  }

  closeOnboardingOverlay(): void {
    const confirmClose = confirm('Are you sure you want to close onboarding? Your progress is saved and you can continue later.');
    if (confirmClose) {
      this.onboardingService.closeOverlay();
    }
  }

  private checkOnboardingStatus(): void {
    // Only check onboarding status if user is logged in
    const user = this.authService.getUser();
    if (user) {
      this.profileService.getProfile(user.id).subscribe(profileData => {
        // Check if profile exists but onboarding is incomplete
        const profile = profileData.profile;
        if (profile && (!profile.onboardingComplete) && profile.onboardingStep > 0) {
          // Only show notification if user has started onboarding but not completed it
          this.notificationService.showProfileUpdateNotification();
        }
      });
    }
  }
}
