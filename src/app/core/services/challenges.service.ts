import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Challenge { id: string; title: string; description: string; points: number; duration: number; joined?: boolean; progress?: number }

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  constructor(private readonly api: ApiService) {}

  public list(): Observable<{ challenges: Challenge[] }> {
    return this.api.get<{ challenges: Challenge[] }>(`/challenge`);
  }

  public join(id: string): Observable<{ challenge: Challenge }> {
    return this.api.post<{ challenge: Challenge }>(`/challenge/join`, { id });
  }

  public updateProgress(id: string, progress: number): Observable<{ userChallenge: any }> {
    return this.api.post<{ userChallenge: any }>(`/challenges/progress`, { id, progress });
  }
}


