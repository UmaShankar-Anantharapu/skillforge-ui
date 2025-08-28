import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfessionalSummary, GeneratedSummary } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-professional-summary',
  template: `
    <div class="professional-summary-container">
      <h3>Professional Summary</h3>
      
      <div class="summary-options">
        <button 
          type="button" 
          class="option-btn" 
          [class.active]="mode === 'generate'"
          (click)="setMode('generate')">
          Generate with AI
        </button>
        <button 
          type="button" 
          class="option-btn" 
          [class.active]="mode === 'custom'"
          (click)="setMode('custom')">
          Write Custom
        </button>
      </div>

      <!-- AI Generation Mode -->
      <div *ngIf="mode === 'generate'" class="generate-section">
        <form [formGroup]="generationForm" (ngSubmit)="generateSummary()">
          <div class="form-row">
            <div class="form-group">
              <label for="careerFocus">Career Focus *</label>
              <input 
                type="text" 
                id="careerFocus"
                formControlName="careerFocus"
                placeholder="e.g., Full Stack Developer, Data Scientist">
            </div>
            <div class="form-group">
              <label for="experienceLevel">Experience Level *</label>
              <select id="experienceLevel" formControlName="experienceLevel">
                <option value="">Select level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
                <option value="lead">Lead/Manager (8+ years)</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="keySkills">Key Skills *</label>
            <input 
              type="text" 
              id="keySkills"
              formControlName="keySkills"
              placeholder="e.g., JavaScript, React, Node.js, Python">
          </div>
          
          <div class="form-group">
            <label for="industry">Industry</label>
            <input 
              type="text" 
              id="industry"
              formControlName="industry"
              placeholder="e.g., FinTech, E-commerce, Healthcare">
          </div>
          
          <button 
            type="submit" 
            class="generate-btn"
            [disabled]="generationForm.invalid || isGenerating">
            <span *ngIf="isGenerating">Generating...</span>
            <span *ngIf="!isGenerating">Generate Summary</span>
          </button>
        </form>
        
        <!-- Generated Options -->
        <div *ngIf="generatedOptions.length > 0" class="generated-options">
          <h4>Choose a summary:</h4>
          <div class="options-list">
            <div 
              *ngFor="let option of generatedOptions; let i = index"
              class="summary-option"
              [class.selected]="selectedOptionIndex === i"
              (click)="selectOption(i)">
              <div class="option-header">
                <span class="option-number">Option {{i + 1}}</span>
                <button 
                  type="button" 
                  class="use-btn"
                  (click)="useSummary(option.summary); $event.stopPropagation()">
                  Use This
                </button>
              </div>
              <p class="summary-text">{{option.summary}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Mode -->
      <div *ngIf="mode === 'custom'" class="custom-section">
        <div class="form-group">
          <label for="customSummary">Write your professional summary *</label>
          <textarea 
            id="customSummary"
            [(ngModel)]="customSummary"
            (ngModelChange)="onCustomSummaryChange()"
            placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
            rows="6">
          </textarea>
          <div class="char-count">{{customSummary?.length || 0}}/500 characters</div>
        </div>
      </div>

      <!-- Current Summary Preview -->
      <div *ngIf="currentSummary" class="current-summary">
        <h4>Current Summary:</h4>
        <div class="summary-preview">
          <p>{{currentSummary}}</p>
          <button type="button" class="edit-btn" (click)="editCurrentSummary()">Edit</button>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-message">
        {{errorMessage}}
      </div>
    </div>
  `,
  styles: [`
    .professional-summary-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .summary-options {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .option-btn {
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .option-btn.active {
      border-color: #007bff;
      background: #007bff;
      color: white;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .char-count {
      text-align: right;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .generate-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }

    .generate-btn:hover:not(:disabled) {
      background: #218838;
    }

    .generate-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .generated-options {
      margin-top: 20px;
    }

    .generated-options h4 {
      margin-bottom: 15px;
      color: #333;
    }

    .summary-option {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .summary-option:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0,123,255,0.1);
    }

    .summary-option.selected {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .option-number {
      font-weight: 600;
      color: #007bff;
    }

    .use-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .use-btn:hover {
      background: #0056b3;
    }

    .summary-text {
      margin: 0;
      line-height: 1.5;
      color: #333;
    }

    .current-summary {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .current-summary h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .summary-preview {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
    }

    .summary-preview p {
      margin: 0;
      flex: 1;
      line-height: 1.5;
    }

    .edit-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
    }

    .edit-btn:hover {
      background: #545b62;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-top: 15px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .summary-options {
        flex-direction: column;
      }
      
      .option-btn {
        width: 100%;
      }
    }
  `]
})
export class ProfessionalSummaryComponent implements OnInit {
  @Input() professionalSummary: ProfessionalSummary | null = null;
  @Output() summaryChange = new EventEmitter<ProfessionalSummary>();

  mode: 'generate' | 'custom' = 'generate';
  generationForm: FormGroup;
  customSummary = '';
  currentSummary = '';
  generatedOptions: GeneratedSummary[] = [];
  selectedOptionIndex = -1;
  isGenerating = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeService
  ) {
    this.generationForm = this.fb.group({
      careerFocus: ['', Validators.required],
      experienceLevel: ['', Validators.required],
      keySkills: ['', Validators.required],
      industry: ['']
    });
  }

  ngOnInit() {
    if (this.professionalSummary?.content) {
      this.currentSummary = this.professionalSummary.content;
      this.customSummary = this.professionalSummary.content;
    }
  }

  setMode(mode: 'generate' | 'custom') {
    this.mode = mode;
    this.errorMessage = '';
  }

  async generateSummary() {
    if (this.generationForm.invalid) return;

    this.isGenerating = true;
    this.errorMessage = '';

    try {
      const formValue = this.generationForm.value;
      const response = await this.resumeService.generateSummaries({
        careerFocus: formValue.careerFocus,
        experienceLevel: formValue.experienceLevel,
        skills: formValue.keySkills.split(',').map((s: string) => s.trim()),
        industry: formValue.industry
      }).toPromise();

      this.generatedOptions = response.summaries || [];
      this.selectedOptionIndex = -1;
    } catch (error) {
      this.errorMessage = 'Failed to generate summary. Please try again.';
      console.error('Error generating summary:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  selectOption(index: number) {
    this.selectedOptionIndex = index;
  }

  useSummary(summary: string) {
    this.currentSummary = summary;
    this.customSummary = summary;
    this.emitSummaryChange(summary);
  }

  onCustomSummaryChange() {
    this.currentSummary = this.customSummary;
    this.emitSummaryChange(this.customSummary);
  }

  editCurrentSummary() {
    this.mode = 'custom';
    this.customSummary = this.currentSummary;
  }

  private emitSummaryChange(summary: string) {
    const professionalSummary: ProfessionalSummary = {
      content: summary,
      type: 'custom',
      isCustom: this.mode === 'custom'
    };
    this.summaryChange.emit(professionalSummary);
  }
}