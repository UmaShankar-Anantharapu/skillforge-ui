import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResearchAgentService {

  constructor(private readonly apiService: ApiService) { }

  getStatus(): Observable<any> {
    return this.apiService.get('/research/status');
  }

  generateRoadmap(data: any): Observable<any> {
    return this.apiService.post('/research/roadmap', data);
  }

  webSearch(query: string, limit?: number): Observable<any> {
    const params = limit ? `?q=${query}&limit=${limit}` : `?q=${query}`;
    return this.apiService.get(`/research/search${params}`);
  }

  scrapeContent(data: { url: string, title: string }): Observable<any> {
    return this.apiService.post('/research/scrape', data);
  }

  analyzeTopic(data: { topic: string, depth: string }): Observable<any> {
    return this.apiService.post('/research/analyze-topic', data);
  }

  compareResources(data: { urls: string[], topic: string }): Observable<any> {
    return this.apiService.post('/research/compare-resources', data);
  }
}