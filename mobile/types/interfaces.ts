import { Href } from "expo-router";

export interface homeMenuButtons {
  Icon: any;
  icon: string;
  label: number | string;
  path: Href;
  notify?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileUri: string;
  bio?: string;
  level: number;
  xp: number;
  feathers: number;
  willPower: number;
  streak: number;
  streakLevel: number;
  league: string;
  leaguePoints: number;
  followers: number;
  following: number;
  joined: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  language: 'en' | 'es' | 'fr' | 'de' | 'pt';
  theme: 'light' | 'dark' | 'auto';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'conversation' | 'reading' | 'listening';
  category: 'beginner' | 'intermediate' | 'advanced';
  difficulty: number;
  estimatedDuration: number;
  exercises: Exercise[];
  xpReward: number;
  featherReward: number;
  isPremium: boolean;
  prerequisites?: string[];
}

export interface Exercise {
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'speaking' | 'listening' | 'writing';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface Progress {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  score: number;
  mistakes: number;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  xpEarned: number;
  feathersEarned: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    xp: number;
    feathers: number;
  };
}

export interface League {
  name: string;
  currentPoints: number;
  requiredPoints: number;
  progress: number;
  rank: number;
  totalPlayers: number;
}

export interface UserStoreState {
  name: string;
  email: string;
  uid: string;
  photoURL: string | null;
  setUser: (user: { name: string; email: string; uid: string; photoURL: string | null }) => void;
  clearUser: () => void;
}

export interface ProgressStoreState {
  level: number;
  completed: number;
  home: number;
  social: number;
  office: number;
  leadership: number;
  title: string;
  setProgress: (progress: { level: number; completed: number; home: number; social: number; office: number; leadership: number; title: string }) => void;
  clearProgress: () => void;
}

export interface OverviewStoreState {
  streak: number;
  streakGoal: number;
  streakLevel: number;
  feathers: number;
  willPower: number;
  setOverview: (overview: { streak: number; streakGoal: number; streakLevel: number; feathers: number; willPower: number }) => void;
  clearOverview: () => void;
}

export interface LeagueStoreState {
  rank: number;
  points: number;
  league: string;
  setLeague: (league: { rank: number; points: number; league: string }) => void;
  clearLeague: () => void;
}
