import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CurrentSkill {
  skillName: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  yearsOfExperience?: number;
  lastUsed?: string;
  prerequisites: string[];
  subSkills: string[];
}

export interface UserProfile {
  userId: string;
  fullName?: string;
  email?: string;
  skill?: string; // Legacy field for backward compatibility
  level?: string; // Legacy field for backward compatibility
  dailyTime?: number;
  goal?: string;
  currentSkills: CurrentSkill[];
  onboardingStep?: number;
  onboardingComplete?: boolean;
  primaryLearningGoal?: string;
  firstName?: string;
}

export interface SkillDetails {
  skillName: string;
  prerequisites: string[];
  subSkills: string[];
  relatedSkills: string[];
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService
  ) {}

  public upsertProfile(profile: Omit<UserProfile, 'userId'>): Observable<{ profile: UserProfile }> {
    return this.api.post<{ profile: UserProfile }>(`/profile`, profile);
  }

  public getProfile(userId: string): Observable<{ profile: UserProfile }> {
    return this.api.get<{ profile: UserProfile }>(`/profile/${userId}`);
  }

  // Enhanced methods for Known Skills integration
  public getUserSkills(userId: string): Observable<CurrentSkill[]> {
    return this.getProfile(userId).pipe(
      map(response => response.profile.currentSkills || [])
    );
  }

  public getCurrentUserProfile(): Observable<UserProfile> {
    const user = this.authService.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.getProfile(user.id).pipe(
      map(response => response.profile)
    );
  }

  public getCurrentUserSkills(): Observable<CurrentSkill[]> {
    const user = this.authService.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.getUserSkills(user.id);
  }

  public updateSkill(userId: string, skill: CurrentSkill): Observable<{ profile: UserProfile }> {
    return this.getProfile(userId).pipe(
      map(response => {
        const profile = response.profile;
        const skillIndex = profile.currentSkills.findIndex(s => s.skillName === skill.skillName);
        
        if (skillIndex >= 0) {
          profile.currentSkills[skillIndex] = skill;
        } else {
          profile.currentSkills.push(skill);
        }
        
        return profile;
      }),
      // Update the profile with modified skills
      switchMap(profile => this.upsertProfile(profile))
    );
  }

  public getSkillDetails(skillName: string): Observable<SkillDetails> {
    // This would typically call a backend endpoint for skill details
    // For now, we'll return mock data based on the skill name
    return this.api.get<SkillDetails>(`/skills/details/${encodeURIComponent(skillName)}`);
  }

  public addSkillToProfile(userId: string, skill: CurrentSkill): Observable<{ profile: UserProfile }> {
    return this.updateSkill(userId, skill);
  }

  public removeSkillFromProfile(userId: string, skillName: string): Observable<{ profile: UserProfile }> {
    return this.getProfile(userId).pipe(
      map(response => {
        const profile = response.profile;
        profile.currentSkills = profile.currentSkills.filter(s => s.skillName !== skillName);
        return profile;
      }),
      switchMap(profile => this.upsertProfile(profile))
    );
  }
}


