import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { RoadmapService } from '../../core/services/roadmap.service';
import { SkillsService } from '../../core/services/skills.service';
import { ToastService } from '../../core/services/toast.service';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';

interface ItemCard { id?: string; title: string; description?: string; }
interface ContinueLearningCard extends ItemCard { progress: number; }

@Component({
  selector: 'sf-my-learning-page',
  templateUrl: './my-learning.page.html',
  styleUrls: ['./my-learning.page.css']
})
export class MyLearningPageComponent implements OnInit {
  // AI Recommendations and Trending Roadmaps
  aiRecommendations: any[] = [];
  trendingRoadmaps: any[] = [];
  isLoadingAIRecommendations: boolean = false;
  isLoadingTrendingRoadmaps: boolean = false;
  showAllAIRecommendations: boolean = false;
  showAllTrendingRoadmaps: boolean = false;
  
  // Personalized roadmap workflow
  activeWorkflows: any[] = [];
  isLoadingWorkflows: boolean = false;
  workflowHistory: any[] = [];
  
  // Pagination for AI recommendations and trending roadmaps
  aiRecPage = 0; aiRecPageSize = 3; aiRecMaxPage = 0;
  trendingPage = 0; trendingPageSize = 3; trendingMaxPage = 0;

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private skillsService: SkillsService,
    private toastService: ToastService,
    private roadmapService: RoadmapService
  ) {}

  continueLearning: ContinueLearningCard[] = [];
  savedRoadmaps: ItemCard[] = [];



  ngOnInit() {
    console.log('MyLearningPageComponent ngOnInit called');
    this.loadContinueLearning();
    this.loadSavedRoadmaps();
    this.loadAIRecommendations();
    this.loadTrendingRoadmaps();
    this.loadActiveWorkflows();
  }

  private async loadContinueLearning() {
    try {
      const user = this.authService.getUser();
      if (!user?.id) {
        console.warn('No user ID available for loading continue learning data');
        return;
      }

      // Fetch user's active roadmap with progress
      const response = await this.roadmapService.getUserActiveRoadmap().toPromise();
      if (response && response.roadmap) {
        this.continueLearning = [{
          id: response.roadmap._id!,
          title: response.roadmap.title,
          description: response.roadmap.description || `Continue your ${response.roadmap.category} learning journey`,
          progress: response.roadmap.progress?.percentageComplete || 0
        }];
      }
    } catch (error) {
      console.error('Error loading continue learning data:', error);
      this.toastService.show('Failed to load continue learning data', 'error');
    }
  }

  private async loadSavedRoadmaps() {
    try {
      const user = this.authService.getUser();
      if (!user?.id) {
        console.warn('No user ID available for loading saved roadmaps');
        return;
      }

      // For now, use AI recommendations as saved roadmaps since we don't have a specific saved roadmaps endpoint
      // This will be replaced with actual saved roadmaps API when available
      this.skillsService.getAIRecommendations(user.id)
        .pipe(
          catchError(error => {
            console.error('Error loading saved roadmaps:', error);
            this.toastService.show('Failed to load saved roadmaps', 'error');
            return of([]);
          })
        )
        .subscribe(recommendations => {
          // Take first 3 recommendations as "saved" roadmaps
          this.savedRoadmaps = (recommendations || []).slice(0, 3).map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            description: rec.description || `${rec.category || 'Learning'} roadmap`
          }));
        });
    } catch (error) {
      console.error('Error loading saved roadmaps:', error);
      this.toastService.show('Failed to load saved roadmaps', 'error');
    }
  }

  loadAIRecommendations() {
    console.log('Loading AI recommendations...');
    this.isLoadingAIRecommendations = true;
    const currentUser = this.authService.getUser();
    console.log('Current user for AI recommendations:', currentUser);
    
    if (!currentUser?.id) {
      console.error('No current user found for AI recommendations');
      this.isLoadingAIRecommendations = false;
      return;
    }

    this.skillsService.getAIRecommendations(currentUser.id, this.aiRecPage, this.aiRecPageSize)
      .pipe(
        catchError(error => {
          console.error('Error loading AI recommendations:', error);
          this.toastService.show('Failed to load AI recommendations', 'error');
          return of([]);
        }),
        finalize(() => {
          this.isLoadingAIRecommendations = false;
        })
      )
      .subscribe(recommendations => {
        console.log('AI recommendations loaded:', recommendations);
        this.aiRecommendations = recommendations || [];
        // Note: With API-level pagination, we get only the requested page of results
        // The pagination logic is now handled by the backend
      });
  }

  loadTrendingRoadmaps() {
    this.isLoadingTrendingRoadmaps = true;
    this.skillsService.getTrendingRoadmaps(this.trendingPage, this.trendingPageSize)
      .pipe(
        catchError(error => {
          console.error('Error loading trending roadmaps:', error);
          this.toastService.show('Failed to load trending roadmaps', 'error');
          return of([]);
        }),
        finalize(() => {
          this.isLoadingTrendingRoadmaps = false;
        })
      )
      .subscribe(roadmaps => {
        console.log('Trending roadmaps loaded:', roadmaps);
        this.trendingRoadmaps = roadmaps || [];
        // Note: With API-level pagination, we get only the requested page of results
        // The pagination logic is now handled by the backend
      });
  }

  // Pagination methods for AI recommendations
  getDisplayedAIRecommendations() {
    if (this.showAllAIRecommendations) {
      return this.aiRecommendations;
    }
    const start = this.aiRecPage * this.aiRecPageSize;
    return this.aiRecommendations.slice(start, start + this.aiRecPageSize);
  }

  nextAIRecPage() {
    if (this.aiRecPage < this.aiRecMaxPage) {
      this.aiRecPage++;
    }
  }

  prevAIRecPage() {
    if (this.aiRecPage > 0) {
      this.aiRecPage--;
    }
  }

  toggleShowAllAIRecommendations() {
    this.showAllAIRecommendations = !this.showAllAIRecommendations;
  }

  // Pagination methods for trending roadmaps
  getDisplayedTrendingRoadmaps() {
    if (this.showAllTrendingRoadmaps) {
      return this.trendingRoadmaps;
    }
    const start = this.trendingPage * this.trendingPageSize;
    return this.trendingRoadmaps.slice(start, start + this.trendingPageSize);
  }

  nextTrendingPage() {
    if (this.trendingPage < this.trendingMaxPage) {
      this.trendingPage++;
    }
  }

  prevTrendingPage() {
    if (this.trendingPage > 0) {
      this.trendingPage--;
    }
  }

  toggleShowAllTrendingRoadmaps() {
    this.showAllTrendingRoadmaps = !this.showAllTrendingRoadmaps;
  }

  // Personalized roadmap workflow methods
  private async loadActiveWorkflows() {
    try {
      this.isLoadingWorkflows = true;
      const response = await this.roadmapService.getWorkflowHistory().toPromise();
      if (response && response.workflows) {
        this.activeWorkflows = response.workflows.filter(w => w.status === 'in_progress' || w.status === 'pending');
        this.workflowHistory = response.workflows.filter(w => w.status === 'completed' || w.status === 'failed');
      }
    } catch (error) {
      console.error('Error loading active workflows:', error);
      this.toastService.show('Failed to load workflow status', 'error');
    } finally {
      this.isLoadingWorkflows = false;
    }
  }

  async generatePersonalizedRoadmap(targetSkill: string, options?: {
    weeklyHours?: number;
    excludedSkills?: string[];
    focusAreas?: string[];
    difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  }) {
    try {
      const response = await this.roadmapService.generatePersonalizedRoadmap(targetSkill, options).toPromise();
      if (response && response.workflowId) {
        this.toastService.show('Personalized roadmap generation started!', 'success');
        // Refresh active workflows to show the new one
        this.loadActiveWorkflows();
        // Start polling for workflow status
        this.pollWorkflowStatus(response.workflowId);
      }
    } catch (error) {
      console.error('Error generating personalized roadmap:', error);
      this.toastService.show('Failed to start roadmap generation', 'error');
    }
  }

  private pollWorkflowStatus(workflowId: string) {
    const pollInterval = setInterval(async () => {
      try {
        const status = await this.roadmapService.getWorkflowStatus(workflowId).toPromise();
        if (status) {
          if (status.status === 'completed' && status.roadmap) {
            clearInterval(pollInterval);
            this.toastService.show('Your personalized roadmap is ready!', 'success');
            this.loadActiveWorkflows();
            this.loadContinueLearning(); // Refresh continue learning section
            // Navigate to the new roadmap
            this.router.navigate(['/learning-path/details', status.roadmap._id]);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            this.toastService.show('Roadmap generation failed. Please try again.', 'error');
            this.loadActiveWorkflows();
          }
          // Update the workflow in the active workflows list
          const workflowIndex = this.activeWorkflows.findIndex(w => w.workflowId === workflowId);
          if (workflowIndex !== -1) {
            this.activeWorkflows[workflowIndex] = {
              ...this.activeWorkflows[workflowIndex],
              status: status.status,
              currentStage: status.currentStage,
              progress: status.progress
            };
          }
        }
      } catch (error) {
        console.error('Error polling workflow status:', error);
        clearInterval(pollInterval);
      }
    }, APP_CONSTANTS.POLLING_INTERVAL.FAST); // Poll every 3 seconds

    // Stop polling after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  }

  getWorkflowStatusText(workflow: any): string {
    if (workflow.status === 'in_progress') {
      return `${workflow.currentStage} (${workflow.progress || 0}%)`;
    }
    return workflow.status;
  }

  getWorkflowProgressPercentage(workflow: any): number {
    return workflow.progress || 0;
  }

  openRoadmap(id?: string) {
    if (!id) return;
    
    // Show loading state
    this.toastService.show('Loading roadmap...', 'info');
    
    // Fetch complete roadmap data using the id as description
    this.roadmapService.getRoadmapDetails(id)
      .pipe(
        catchError(error => {
          console.error('Error fetching roadmap:', error);
          this.toastService.show('Failed to load roadmap', 'error');
          // Fallback to original navigation
          this.router.navigate(['/learning-path/details', id]);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.roadmap) {
          // Navigate to roadmap detail with the fetched data
          // We'll pass the roadmap data through navigation state
          this.router.navigate(['/learning-path/details', response.roadmap._id || id], {
            state: { 
              roadmap: response.roadmap,
              showSummaryFirst: true,
              fromCache: response.fromCache 
            }
          });
          
          if (response.fromCache) {
            this.toastService.show('Roadmap loaded from cache', 'success');
          } else {
            this.toastService.show('Roadmap loaded successfully', 'success');
          }
        }
      });
  }
}

