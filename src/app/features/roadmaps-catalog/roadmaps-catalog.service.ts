import { Injectable } from '@angular/core';

export interface CatalogStep { day: number; topic: string; lessonId?: string }
export interface CatalogRoadmap { id: string; title: string; description?: string; estimatedDuration?: string; difficulty?: string; steps: CatalogStep[] }
export interface CatalogProgress { roadmapId: string; started: boolean; lastCompletedDay: number; totalSteps: number }

@Injectable({ providedIn: 'root' })
export class RoadmapsCatalogService {
  private readonly key = (id: string) => `sf_catalog_roadmap_progress_${id}`;

  // Dummy data for demo
  private roadmaps: CatalogRoadmap[] = [
    // Catalog sample
    {
      id: 'js-beginner',
      title: 'JavaScript Beginner Path',
      description: 'Kickstart your JS journey with fundamentals and hands-on practice.',
      estimatedDuration: '3 weeks',
      difficulty: 'Beginner',
      steps: [
        { day: 1, topic: 'Variables and Types', lessonId: 'lesson-js-1' },
        { day: 2, topic: 'Functions and Scope', lessonId: 'lesson-js-2' },
        { day: 3, topic: 'Arrays and Objects', lessonId: 'lesson-js-3' },
      ]
    },
    {
      id: 'python-intermediate',
      title: 'Python Intermediate Path',
      description: 'Strengthen your Python skills with modules and projects.',
      estimatedDuration: '4 weeks',
      difficulty: 'Intermediate',
      steps: [
        { day: 1, topic: 'Modules and Packages', lessonId: 'lesson-py-1' },
        { day: 2, topic: 'File I/O', lessonId: 'lesson-py-2' },
        { day: 3, topic: 'Error Handling', lessonId: 'lesson-py-3' },
      ]
    },
    // My Learning targets
    {
      id: 'data-science',
      title: 'Data Science Roadmap',
      description: 'Intro to DS concepts, viz, and ML basics.',
      estimatedDuration: '3 weeks',
      difficulty: 'Beginner',
      steps: [
        { day: 1, topic: 'Intro to Data Science' },
        { day: 2, topic: 'Visualization Basics' },
        { day: 3, topic: 'Intro to Machine Learning' },
      ]
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning Roadmap',
      description: 'Core ML topics and applications.',
      estimatedDuration: '4 weeks',
      difficulty: 'Intermediate',
      steps: [
        { day: 1, topic: 'Supervised Learning' },
        { day: 2, topic: 'Model Evaluation' },
        { day: 3, topic: 'Unsupervised Learning' },
      ]
    },
    {
      id: 'ai-engineering',
      title: 'AI Engineering Roadmap',
      description: 'Systems, deployment, and MLOps essentials.',
      estimatedDuration: '4 weeks',
      difficulty: 'Intermediate',
      steps: [
        { day: 1, topic: 'Serving Models' },
        { day: 2, topic: 'Pipelines' },
        { day: 3, topic: 'Monitoring' },
      ]
    }
  ];

  // Data access
  list(): CatalogRoadmap[] { return this.roadmaps; }
  get(id: string): CatalogRoadmap | null { return this.roadmaps.find(r => r.id === id) || null; }

  // Progress helpers (localStorage)
  getProgress(id: string, totalSteps?: number): CatalogProgress {
    try {
      const raw = localStorage.getItem(this.key(id));
      if (raw) return JSON.parse(raw) as CatalogProgress;
    } catch {}
    return { roadmapId: id, started: false, lastCompletedDay: 0, totalSteps: totalSteps ?? (this.get(id)?.steps.length || 0) };
  }
  start(id: string): CatalogProgress {
    const totalSteps = this.get(id)?.steps.length || 0;
    const p: CatalogProgress = { roadmapId: id, started: true, lastCompletedDay: 0, totalSteps };
    localStorage.setItem(this.key(id), JSON.stringify(p));
    return p;
  }
  markCompleted(id: string, day: number): CatalogProgress {
    const cur = this.getProgress(id);
    const next: CatalogProgress = { ...cur, started: true, lastCompletedDay: Math.max(cur.lastCompletedDay, day) };
    localStorage.setItem(this.key(id), JSON.stringify(next));
    return next;
  }
}

