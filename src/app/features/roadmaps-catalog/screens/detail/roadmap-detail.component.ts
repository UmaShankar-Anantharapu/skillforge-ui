import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { RoadmapService, Roadmap, AiLevelSummary, RoadmapMilestone } from '../../../../core/services/roadmap.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Milestone } from '../../../../shared/interfaces/milestone.interface';

@Component({
  selector: 'app-roadmap-detail',
  templateUrl: './roadmap-detail.component.html',
  styleUrls: ['./roadmap-detail.component.scss']
})
export class RoadmapDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State management
  roadmap: Roadmap | null = null;
  loading$ = new BehaviorSubject<boolean>(true);
  saving$ = new BehaviorSubject<boolean>(false);
  generatingSummary$ = new BehaviorSubject<string | null>(null);
  
  // UI state
  currentTheme: 'light' | 'dark' = 'light';
  selectedMilestone: RoadmapMilestone | null = null;
  aiSummaryModal = false;
  currentAiSummary: AiLevelSummary | null = null;
  showSummaryFirst = false;
  fromCache = false;
  
  // Error handling
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService,
    private themeService: ThemeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.detectChanges();
      });

    // Check if roadmap data was passed through navigation state
    const navigationState = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (navigationState?.roadmap) {
      // Use pre-loaded roadmap data
      this.roadmap = navigationState.roadmap;
      this.showSummaryFirst = navigationState.showSummaryFirst || false;
      this.fromCache = navigationState.fromCache || false;
      this.loading$.next(false);
      
      if (this.showSummaryFirst) {
        // Show summary view first
        this.toastService.show('Roadmap loaded - showing summary', 'success');
      }
      
      this.cdr.detectChanges();
      return;
    }

    // Load roadmap details from route parameter (fallback)
    combineLatest([
      this.route.params,
      this.route.queryParams
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([params, queryParams]) => {
      const description = params['id'] || params['description'] || queryParams['description'];
      if (description) {
        this.loadRoadmapDetails(decodeURIComponent(description));
      } else {
        this.handleError('No roadmap description provided');
      }
    });
  }

  private loadRoadmapDetails(description: string): void {
    this.loading$.next(true);
    this.error = null;

    this.roadmapService.getRoadmapDetails(description)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading$.next(false)),
        catchError(error => {
          this.handleError('Failed to load roadmap details');
          throw error;
        })
      )
      .subscribe({
        next: (response) => {
          this.roadmap = response.roadmap;
          if (response.fromCache) {
            this.toastService.show('Loaded from cache', 'info');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading roadmap:', error);
        }
      });
  }

  onStartRoadmap(): void {
    if (!this.roadmap?._id) {
      this.toastService.show('Invalid roadmap data', 'error');
      return;
    }

    this.saving$.next(true);
    
    this.roadmapService.saveRoadmapToProfile(this.roadmap._id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.saving$.next(false))
      )
      .subscribe({
        next: (response) => {
          this.toastService.show(response.message, 'success');
          // Navigate to the roadmap start URL or dashboard
          if (response.startUrl) {
            this.router.navigateByUrl(response.startUrl);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to save roadmap';
          this.toastService.show(errorMessage, 'error');
          console.error('Error saving roadmap:', error);
        }
      });
  }

  onGenerateAiSummary(milestone: RoadmapMilestone): void {
    if (!this.roadmap?._id) {
      this.toastService.show('Invalid roadmap data', 'error');
      return;
    }

    this.generatingSummary$.next(milestone.id);
    
    this.roadmapService.generateLevelSummary(this.roadmap._id, milestone.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.generatingSummary$.next(null))
      )
      .subscribe({
        next: (response) => {
          this.currentAiSummary = response.summary;
          this.selectedMilestone = milestone;
          this.aiSummaryModal = true;
          
          if (response.fromCache) {
            this.toastService.show('Summary loaded from cache', 'info');
          } else {
            this.toastService.show('AI summary generated successfully', 'success');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to generate AI summary';
          this.toastService.show(errorMessage, 'error');
          console.error('Error generating AI summary:', error);
        }
      });
  }

  // Handle milestone interactions from shared components
  onMilestoneToggle(milestone: Milestone): void {
    // Toggle milestone completion status
    const roadmapMilestone = this.roadmap?.milestones?.find(m => 
      m.title === milestone.title
    );
    
    if (roadmapMilestone) {
      // Update milestone status logic here
      this.cdr.detectChanges();
    }
  }

  onMilestoneAiSummary(milestone: Milestone): void {
    // Convert Milestone to RoadmapMilestone for AI summary
    const roadmapMilestone: RoadmapMilestone = {
      id: milestone.title.toLowerCase().replace(/\s+/g, '-'),
      title: milestone.title,
      description: milestone.description,
      estimatedWeeks: milestone.estimatedWeeks,
      skills: milestone.skills,
      completed: milestone.isCompleted || false,
      order: 0
    };
    
    this.onGenerateAiSummary(roadmapMilestone);
  }

  // Convert RoadmapMilestone to Milestone for shared components
  convertToMilestone(roadmapMilestone: RoadmapMilestone): Milestone {
    return {
      id: roadmapMilestone.id,
      title: roadmapMilestone.title,
      description: roadmapMilestone.description,
      estimatedWeeks: roadmapMilestone.estimatedWeeks,
      skills: roadmapMilestone.skills,
      order: roadmapMilestone.order,
      isCompleted: roadmapMilestone.completed || false,
      resources: [], // Default empty array, can be enhanced with actual resources
      projects: [] // Default empty array for projects
    };
  }

  // Helper method to calculate total skills count
  getTotalSkillsCount(): number {
    if (!this.roadmap) return 0;
    
    if (this.roadmap.skillsRequired?.length) {
      return this.roadmap.skillsRequired.length;
    }
    
    if (this.roadmap.milestones?.length) {
      return this.roadmap.milestones.reduce((acc, m) => acc + (m.skills?.length || 0), 0);
    }
    
    return 0;
  }

  onCloseAiSummaryModal(): void {
    this.aiSummaryModal = false;
    this.currentAiSummary = null;
    this.selectedMilestone = null;
  }

  onBackToOverview(): void {
    this.router.navigate(['/learning-path']);
  }

  // Utility methods
  getEstimatedHours(): number {
    if (!this.roadmap) return 0;
    return this.roadmap.totalEstimatedHours || 
           this.roadmap.steps.reduce((total, step) => total + (step.estimatedMinutes || 0), 0) / 60;
  }

  getCompletionPercentage(): number {
    if (!this.roadmap) return 0;
    return this.roadmap.progress?.percentageComplete || 0;
  }

  getDifficultyColor(): string {
    if (!this.roadmap) return 'text-gray-500';
    
    const colors = {
      'Beginner': this.currentTheme === 'dark' ? 'text-green-400' : 'text-green-600',
      'Intermediate': this.currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600', 
      'Advanced': this.currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
    };
    
    return colors[this.roadmap.difficultyLevel] || 'text-gray-500';
  }

  getResourceTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'video': 'play-circle',
      'article': 'document-text',
      'course': 'academic-cap',
      'book': 'book-open',
      'tool': 'cog',
      'documentation': 'clipboard-document',
      'tutorial': 'light-bulb'
    };
    return icons[type] || 'document';
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading$.next(false);
    this.toastService.show(message, 'error');
  }

  // Template helper methods
  isGeneratingSummary(milestoneId: string): boolean {
    return this.generatingSummary$.value === milestoneId;
  }

  isLoading(): boolean {
    return this.loading$.value;
  }

  isSaving(): boolean {
    return this.saving$.value;
  }
}