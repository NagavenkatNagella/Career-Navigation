export type CareerPathType = 'software-dev' | 'data-science' | 'cybersecurity' | 'ai-ml' | 'cloud-eng' | 'ui-ux';

export interface SkillSet {
    [key: string]: number;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    fileUrl?: string;
    fileName?: string;
}

export interface ChatSession {
    id: string;
    participants: string[];
    messages: Message[];
    lastMessage?: string;
    updatedAt: string;
}

export interface LearningGroup {
    id: string;
    mentorId: string;
    name: string;
    description: string;
    members: string[]; // User IDs
    resources: ResourceMetadata[];
    announcements: Announcement[];
}

export interface Announcement {
    id: string;
    text: string;
    authorName: string;
    timestamp: string;
}

export interface ResourceMetadata {
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'link' | 'note';
    url: string;
    addedBy: string;
    description?: string;
    category?: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    deadline: string;
    status: 'pending' | 'submitted' | 'graded';
    submissionUrl?: string;
    feedback?: string;
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
    learningHistory?: string[]; // IDs of completed resources
    activeCourses?: string[];
    mentors?: string[]; // IDs of accepted mentors
    mentees?: string[]; // IDs of accepted learners
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
