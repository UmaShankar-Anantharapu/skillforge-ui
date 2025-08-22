import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'my-learning',
    loadChildren: () => import('./features/lesson/lesson.module').then(m => m.LessonModule),
  },
  {
    path: 'resume',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'onboarding',
    loadChildren: () =>
      import('./features/onboarding/onboarding.module').then((m) => m.OnboardingModule),
  },
  {
    path: 'roadmap',
    loadChildren: () =>
      import('./features/roadmap/roadmap.module').then((m) => m.RoadmapModule),
  },
  {
    path: 'lesson',
    loadChildren: () =>
      import('./features/lesson/lesson.module').then((m) => m.LessonModule),
  },
  {
    path: 'challenges',
    loadChildren: () =>
      import('./features/challenges/challenges.module').then((m) => m.ChallengesModule),
  },
  {
    path: 'leaderboard',
    loadChildren: () =>
      import('./features/leaderboard/leaderboard.module').then((m) => m.LeaderboardModule),
  },
  {
    path: 'badges',
    loadChildren: () =>
      import('./features/badges/badges.module').then((m) => m.BadgesModule),
  },
  {
    path: 'tutor',
    loadChildren: () =>
      import('./features/tutor/tutor.module').then((m) => m.TutorModule),
  },
  {
    path: 'analytics',
    loadChildren: () =>
      import('./features/analytics/analytics.module').then((m) => m.AnalyticsModule),
  },
  {
    path: 'research-agent',
    loadChildren: () =>
      import('./features/research-agent/research-agent.module').then((m) => m.ResearchAgentModule),
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
