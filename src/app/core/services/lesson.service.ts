import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Lesson {
  lessonId: string;
  type: 'text' | 'quiz' | 'code';
  content: any;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  concepts?: string[];
}

@Injectable({ providedIn: 'root' })
export class LessonService {
  constructor(private readonly api: ApiService) {}

  public getLesson(id: string): Observable<{ lesson: Lesson }> {
    return this.api.get<{ lesson: Lesson }>(`/lesson/${id}`);
  }

  public generateLesson(payload: { topic: string; skill?: string; difficulty?: 'Beginner'|'Intermediate'|'Advanced'; day?: number }): Observable<{ lesson: Lesson }> {
    return this.api.post<{ lesson: Lesson }>(`/lesson/generate`, payload);
  }
}


