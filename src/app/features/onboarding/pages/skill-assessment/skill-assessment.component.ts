import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { ResearchAgentService } from '../../../../core/services/research-agent.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-skill-assessment',
  templateUrl: './skill-assessment.component.html',
  styleUrls: ['./skill-assessment.component.scss']
})
export class SkillAssessmentComponent implements OnInit {
  assessmentForm!: FormGroup;
  skillAnalysis: any = null;
  isAnalyzing = false;
  questions: any[] = [];
  currentQuestionIndex = 0;
  assessmentCompleted = false;
  assessmentScore = 0;
  skillLevel = '';
  recommendations: string[] = [];

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private researchService: ResearchAgentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.assessmentForm = this.fb.group({
      skill: ['', Validators.required],
      currentKnowledge: ['', Validators.required]
    });
  }

  analyzeSkill(): void {
    if (this.assessmentForm.get('skill')?.invalid) {
      return;
    }

    const skill = this.assessmentForm.get('skill')?.value;
    this.isAnalyzing = true;

    this.researchService.analyzeTopic({ topic: skill, depth: 'assessment' }).pipe(
      finalize(() => this.isAnalyzing = false)
    ).subscribe({
      next: (analysis) => {
        this.skillAnalysis = analysis;
        this.generateQuestions(skill);
      },
      error: (error) => {
        console.error('Error analyzing skill:', error);
        // Generate default questions if analysis fails
        this.generateDefaultQuestions(skill);
      }
    });
  }

  generateQuestions(skill: string): void {
    // Use the skill analysis to generate assessment questions
    // In a real implementation, this would use the research agent's data
    if (this.skillAnalysis && this.skillAnalysis.subtopics) {
      this.questions = this.skillAnalysis.subtopics.slice(0, 5).map((subtopic: any, index: number) => ({
        id: index + 1,
        topic: subtopic.name,
        question: `Rate your knowledge of ${subtopic.name}:`,
        options: [
          { value: 1, label: 'No knowledge' },
          { value: 2, label: 'Basic understanding' },
          { value: 3, label: 'Intermediate knowledge' },
          { value: 4, label: 'Advanced knowledge' },
          { value: 5, label: 'Expert knowledge' }
        ],
        answer: null
      }));
    } else {
      this.generateDefaultQuestions(skill);
    }
  }

  generateDefaultQuestions(skill: string): void {
    // Generate default questions when research agent analysis fails
    const defaultTopics = [
      'Fundamentals',
      'Core concepts',
      'Advanced techniques',
      'Best practices',
      'Tools and frameworks'
    ];

    this.questions = defaultTopics.map((topic, index) => ({
      id: index + 1,
      topic: `${skill} ${topic}`,
      question: `Rate your knowledge of ${skill} ${topic.toLowerCase()}:`,
      options: [
        { value: 1, label: 'No knowledge' },
        { value: 2, label: 'Basic understanding' },
        { value: 3, label: 'Intermediate knowledge' },
        { value: 4, label: 'Advanced knowledge' },
        { value: 5, label: 'Expert knowledge' }
      ],
      answer: null
    }));
  }

  answerQuestion(questionId: number, value: number): void {
    this.questions = this.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, answer: value };
      }
      return q;
    });

    // Move to next question or complete assessment
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.completeAssessment();
    }
  }

  completeAssessment(): void {
    // Calculate average score
    const totalScore = this.questions.reduce((sum, q) => sum + (q.answer || 0), 0);
    this.assessmentScore = Math.round((totalScore / this.questions.length) * 100) / 100;

    // Determine skill level based on score
    if (this.assessmentScore < 2) {
      this.skillLevel = 'beginner';
      this.recommendations = [
        'Start with fundamentals and basic concepts',
        'Focus on hands-on practice with simple projects',
        'Use structured tutorials and guided courses'
      ];
    } else if (this.assessmentScore < 3.5) {
      this.skillLevel = 'intermediate';
      this.recommendations = [
        'Build on your existing knowledge with more complex concepts',
        'Work on medium-sized projects to apply your skills',
        'Focus on best practices and optimization techniques'
      ];
    } else {
      this.skillLevel = 'advanced';
      this.recommendations = [
        'Explore cutting-edge techniques and advanced topics',
        'Contribute to open-source projects or create your own',
        'Focus on mentoring others and deepening specialized knowledge'
      ];
    }

    this.assessmentCompleted = true;
  }

  saveAndContinue(): void {
    const skillData = [{
      skill: this.assessmentForm.get('skill')?.value,
      confidenceLevel: this.assessmentScore,
      recentExperience: this.skillLevel,
      learningGoal: this.assessmentForm.get('currentKnowledge')?.value
    }];

    this.onboardingService.saveSkillAssessment(skillData).subscribe({
      next: () => {
        this.router.navigate(['/onboarding/set-learning-goal']);
      },
      error: (error) => {
        console.error('Error saving skill assessment:', error);
        // Continue anyway as this might be a new endpoint
        this.router.navigate(['/onboarding/set-learning-goal']);
      }
    });
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  skipAssessment(): void {
    this.router.navigate(['/onboarding/set-learning-goal']);
  }
}