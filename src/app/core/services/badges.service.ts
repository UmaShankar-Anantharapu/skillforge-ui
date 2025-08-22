import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserBadge { badgeId: string; name: string; description?: string; earnedAt: string }

@Injectable({ providedIn: 'root' })
export class BadgesService {
  constructor(private readonly api: ApiService) {}
  list(): Observable<{ badges: UserBadge[] }> { return this.api.get<{ badges: UserBadge[] }>(`/badges`); }
}


