import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { RoadmapsOverviewPage } from './screens/overview/overview.page';
import { RoadmapDetailPage } from './screens/detail/detail.page';
import { RoadmapDetailComponent } from './screens/detail/roadmap-detail.component';


const routes: Routes = [
  { path: '', component: RoadmapsOverviewPage },
  { path: 'details/:id', component: RoadmapDetailPage },
];

@NgModule({
  declarations: [RoadmapsOverviewPage, RoadmapDetailPage, RoadmapDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class RoadmapsCatalogModule {}

