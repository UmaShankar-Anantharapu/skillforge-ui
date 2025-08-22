import { Injectable } from '@angular/core';
import { Observable, of, catchError, map, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { ResearchAgentService } from './research-agent.service';

export interface RoadmapStep { day: number; topic: string; lessonIds: string[] }
export interface Roadmap { userId: string; steps: RoadmapStep[] }

export interface RoadmapParams {
  skill: string;
  level: string;
  timeframeWeeks: number;
  dailyTimeMinutes: number;
  focus?: string;
}

@Injectable({ providedIn: 'root' })
export class RoadmapService {
  constructor(
    private readonly api: ApiService,
    private readonly researchAgent: ResearchAgentService
  ) {}

  public generateRoadmap(): Observable<{ roadmap: Roadmap }> {
    return this.api.post<{ roadmap: Roadmap }>(`/roadmap/generate`, {});
  }

  public generateRoadmapLlm(): Observable<{ roadmap: Roadmap }> {
    return this.api.post<{ roadmap: Roadmap }>(`/roadmap/generate-llm`, {});
  }

  public getRoadmap(userId: string): Observable<{ roadmap: Roadmap }> {
    return this.api.get<{ roadmap: Roadmap }>(`/roadmap/${userId}`);
  }
  
  public generateEnhancedRoadmap(params: RoadmapParams): Observable<{ roadmap: Roadmap }> {
    return this.researchAgent.getStatus().pipe(
      switchMap(status => {
        if (status.operational) {
          // Use research-enhanced roadmap generation
          return this.researchAgent.generateRoadmap({
            topic: params.skill,
            level: params.level,
            timeframe: `${params.timeframeWeeks}-weeks`,
            dailyTimeMinutes: params.dailyTimeMinutes,
            focus: params.focus || 'practical',
            includeProjects: true
          }).pipe(
            map(researchRoadmap => {
              // Map the research roadmap response to our standard format
              const steps = researchRoadmap.roadmap?.steps?.map((step: any, index: number) => ({
                day: Number(step.day || index + 1),
                topic: String(step.title || step.topic || `Day ${index + 1}`),
                lessonIds: []
              })) || [];
              
              return { 
                roadmap: {
                  userId: 'current', // This will be replaced with the actual user ID
                  steps: steps
                }
              };
            })
          );
        } else {
          // Fallback to standard roadmap generation
          return this.generateRoadmapLlm();
        }
      }),
      catchError(error => {
        console.error('Error generating enhanced roadmap:', error);
        // Fallback to standard roadmap generation on error
        return this.generateRoadmapLlm();
      })
    );
  }
}


