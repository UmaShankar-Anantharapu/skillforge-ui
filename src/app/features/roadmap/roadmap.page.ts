import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoadmapService, Roadmap } from '../../core/services/roadmap.service';
import { LessonService } from '../../core/services/lesson.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-roadmap-page',
  template: `
    <div class="sf-container">
      <div class="sf-card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <h2>Learning Roadmap</h2>
        <div style="display:flex;gap:8px;">
          <button class="sf-btn" (click)="generate()" [disabled]="loading">Mock Generate</button>
          <button class="sf-btn" (click)="generateLlm()" [disabled]="loading">AI Generate</button>
          <button class="sf-btn" (click)="generateEnhanced()" [disabled]="loading">Enhanced AI Generate</button>
        </div>
      </div>
      
      <!-- Visualization Component -->
      <app-roadmap-visualization 
        [roadmap]="roadmap" 
        [currentDay]="currentDay"
        [viewMode]="visualizationMode"
      ></app-roadmap-visualization>
      
      <!-- List View (Original) -->
      <div class="sf-card" style="margin-top: 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>Roadmap Details</h3>
          <button class="sf-btn" (click)="toggleVisualizationMode()">{{ visualizationMode === 'path' ? 'Calendar View' : 'Path View' }}</button>
        </div>
        
        <div *ngIf="roadmap" class="grid grid-3" style="margin-top:16px;">
          <div *ngFor="let step of roadmap.steps; trackBy: trackByFn" class="sf-card" style="cursor:pointer">
            <h4>Day {{ step.day }}</h4>
            <p>{{ step.topic }}</p>
            <small>Lessons: {{ step.lessonIds.join(', ') }}</small>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <button class="sf-btn" (click)="openLesson(step.lessonIds[0])" [disabled]="!step.lessonIds.length">Open</button>
              <button class="sf-btn" (click)="generateLessonFor(step.day, step.topic)">AI Lesson</button>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <button class="sf-btn" (click)="goToToday()">Today's Lesson</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .card { border: 1px solid #ddd; padding: 8px; margin: 8px 0; border-radius: 6px; }
  `,
})
export class RoadmapPageComponent implements OnInit {
  public loading = false;
  public roadmap: Roadmap | null = null;
  public currentDay = 1;
  public visualizationMode: 'path' | 'calendar' = 'path';

  trackByFn(index: number, item: any): any {
    return item.day; // or a unique ID for the step
  }
  constructor(
    private readonly roadmapService: RoadmapService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly lessons: LessonService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (!user) return;
    this.roadmapService.getRoadmap(user.id).subscribe({
      next: (res) => (this.roadmap = res.roadmap),
      error: () => (this.roadmap = null),
    });
  }

  generate(): void {
    this.loading = true;
    this.roadmapService.generateRoadmap().subscribe({
      next: (res) => {
        this.loading = false;
        this.roadmap = res.roadmap;
      },
      error: () => {
        this.loading = false;
        this.toast.show('Failed to generate roadmap', 'error');
      },
    });
  }

  generateLlm(): void {
    this.loading = true;
    this.roadmapService.generateRoadmapLlm().subscribe({
      next: (res) => { this.loading = false; this.roadmap = res.roadmap; },
      error: () => { this.loading = false; this.toast.show('AI generation failed', 'error'); },
    });
  }

  goToToday(): void {
    // Placeholder navigation; wire to lessons later
    this.router.navigate(['/dashboard']);
  }
  
  generateEnhanced(): void {
    this.loading = true;
    // Use the enhanced roadmap generation with research agent integration
    const params = {
      skill: 'JavaScript', // These would come from user input in a real implementation
      level: 'intermediate',
      timeframeWeeks: 4,
      dailyTimeMinutes: 60,
      focus: 'practical'
    };
    
    this.roadmapService.generateEnhancedRoadmap(params).subscribe({
      next: (res) => { 
        this.loading = false; 
        this.roadmap = res.roadmap; 
        // Set current day to 1 for new roadmap
        this.currentDay = 1;
      },
      error: () => { 
        this.loading = false; 
        this.toast.show('Enhanced AI generation failed', 'error'); 
      },
    });
  }
  
  toggleVisualizationMode(): void {
    this.visualizationMode = this.visualizationMode === 'path' ? 'calendar' : 'path';
  }

  openLesson(lessonId: string): void {
    if (!lessonId) return;
    this.router.navigate(['/lesson', lessonId]);
  }

  generateLessonFor(day: number, topic: string): void {
    this.lessons.generateLesson({ topic, day }).subscribe({
      next: (res) => {
        this.toast.show(`Generated lesson ${res.lesson.lessonId}`, 'success');
        // Refresh roadmap view
        const user = this.auth.getUser();
        if (user) {
          this.roadmapService.getRoadmap(user.id).subscribe({ next: (r) => (this.roadmap = r.roadmap) });
        }
      },
      error: () => this.toast.show('Failed to generate lesson', 'error'),
    });
  }
}


