import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-banner',
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss']
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismiss(notification: Notification): void {
    this.notificationService.dismiss(notification.id);
  }

  handlePrimaryAction(notification: Notification): void {
    if (notification.actions?.primary?.route) {
      this.router.navigate([notification.actions.primary.route]);
    } else if (notification.actions?.primary?.callback) {
      notification.actions.primary.callback();
    }
    this.dismiss(notification);
  }

  handleSecondaryAction(notification: Notification): void {
    if (notification.actions?.secondary?.callback) {
      notification.actions.secondary.callback();
    }
    this.dismiss(notification);
  }
}