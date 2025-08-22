import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LeaderboardService, LeaderRow } from '../../core/services/leaderboard.service';

@Component({
  selector: 'app-leaderboard-page',
  template: `
    <div class="sf-container">
      <div class="sf-card" style="display:flex;justify-content:space-between;align-items:center;">
        <h2>Leaderboard</h2>
      </div>
      <div class="sf-card" style="margin-top:16px;">
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr><th style="text-align:left;">Rank</th><th style="text-align:left;">User</th><th style="text-align:right;">Points</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>{{ row.rank }}</td>
              <td>{{ row.name }}</td>
              <td style="text-align:right;">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: ``
})
export class LeaderboardPageComponent implements OnInit, OnDestroy {
  public rows: LeaderRow[] = [];
  private sub?: Subscription;

  constructor(private readonly svc: LeaderboardService) {}

  ngOnInit(): void {
    this.sub = this.svc.stream(5000).subscribe({ next: (res) => (this.rows = res.leaderboard) });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}


