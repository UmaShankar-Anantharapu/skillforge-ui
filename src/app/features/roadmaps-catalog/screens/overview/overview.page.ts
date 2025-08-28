import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoadmapsCatalogService, CatalogRoadmap } from '../../roadmaps-catalog.service';

@Component({
  selector: 'app-roadmaps-overview-page',
  template: `
  <div class="sf-container">
    <div class="sf-card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <div>
        <h2 class="gradient-text" style="margin:0">Learning Paths</h2>
        <p style="margin:4px 0 0;color:var(--sf-muted)">Browse curated roadmaps to start or continue learning.</p>
      </div>
      <input class="sf-input" style="max-width:300px" [(ngModel)]="q" placeholder="Search" />
    </div>

    <div class="sf-card" style="margin-top:16px;">
      <div class="grid grid-3">
        <div *ngFor="let r of filtered()" class="sf-card" style="cursor:pointer" (click)="open(r)">
          <div style="height:120px;background:var(--sf-gradient-hero);border-radius:8px;"></div>
          <h4 style="margin:12px 0 4px">{{ r.title }}</h4>
          <p style="margin:0;color:var(--sf-muted)">{{ r.description }}</p>
          <small style="color:var(--sf-muted)">{{ r.estimatedDuration }} • {{ r.difficulty }}</small>
        </div>
      </div>
      <div *ngIf="filtered().length===0" class="text-center" style="padding:16px;color:var(--sf-muted)">No results</div>
    </div>
  </div>
  `
})
export class RoadmapsOverviewPage implements OnInit {
  q = '';
  items: CatalogRoadmap[] = [];
  constructor(private readonly svc: RoadmapsCatalogService, private readonly router: Router) {}
  ngOnInit(): void { this.items = this.svc.list(); }
  filtered(): CatalogRoadmap[] {
    const term = this.q.trim().toLowerCase();
    if (!term) return this.items;
    return this.items.filter(r => r.title.toLowerCase().includes(term) || (r.description||'').toLowerCase().includes(term));
  }
  open(r: CatalogRoadmap): void { this.router.navigate(['/roadmaps', r.id]); }
}

