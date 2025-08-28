import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Skills } from '../../models/resume.model';

@Component({
  selector: 'app-skills-editor',
  template: `
    <div class="section-editor">
      <h3>Skills</h3>
      <form [formGroup]="skillsForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Technical Skills</mat-label>
          <textarea matInput formControlName="technicalString" rows="3" 
                   placeholder="JavaScript, Python, Java, C++, TypeScript"></textarea>
          <mat-hint>Separate skills with commas</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Frameworks & Libraries</mat-label>
          <textarea matInput formControlName="frameworksString" rows="3" 
                   placeholder="React, Angular, Node.js, Express, Django"></textarea>
          <mat-hint>Separate frameworks with commas</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Databases</mat-label>
          <textarea matInput formControlName="databasesString" rows="2" 
                   placeholder="MongoDB, PostgreSQL, MySQL, Redis"></textarea>
          <mat-hint>Separate databases with commas</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tools & Technologies</mat-label>
          <textarea matInput formControlName="toolsString" rows="3" 
                   placeholder="Git, Docker, AWS, Jenkins, Kubernetes"></textarea>
          <mat-hint>Separate tools with commas</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Soft Skills</mat-label>
          <textarea matInput formControlName="softSkillsString" rows="2" 
                   placeholder="Leadership, Communication, Problem Solving, Team Collaboration"></textarea>
          <mat-hint>Separate soft skills with commas</mat-hint>
        </mat-form-field>
      </form>

      <div class="skills-preview" *ngIf="hasAnySkills()">
        <h4>Skills Preview</h4>
        
        <div class="skill-category" *ngIf="skills.technical?.length">
          <h5>Technical Skills</h5>
          <div class="skill-chips">
            <mat-chip-set>
              <mat-chip *ngFor="let skill of skills.technical">{{ skill }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="skill-category" *ngIf="skills.frameworks?.length">
          <h5>Frameworks & Libraries</h5>
          <div class="skill-chips">
            <mat-chip-set>
              <mat-chip *ngFor="let framework of skills.frameworks">{{ framework }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="skill-category" *ngIf="skills.databases?.length">
          <h5>Databases</h5>
          <div class="skill-chips">
            <mat-chip-set>
              <mat-chip *ngFor="let db of skills.databases">{{ db }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="skill-category" *ngIf="skills.tools?.length">
          <h5>Tools & Technologies</h5>
          <div class="skill-chips">
            <mat-chip-set>
              <mat-chip *ngFor="let tool of skills.tools">{{ tool }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="skill-category" *ngIf="skills.soft_skills?.length">
          <h5>Soft Skills</h5>
          <div class="skill-chips">
            <mat-chip-set>
              <mat-chip *ngFor="let skill of skills.soft_skills">{{ skill }}</mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-editor {
      padding: 24px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    h3 {
      margin-bottom: 24px;
      color: #333;
    }
    .skills-preview {
      margin-top: 32px;
      padding: 24px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    .skills-preview h4 {
      margin-bottom: 16px;
      color: #333;
    }
    .skill-category {
      margin-bottom: 16px;
    }
    .skill-category h5 {
      margin-bottom: 8px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
    .skill-chips {
      margin-bottom: 12px;
    }
    mat-chip {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  `]
})
export class SkillsEditorComponent {
  @Input() skills: Skills = {
    technical: [],
    frameworks: [],
    databases: [],
    tools: [],
    soft_skills: []
  };
  @Output() skillsChange = new EventEmitter<Skills>();

  skillsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.skillsForm = this.fb.group({
      technicalString: [''],
      frameworksString: [''],
      databasesString: [''],
      toolsString: [''],
      softSkillsString: ['']
    });

    this.skillsForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  ngOnInit() {
    if (this.skills) {
      this.skillsForm.patchValue({
        technicalString: this.skills.technical?.join(', ') || '',
        frameworksString: this.skills.frameworks?.join(', ') || '',
        databasesString: this.skills.databases?.join(', ') || '',
        toolsString: this.skills.tools?.join(', ') || '',
        softSkillsString: this.skills.soft_skills?.join(', ') || ''
      });
    }
  }

  private emitChanges() {
    const formValue = this.skillsForm.value;
    const updatedSkills: Skills = {
      technical: this.parseSkillString(formValue.technicalString),
      frameworks: this.parseSkillString(formValue.frameworksString),
      databases: this.parseSkillString(formValue.databasesString),
      tools: this.parseSkillString(formValue.toolsString),
      soft_skills: this.parseSkillString(formValue.softSkillsString)
    };
    
    this.skills = updatedSkills;
    this.skillsChange.emit(updatedSkills);
  }

  private parseSkillString(skillString: string): string[] {
    if (!skillString) return [];
    return skillString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }

  hasAnySkills(): boolean {
    return !!(this.skills.technical?.length || 
             this.skills.frameworks?.length || 
             this.skills.databases?.length || 
             this.skills.tools?.length || 
             this.skills.soft_skills?.length);
  }
}