import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoadmapsCatalogService, CatalogRoadmap } from '../../roadmaps-catalog.service';

@Component({
  selector: 'app-roadmap-detail-page',
  template: `
  <div class="sf-container" *ngIf="roadmap">
    <div class="sf-card" style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
      <div>
        <h2 style="margin:0">{{ roadmap.title }}</h2>
        <p style="margin:6px 0 0;color:var(--sf-muted)">{{ roadmap.description }}</p>
        <div style="margin-top:8px;color:var(--sf-muted);font-size:.9rem;">
          <span>{{ roadmap.estimatedDuration }}</span>
          <span> • {{ roadmap.difficulty }}</span>
        </div>
      </div>
      <button class="sf-btn" *ngIf="!hasStarted" (click)="start()">Start Roadmap</button>
      <button class="sf-btn" *ngIf="hasStarted" (click)="continue()">Continue Learning</button>
    </div>

    <div class="sf-card">
      <h3>Modules</h3>
      <div class="grid grid-3">
        <div class="sf-card" *ngFor="let s of roadmap.steps">
          <div class="badge">Day {{ s.day }}</div>
          <h4 style="margin:6px 0;">{{ s.topic }}</h4>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .badge { display:inline-block; background:var(--sf-glass-bg); border:1px solid var(--sf-glass-border); padding:2px 8px; border-radius:999px; font-size:.8rem; margin-bottom:6px; }
  `]
})
export class RoadmapDetailPage implements OnInit {
  roadmap: CatalogRoadmap | null = null;
  hasStarted = false;
  currentDay = 1;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly svc: RoadmapsCatalogService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/learning-path']); return; }
    const r = this.svc.get(id);
    if (!r) { this.router.navigate(['/learning-path']); return; }
    this.roadmap = r;
    const p = this.svc.getProgress(r.id, r.steps.length);
    this.hasStarted = p.started;
    this.currentDay = Math.min(Math.max(1, p.lastCompletedDay + 1), r.steps.length || 1);
  }

  start(): void {
    if (!this.roadmap) return;
    this.svc.start(this.roadmap.id);
    this.hasStarted = true; this.currentDay = 1;
    this.continue();
  }

  continue(): void {
    if (!this.roadmap) return;
    const step = this.roadmap.steps.find(s => s.day === this.currentDay) || this.roadmap.steps[0];
    const lessonId = step?.lessonId || 'demo-lesson';
    this.router.navigate(['/lesson', lessonId]);
  }
}

