import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResumeBuilderComponent } from './pages/resume-builder/resume-builder.component';
import { ResumeListComponent } from './pages/resume-list/resume-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ResumeListComponent },
  { path: 'builder', component: ResumeBuilderComponent },
  { path: 'builder/:id', component: ResumeBuilderComponent },
  { path: 'edit/:id', component: ResumeBuilderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResumeRoutingModule { }