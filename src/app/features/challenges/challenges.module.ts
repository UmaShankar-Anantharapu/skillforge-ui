import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChallengesPageComponent } from './challenges.page';

const routes: Routes = [ { path: '', component: ChallengesPageComponent } ];

@NgModule({
  declarations: [ChallengesPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ChallengesModule {}


