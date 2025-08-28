import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RoadmapsOverviewPage } from './screens/overview/overview.page';
import { RoadmapDetailPage } from './screens/detail/detail.page';

const routes: Routes = [
  { path: '', component: RoadmapsOverviewPage },
  { path: ':id', component: RoadmapDetailPage },
];

@NgModule({
  declarations: [RoadmapsOverviewPage, RoadmapDetailPage],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class RoadmapsCatalogModule {}

