import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoadmapPageComponent } from './roadmap.page';
import { RoadmapVisualizationComponent } from './components/roadmap-visualization/roadmap-visualization.component';

const routes: Routes = [
  { path: '', component: RoadmapPageComponent },
];

@NgModule({
  declarations: [RoadmapPageComponent, RoadmapVisualizationComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RoadmapModule {}


