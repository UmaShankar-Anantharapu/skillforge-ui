import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loading = false;
  public showPassword = false;
  public isDarkTheme = false;
  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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

  public onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.getRawValue();
    this.auth.login(value as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        alert('Login failed');
      },
    });
  }
}
