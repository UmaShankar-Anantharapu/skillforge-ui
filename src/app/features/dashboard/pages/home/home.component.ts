import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService, UserProfile } from '../../../../core/services/profile.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { RecommendationsService, Recommendation } from '../../../../core/services/recommendations.service';
import { BadgesService, UserBadge } from '../../../../core/services/badges.service';
import { LeaderboardService, LeaderRow } from '../../../../core/services/leaderboard.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="sf-container">
      <div class="grid grid-3">
        <div class="sf-card" style="grid-column:1/-1">
          <h2>Welcome{{ user ? (', ' + user.name) : '' }}</h2>
          <p class="sub">Keep up your daily streak and reach your goal</p>
        </div>

        <div class="sf-card">
          <h3>Profile</h3>
          <ng-container *ngIf="profile; else noProfile">
            <ul>
              <li><strong>Skill:</strong> {{ profile.skill }}</li>
              <li><strong>Level:</strong> {{ profile.level }}</li>
              <li><strong>Daily:</strong> {{ profile.dailyTime }} mins</li>
              <li><strong>Goal:</strong> {{ profile.goal }}</li>
            </ul>
          </ng-container>
          <ng-template #noProfile>
            <p>Complete your <a class="sf-link" routerLink="/onboarding">onboarding</a>.</p>
          </ng-template>
        </div>

        <div class="sf-card">
          <h3>Progress</h3>
          <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; height: 12px;">
            <div [style.width.%]="progressPercent" style="background: var(--sf-accent); height: 100%;"></div>
          </div>
          <p style="margin-top:8px;">{{ progressPercent }}% completed • Streak: {{ streakDays }} days</p>
        </div>

        <div class="sf-card">
          <h3>Actions</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a class="sf-btn" routerLink="/roadmap">View Roadmap</a>
            <a class="sf-btn" routerLink="/lesson/angular-1">Today's Lesson</a>
            <a class="sf-btn" routerLink="/challenges">Challenges</a>
          </div>
        </div>
        
        <div class="sf-card">
          <h3>Gamification</h3>
          <div *ngIf="leaderboardPosition" class="leaderboard-position">
            <p><strong>Rank:</strong> #{{ leaderboardPosition.rank }}</p>
            <p><strong>Points:</strong> {{ leaderboardPosition.points }}</p>
            <a class="sf-link" routerLink="/leaderboard">View Leaderboard</a>
          </div>
          <div *ngIf="!leaderboardPosition" class="leaderboard-position">
            <p>Complete lessons to earn points and appear on the leaderboard!</p>
          </div>
        </div>
        
        <div class="sf-card">
          <h3>Recent Badges</h3>
          <div *ngIf="recentBadges.length; else noBadges" class="badges-container">
            <div *ngFor="let badge of recentBadges" class="badge-item">
              <div class="badge-icon">🏆</div>
              <div class="badge-details">
                <strong>{{ badge.name }}</strong>
                <p>{{ badge.description }}</p>
                <small>{{ badge.earnedAt | date:'shortDate' }}</small>
              </div>
            </div>
            <a class="sf-link" routerLink="/badges">View All Badges</a>
          </div>
          <ng-template #noBadges>
            <p>Complete lessons and challenges to earn badges!</p>
          </ng-template>
        </div>

        <div class="sf-card" *ngIf="recommendations.length">
          <h3>Recommendations</h3>
          <ul>
            <li *ngFor="let r of recommendations">{{ r.message }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: `
    .leaderboard-position {
      margin-top: 8px;
    }
    .badges-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .badge-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
    }
    .badge-icon {
      font-size: 24px;
      min-width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
    }
    .badge-details {
      flex: 1;
    }
    .badge-details p {
      margin: 4px 0;
      font-size: 14px;
    }
    .badge-details small {
      color: var(--sf-text-secondary);
    }
  `
})
export class HomeComponent implements OnInit {
  public user: { id: string; name: string; email: string } | null = null;
  public profile: UserProfile | null = null;
  public progressPercent = 0;
  public streakDays = 0;
  public recommendations: Recommendation[] = [];
  public recentBadges: UserBadge[] = [];
  public leaderboardPosition: LeaderRow | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly profileService: ProfileService,
    private readonly progressService: ProgressService,
    private readonly recsService: RecommendationsService,
    private readonly badgesService: BadgesService,
    private readonly leaderboardService: LeaderboardService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUser();
    const id = this.user?.id;
    if (!id) return;
    this.profileService.getProfile(id).subscribe({
      next: (res) => { this.profile = res.profile; },
      error: () => { this.profile = null; },
    });

    // Load progress summary (very simple % completed over seeded lessons)
    this.progressService.list().subscribe({
      next: (res) => {
        const completed = res.progress.filter(p => p.status === 'completed').length;
        const total = Math.max(completed, 7); // placeholder denominator
        this.progressPercent = Math.round((completed / total) * 100);
        this.streakDays = completed; // naive streak placeholder
      }
    });

    this.recsService.list().subscribe({
      next: (res) => { this.recommendations = res.recommendations; }
    });
    
    // Load recent badges
    this.badgesService.list().subscribe({
      next: (res) => {
        // Sort badges by earned date (newest first) and take the 3 most recent
        this.recentBadges = res.badges
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, 3);
      }
    });
    
    // Load leaderboard position
    this.leaderboardService.fetch().subscribe({
      next: (res) => {
        if (id) {
          this.leaderboardPosition = res.leaderboard.find(row => row.userId === id) || null;
        }
      }
    });
  }
}
