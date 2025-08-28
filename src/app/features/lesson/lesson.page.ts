import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonService, Lesson } from '../../core/services/lesson.service';
import { ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-lesson-page',
  template: `
    <div *ngIf="lesson" class="sf-container">
      <div class="sf-card">
        <h2>{{ lesson.skill }} • {{ lesson.difficulty }}</h2>
        <ng-container [ngSwitch]="lesson.type">
          <div *ngSwitchCase="'text'">
            <h3>{{ lesson.content.title }}</h3>
            <p>{{ lesson.content.body }}</p>
          </div>
          <div *ngSwitchCase="'quiz'">
            <h3>Quiz</h3>
            <p>{{ lesson.content.question }}</p>
            <div class="grid">
              <label *ngFor="let opt of lesson.content.options; index as i" class="sf-card" style="padding:12px;">
                <input type="radio" name="ans" (change)="select(i)"> {{ opt }}
              </label>
            </div>
            <div style="margin-top:12px;">
              <button class="sf-btn" (click)="submitQuiz()">Submit</button>
            </div>
          </div>
          <div *ngSwitchCase="'code'">
            <p>Code lesson placeholder</p>
          </div>
        </ng-container>
        <div style="margin-top: 12px; display:flex; gap:12px;">
          <button class="sf-btn" (click)="markCompleted()">Mark Completed</button>
          <a routerLink="/skills" class="sf-link">Back to Skills</a>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class LessonPageComponent implements OnInit {
  public lesson: Lesson | null = null;
  private selectedIndex: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly lessons: LessonService,
    private readonly progress: ProgressService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.lessons.getLesson(id).subscribe({ next: (res) => (this.lesson = res.lesson) });
  }

  select(i: number): void { this.selectedIndex = i; }

  submitQuiz(): void {
    if (!this.lesson) return;
    const correct = typeof this.lesson.content?.answer === 'number' ? this.lesson.content.answer : -1;
    const score = this.selectedIndex === correct ? 100 : 0;
    const concept = Array.isArray(this.lesson.concepts) ? this.lesson.concepts[0] : undefined;
    this.progress.upsert({ lessonId: this.lesson.lessonId, status: 'completed', score, concept }).subscribe();
  }

  markCompleted(): void {
    if (!this.lesson) return;
    const concept = Array.isArray(this.lesson.concepts) ? this.lesson.concepts[0] : undefined;
    this.progress.upsert({ lessonId: this.lesson.lessonId, status: 'completed', score: 100, concept }).subscribe();
  }
}


