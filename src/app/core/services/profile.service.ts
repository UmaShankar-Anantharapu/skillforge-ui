import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfile {
  userId: string;
  skill: string;
  level: string;
  dailyTime: number;
  goal: string;
  onboardingStep?: number;
  onboardingComplete?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly api: ApiService) {}

  public upsertProfile(profile: Omit<UserProfile, 'userId'>): Observable<{ profile: UserProfile }> {
    return this.api.post<{ profile: UserProfile }>(`/profile`, profile);
  }

  public getProfile(userId: string): Observable<{ profile: UserProfile }> {
    return this.api.get<{ profile: UserProfile }>(`/profile/${userId}`);
  }
}


