import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userProfile: any = null;
  isLoading = true;
  userName = 'User';
  primaryGoal = 'Set your learning goal';
  
  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  private loadUserProfile(): void {
    const user = this.authService.getUser();
    if (user) {
      this.profileService.getProfile(user.id).subscribe({
        next: (profileData) => {
          this.userProfile = profileData.profile;
          if (this.userProfile) {
            this.userName = this.userProfile.fullName || this.userProfile.firstName || 'User';
            this.primaryGoal = this.userProfile.primaryLearningGoal || 'Set your learning goal';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }
  
  adjustGoal(): void {
    // Navigate to onboarding or goal setting
    console.log('Adjust goal clicked');
  }
  
  startNextLesson(): void {
    // Navigate to next lesson
    console.log('Start next lesson clicked');
  }
  
  exploreRoadmaps(): void {
    // Navigate to roadmaps
    console.log('Explore roadmaps clicked');
  }
}
