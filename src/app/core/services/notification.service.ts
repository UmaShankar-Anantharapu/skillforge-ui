import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OnboardingService } from './onboarding.service';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  dismissible: boolean;
  actions?: {
    primary?: { label: string; route?: string; callback?: () => void };
    secondary?: { label: string; callback?: () => void };
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor(private onboardingService: OnboardingService) {}

  /**
   * Show a notification
   * @param notification The notification to show
   * @returns The ID of the notification
   */
  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification = { ...notification, id };
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...currentNotifications, newNotification]);
    return id;
  }

  /**
   * Show a profile update notification
   * @returns The ID of the notification
   */
  showProfileUpdateNotification(): string {
    return this.show({
      message: 'Some of your profile information needs updating. Please update to continue enjoying full features.',
      type: 'warning',
      dismissible: true,
      actions: {
        primary: { label: 'Start Onboarding', callback: () => this.onboardingService.openOverlay() },
        secondary: { label: 'Remind Me Later', callback: () => {} }
      }
    });
  }

  /**
   * Dismiss a notification by ID
   * @param id The ID of the notification to dismiss
   */
  dismiss(id: string): void {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Generate a unique ID for a notification
   * @returns A unique ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}