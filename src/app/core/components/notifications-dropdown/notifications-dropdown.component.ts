import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-dropdown',
  templateUrl: './notifications-dropdown.component.html',
  styleUrls: ['./notifications-dropdown.component.scss']
})
export class NotificationsDropdownComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  notifications: Notification[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

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

  dismissAll(): void {
    this.notificationService.dismissAll();
  }

  handlePrimaryAction(notification: Notification): void {
    if (notification.actions?.primary?.route) {
      // Handle route navigation if needed
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

  onClose(): void {
    this.close.emit();
  }
}