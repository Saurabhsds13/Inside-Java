// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

// ─── OOP Concepts ─────────────────────────────────────────────────────────────

export interface OopPillar {
  id: string;
  name: string;
  description: string;
  realWorldAnalogy: string;
  keyPoints: string[];
  codeExample: string;
  color: string;
}

// ─── Collections ──────────────────────────────────────────────────────────────

export interface CollectionType {
  id: string;
  name: string;
  interface: string;
  description: string;
  internalStructure: string;
  timeComplexity: Record<string, string>;
  whenToUse: string[];
  color: string;
}

// ─── Exception Handling ───────────────────────────────────────────────────────

export interface ExceptionInfo {
  id: string;
  name: string;
  type: 'checked' | 'unchecked' | 'error';
  parent: string;
  description: string;
  example: string;
  color: string;
}

// ─── Interview Questions ──────────────────────────────────────────────────────

export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type QuestionCategory =
  | 'OOP'
  | 'Strings'
  | 'Exceptions'
  | 'Collections'
  | 'Generics'
  | 'Keywords'
  | 'Java 8'
  | 'Multithreading'
  | 'Design Patterns'
  | 'IO/NIO'
  | 'Annotations'
  | 'Modern Java'
  | 'Concurrency'
  | 'Serialization'
  | 'Memory'
  | 'Security'
  | 'Testing';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  keyPoints: string[];
  difficulty: QuestionDifficulty;
  category: QuestionCategory;
  followUps?: string[];
  codeExample?: string;
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  href: string;
  color: string;
  icon: string;
  topics: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}
