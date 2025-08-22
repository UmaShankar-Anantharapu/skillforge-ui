import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Recommendation { message: string; topic: string }

@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  constructor(private readonly api: ApiService) {}

  public list(): Observable<{ recommendations: Recommendation[] }> {
    return this.api.get<{ recommendations: Recommendation[] }>(`/roadmap/recommendations/list`);
  }
}


