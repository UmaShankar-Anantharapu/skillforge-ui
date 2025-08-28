import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Education } from '../../models/resume.model';

@Component({
  selector: 'app-education-editor',
  template: `
    <div class="section-editor">
      <div class="section-header">
        <h3>Education</h3>
        <button mat-raised-button color="primary" (click)="addEducation()">
          <mat-icon>add</mat-icon>
          Add Education
        </button>
      </div>

      <div class="education-list" *ngIf="educationArray.length > 0">
        <mat-card class="education-card" *ngFor="let edu of educationArray.controls; let i = index" [formGroup]="edu">
          <mat-card-header>
            <mat-card-title>Education {{ i + 1 }}</mat-card-title>
            <button mat-icon-button color="warn" (click)="removeEducation(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-header>

          <mat-card-content>
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Institution</mat-label>
                <input matInput formControlName="institution" placeholder="University/College Name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Degree</mat-label>
                <input matInput formControlName="degree" placeholder="Bachelor's, Master's, etc.">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Field of Study</mat-label>
                <input matInput formControlName="field" placeholder="Computer Science, Engineering, etc.">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>GPA (Optional)</mat-label>
                <input matInput formControlName="gpa" placeholder="3.8/4.0">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Start Date</mat-label>
                <input matInput type="date" formControlName="startDate">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>End Date</mat-label>
                <input matInput type="date" formControlName="endDate">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Relevant Coursework (comma-separated)</mat-label>
              <textarea matInput formControlName="courseworkString" rows="3" placeholder="Data Structures, Algorithms, Web Development"></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="educationArray.length === 0">
        <mat-icon>school</mat-icon>
        <p>No education added yet</p>
        <button mat-raised-button color="primary" (click)="addEducation()">
          Add Your Education
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
    .education-card {
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
export class EducationEditorComponent {
  @Input() education: Education[] = [];
  @Output() educationChange = new EventEmitter<Education[]>();

  educationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.educationForm = this.fb.group({
      educations: this.fb.array([])
    });

    this.educationForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  get educationArray(): FormArray {
    return this.educationForm.get('educations') as FormArray;
  }

  ngOnInit() {
    if (this.education && this.education.length > 0) {
      this.education.forEach(edu => {
        this.educationArray.push(this.createEducationFormGroup(edu));
      });
    }
  }

  createEducationFormGroup(edu?: Education): FormGroup {
    return this.fb.group({
      institution: [edu?.institution || '', Validators.required],
      degree: [edu?.degree || '', Validators.required],
      field: [edu?.field || '', Validators.required],
      startDate: [edu?.startDate || ''],
      endDate: [edu?.endDate || ''],
      gpa: [edu?.gpa || ''],
      courseworkString: [edu?.relevant_coursework?.join(', ') || '']
    });
  }

  addEducation() {
    this.educationArray.push(this.createEducationFormGroup());
  }

  removeEducation(index: number) {
    this.educationArray.removeAt(index);
  }

  private emitChanges() {
    const educations = this.educationArray.value.map((edu: any) => ({
      ...edu,
      relevant_coursework: edu.courseworkString ? edu.courseworkString.split(',').map((c: string) => c.trim()) : []
    }));
    this.educationChange.emit(educations);
  }
}