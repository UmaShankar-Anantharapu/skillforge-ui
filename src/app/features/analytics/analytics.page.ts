import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analytics-page',
  template: `
    <div class="sf-container">
      <div class="sf-card">
        <h2>Analytics</h2>
        <div *ngIf="stats">
          <p>Completed: {{ stats.completed }} / {{ stats.total }} ({{ stats.completionRate }}%)</p>
          <h3>Weak Topics</h3>
          <ul>
            <li *ngFor="let w of stats.weakTopics">{{ w.topic }} ({{ w.strength }})</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class AnalyticsPageComponent implements OnInit {
  public stats: any;
  constructor(private readonly auth: AuthService, private readonly http: HttpClient) {}
  ngOnInit(): void {
    const id = this.auth.getUser()?.id;
    if (!id) return;
    this.http.get<{ stats: any }>(`http://localhost:5050/api/analytics/${id}`).subscribe({ next: (r) => (this.stats = r.stats) });
  }
}


