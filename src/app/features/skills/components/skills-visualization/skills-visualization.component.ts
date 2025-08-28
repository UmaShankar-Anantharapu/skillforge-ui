import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Roadmap, RoadmapStep } from '../../../../core/services/roadmap.service';

interface SkillsNode {
  id: string;
  day: number;
  topic: string;
  lessonIds: string[];
  x: number;
  y: number;
  status: 'completed' | 'current' | 'upcoming';
}

interface SkillsConnection {
  id: string;
  source: string;
  target: string;
}

@Component({
  selector: 'app-skills-visualization',
  templateUrl: './skills-visualization.component.html',
  styleUrls: ['./skills-visualization.component.scss']
})
export class SkillsVisualizationComponent implements OnChanges {
  @Input() skills: Roadmap | null = null;
  @Input() currentDay: number = 1;
  @Input() viewMode: 'path' | 'calendar' = 'path';
  
  nodes: SkillsNode[] = [];
  connections: SkillsConnection[] = [];
  Math = Math; // Make Math available to the template
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['skills'] && this.skills) {
      this.generateVisualization();
    }
  }
  
  generateVisualization(): void {
    if (!this.skills || !this.skills.steps || this.skills.steps.length === 0) {
      return;
    }
    
    if (this.viewMode === 'path') {
      this.generatePathView();
    } else {
      this.generateCalendarView();
    }
  }
  
  generatePathView(): void {
    this.nodes = [];
    this.connections = [];
    
    // Create nodes for each step
    this.skills!.steps.forEach((step, index) => {
      const node = {
        id: `node-${step.day}`,
        day: step.day,
        topic: step.topic,
        lessonIds: step.lessonIds,
        x: (index % 3) * 200 + 100, // Position nodes in a grid
        y: Math.floor(index / 3) * 150 + 100,
        status: this.getNodeStatus(step)
      };
      
      this.nodes.push(node);
      
      // Create connections between nodes
      if (index > 0) {
        this.connections.push({
          id: `connection-${index}`,
          source: `node-${this.skills!.steps[index - 1].day}`,
          target: `node-${step.day}`
        });
      }
    });
  }
  
  generateCalendarView(): void {
    this.nodes = [];
    this.connections = [];
    
    // Create calendar view nodes
    const daysInWeek = 7;
    this.skills!.steps.forEach((step) => {
      const weekNumber = Math.floor((step.day - 1) / daysInWeek);
      const dayInWeek = (step.day - 1) % daysInWeek;
      
      const node = {
        id: `node-${step.day}`,
        day: step.day,
        topic: step.topic,
        lessonIds: step.lessonIds,
        x: dayInWeek * 150 + 100,
        y: weekNumber * 150 + 100,
        status: this.getNodeStatus(step)
      };
      
      this.nodes.push(node);
    });
  }
  
  getNodeStatus(step: RoadmapStep): 'completed' | 'current' | 'upcoming' {
    if (step.day < this.currentDay) {
      return 'completed';
    } else if (step.day === this.currentDay) {
      return 'current';
    } else {
      return 'upcoming';
    }
  }
  
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'path' ? 'calendar' : 'path';
    this.generateVisualization();
  }
  
  getNodeById(id: string): SkillsNode | undefined {
    return this.nodes.find(node => node.id === id);
  }

  getGridRow(day: number): number {
    return Math.floor((day - 1) / 7) + 1;
  }
}