import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
    private researchService: ResearchAgentService,

  ) {
    // Check current theme - force dark theme for cyberpunk style
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // ViewChild references to DOM elements
  @ViewChild('duplicateButtons', { static: false }) duplicateButtonsRef!: ElementRef;
  @ViewChild('headerButtons', { static: false }) headerButtonsRef!: ElementRef;
  @ViewChild('ctaSection', { static: false }) ctaSectionRef!: ElementRef;
  
  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  // Use HostListener to listen for scroll events
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkButtonsVisibility();
  }
  
  // Check visibility of CTA section and toggle buttons accordingly
  private checkButtonsVisibility(): void {
    if (!this.ctaSectionRef || !this.duplicateButtonsRef || !this.headerButtonsRef) return;
    
    const ctaSection = this.ctaSectionRef.nativeElement;
    const duplicateButtons = this.duplicateButtonsRef.nativeElement;
    const headerButtons = this.headerButtonsRef.nativeElement;
    
    // Get the position of the CTA section
    const ctaSectionRect = ctaSection.getBoundingClientRect();
    
    // Check if the CTA section is in the viewport
    const isCTASectionVisible = 
      ctaSectionRect.top >= 0 &&
      ctaSectionRect.top <= window.innerHeight;
    
    if (isCTASectionVisible) {
      // Show duplicate buttons and hide header buttons
      duplicateButtons.classList.remove('hide-buttons');
      headerButtons.classList.add('hide-buttons');
    } else {
      // Hide duplicate buttons and show header buttons
      duplicateButtons.classList.add('hide-buttons');
      headerButtons.classList.remove('hide-buttons');
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
