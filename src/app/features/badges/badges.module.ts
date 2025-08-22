import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BadgesPageComponent } from './badges.page';

const routes: Routes = [ { path: '', component: BadgesPageComponent } ];

@NgModule({
  declarations: [BadgesPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class BadgesModule {}


