import { Injectable } from '@angular/core';
import { Observable, of, switchMap, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { ResearchAgentService } from './research-agent.service';

export interface RoadmapStep { 
  day: number; 
  week: number;
  milestoneId: string;
  title: string;
  description: string;
  type: 'theory' | 'practice' | 'project' | 'assessment' | 'review';
  estimatedMinutes: number;
  skills: string[];
  resources: RoadmapResource[];
  prerequisites: string[];
  learningObjectives: string[];
  completed: boolean;
  completedAt?: Date;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  order: number;
  topic?: string; 
  lessonIds?: string[];
}

export interface RoadmapResource {
  type: 'video' | 'article' | 'course' | 'book' | 'tool' | 'documentation' | 'tutorial';
  title: string;
  url?: string;
  description?: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  rating?: number;
  isFree: boolean;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  skills: string[];
  completed: boolean;
  completedAt?: Date;
  order: number;
}

export interface RoadmapProgress {
  completedSteps: number;
  totalSteps: number;
  completedMilestones: number;
  totalMilestones: number;
  percentageComplete: number;
  lastActivityAt?: Date;
  currentStep: number;
  currentMilestone?: string;
  estimatedCompletionDate?: Date;
  actualStartDate?: Date;
  streakDays: number;
  totalTimeSpent: number;
}

export interface Roadmap { 
  _id?: string;
  userId: string; 
  profileId?: string;
  title: string;
  description: string;
  estimatedDuration: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  tags: string[];
  milestones: RoadmapMilestone[];
  steps: RoadmapStep[];
  progress: RoadmapProgress;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Enhanced metadata for details view
  levelSummaries?: LevelSummary[];
  totalEstimatedHours?: number;
  skillsRequired?: string[];
  resourceTypes?: string[];
}

export interface LevelSummary {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  skills: string[];
  stepCount: number;
  totalMinutes: number;
}

export interface AiLevelSummary {
  milestoneId: string;
  title: string;
  aiSummary: string;
  keySkills: string[];
  estimatedWeeks: number;
  stepCount: number;
  totalMinutes: number;
  difficulty: string;
  generatedAt: Date;
}

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
  
  public generateEnhancedRoadmap(params: RoadmapParams): Observable<{ roadmap: any }> {
    return this.researchAgent.getStatus().pipe(
      switchMap(status => {
        if (status.operational) {
          return this.researchAgent.generateRoadmap({
            topic: params.skill,
            level: params.level,
            timeframe: `${params.timeframeWeeks}-weeks`,
            dailyTimeMinutes: params.dailyTimeMinutes,
            focus: params.focus || 'practical',
            includeProjects: true
          }).pipe(
            map(researchRoadmap => {
              const steps = researchRoadmap.roadmap?.steps?.map((step: any, index: number) => ({
                day: Number(step.day || index + 1),
                topic: String(step.title || step.topic || `Day ${index + 1}`),
                lessonIds: []
              })) || [];
              return { roadmap: { userId: 'current', steps } };
            })
          );
        } else {
          return this.generateRoadmapLlm();
        }
      }),
      catchError(() => this.generateRoadmapLlm())
    );
  }

  // New: AI and Trending recommendations (25 each)
  getAiRoadmaps(page: number = 0, pageSize: number = 25): Observable<{ recommendations: any[] }> {
    return this.api.get(`/roadmap/recommendations/ai?page=${page}&pageSize=${pageSize}`);
  }
  getTrendingRoadmaps(page: number = 0, pageSize: number = 25): Observable<{ recommendations: any[] }> {
    return this.api.get(`/roadmap/recommendations/trending?page=${page}&pageSize=${pageSize}`);
  }

  // New methods for roadmap interaction flow
  getRoadmapDetails(description: string): Observable<{ roadmap: Roadmap; fromCache?: boolean }> {
    return this.api.get<{ roadmap: Roadmap; fromCache?: boolean }>(`/roadmap/details/${encodeURIComponent(description)}`);
  }

  saveRoadmapToProfile(roadmapId: string): Observable<{ message: string; roadmap: Roadmap; startUrl: string }> {
    return this.api.post<{ message: string; roadmap: Roadmap; startUrl: string }>(`/roadmap/${roadmapId}/save`, {});
  }

  generateLevelSummary(roadmapId: string, milestoneId: string): Observable<{ summary: AiLevelSummary; fromCache?: boolean }> {
    return this.api.post<{ summary: AiLevelSummary; fromCache?: boolean }>(`/roadmap/${roadmapId}/summarize-level`, { milestoneId });
  }

  getUserActiveRoadmap(): Observable<{ roadmap: Roadmap | null }> {
    return this.api.get<{ roadmap: Roadmap }>(`/roadmap/active`).pipe(
      catchError(() => of({ roadmap: null }))
    );
  }

  checkRoadmapStatus(roadmapId: string): Observable<{isSaved: boolean, roadmapId: string | null, status: string | null}> {
    return this.api.get<{isSaved: boolean, roadmapId: string | null, status: string | null}>(`/roadmap/user/status/${roadmapId}`);
  }

  generateAndSaveRoadmap(roadmapData: any): Observable<{roadmap: Roadmap, message: string, generatedWithAI: boolean, webScrapingUsed: boolean}> {
    return this.api.post<{roadmap: Roadmap, message: string, generatedWithAI: boolean, webScrapingUsed: boolean}>('/roadmap/generate-and-save', roadmapData);
  }

  // New personalized roadmap workflow methods
  generatePersonalizedRoadmap(targetSkill: string, options?: {
    weeklyHours?: number;
    excludedSkills?: string[];
    focusAreas?: string[];
    difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  }): Observable<{workflowId: string, message: string}> {
    const payload = {
      targetSkill,
      learningStyle: options?.difficultyLevel || 'Intermediate',
      timeCommitment: `${options?.weeklyHours || 10} hours per week`,
      currentLevel: options?.difficultyLevel || 'Intermediate'
    };
    return this.api.post('/personalized-roadmap/generate', payload);
  }

  getWorkflowStatus(workflowId: string): Observable<{
    workflowId: string;
    status: string;
    currentStage: string;
    progress: number;
    stages: any[];
    error?: string;
    roadmap?: Roadmap;
  }> {
    return this.api.get(`/personalized-roadmap/status/${workflowId}`);
  }

  getWorkflowHistory(): Observable<{
    workflows: Array<{
      workflowId: string;
      targetSkill: string;
      status: string;
      createdAt: Date;
      completedAt?: Date;
      roadmapId?: string;
    }>;
  }> {
    return this.api.get('/roadmap/workflow-history');
  }

  handleRoadmapClick(roadmapData: any): Observable<{roadmap: Roadmap, isNew: boolean, message?: string}> {
    // Check if this is a database roadmap (has MongoDB ObjectId) or catalog roadmap (string ID)
    const roadmapId = roadmapData._id || roadmapData.id;
    const isMongoId = roadmapId && /^[0-9a-fA-F]{24}$/.test(roadmapId);
    
    if (isMongoId) {
      // This is a database roadmap, check if user has saved it
      return this.checkRoadmapStatus(roadmapId).pipe(
        switchMap(status => {
          if (status.isSaved && status.roadmapId) {
            // Return existing saved roadmap
            return this.getRoadmap(status.roadmapId).pipe(
              map(response => ({
                roadmap: response.roadmap,
                isNew: false,
                message: 'Loaded your existing roadmap'
              }))
            );
          } else {
            // Generate new roadmap based on the clicked roadmap data
            return this.generateNewRoadmap(roadmapData);
          }
        }),
        catchError(error => {
          console.error('Error checking roadmap status:', error);
          // If checking status fails, try to generate new roadmap
          return this.generateNewRoadmap(roadmapData);
        })
      );
    } else {
      // This is a catalog roadmap (template), always generate new roadmap
      return this.generateNewRoadmap(roadmapData);
    }
  }

  private generateNewRoadmap(roadmapData: any): Observable<{roadmap: Roadmap, isNew: boolean, message?: string}> {
    const generationData = {
      title: roadmapData.title || roadmapData.name,
      description: roadmapData.description || roadmapData.summary || '',
      category: roadmapData.category || 'General',
      difficultyLevel: roadmapData.difficultyLevel || roadmapData.difficulty || 'Intermediate',
      enableWebScraping: true,
      timeframeWeeks: roadmapData.timeframeWeeks || 12,
      dailyTimeMinutes: roadmapData.dailyTimeMinutes || 60
    };
    return this.generateAndSaveRoadmap(generationData).pipe(
      map(response => ({
        roadmap: response.roadmap,
        isNew: true,
        message: response.message
      })),
      catchError(error => {
        console.error('Error generating roadmap:', error);
        throw error;
      })
    );
  }
}



