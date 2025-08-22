import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="sf-container">
      <div class="sf-card">
        <h2>Tell us about your goal</h2>
        <p class="sub">We’ll craft a 7‑day plan to get you started</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-2" novalidate>
          <div>
            <label for="skill">Skill</label>
            <input id="skill" class="sf-input" formControlName="skill" type="text" placeholder="Angular, Leadership..." />
          </div>
          <div>
            <label for="level">Level</label>
            <select id="level" class="sf-input" formControlName="level">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label for="daily">Daily Time (minutes)</label>
            <input id="daily" class="sf-input" formControlName="dailyTime" type="number" min="1" />
          </div>
          <div>
            <label for="goal">Goal</label>
            <textarea id="goal" class="sf-input" formControlName="goal" rows="3" placeholder="Build a project, interview prep..."></textarea>
          </div>
          <div style="grid-column: 1/-1; display:flex; gap:12px;">
            <button class="sf-btn" type="submit" [disabled]="form.invalid || loading">Save</button>
            <a routerLink="/roadmap" class="sf-link">Skip for now</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class WelcomeComponent {
  public loading = false;
  public form = this.fb.group({
    skill: ['', [Validators.required]],
    level: ['Beginner', [Validators.required]],
    dailyTime: [30, [Validators.required, Validators.min(1)]],
    goal: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profile: ProfileService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  public onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.getRawValue();
    this.profile.upsertProfile(value as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        alert('Failed to save profile');
      }
    });
  }
}
