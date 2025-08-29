import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { OnboardingService } from '../../../../core/services/onboarding.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loading = false;
  public showPassword = false;
  public isDarkTheme = false;
  public loginError: string | null = null;
  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly onboardingService: OnboardingService,
  ) {
    // Check current theme
    this.isDarkTheme = document.documentElement.getAttribute('data-theme') !== 'light';
  }

  public toggleTheme(): void {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    this.isDarkTheme = !isLight;
  }

  public onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.getRawValue();
    this.auth.login(value as any).subscribe({
      next: () => {
        this.loading = false;
        this.checkOnboardingAndRedirect();
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }

  private checkOnboardingAndRedirect(): void {
    this.onboardingService.needsOnboarding().subscribe({
      next: (needsOnboarding) => {
        if (needsOnboarding) {
          // Show notification about incomplete onboarding
          this.showOnboardingNotification();
          this.router.navigate(['/dashboard']);
        } else {
          // Onboarding complete, go to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        // If onboarding check fails, just go to dashboard
        console.error('Onboarding check failed:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private showOnboardingNotification(): void {
    // Create and show a notification popup
    const notification = document.createElement('div');
    notification.className = 'onboarding-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <span class="notification-icon">🚀</span>
          <h3>Complete Your Profile Setup</h3>
          <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
        </div>
        <p>Finish setting up your personalized learning journey to unlock all features.</p>
        <div class="notification-actions">
          <button class="btn-primary" onclick="window.location.href='/onboarding'">Get Started</button>
          <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .onboarding-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid #e1e5e9;
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
      }
      
      .notification-content {
        padding: 20px;
      }
      
      .notification-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      
      .notification-icon {
        font-size: 24px;
      }
      
      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        flex: 1;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #a0aec0;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .notification-close:hover {
        color: #718096;
      }
      
      .onboarding-notification p {
        margin: 0 0 16px 0;
        color: #4a5568;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .notification-actions {
        display: flex;
        gap: 8px;
      }
      
      .notification-actions .btn-primary {
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .notification-actions .btn-primary:hover {
        background: #5a67d8;
      }
      
      .notification-actions .btn-secondary {
        background: #f7fafc;
        color: #4a5568;
        border: 1px solid #e2e8f0;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .notification-actions .btn-secondary:hover {
        background: #edf2f7;
        border-color: #cbd5e0;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      [data-theme="dark"] .onboarding-notification {
        background: #2d3748;
        border-color: #4a5568;
      }
      
      [data-theme="dark"] .notification-header h3 {
        color: #f7fafc;
      }
      
      [data-theme="dark"] .onboarding-notification p {
        color: #cbd5e0;
      }
      
      [data-theme="dark"] .notification-actions .btn-secondary {
        background: #4a5568;
        color: #f7fafc;
        border-color: #718096;
      }
      
      [data-theme="dark"] .notification-actions .btn-secondary:hover {
        background: #718096;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
      if (style.parentNode) {
        style.remove();
      }
    }, 10000);
  }
}
