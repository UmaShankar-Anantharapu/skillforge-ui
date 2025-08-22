import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Toast, ToastService } from './core/services/toast.service';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'skillforge-ui';
  toasts: Toast[] = [];
  currentRoute = '';

  constructor(
    private readonly toastSvc: ToastService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService
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
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
  }

  ngOnInit(): void {
    this.checkOnboardingStatus();
  }

  private checkOnboardingStatus(): void {
    // Only check onboarding status if user is logged in
    const user = this.authService.getUser();
    if (user) {
      this.profileService.getProfile(user.id).subscribe(profileData => {
        // Check if profile exists but onboarding is incomplete
        const profile = profileData.profile;
        if (profile && (!profile.onboardingComplete)) {
          this.notificationService.showProfileUpdateNotification();
        }
      });
    }
  }
}
