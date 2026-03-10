export type CareerPathType = 'software-dev' | 'data-science' | 'cybersecurity' | 'ai-ml' | 'cloud-eng' | 'ui-ux';

export interface SkillSet {
    [key: string]: number;
}

export interface UserProfile {
    name: string;
    education: string;
    goal: CareerPathType;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    skills: SkillSet;
    bio?: string;
    role?: 'user' | 'mentor';
    onboarded?: boolean;
}

export interface AssessmentQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    skillMapped: string;
}

export interface RoadmapStep {
    title: string;
    description: string;
    status: 'completed' | 'current' | 'locked';
    technologies: string[];
}

export interface LearningResource {
    id: number;
    title: string;
    provider: string;
    type: 'Course' | 'Project' | 'Docs';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    matchScore: number;
}
