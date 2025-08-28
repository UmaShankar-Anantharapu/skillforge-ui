import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@app/environments/environment';
import {
  OnboardingStartResponse,
  StepConfigurationResponse,
  StepSaveResponse,
  StepFormData,
  SkillSuggestionsRequest,
  SkillSuggestionsResponse,
  OnboardingCompleteResponse,
  OnboardingStatus
} from '../../features/onboarding/models/onboarding.models';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly apiUrl = `${environment.apiUrl}/onboarding`;

  // State management
  private currentSessionSubject = new BehaviorSubject<string>('');
  private onboardingStatusSubject = new BehaviorSubject<OnboardingStatus | null>(null);
  private overlayOpenSubject = new BehaviorSubject<boolean>(false);

  public currentSession$ = this.currentSessionSubject.asObservable();
  public onboardingStatus$ = this.onboardingStatusSubject.asObservable();
  public overlayOpen$ = this.overlayOpenSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Initialize onboarding session
   */
  startOnboarding(sessionId?: string): Observable<OnboardingStartResponse> {
    const body = sessionId ? { sessionId } : {};

    return this.http.post<OnboardingStartResponse>(`${this.apiUrl}/start`, body)
      .pipe(
        tap(response => {
          this.currentSessionSubject.next(response.profile.sessionId);
        })
      );
  }

  /**
   * Get step configuration and current data
   */
  getStepConfiguration(stepNumber: number): Observable<StepConfigurationResponse> {
    return this.http.get<StepConfigurationResponse>(`${this.apiUrl}/step/${stepNumber}`);
  }

  /**
   * Save step data
   */
  saveStepData(stepNumber: number, data: StepFormData): Observable<StepSaveResponse> {
    return this.http.post<StepSaveResponse>(`${this.apiUrl}/step/${stepNumber}`, data);
  }

  /**
   * Get AI-powered skill suggestions
   */
  getSkillSuggestions(request: SkillSuggestionsRequest): Observable<SkillSuggestionsResponse> {
    return this.http.post<SkillSuggestionsResponse>(`${this.apiUrl}/skills/suggest`, request);
  }

  getSubSkills(body: { skillName: string }): Observable<{ skillName: string; prerequisites: string[]; subSkills: string[] }> {
    return this.http.post<{ skillName: string; prerequisites: string[]; subSkills: string[] }>(`${this.apiUrl}/skills/subskills`, body);
  }

  /**
   * Complete onboarding process
   */
  completeOnboarding(sessionId: string): Observable<OnboardingCompleteResponse> {
    return this.http.post<OnboardingCompleteResponse>(`${this.apiUrl}/complete`, { sessionId });
  }

  /**
   * Get current onboarding status
   */
  getOnboardingStatus(): Observable<OnboardingStatus> {
    return this.http.get<OnboardingStatus>(`${this.apiUrl}/status`)
      .pipe(
        tap(status => {
          this.onboardingStatusSubject.next(status);
          this.currentSessionSubject.next(status.sessionId);
        })
      );
  }

  /**
   * Reset onboarding progress
   */
  resetOnboarding(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reset`)
      .pipe(
        tap(() => {
          this.currentSessionSubject.next('');
          this.onboardingStatusSubject.next(null);
        })
      );
  }

  /**
   * Check if user needs onboarding
   */
  needsOnboarding(): Observable<boolean> {
    return new Observable(observer => {
      this.getOnboardingStatus().subscribe({
        next: (status) => {
          observer.next(!status.isComplete);
          observer.complete();
        },
        error: (error) => {
          // If status endpoint fails, assume onboarding is needed
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string {
    return this.currentSessionSubject.value;
  }

  /**
   * Set current session ID
   */
  setCurrentSessionId(sessionId: string): void {
    this.currentSessionSubject.next(sessionId);
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSessionSubject.next('');
    this.onboardingStatusSubject.next(null);
  }

  /**
   * Open onboarding overlay
   */
  openOverlay(): void {
    this.overlayOpenSubject.next(true);
  }

  /**
   * Close onboarding overlay
   */
  closeOverlay(): void {
    this.overlayOpenSubject.next(false);
  }
}