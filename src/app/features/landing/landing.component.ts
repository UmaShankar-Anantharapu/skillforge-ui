import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ResearchAgentService } from '../../core/services/research-agent.service';
import { finalize } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  isDarkTheme = true;
  activeTab: 'personal' | 'enterprise' = 'personal';
  searchQuery = '';
  isSearching = false;
  searchResults: any[] = [];
  topicAnalysis: any = null;
  researchAgentAvailable = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private researchService: ResearchAgentService
  ) {
    // Check current theme - force dark theme for cyberpunk style
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  setActiveTab(tab: 'personal' | 'enterprise'): void {
    this.activeTab = tab;
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  toggleTheme() {
    const root = document.documentElement;
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    this.isDarkTheme = !isLight;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  /**
   * Check if the research agent is operational - disabled for landing page
   */
  checkResearchAgentStatus() {
    // Research agent functionality disabled for cyberpunk landing page
    this.researchAgentAvailable = false;
  }
  
  /**
   * Search for a topic using the research agent - disabled for landing page
   */
  searchTopic() {
    if (!this.searchQuery || this.isSearching) return;
    
    // Research agent functionality disabled for cyberpunk landing page
    this.isSearching = false;
    
    // Placeholder for future implementation
    /*
    this.researchService.webSearch(this.searchQuery, 5)
      .pipe(
        finalize(() => this.isSearching = false),
        catchError(error => {
          return of(null);
        })
      )
      .subscribe(results => {
        // Placeholder for search results
      });
    */
  }

  /**
   * Analyze a topic using the research agent - disabled for landing page
   */
  analyzeTopic(topic: string) {
    if (!topic) return;
    
    // Research agent functionality disabled for cyberpunk landing page
    
    /*
    this.isSearching = true;
    this.topicAnalysis = null;
    
    this.researchService.analyzeTopic({ topic, depth: 'overview' })
      .pipe(
        finalize(() => this.isSearching = false),
        catchError(error => {
          console.error('Topic analysis failed:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.topicAnalysis = response;
          this.searchResults = [];
        }
      });
    */
  }
  
  /**
   * Generate a roadmap for a topic and navigate to the onboarding page
   */
  generateRoadmap(topic: string): void {
    if (!topic) return;
    
    // Store the topic in session storage to use in the onboarding flow
    sessionStorage.setItem('selectedTopic', topic);
    sessionStorage.setItem('topicAnalysis', JSON.stringify(this.topicAnalysis));
    
    // Navigate to the onboarding page
    this.router.navigate(['/onboarding']);
  }
}
