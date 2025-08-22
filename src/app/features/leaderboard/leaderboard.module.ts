import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LeaderboardPageComponent } from './leaderboard.page';

const routes: Routes = [ { path: '', component: LeaderboardPageComponent } ];

@NgModule({
  declarations: [LeaderboardPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class LeaderboardModule {}


