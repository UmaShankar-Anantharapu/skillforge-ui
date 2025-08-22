import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@app/environments/environment';

export interface OnboardingData {
  // Step 1: Welcome & Basic Profile
  personalInfo: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    jobTitle: string;
    company?: string;
    industry: string;
    yearsExperience: string;
    preferredLanguage: string;
  };
  
  // Step 2: Learning Goals & Context
  learningGoals: {
    primaryLearningGoal: string;
    targetRole?: string;
    timeline: string;
    motivationLevel: string;
    currentChallenge: string;
  };
  
  // Step 3: Learning Preferences
  learningPreferences: {
    learningStyle: string;
    contentFormat: string;
    sessionDuration: string;
    difficultyPreference: string;
    primaryDevice: string;
  };
  
  // Step 4: Schedule & Availability
  schedule: {
    availableTimePerDay: string;
    bestLearningTimes: string[];
    daysPerWeek: string;
    timeZone: string;
    reminderMethod: string;
  };
  
  // Step 5: Skills Assessment Setup
  skillsSetup: {
    primarySkillCategory: string;
    skillsToLearn: string[];
    currentSkillLevels: Array<{skill: string, level: string}>;
    relatedSkills?: string[];
    prioritySkills: string[];
  };
  
  // Step 6: Background & Experience
  background: {
    educationLevel: string;
    certifications?: string[];
    previousLearningExperience: string;
    teamRole: string;
    learningBudget: string;
  };
  
  // Step 7: Success Metrics & Preferences
  successMetrics: {
    successMeasurement: string;
    progressTracking: string;
    communityParticipation: string;
    accessibilityRequirements?: string[];
    communicationPreferences: string[];
  };
  
  // Step 8: Skill Assessment
  skillAssessments?: Array<{
    skill: string;
    confidenceLevel: number;
    recentExperience: string;
    learningGoal: string;
  }>;
  
  // Step 9: Final Setup & Preferences
  finalSetup: {
    profilePrivacy: string;
    dataSharing: {
      analytics: boolean;
      marketing: boolean;
      thirdParty: boolean;
    };
    notificationPreferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    themePreference: string;
    betaFeatures: boolean;
  };
  
  // Legacy fields for backward compatibility
  skills?: string[];
  primarySkill?: string;
  level?: string;
  dailyTime?: number;
  goal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Step 0: Get Started
  getStarted(): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/0`, {});
  }

  // Step 1: Welcome & Basic Profile
  saveBasicProfile(profileData: OnboardingData['personalInfo']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/1`, profileData);
  }

  // Step 2: Learning Goals & Context
  saveLearningGoals(goalData: OnboardingData['learningGoals']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/2`, goalData);
  }

  // Step 3: Learning Preferences
  saveLearningPreferences(preferencesData: OnboardingData['learningPreferences']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/3`, preferencesData);
  }

  // Step 4: Schedule & Availability
  saveSchedule(scheduleData: OnboardingData['schedule']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/4`, scheduleData);
  }

  // Step 5: Skills Assessment Setup
  saveSkillsSetup(skillsData: OnboardingData['skillsSetup']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/5`, skillsData);
  }

  // Step 6: Background & Experience
  saveBackground(backgroundData: OnboardingData['background']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/6`, backgroundData);
  }

  // Step 7: Success Metrics & Preferences
  saveSuccessMetrics(metricsData: OnboardingData['successMetrics']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/7`, metricsData);
  }

  // Step 8: Skill Assessment
  saveSkillAssessment(assessmentData: OnboardingData['skillAssessments']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/8`, { skillAssessments: assessmentData });
  }

  // Step 9: Final Setup & Preferences
  saveFinalSetup(setupData: OnboardingData['finalSetup']): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/step/9`, setupData);
  }
  
  // Legacy methods for backward compatibility
  setLearningGoal(goalData: { skill: string, level: string, dailyTime: number, goal: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/goal`, goalData);
  }

  chooseFocus(focusAreas: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/focus`, { learningGoal: focusAreas });
  }

  customizeProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/customize`, profileData);
  }

  /**
   * Analyze a resume to extract onboarding data
   * @param file The resume file to analyze
   * @returns Observable with the extracted onboarding data
   */
  analyzeResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<any>(`${this.apiUrl}/onboarding/analyze-resume`, formData);
  }
  
  /**
   * Start onboarding with draft data
   * @returns Observable with draft onboarding data
   */
  startManually(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/onboarding/start-manually`, {});
  }

  /**
   * Save onboarding data for a specific step
   * @param stepNumber The step number being saved
   * @param stepData The data for the current step
   * @returns Observable with the response
   */
  saveOnboardingData(stepNumber: number, stepData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/save/${stepNumber}`, stepData);
  }

  /**
   * Complete the onboarding process with all collected data
   * @param onboardingData Complete onboarding data
   * @returns Observable with the response
   */
  completeOnboarding(onboardingData: OnboardingData): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding/complete`, onboardingData);
  }
}