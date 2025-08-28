import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { ProfileService, CurrentSkill, SkillDetails } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-known-skills',
  templateUrl: './known-skills.component.html',
  styleUrls: ['./known-skills.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50%) translateY(-100%) scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(-50%) translateY(-100%) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(-50%) translateY(-100%) scale(0.9)' }))
      ])
    ])
  ]
})
export class KnownSkillsComponent implements OnInit, OnDestroy {
  skills$ = new BehaviorSubject<CurrentSkill[]>([]);
  isLoading = false;
  hoveredSkill: string | null = null;
  skillPrerequisites: { [skillName: string]: string[] } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserSkills();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserSkills(): void {
    this.isLoading = true;
    
    this.profileService.getCurrentUserSkills()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading user skills:', error);
          this.toastService.show('Failed to load skills', 'error');
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(skills => {
        this.skills$.next(skills);
      });
  }

  onSkillHover(skillName: string): void {
    this.hoveredSkill = skillName;
    
    // Load prerequisites if not already cached
    if (!this.skillPrerequisites[skillName]) {
      this.loadSkillPrerequisites(skillName);
    }
  }

  onSkillLeave(): void {
    this.hoveredSkill = null;
  }

  private loadSkillPrerequisites(skillName: string): void {
    this.profileService.getSkillDetails(skillName)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading skill details:', error);
          // Return mock prerequisites for demo purposes
          return of({
            skillName,
            prerequisites: this.getMockPrerequisites(skillName),
            subSkills: [],
            relatedSkills: []
          } as SkillDetails);
        })
      )
      .subscribe(details => {
        this.skillPrerequisites[skillName] = details.prerequisites;
      });
  }

  private getMockPrerequisites(skillName: string): string[] {
    // Mock prerequisites for common skills - this would come from the backend
    const mockPrerequisites: { [key: string]: string[] } = {
      'Python': ['Basic Programming', 'Computer Science Fundamentals'],
      'JavaScript': ['HTML', 'CSS', 'Basic Programming'],
      'React': ['JavaScript', 'ES6+', 'HTML/CSS'],
      'Node.js': ['JavaScript', 'Asynchronous Programming'],
      'Machine Learning': ['Python', 'Statistics', 'Linear Algebra'],
      'Data Analysis': ['Statistics', 'Excel/Spreadsheets'],
      'SQL': ['Database Concepts', 'Basic Programming'],
      'Web Development': ['HTML', 'CSS', 'JavaScript'],
      'Mobile Development': ['Programming Fundamentals', 'UI/UX Basics'],
      'Cloud Computing': ['Networking', 'Operating Systems'],
      'Cybersecurity': ['Networking', 'Operating Systems', 'Security Fundamentals'],
      'Network Security': ['Networking', 'Security Fundamentals']
    };

    return mockPrerequisites[skillName] || ['Basic Programming'];
  }

  getSkillPrerequisites(skillName: string): string[] {
    return this.skillPrerequisites[skillName] || [];
  }

  getProficiencyClass(level: string): string {
    return `proficiency-${level.toLowerCase()}`;
  }

  getExperienceText(years?: number): string {
    if (!years || years === 0) return 'New to this skill';
    if (years === 1) return '1 year';
    return `${years} years`;
  }

  updateSkills(): void {
    // Navigate to skills update page or open modal
    this.toastService.show('Skills update feature coming soon!', 'info');
  }

  addSkills(): void {
    // Navigate to skills addition page or open modal
    this.toastService.show('Add skills feature coming soon!', 'info');
  }

  trackBySkillName(index: number, skill: CurrentSkill): string {
    return skill.skillName;
  }
}