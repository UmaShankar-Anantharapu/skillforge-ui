import { Component, OnInit } from '@angular/core';
import { BadgesService, UserBadge } from '../../core/services/badges.service';

@Component({
  selector: 'app-badges-page',
  template: `
    <div class="sf-container">
      <div class="sf-card">
        <h2>Badges</h2>
        <div *ngIf="badges.length; else empty" class="grid grid-3" style="margin-top:16px;">
          <div class="sf-card" *ngFor="let b of badges">
            <strong>{{ b.name }}</strong>
            <p>{{ b.description }}</p>
            <small>{{ b.earnedAt | date:'medium' }}</small>
          </div>
        </div>
        <ng-template #empty>
          <p>No badges yet. Complete lessons and join challenges to earn badges.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: ``
})
export class BadgesPageComponent implements OnInit {
  public badges: UserBadge[] = [];
  constructor(private readonly svc: BadgesService) {}
  ngOnInit(): void { this.svc.list().subscribe({ next: (r) => (this.badges = r.badges) }); }
}


