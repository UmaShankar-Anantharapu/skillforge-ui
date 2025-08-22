import { Component, OnInit } from '@angular/core';
import { ChallengesService, Challenge } from '../../core/services/challenges.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-challenges-page',
  template: `
    <div class="sf-container">
      <div class="sf-card" style="display:flex;justify-content:space-between;align-items:center;">
        <h2>Challenges</h2>
      </div>
      <div class="grid grid-2" style="margin-top:16px;">
        <div class="sf-card" *ngFor="let c of challenges">
          <h3>{{ c.title }}</h3>
          <p>{{ c.description }}</p>
          <p><strong>{{ c.points }}</strong> pts • {{ c.duration }} days</p>
          
          <div *ngIf="c.joined" class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="c.progress || 0"></div>
            </div>
            <p>Progress: {{ c.progress || 0 }}%</p>
            
            <div class="progress-controls">
              <button class="sf-btn sf-btn-small" (click)="updateProgress(c.id, 25)" [disabled]="loading">25%</button>
              <button class="sf-btn sf-btn-small" (click)="updateProgress(c.id, 50)" [disabled]="loading">50%</button>
              <button class="sf-btn sf-btn-small" (click)="updateProgress(c.id, 75)" [disabled]="loading">75%</button>
              <button class="sf-btn sf-btn-small" (click)="updateProgress(c.id, 100)" [disabled]="loading">Complete!</button>
            </div>
          </div>
          
          <button *ngIf="!c.joined" class="sf-btn" (click)="join(c.id)" [disabled]="loading">Join</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .progress-container {
      margin-top: 12px;
    }
    .progress-bar {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .progress-fill {
      height: 100%;
      background-color: #4caf50;
      transition: width 0.3s ease;
    }
    .progress-controls {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .sf-btn-small {
      padding: 4px 8px;
      font-size: 12px;
    }
  `
})
export class ChallengesPageComponent implements OnInit {
  public challenges: Challenge[] = [];
  public loading = false;

  constructor(
    private readonly svc: ChallengesService,
    private readonly toast: ToastService
  ) {}

  ngOnInit(): void {
    this.svc.list().subscribe({ next: (res) => (this.challenges = res.challenges) });
  }

  join(id: string): void {
    if (this.loading) return;
    this.loading = true;
    this.svc.join(id).subscribe({
      next: (res) => { 
        this.loading = false; 
        this.toast.show('Successfully joined challenge!', 'success');
        
        // Update the challenge in the list
        this.challenges = this.challenges.map(c => {
          if (c.id === id) {
            return { ...c, joined: true, progress: 0 };
          }
          return c;
        });
      },
      error: () => { 
        this.loading = false; 
        this.toast.show('Failed to join challenge', 'error');
      },
    });
  }
  
  updateProgress(id: string, progress: number): void {
    if (this.loading) return;
    this.loading = true;
    
    this.svc.updateProgress(id, progress).subscribe({
      next: () => {
        this.loading = false;
        
        // Update the challenge in the list
        this.challenges = this.challenges.map(c => {
          if (c.id === id) {
            return { ...c, progress };
          }
          return c;
        });
        
        if (progress === 100) {
          this.toast.show('Challenge completed! Points awarded!', 'success');
        } else {
          this.toast.show(`Progress updated to ${progress}%`, 'success');
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to update progress', 'error');
      }
    });
  }
}


