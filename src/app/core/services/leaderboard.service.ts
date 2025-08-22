import { Injectable } from '@angular/core';
import { Observable, timer, switchMap } from 'rxjs';
import { ApiService } from './api.service';

export interface LeaderRow { userId: string; name: string; points: number; rank: number }

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  constructor(private readonly api: ApiService) {}

  public fetch(): Observable<{ leaderboard: LeaderRow[] }> {
    return this.api.get<{ leaderboard: LeaderRow[] }>(`/leaderboard`);
  }

  public stream(intervalMs = 5000): Observable<{ leaderboard: LeaderRow[] }> {
    return timer(0, intervalMs).pipe(switchMap(() => this.fetch()));
  }
}


