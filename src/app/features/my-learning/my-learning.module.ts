import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyLearningPageComponent } from './my-learning.page';

const routes: Routes = [
  { path: '', component: MyLearningPageComponent }
];

@NgModule({
  declarations: [MyLearningPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class MyLearningModule {}

