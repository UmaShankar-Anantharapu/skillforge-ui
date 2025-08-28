import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Experience } from '../../models/resume.model';

@Component({
  selector: 'app-experience-editor',
  template: `
    <div class="section-editor">
      <div class="section-header">
        <h3>Work Experience</h3>
        <button mat-raised-button color="primary" (click)="addExperience()">
          <mat-icon>add</mat-icon>
          Add Experience
        </button>
      </div>

      <div class="experience-list" *ngIf="experienceArray.length > 0">
        <mat-card class="experience-card" *ngFor="let exp of experienceArray.controls; let i = index" [formGroup]="exp">
          <mat-card-header>
            <mat-card-title>Experience {{ i + 1 }}</mat-card-title>
            <button mat-icon-button color="warn" (click)="removeExperience(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-header>

          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Company</mat-label>
                <input matInput formControlName="company" placeholder="Company Name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Position</mat-label>
                <input matInput formControlName="position" placeholder="Job Title">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Start Date</mat-label>
                <input matInput type="date" formControlName="startDate">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width" *ngIf="!exp.get('current')?.value">
                <mat-label>End Date</mat-label>
                <input matInput type="date" formControlName="endDate">
              </mat-form-field>
            </div>

            <mat-checkbox formControlName="current" class="current-checkbox">
              Currently working here
            </mat-checkbox>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Describe your role and responsibilities"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Technologies (comma-separated)</mat-label>
              <input matInput formControlName="technologiesString" placeholder="React, Node.js, MongoDB">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Key Achievements (comma-separated)</mat-label>
              <textarea matInput formControlName="achievementsString" rows="3" placeholder="Increased performance by 30%, Led team of 5 developers"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="experienceArray.length === 0">
        <mat-icon>work</mat-icon>
        <p>No work experience added yet</p>
        <button mat-raised-button color="primary" (click)="addExperience()">
          Add Your First Experience
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
    .experience-card {
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
    .current-checkbox {
      margin: 16px 0;
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
export class ExperienceEditorComponent {
  @Input() experience: Experience[] = [];
  @Output() experienceChange = new EventEmitter<Experience[]>();

  experienceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.experienceForm = this.fb.group({
      experiences: this.fb.array([])
    });

    this.experienceForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  get experienceArray(): FormArray {
    return this.experienceForm.get('experiences') as FormArray;
  }

  ngOnInit() {
    if (this.experience && this.experience.length > 0) {
      this.experience.forEach(exp => {
        this.experienceArray.push(this.createExperienceFormGroup(exp));
      });
    }
  }

  createExperienceFormGroup(exp?: Experience): FormGroup {
    return this.fb.group({
      company: [exp?.company || '', Validators.required],
      position: [exp?.position || '', Validators.required],
      startDate: [exp?.startDate || ''],
      endDate: [exp?.endDate || ''],
      current: [exp?.current || false],
      description: [exp?.description || ''],
      technologiesString: [exp?.technologies?.join(', ') || ''],
      achievementsString: [exp?.achievements?.join(', ') || '']
    });
  }

  addExperience() {
    this.experienceArray.push(this.createExperienceFormGroup());
  }

  removeExperience(index: number) {
    this.experienceArray.removeAt(index);
  }

  private emitChanges() {
    const experiences = this.experienceArray.value.map((exp: any) => ({
      ...exp,
      technologies: exp.technologiesString ? exp.technologiesString.split(',').map((t: string) => t.trim()) : [],
      achievements: exp.achievementsString ? exp.achievementsString.split(',').map((a: string) => a.trim()) : []
    }));
    this.experienceChange.emit(experiences);
  }
}