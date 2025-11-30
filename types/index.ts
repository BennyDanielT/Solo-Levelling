export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'finance' | 'relationships' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'archived';
  progress: number; // 0-100 percentage
  targetValue?: number; // optional target for measurable goals
  currentValue?: number; // optional current progress for measurable goals
  unit?: string; // unit for measurable goals (e.g., 'hours', 'pages', 'lbs')
  deadline?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  points: number; // points awarded when completed
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