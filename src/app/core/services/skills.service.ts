import { Injectable } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface SkillRecommendation {
  skillName: string;
  matchScore: number;
  reason: string;
  benefits: string[];
  relatedSkills: string[];
  estimatedLearningTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SkillRelationship {
  skillName: string;
  relatedSkills: string[];
  prerequisites: string[];
  subSkills: string[];
  description?: string;
}

export interface CareerPathway {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  recommendedSkills: string[];
  estimatedTimeframe: string;
  learningPath: {
    phase: number;
    skills: string[];
    duration: string;
    description: string;
  }[];
}

export interface SkillSuggestionRequest {
  goal?: string;
  currentSkills?: string[];
  targetRole?: string;
  useAI?: boolean;
}

export interface SkillSuggestionResponse {
  suggestions: {
    core: string[];
    advanced: string[];
    complementary: string[];
  };
  estimatedTime: string;
  difficulty: string;
  learningPath?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  /**
   * Get AI-powered skill recommendations based on user's current skills and goals
   */
  getSkillRecommendations(request: SkillSuggestionRequest): Observable<SkillRecommendation[]> {
    return this.api.post<SkillSuggestionResponse>('/skills/suggest', request)
      .pipe(
        map(response => this.transformToRecommendations(response, request)),
        catchError(error => {
          console.error('Error getting skill recommendations:', error);
          return of(this.getFallbackRecommendations());
        })
      );
  }

  /**
   * Get skill relationships (prerequisites, sub-skills, related skills)
   */
  getSkillRelationships(skillName: string): Observable<SkillRelationship> {
    return this.api.get<SkillRelationship>(`/skills/relationships/${encodeURIComponent(skillName)}`)
      .pipe(
        catchError(error => {
          console.error('Error getting skill relationships:', error);
          return of(this.getFallbackSkillRelationship(skillName));
        })
      );
  }

  /**
   * Get career pathway recommendations
   */
  getCareerPathways(currentSkills: string[], targetRole: string): Observable<CareerPathway> {
    const request = {
      currentSkills,
      targetRole
    };
    
    return this.api.post<CareerPathway>('/skills/career-pathways', request)
      .pipe(
        catchError(error => {
          console.error('Error getting career pathways:', error);
          return of(this.getFallbackCareerPathway(currentSkills, targetRole));
        })
      );
  }

  /**
   * Get sub-skills for a specific skill
   */
  getSubSkills(skillName: string): Observable<{ skillName: string; prerequisites: string[]; subSkills: string[] }> {
    return this.api.post<{ skillName: string; prerequisites: string[]; subSkills: string[] }>('/skills/subskills', { skillName })
      .pipe(
        catchError(error => {
          console.error('Error getting sub-skills:', error);
          return of({ skillName, prerequisites: [], subSkills: [] });
        })
      );
  }

  /**
   * Search for skills based on query
   */
  searchSkills(query: string): Observable<string[]> {
    return this.api.get<{ skills: string[] }>(`/skills/search?q=${encodeURIComponent(query)}`)
      .pipe(
        map(response => response.skills || []),
        catchError(error => {
          console.error('Error searching skills:', error);
          return of(this.getFallbackSkillSearch(query));
        })
      );
  }

  /**
   * Get trending skills
   */
  getTrendingSkills(): Observable<string[]> {
    return this.api.get<{ skills: string[] }>('/skills/trending')
      .pipe(
        map(response => response.skills || []),
        catchError(error => {
          console.error('Error getting trending skills:', error);
          return of(this.getFallbackTrendingSkills());
        })
      );
  }

  /**
   * Get AI-powered personalized roadmap recommendations
   */
  getAIRecommendations(userId: string): Observable<any[]> {
    return this.api.get<{ roadmaps: any[] }>(`/skills/personalized-roadmaps?userId=${userId}`)
      .pipe(
        map(response => response.roadmaps || []),
        catchError(error => {
          console.error('Error getting AI recommendations:', error);
          return of([]);
        })
      );
  }

  /**
   * Get trending roadmaps
   */
  getTrendingRoadmaps(): Observable<any[]> {
    return this.api.get<{ roadmaps: any[] }>('/skills/trending-roadmaps')
      .pipe(
        map(response => response.roadmaps || []),
        catchError(error => {
          console.error('Error getting trending roadmaps:', error);
          return of([]);
        })
      );
  }

  /**
   * Transform API response to skill recommendations format
   */
  private transformToRecommendations(response: SkillSuggestionResponse, request: SkillSuggestionRequest): SkillRecommendation[] {
    const recommendations: SkillRecommendation[] = [];
    const currentSkills = request.currentSkills || [];

    // Process core skills
    response.suggestions.core?.forEach((skill, index) => {
      if (!currentSkills.includes(skill)) {
        recommendations.push({
          skillName: skill,
          matchScore: 95 - (index * 5),
          reason: `Essential ${request.targetRole ? 'for ' + request.targetRole : 'skill'} that builds on your current expertise`,
          benefits: [
            'Core competency for your target role',
            'High demand in the job market',
            'Strong foundation for advanced skills'
          ],
          relatedSkills: currentSkills.slice(0, 2),
          difficulty: 'Intermediate',
          estimatedLearningTime: '2-4 weeks'
        });
      }
    });

    // Process advanced skills
    response.suggestions.advanced?.forEach((skill, index) => {
      if (!currentSkills.includes(skill)) {
        recommendations.push({
          skillName: skill,
          matchScore: 85 - (index * 3),
          reason: `Advanced skill that will set you apart in ${request.targetRole || 'your field'}`,
          benefits: [
            'Specialized expertise',
            'Higher salary potential',
            'Leadership opportunities'
          ],
          relatedSkills: response.suggestions.core?.slice(0, 2) || [],
          difficulty: 'Advanced',
          estimatedLearningTime: '4-8 weeks'
        });
      }
    });

    // Process complementary skills
    response.suggestions.complementary?.forEach((skill, index) => {
      if (!currentSkills.includes(skill) && recommendations.length < 5) {
        recommendations.push({
          skillName: skill,
          matchScore: 75 - (index * 2),
          reason: `Complementary skill that enhances your overall profile`,
          benefits: [
            'Broadens your skill set',
            'Improves collaboration',
            'Increases versatility'
          ],
          relatedSkills: currentSkills.slice(0, 1),
          difficulty: 'Beginner',
          estimatedLearningTime: '1-3 weeks'
        });
      }
    });

    // Return full list; pagination is handled at the component level
    return recommendations;
  }

  /**
   * Fallback recommendations when API fails
   */
  private getFallbackRecommendations(): SkillRecommendation[] {
    return [
      {
        skillName: 'Docker',
        matchScore: 92,
        reason: 'Essential containerization technology for modern development',
        benefits: [
          'Streamline application deployment',
          'Improve development consistency',
          'High demand in DevOps roles'
        ],
        relatedSkills: ['Cloud Computing', 'DevOps'],
        difficulty: 'Intermediate',
        estimatedLearningTime: '2-3 weeks'
      },
      {
        skillName: 'React',
        matchScore: 88,
        reason: 'Popular frontend framework with excellent job prospects',
        benefits: [
          'Build modern user interfaces',
          'High demand in frontend development',
          'Strong community support'
        ],
        relatedSkills: ['JavaScript', 'Web Development'],
        difficulty: 'Intermediate',
        estimatedLearningTime: '3-4 weeks'
      },
      {
        skillName: 'Python',
        matchScore: 85,
        reason: 'Versatile programming language for multiple domains',
        benefits: [
          'Data science and AI applications',
          'Web development capabilities',
          'Beginner-friendly syntax'
        ],
        relatedSkills: ['Programming', 'Data Analysis'],
        difficulty: 'Beginner',
        estimatedLearningTime: '4-6 weeks'
      }
    ];
  }

  /**
   * Fallback skill relationship when API fails
   */
  private getFallbackSkillRelationship(skillName: string): SkillRelationship {
    const fallbackRelationships: { [key: string]: SkillRelationship } = {
      'JavaScript': {
        skillName: 'JavaScript',
        relatedSkills: ['TypeScript', 'React', 'Node.js', 'HTML', 'CSS'],
        prerequisites: ['HTML', 'CSS', 'Programming Basics'],
        subSkills: ['ES6+', 'DOM Manipulation', 'Async Programming', 'Closures'],
        description: 'Dynamic programming language for web development'
      },
      'Python': {
        skillName: 'Python',
        relatedSkills: ['Django', 'Flask', 'NumPy', 'Pandas', 'Machine Learning'],
        prerequisites: ['Programming Basics', 'Logic and Algorithms'],
        subSkills: ['Object-Oriented Programming', 'Data Structures', 'Libraries', 'Frameworks'],
        description: 'Versatile programming language for various applications'
      }
    };

    return fallbackRelationships[skillName] || {
      skillName,
      relatedSkills: [],
      prerequisites: [],
      subSkills: [],
      description: `Information about ${skillName}`
    };
  }

  /**
   * Fallback career pathway when API fails
   */
  private getFallbackCareerPathway(currentSkills: string[], targetRole: string): CareerPathway {
    return {
      targetRole,
      currentSkills,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Database Management'],
      recommendedSkills: ['TypeScript', 'Docker', 'AWS', 'Testing'],
      estimatedTimeframe: '6-12 months',
      learningPath: [
        {
          phase: 1,
          skills: ['JavaScript Fundamentals', 'HTML/CSS'],
          duration: '4-6 weeks',
          description: 'Build foundation in web technologies'
        },
        {
          phase: 2,
          skills: ['React', 'State Management'],
          duration: '6-8 weeks',
          description: 'Learn modern frontend development'
        },
        {
          phase: 3,
          skills: ['Node.js', 'Express', 'Database'],
          duration: '6-8 weeks',
          description: 'Develop backend capabilities'
        }
      ]
    };
  }

  /**
   * Fallback skill search results
   */
  private getFallbackSkillSearch(query: string): string[] {
    const allSkills = [
      'JavaScript', 'Python', 'React', 'Angular', 'Vue.js', 'Node.js',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Machine Learning',
      'Data Science', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'DevOps'
    ];
    
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }

  /**
   * Fallback trending skills
   */
  private getFallbackTrendingSkills(): string[] {
    return [
      'Artificial Intelligence',
      'Machine Learning',
      'Cloud Computing',
      'Cybersecurity',
      'Data Science',
      'DevOps',
      'React',
      'Python',
      'Docker',
      'Kubernetes'
    ];
  }
}