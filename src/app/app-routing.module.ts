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
    loadChildren: () => import('./features/my-learning/my-learning.module').then(m => m.MyLearningModule),
  },
  {
    path: 'resume',
    loadChildren: () => import('./features/resume/resume.module').then(m => m.ResumeModule),
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
  // Add overlay route to lazy-load onboarding module into the named outlet "overlay"
  {
    path: 'onboarding',
    outlet: 'overlay',
    loadChildren: () =>
      import('./features/onboarding/onboarding.module').then((m) => m.OnboardingModule),
  },
  {
    path: 'skills',
    loadChildren: () =>
      import('./features/skills/skills.module').then((m) => m.SkillsModule),
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
  {
    path: 'learning-path',
    loadChildren: () => import('./features/roadmaps-catalog/roadmaps-catalog.module').then(m => m.RoadmapsCatalogModule),
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
