import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LessonPageComponent } from './lesson.page';

const routes: Routes = [
  { path: ':id', component: LessonPageComponent },
];

@NgModule({
  declarations: [LessonPageComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class LessonModule {}


