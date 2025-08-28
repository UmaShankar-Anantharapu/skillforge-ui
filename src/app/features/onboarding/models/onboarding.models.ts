// Core onboarding interfaces
export interface OnboardingStep {
  title: string;
  description: string;
  fields: string[];
  data: any;
}

export interface OnboardingConfig {
  totalSteps: number;
  predefinedGoals: string[];
  countriesTimezones: CountryTimezone[];
  commonSkills: string[];
}

export interface CountryTimezone {
  country: string;
  timezone: string;
}

export interface OnboardingStatus {
  sessionId: string;
  currentStep: number;
  progress: number;
  isComplete: boolean;
  hasPersonalDetails: boolean;
  hasSkillsAssessment: boolean;
  hasLearningGoals: boolean;
  hasRoadmapConfig: boolean;
  roadmapGenerated: boolean;
}

// Step-specific interfaces
export interface PersonalDetails {
  fullName: string;
  email: string;
  age?: number;
  country: string;
  timezone: string;
  preferredLanguages: string[];
}

export interface CareerBackground {
  company: string;
  position: string;
  yearsOfExperience: number;
  skillsWorkedOn?: string[];
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CurrentSkill {
  skillName: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  yearsOfExperience?: number;
  lastUsed?: 'Currently using' | 'Within 6 months' | '6-12 months ago' | '1+ years ago' | 'Never used professionally';
}

export interface LearningGoals {
  primaryGoal: string;
  targetRole?: string;
  motivationLevel: number; // 1-10
  customGoalDescription?: string;
}

export interface RequiredSkill {
  skillName: string;
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  priority: number; // 1-10
}

export interface Timeline {
  targetDuration: '1 month' | '3 months' | '6 months' | '1 year';
  weeklyTimeCommitment: number; // hours per week
  preferredLearningDays: string[];
  startDate?: Date;
  expectedEndDate?: Date;
}

export interface LearningPreferences {
  learningStyles: string[];
  contentDifficulty: 'Beginner-friendly' | 'Balanced' | 'Challenge-focused';
  assessmentFrequency: 'Daily' | 'Weekly' | 'Project-based' | 'Mixed';
}

// Complete user profile interface
export interface UserProfile {
  sessionId: string;
  personalDetails?: PersonalDetails;
  careerBackground?: CareerBackground[];
  currentSkills?: CurrentSkill[];
  learningGoals?: LearningGoals;
  requiredSkills?: RequiredSkill[];
  timeline?: Timeline;
  learningPreferences?: LearningPreferences;
  onboardingStep: number;
  onboardingComplete: boolean;
  roadmapGenerated: boolean;
}

// API response interfaces
export interface OnboardingStartResponse {
  message: string;
  profile: {
    sessionId: string;
    onboardingStep: number;
    onboardingProgress: number;
  };
  config: OnboardingConfig;
}

export interface StepConfigurationResponse {
  step: OnboardingStep;
  currentStep: number;
  progress: number;
  canAccess: boolean;
}

export interface StepSaveResponse {
  message: string;
  profile: {
    sessionId: string;
    onboardingStep: number;
    onboardingProgress: number;
    hasPersonalDetails?: boolean;
    hasSkillsAssessment?: boolean;
    hasLearningGoals?: boolean;
    hasRoadmapConfig?: boolean;
  };
}

export interface SkillSuggestion {
  skillName: string;
  relevanceScore: number;
  category: 'Core' | 'Advanced' | 'Complementary' | 'Role-specific';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedLearningTime: string;
}

export interface SkillSuggestionsResponse {
  message: string;
  suggestions: SkillSuggestion[];
}

export interface OnboardingCompleteResponse {
  message: string;
  profile: {
    sessionId: string;
    onboardingStep: number;
    onboardingComplete: boolean;
    onboardingProgress: number;
  };
  nextSteps: {
    roadmapGeneration: boolean;
    redirectTo: string;
  };
}

// Form data interfaces for API calls
export interface StepFormData {
  sessionId: string;
  [key: string]: any;
}

export interface SkillSuggestionsRequest {
  goal?: string;
  currentSkills?: CurrentSkill[];
  targetRole?: string;
}