import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ResumeTemplate } from '../../models/resume.model';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-template-selector',
  templateUrl: './template-selector.component.html',
  styleUrls: ['./template-selector.component.scss']
})
export class TemplateSelectorComponent implements OnInit {
  @Input() selectedTemplateId?: string;
  @Output() templateSelected = new EventEmitter<ResumeTemplate>();
  @Output() nextStep = new EventEmitter<void>();

  templates: ResumeTemplate[] = [];
  loading = true;
  error: string | null = null;

  constructor(private resumeService: ResumeService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.loading = true;
    this.error = null;
    
    this.resumeService.getTemplates().subscribe({
      next: (response) => {
        this.templates = response.templates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.error = 'Failed to load resume templates. Please try again.';
        this.loading = false;
      }
    });
  }

  selectTemplate(template: ResumeTemplate): void {
    this.selectedTemplateId = template.id;
    this.templateSelected.emit(template);
  }

  proceedToNext(): void {
    if (this.selectedTemplateId) {
      this.nextStep.emit();
    }
  }

  getTemplatesByCategory(category: string): ResumeTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  get availableCategories(): string[] {
    const categories = [...new Set(this.templates.map(t => t.category))];
    return categories.sort();
  }

  isTemplateSelected(templateId: string): boolean {
    return this.selectedTemplateId === templateId;
  }

  retryLoadTemplates(): void {
    this.loadTemplates();
  }
}