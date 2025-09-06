import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SkillsService, SkillRecommendation as ApiSkillRecommendation } from '../../core/services/skills.service';
import { ProfileService, CurrentSkill } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  skills: string[];
  coreSkills?: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  category?: string;
}

// KnownSkill interface moved to KnownSkillsComponent

interface SkillRecommendation {
  skillName: string;
  matchScore: number;
  reason: string;
  benefits: string[];
  relatedSkills: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedLearningTime?: string;
}



@Component({
  selector: 'app-skills-page',
  templateUrl: './skills.page.html',
  styleUrls: ['./skills.page.scss']
})
export class SkillsPageComponent implements OnInit {
  // knownSkills moved to KnownSkillsComponent

  // Make Math available in template
  Math = Math;

  // Filter properties
  selectedDifficulty: string = '';
  selectedSkill: string = '';
  selectedSkills: string[] = [];
  selectedProficiency: string = '';
  selectedTimeRange: string = '';
  showFilters: boolean = false;
  isLoadingProjects: boolean = false;
  selectedDemandedDifficulty: string = '';
  selectedDemandedSkill: string = '';
  availableSkills: string[] = [];
  filteredProjects: any[] = [];
  filteredProjectsYouCanAchieve: Project[] = [];
  filteredMostDemandedProjects: Project[] = [];
  filteredRecommendedSkills: SkillRecommendation[] = [];
  skillRecommendations: SkillRecommendation[] = [];
  aiRecommendations: any[] = [];
  trendingRoadmaps: any[] = [];
  isLoadingAIRecommendations: boolean = false;
  isLoadingTrendingRoadmaps: boolean = false;
  showAllAIRecommendations: boolean = false;
  showAllTrendingRoadmaps: boolean = false;

  // Pagination state
  recPage = 0; recPageSize = 3; recMaxPage = 0;
  achPage = 0; achPageSize = 3; achMaxPage = 0;
  trendPage = 0; trendPageSize = 3; trendMaxPage = 0;
  aiRecPage = 0; aiRecPageSize = 3; aiRecMaxPage = 0;
  trendingPage = 0; trendingPageSize = 3; trendingMaxPage = 0;

  // Properties for scrolling trending roadmaps
  canScrollLeftTrendingRoadmaps: boolean = false;
  canScrollRightTrendingRoadmaps: boolean = false;

  // Properties for scrolling AI recommendations
  canScrollLeftAIRecommendations: boolean = false;
  canScrollRightAIRecommendations: boolean = false;

  projectsYouCanAchieve: Project[] = [
    {
      id: '1',
      title: 'Build a Data Analysis Dashboard',
      description: 'Visualize key metrics and create interactive charts',
      image: '/assets/images/data-dashboard.jpg',
      skills: ['Analysis', 'Python', 'Visualization'],
      coreSkills: ['Analysis', 'Python'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 weeks',
      category: 'data'
    },
    {
      id: '2',
      title: 'Deploy a Machine Learning Model',
      description: 'Create a scalable prediction service, Sales forecasting',
      image: '/assets/images/ml-model.jpg',
      skills: ['Machine Learning', 'Python', 'API Development'],
      coreSkills: ['Machine Learning', 'Python'],
      difficulty: 'Advanced',
      estimatedTime: '3-4 weeks',
      category: 'ai'
    },
    {
      id: '3',
      title: 'Migrate Data to the Cloud',
      description: 'Securely transfer data to a cloud platform',
      image: '/assets/images/cloud-migration.jpg',
      skills: ['Data', 'Cloud Computing', 'SQL', 'DevOps'],
      coreSkills: ['Cloud Computing', 'SQL'],
      difficulty: 'Intermediate',
      estimatedTime: '1-2 weeks',
      category: 'devops'
    }
  ];

  mostDemandedProjects: Project[] = [
    {
      id: '4',
      title: 'Develop a Responsive Web Application',
      description: 'Build user-friendly web applications, Skills',
      image: '/assets/images/web-app.jpg',
      skills: ['Web Development', 'JavaScript'],
      difficulty: 'Beginner',
      estimatedTime: '2-3 weeks'
    },
    {
      id: '5',
      title: 'Build a Mobile Application',
      description: 'Create cross-platform mobile app, Skills, Mobile Development',
      image: '/assets/images/mobile-app.jpg',
      skills: ['Mobile Development', 'Swift'],
      difficulty: 'Advanced',
      estimatedTime: '4-6 weeks'
    },
    {
      id: '6',
      title: 'Implement a Cybersecurity Solution',
      description: 'Secure systems and networks',
      image: '/assets/images/cybersecurity.jpg',
      skills: ['Cybersecurity', 'Network Security'],
      difficulty: 'Advanced',
      estimatedTime: '3-5 weeks'
    }
  ];



  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private skillsService: SkillsService,
    private profileService: ProfileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateTrendingRoadmapScrollButtons();
    this.initializeFilters();
    this.applyBasicFilters();
    this.generateSkillRecommendations();
    this.loadTrendingSkills();

    this.filteredProjects = [...this.projectsYouCanAchieve];

    // init max pages based on fetched lists (25 each later)
    this.recMaxPage = Math.max(Math.ceil(this.skillRecommendations.length / this.recPageSize) - 1, 0);
    this.achMaxPage = Math.max(Math.ceil(this.filteredProjects.length / this.achPageSize) - 1, 0);
    this.trendMaxPage = Math.max(Math.ceil(this.mostDemandedProjects.length / this.trendPageSize) - 1, 0);
  }

  // Method to scroll trending roadmaps
  scrollTrendingRoadmaps(direction: 'left' | 'right') {
    const container = document.querySelector('.trending-roadmaps-container');
    if (container) {
      const scrollAmount = APP_CONSTANTS.SCROLL_AMOUNT;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      // Update button states after scroll animation (or with a slight delay)
      setTimeout(() => this.updateTrendingRoadmapScrollButtons(), APP_CONSTANTS.SCROLL_UPDATE_DELAY);
    }
  }

  // Method to update scroll button visibility
  updateTrendingRoadmapScrollButtons() {
    const container = document.querySelector('.trending-roadmaps-container');
    if (container) {
      this.canScrollLeftTrendingRoadmaps = container.scrollLeft > 0;
      this.canScrollRightTrendingRoadmaps = container.scrollLeft + container.clientWidth < container.scrollWidth;
    }
  }

  // Method to scroll AI recommendations
  scrollAIRecommendations(direction: 'left' | 'right') {
    const container = document.querySelector('.ai-recommendations-container');
    if (container) {
      const scrollAmount = APP_CONSTANTS.SCROLL_AMOUNT;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      // Update button states after scroll animation
      setTimeout(() => this.updateAIRecommendationsScrollButtons(), APP_CONSTANTS.SCROLL_UPDATE_DELAY);
    }
  }

  // Method to update AI recommendations scroll button visibility
  updateAIRecommendationsScrollButtons() {
    const container = document.querySelector('.ai-recommendations-container');
    if (container) {
      this.canScrollLeftAIRecommendations = container.scrollLeft > 0;
      this.canScrollRightAIRecommendations = container.scrollLeft + container.clientWidth < container.scrollWidth;
    }
  }

  initializeFilters() {
    // Extract unique skills from all projects
    const allSkills = new Set<string>();
    [...this.projectsYouCanAchieve, ...this.mostDemandedProjects].forEach(project => {
      project.skills.forEach(skill => allSkills.add(skill));
    });
    this.availableSkills = Array.from(allSkills).sort();
  }

  applyBasicFilters() {
    // Filter Projects You Can Achieve
    this.filteredProjectsYouCanAchieve = this.projectsYouCanAchieve.filter(project => {
      const matchesDifficulty = !this.selectedDifficulty || project.difficulty === this.selectedDifficulty;
      const matchesSkill = !this.selectedSkill || project.skills.includes(this.selectedSkill);
      return matchesDifficulty && matchesSkill;
    });

    // Filter Most Demanded Projects
    this.filteredMostDemandedProjects = this.mostDemandedProjects.filter(project => {
      const matchesDifficulty = !this.selectedDemandedDifficulty || project.difficulty === this.selectedDemandedDifficulty;
      const matchesSkill = !this.selectedDemandedSkill || project.skills.includes(this.selectedDemandedSkill);
      return matchesDifficulty && matchesSkill;
    });
   }

  generateSkillRecommendations() {
    // Get current user skills first
    this.profileService.getCurrentUserSkills()
      .pipe(
        catchError(error => {
          console.error('Error loading user skills:', error);
          return of([]);
        })
      )
      .subscribe(currentSkills => {
        const currentSkillNames = currentSkills.map(skill => skill.skillName);
        
        // Get AI-powered skill recommendations
        const request = {
          currentSkills: currentSkillNames,
          useAI: true
        };
        
        this.skillsService.getSkillRecommendations(request)
          .pipe(
            catchError(error => {
              console.error('Error getting skill recommendations:', error);
              this.toastService.show('Failed to load skill recommendations', 'error');
              return of([]);
            })
          )
          .subscribe(recommendations => {
            // Expect up to 25 items; paginate 3–5 per page via template
            this.skillRecommendations = recommendations;
            this.recPage = 0;
            this.recMaxPage = Math.max(Math.ceil(this.skillRecommendations.length / this.recPageSize) - 1, 0);
          });
      });
  }

  refreshRecommendations() {
    this.generateSkillRecommendations();
    this.toastService.show('Recommendations refreshed', 'success');
  }

  addToLearningPath(skillName: string) {
    // Get skill relationships to understand prerequisites and sub-skills
    this.skillsService.getSkillRelationships(skillName)
      .subscribe(relationship => {
        console.log(`Adding ${skillName} to learning path with prerequisites:`, relationship.prerequisites);
        this.toastService.show(`${skillName} added to learning path`, 'success');
        // TODO: Integrate with roadmap service to create learning path
      });
  }

  learnMore(skillName: string) {
    // Get detailed skill information first
    this.skillsService.getSkillRelationships(skillName)
      .subscribe(relationship => {
        console.log('Skill details:', relationship);
        // For now, redirect to external learning platform
        const skillQuery = encodeURIComponent(skillName.toLowerCase());
        const learningUrl = `${APP_CONSTANTS.EXTERNAL_URLS.COURSERA_SEARCH}${skillQuery}&`;
        window.open(learningUrl, '_blank');
      });
  }

  /**
   * Get career pathway recommendations based on current skills
   */
  getCareerPathways(targetRole: string) {
    this.profileService.getCurrentUserSkills()
      .pipe(
        catchError(error => {
          console.error('Error loading user skills:', error);
          return of([]);
        })
      )
      .subscribe(currentSkills => {
        const currentSkillNames = currentSkills.map(skill => skill.skillName);
        
        this.skillsService.getCareerPathways(currentSkillNames, targetRole)
          .pipe(
            catchError(error => {
              console.error('Error getting career pathways:', error);
              this.toastService.show('Failed to load career pathways', 'error');
              return of(null);
            })
          )
          .subscribe(pathway => {
            if (pathway) {
              console.log('Career pathway:', pathway);
              // TODO: Display career pathway in UI or navigate to dedicated page
              this.toastService.show(`Career pathway for ${targetRole} generated`, 'success');
            }
          });
      });
  }

  /**
   * Search for skills and update available skills list
   */
  searchSkills(query: string) {
    if (query.length > 2) {
      this.skillsService.searchSkills(query)
        .subscribe(skills => {
          this.availableSkills = skills;
        });
    }
  }

  /**
   * Load trending skills for recommendations
   */
  loadTrendingSkills() {
    this.skillsService.getTrendingSkills()
      .subscribe(skills => {
        // Update available skills with trending skills
        this.availableSkills = [...new Set([...this.availableSkills, ...skills])];
      });
  }

  /**
   * Load AI-powered recommendations
   */
  loadAIRecommendations() {
    this.isLoadingAIRecommendations = true;
    
    // Get current user ID from auth service
    const currentUser = this.authService.getUser();
    if (!currentUser || !currentUser.id) {
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
        this.aiRecommendations = recommendations;
        this.aiRecMaxPage = Math.max(Math.ceil(this.aiRecommendations.length / this.aiRecPageSize) - 1, 0);
      });
  }

  /**
   * Load trending roadmaps
   */
  loadTrendingRoadmaps() {
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
      .subscribe((roadmaps:any) => {

        this.trendingRoadmaps = roadmaps;
        this.trendingMaxPage = Math.max(Math.ceil(this.trendingRoadmaps.length / this.trendingPageSize) - 1, 0);
      });
  }







  updateSkills(): void {
    console.log('Updating skills');
    // Navigate to skills update page
  }

  viewProject(projectId: string): void {
    console.log('Viewing project:', projectId);
    // Navigate to project details
  }



  getSkillIcon(skillName: string): string {
    const iconMap: { [key: string]: string } = {
      'Python': '🐍',
      'Data Analysis': '📊',
      'Machine Learning': '🤖',
      'SQL': '🗄️',
      'Cloud Computing': '☁️',
      'JavaScript': '💛',
      'Web Development': '🌐',
      'Swift': '🍎',
      'Mobile Development': '📱',
      'Cybersecurity': '🔒',
      'Network Security': '🛡️'
    };
    return iconMap[skillName] || '⚡';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    if (progress >= 40) return 'primary';
    return 'medium';
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Advanced': return 'success';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'primary';
      default: return 'medium';
    }
  }

  formatPrerequisites(prerequisites: string[]): string {
     return prerequisites.join(' • ');
   }

   // getSkillTooltip method removed - now handled by KnownSkillsComponent

  // Enhanced filter methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSkillFilter(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  clearFilters(): void {
    this.selectedSkills = [];
    this.selectedProficiency = '';
    this.selectedTimeRange = '';
    this.filteredProjects = [...this.projectsYouCanAchieve];
  }

  async applyFilters(): Promise<void> {
    this.isLoadingProjects = true;
    
    try {
      // Simulate API call to LLM service
      await this.delay(1500);
      
      // Filter projects based on selected criteria
      let filtered = [...this.projectsYouCanAchieve];
      
      if (this.selectedSkills.length > 0) {
        filtered = filtered.filter(project => 
          this.selectedSkills.some(skill => 
            project.coreSkills?.includes(skill) || project.skills?.includes(skill)
          )
        );
      }
      
      if (this.selectedProficiency) {
        filtered = filtered.filter(project => 
          project.difficulty?.toLowerCase() === this.selectedProficiency
        );
      }
      
      if (this.selectedTimeRange) {
        filtered = filtered.filter(project => 
          this.matchesTimeRange(project.estimatedTime, this.selectedTimeRange)
        );
      }
      
      this.filteredProjects = filtered;
    } catch (error) {
      console.error('Error applying filters:', error);
      this.filteredProjects = [...this.projectsYouCanAchieve];
    } finally {
      this.isLoadingProjects = false;
      this.achPage = 0;
      this.achMaxPage = Math.max(Math.ceil(this.filteredProjects.length / this.achPageSize) - 1, 0);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private matchesTimeRange(estimatedTime: string, timeRange: string): boolean {
    // Simple time range matching logic
    const timeValue = estimatedTime.toLowerCase();
    
    switch (timeRange) {
      case '1-3':
        return timeValue.includes('hour') && !timeValue.includes('day');
      case '4-8':
        return timeValue.includes('hour') && !timeValue.includes('day');
      case '1-2':
        return timeValue.includes('day') && (timeValue.includes('1') || timeValue.includes('2'));
      case '3-7':
        return timeValue.includes('day') && !timeValue.includes('week');
      case '1+':
        return timeValue.includes('week') || timeValue.includes('month');
      default:
        return true;
    }
  }

  getProjectIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'web': 'fas fa-globe',
      'mobile': 'fas fa-mobile-alt',
      'data': 'fas fa-chart-bar',
      'ai': 'fas fa-brain',
      'backend': 'fas fa-server',
      'frontend': 'fas fa-desktop',
      'fullstack': 'fas fa-layer-group',
      'devops': 'fas fa-cogs',
      'default': 'fas fa-project-diagram'
    };
    
    return iconMap[category?.toLowerCase()] || iconMap['default'];
  }

  // AI Recommendations pagination
  prevAIRecommendations() {
    if (this.aiRecPage > 0) {
      this.aiRecPage--;
    }
  }

  nextAIRecommendations() {
    if (this.aiRecPage < this.aiRecMaxPage) {
      this.aiRecPage++;
    }
  }

  toggleViewAllAIRecommendations() {
    this.showAllAIRecommendations = !this.showAllAIRecommendations;
  }

  // Trending Roadmaps pagination
  prevTrendingRoadmaps() {
    if (this.trendingPage > 0) {
      this.trendingPage--;
    }
  }

  nextTrendingRoadmaps() {
    if (this.trendingPage < this.trendingMaxPage) {
      this.trendingPage++;
    }
  }

  toggleViewAllTrendingRoadmaps() {
    this.showAllTrendingRoadmaps = !this.showAllTrendingRoadmaps;
  }

  // Get paginated items
  getPaginatedAIRecommendations() {
    if (this.showAllAIRecommendations) {
      return this.aiRecommendations;
    }
    const start = this.aiRecPage * this.aiRecPageSize;
    return this.aiRecommendations.slice(start, start + this.aiRecPageSize);
  }

  getPaginatedTrendingRoadmaps() {
    if (this.showAllTrendingRoadmaps) {
      return this.trendingRoadmaps;
    }
    const start = this.trendingPage * this.trendingPageSize;
    return this.trendingRoadmaps.slice(start, start + this.trendingPageSize);
  }

  // View roadmap details
  viewRoadmap(roadmapId: string) {
    console.log('Viewing roadmap:', roadmapId);
    // TODO: Navigate to roadmap details page
    this.toastService.show('Roadmap details coming soon!', 'info');
  }
}