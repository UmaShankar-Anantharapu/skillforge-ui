import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '@app/core/services/theme.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isUserMenuOpen = false;
  hasNotifications = false;
  private notificationSubscription: Subscription;

  constructor(
    private themeService: ThemeService, 
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  signOut() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.isUserMenuOpen = false; // Close menu after sign out
  }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notifications => {
      this.hasNotifications = notifications.length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
