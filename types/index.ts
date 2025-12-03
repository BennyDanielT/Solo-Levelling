export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'productivity' | 'learning' | 'career' | 'fitness' | 'personal';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'archived';
  progress: number; // 0-100 percentage
  targetDate?: string;
  tags: string[];
  userId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DashboardMetrics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
}

export interface CategoryMetrics {
  category: string;
  total: number;
  completed: number;
  active: number;
  completionRate: number;
}

export interface MetricsResponse {
  overview: DashboardMetrics;
  categories: CategoryMetrics[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  level: number;
  goals: Goal[];
  unlockedCompanions: Companion[];
  unlockedItems: Item[];
  createdAt: Date;
}

export interface Companion {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  modelPath?: string; // Path to 3D model for unlock notifications
  requiredPoints: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  abilities: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  modelPath?: string; // Path to 3D model for unlock notifications
  requiredPoints: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
}

export interface UnlockNotification {
  id: string;
  type: 'companion' | 'item' | 'level';
  title: string;
  description: string;
  imageUrl?: string;
  timestamp: Date;
  read: boolean;
}

export interface ProgressStats {
  totalGoals: number;
  completedGoals: number;
  totalProgress: number; // percentage
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
} 