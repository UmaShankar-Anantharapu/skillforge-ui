import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isUserMenuOpen = false;
  hasUnreadNotifications = false;
  isNotificationsOpen = false;
  currentTheme: 'light' | 'dark' = 'light';
  private notificationSubscription: Subscription;
  private themeSubscription: Subscription;

  constructor(
    private themeService: ThemeService, 
    private router: Router, 
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser() {
    return this.authService.getUser();
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  closeNotifications(): void {
    this.isNotificationsOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  signOut() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const notificationContainer = target.closest('.notification-container');
    
    if (!notificationContainer && this.isNotificationsOpen) {
      this.closeNotifications();
    }
  }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notifications => {
      this.hasUnreadNotifications = notifications.length > 0;
    });
    
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}