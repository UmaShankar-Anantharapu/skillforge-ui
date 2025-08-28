import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  public loading = false;
  public showPassword = false;
  public isDarkTheme = false;
  public form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
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

  public getPasswordStrength(): string {
    const password = this.form.get('password')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'strong';
    return 'good';
  }

  public getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.getRawValue();
    this.auth.signup(value as any).subscribe({
      next: () => {
        this.loading = false;
        // Redirect new users to onboarding instead of dashboard
        // This ensures UserProfile is created before accessing other features
        this.router.navigate(['/onboarding']);
      },
      error: () => {
        this.loading = false;
        alert('Signup failed');
      },
    });
  }
}
