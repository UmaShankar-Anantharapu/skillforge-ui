import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SkillsPageComponent } from './skills.page';
import { SkillsVisualizationComponent } from './components/skills-visualization/skills-visualization.component';
import { KnownSkillsComponent } from './components/known-skills/known-skills.component';

const routes: Routes = [
  { path: '', component: SkillsPageComponent },
];

@NgModule({
  declarations: [SkillsPageComponent, SkillsVisualizationComponent, KnownSkillsComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
})
export class SkillsModule {}


