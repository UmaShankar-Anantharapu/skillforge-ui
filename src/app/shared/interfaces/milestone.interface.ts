export interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  skills: string[];
  order: number;
  isCompleted: boolean;
  resources?: any[];
  projects?: any[];
}