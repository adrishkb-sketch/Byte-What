export type DomainId =
  | 'software_web'
  | 'mobile_development'
  | 'artificial_intelligence'
  | 'machine_learning'
  | 'data_science'
  | 'cybersecurity'
  | 'cloud_devops'
  | 'networks_systems'
  | 'blockchain_web3'
  | 'game_development'
  | 'ar_vr_xr'
  | 'robotics_iot'
  | 'electronics_vlsi'
  | 'competitive_programming'
  | 'ui_ux_design'
  | 'graphic_3d_design'
  | 'entrepreneurship'
  | 'cs_research'
  | 'bioinformatics_healthtech'
  | 'fintech_quant';

export type DomainCategory =
  | 'Core Software & Systems'
  | 'Data & Intelligence'
  | 'Hardware & Physical Computing'
  | 'Design & Creative'
  | 'Applied & Interdisciplinary';

export interface Domain {
  id: DomainId;
  name: string;
  category: DomainCategory;
  description: string;
  longDescription: string;
  iconName: string;
  color: string;
  gradient: string;
  exampleTechnologies: string[];
  skills: string[];
  relatedDomains: DomainId[];
  exampleProjects: {
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
  learningRoadmap: {
    stage: string;
    topics: string[];
  }[];
}

export type QuestionType = 'universal' | 'likert';

export interface UniversalOption {
  id: string;
  text: string;
  domainWeights: Partial<Record<DomainId, number>>;
}

export interface Question {
  id: string; // e.g. Q001
  code: string; // Q001
  text: string;
  type: QuestionType;
  isUniversal: boolean;
  primaryDomainId?: DomainId;
  options?: UniversalOption[]; // for universal questions
  secondaryDomainWeights?: Partial<Record<DomainId, number>>;
}

export interface UserResponse {
  questionId: string;
  selectedOptionId?: string;
  numericValue?: number; // 0 to 4 for likert
  textResponse?: string;
  timestamp: string;
}

export interface DomainScoreResult {
  domainId: DomainId;
  domainName: string;
  interestScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  evidenceCount: number;
  classification: 'primary' | 'secondary' | 'emerging' | 'low_evidence';
}

export interface QuestionnaireResultSummary {
  sessionId: string;
  startedAt: string;
  completedAt: string;
  questionsAnswered: number;
  primaryInterests: DomainScoreResult[];
  secondaryInterests: DomainScoreResult[];
  emergingInterests: DomainScoreResult[];
  lowEvidenceInterests: DomainScoreResult[];
  allDomainScores: DomainScoreResult[];
  writtenExplanation?: string;
  suggestedProjects?: {
    title: string;
    description: string;
    domains: DomainId[];
    technologies: string[];
  }[];
  crossDomainInsights?: string[];
}

export interface StudentDomainRank {
  domainId: DomainId;
  rank: number; // 1-based, ties allowed (e.g. multiple domains can have rank 1)
}

export interface StudentSubmission {
  id: string;
  name: string;
  department: string;
  year: string;
  phoneNumber: string;
  pathChosen: 'self_selected' | 'questionnaire';
  rankings: StudentDomainRank[];
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  anonymousSessionId: string;
  displayName: string;
  name?: string;
  department?: string;
  year?: string;
  phoneNumber?: string;
  pathChosen?: 'self_selected' | 'questionnaire';
  bio?: string;
  discoverable: boolean;
  primaryDomains: DomainId[];
  secondaryDomains: DomainId[];
  skills: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creatorPseudonym: string;
  creatorSessionId?: string;
  domains: DomainId[];
  skillRequirements: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Open' | 'In Progress' | 'Completed';
  teamRequirements: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  domains: DomainId[];
}

