import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Project } from '../../models/resume.model';

@Component({
  selector: 'app-projects-editor',
  template: `
    <div class="section-editor">
      <div class="section-header">
        <h3>Projects</h3>
        <button mat-raised-button color="primary" (click)="addProject()">
          <mat-icon>add</mat-icon>
          Add Project
        </button>
      </div>

      <div class="projects-list" *ngIf="projectsArray.length > 0">
        <mat-card class="project-card" *ngFor="let project of projectsArray.controls; let i = index" [formGroup]="project">
          <mat-card-header>
            <mat-card-title>Project {{ i + 1 }}</mat-card-title>
            <button mat-icon-button color="warn" (click)="removeProject(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-header>

          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Project Name</mat-label>
              <input matInput formControlName="name" placeholder="My Awesome Project">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" 
                       placeholder="Brief description of what the project does and its purpose"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Technologies Used (comma-separated)</mat-label>
              <input matInput formControlName="technologiesString" 
                    placeholder="React, Node.js, MongoDB, Express">
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>GitHub URL (Optional)</mat-label>
                <input matInput formControlName="github_url" 
                      placeholder="https://github.com/username/project">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Live Demo URL (Optional)</mat-label>
                <input matInput formControlName="live_url" 
                      placeholder="https://myproject.com">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Key Highlights (comma-separated)</mat-label>
              <textarea matInput formControlName="highlightsString" rows="3" 
                       placeholder="Implemented real-time features, Optimized performance by 40%, Used microservices architecture"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="projectsArray.length === 0">
        <mat-icon>code</mat-icon>
        <p>No projects added yet</p>
        <button mat-raised-button color="primary" (click)="addProject()">
          Add Your First Project
        </button>
      </div>
    </div>
  `,
  styles: [`
    .section-editor {
      padding: 24px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .project-card {
      margin-bottom: 24px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class ProjectsEditorComponent {
  @Input() projects: Project[] = [];
  @Output() projectsChange = new EventEmitter<Project[]>();

  projectsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.projectsForm = this.fb.group({
      projects: this.fb.array([])
    });

    this.projectsForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  get projectsArray(): FormArray {
    return this.projectsForm.get('projects') as FormArray;
  }

  ngOnInit() {
    if (this.projects && this.projects.length > 0) {
      this.projects.forEach(project => {
        this.projectsArray.push(this.createProjectFormGroup(project));
      });
    }
  }

  createProjectFormGroup(project?: Project): FormGroup {
    return this.fb.group({
      name: [project?.name || '', Validators.required],
      description: [project?.description || '', Validators.required],
      technologiesString: [project?.technologies?.join(', ') || ''],
      github_url: [project?.github_url || ''],
      live_url: [project?.live_url || ''],
      highlightsString: [project?.highlights?.join(', ') || '']
    });
  }

  addProject() {
    this.projectsArray.push(this.createProjectFormGroup());
  }

  removeProject(index: number) {
    this.projectsArray.removeAt(index);
  }

  private emitChanges() {
    const projects = this.projectsArray.value.map((project: any) => ({
      ...project,
      technologies: project.technologiesString ? 
        project.technologiesString.split(',').map((t: string) => t.trim()) : [],
      highlights: project.highlightsString ? 
        project.highlightsString.split(',').map((h: string) => h.trim()) : []
    }));
    this.projectsChange.emit(projects);
  }
}