import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '@app/shared/material.module';

import { ResumeRoutingModule } from './resume-routing.module';
import { ResumeBuilderComponent } from './pages/resume-builder/resume-builder.component';
import { ResumeListComponent } from './pages/resume-list/resume-list.component';
import { ResumeWizardComponent } from './components/resume-wizard/resume-wizard.component';
import { TemplateSelectorComponent } from './components/template-selector/template-selector.component';
import { ProfessionalSummaryComponent } from './components/professional-summary/professional-summary.component';
import { ResumePreviewComponent } from './components/resume-preview/resume-preview.component';
import { ContactInfoEditorComponent } from './components/contact-info-editor/contact-info-editor.component';
import { ExperienceEditorComponent } from './components/experience-editor/experience-editor.component';
import { EducationEditorComponent } from './components/education-editor/education-editor.component';
import { SkillsEditorComponent } from './components/skills-editor/skills-editor.component';
import { ProjectsEditorComponent } from './components/projects-editor/projects-editor.component';

@NgModule({
  declarations: [
    ResumeBuilderComponent,
    ResumeListComponent,
    ResumeWizardComponent,
    TemplateSelectorComponent,
    ProfessionalSummaryComponent,
    ResumePreviewComponent,
    ContactInfoEditorComponent,
    ExperienceEditorComponent,
    EducationEditorComponent,
    SkillsEditorComponent,
    ProjectsEditorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ResumeRoutingModule,
    MaterialModule
  ]
})
export class ResumeModule { }