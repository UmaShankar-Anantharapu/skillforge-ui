import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SkillsService } from '../../core/services/skills.service';
import { ToastService } from '../../core/services/toast.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface ItemCard { id?: string; title: string; description?: string; }

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
  
  // Pagination for AI recommendations and trending roadmaps
  aiRecPage = 0; aiRecPageSize = 5; aiRecMaxPage = 0;
  trendingPage = 0; trendingPageSize = 5; trendingMaxPage = 0;

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private skillsService: SkillsService,
    private toastService: ToastService
  ) {}

  continueLearning: ItemCard[] = [
    {
      id: 'data-science-fundamentals',
      title: 'Introduction to Data Science',
      description: 'Learn the basics of data science, including data analysis, visualization, and machine learning.'
    },
    {
      id: 'ml-basics',
      title: 'Machine Learning Basics',
      description: 'Explore the core concepts of machine learning and its applications.'
    },
    {
      id: 'advanced-data-analysis',
      title: 'Advanced Data Analysis',
      description: 'Dive deeper into data analysis techniques and tools.'
    }
  ];

  savedRoadmaps: ItemCard[] = [
    { id: 'data-science', title: 'Data Science Roadmap' },
    { id: 'machine-learning', title: 'Machine Learning Roadmap' },
    { id: 'ai-engineering', title: 'AI Engineering Roadmap' }
  ];



  ngOnInit() {
    console.log('MyLearningPageComponent ngOnInit called');
    this.loadAIRecommendations();
    this.loadTrendingRoadmaps();
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

    this.skillsService.getAIRecommendations(currentUser.id)
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
        this.aiRecMaxPage = Math.ceil(this.aiRecommendations.length / this.aiRecPageSize) - 1;
      });
  }

  loadTrendingRoadmaps() {
    console.log('Loading trending roadmaps...');
    this.isLoadingTrendingRoadmaps = true;

    this.skillsService.getTrendingRoadmaps()
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
        this.trendingMaxPage = Math.ceil(this.trendingRoadmaps.length / this.trendingPageSize) - 1;
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

  openRoadmap(id?: string) {
    if (!id) return;
    this.router.navigate(['/roadmaps', id]);
  }
}

