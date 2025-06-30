import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ILesson extends Document {
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  completed: boolean;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuest extends Document {
  title: string;
  description: string;
  points: number;
  requirements: {
    lessons: Types.ObjectId[];
    minScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeague extends Document {
  name: string;
  description: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
} 