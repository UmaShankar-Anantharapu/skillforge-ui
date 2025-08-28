import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { OnboardingService } from './core/services/onboarding.service';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { NotificationBannerComponent } from './core/components/notification-banner/notification-banner.component';
import { NotificationsDropdownComponent } from './core/components/notifications-dropdown/notifications-dropdown.component';
import { ThemeService } from './core/services/theme.service';
import { NotificationService } from './core/services/notification.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NotificationBannerComponent,
    NotificationsDropdownComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    OnboardingService,
    ThemeService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
