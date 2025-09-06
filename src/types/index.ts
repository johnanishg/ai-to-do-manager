export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Task {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  estimatedTime?: number; // in minutes
  tags?: string[];
  subtasks?: Subtask[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AIRecommendation {
  type: 'priority' | 'category' | 'subtask' | 'deadline';
  suggestion: string;
  reasoning: string;
}