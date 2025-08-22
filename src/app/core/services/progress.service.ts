import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Progress {
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
  concept?: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  constructor(private readonly api: ApiService) {}

  public upsert(payload: Partial<Progress> & { lessonId: string }): Observable<{ progress: Progress }> {
    return this.api.post<{ progress: Progress }>(`/progress`, payload);
  }

  public list(lessonId?: string): Observable<{ progress: Progress[] }> {
    const qs = lessonId ? `?lessonId=${encodeURIComponent(lessonId)}` : '';
    return this.api.get<{ progress: Progress[] }>(`/progress${qs}`);
  }
}


