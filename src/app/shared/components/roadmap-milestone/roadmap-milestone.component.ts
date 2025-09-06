import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-roadmap-milestone',
  templateUrl: './roadmap-milestone.component.html',
  styleUrls: ['./roadmap-milestone.component.scss']
})
export class RoadmapMilestoneComponent {
  @Input() milestone: any;
  @Input() index: number = 0;
  @Input() isActive: boolean = false;
  @Input() theme: 'light' | 'dark' = 'light';
  
  @Output() toggle = new EventEmitter<any>();
  @Output() aiSummary = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<any>();

  onToggleComplete(): void {
    this.toggle.emit(this.milestone);
  }

  onGenerateAiSummary(): void {
    this.aiSummary.emit(this.milestone);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.milestone);
  }

  getProgressPercentage(): number {
    if (!this.milestone?.resources || this.milestone.resources.length === 0) {
      return this.milestone?.isCompleted ? 100 : 0;
    }
    
    const completedResources = this.milestone.resources.filter((r: any) => r.completed).length;
    return Math.round((completedResources / this.milestone.resources.length) * 100);
  }

  getSkillsText(): string {
    if (!this.milestone?.skills || this.milestone.skills.length === 0) {
      return 'No skills defined';
    }
    
    if (this.milestone.skills.length <= 3) {
      return this.milestone.skills.join(', ');
    }
    
    return `${this.milestone.skills.slice(0, 3).join(', ')} +${this.milestone.skills.length - 3} more`;
  }
}