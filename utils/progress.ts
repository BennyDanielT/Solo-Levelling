import { Goal, ProgressStats, Companion, Item } from '@/types';

export function calculateProgress(goals: Goal[]): ProgressStats {
  // Filter out archived goals for display purposes
  const activeGoals = goals.filter(goal => goal.status !== 'archived');
  const totalGoals = activeGoals.length;
  const completedGoals = activeGoals.filter(goal => goal.status === 'completed').length;
  
  // Calculate progress based on completed goals vs total active goals
  const totalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  // Calculate total points from completed goals (including archived ones)
  const totalPoints = goals
    .filter(goal => goal.status === 'completed')
    .reduce((sum, goal) => sum + goal.points, 0);

  // Calculate level based on points (every 100 points = 1 level)
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = 100 - (totalPoints % 100);

  return {
    totalGoals,
    completedGoals,
    totalProgress,
    totalPoints,
    currentLevel,
    pointsToNextLevel
  };
}

export function redistributeWeights(goals: Goal[], newGoalWeight: number): Goal[] {
  // This function is no longer needed since Goal type doesn't have weight property
  // Return goals unchanged
  return goals;
}

export function redistributeWeightsAfterCompletion(goals: Goal[]): Goal[] {
  // When a goal is completed, we want to release its weight back to the available pool
  // This means we don't redistribute it to other goals - it becomes available for new goals
  
  return goals.map(goal => {
    if (goal.status === 'completed') {
      return {
        ...goal,
        weight: 0 // Release the weight back to available pool
      };
    }
    return goal; // Keep all other goals unchanged
  });
}

export function redistributeWeightsAfterDeletion(goals: Goal[], deletedGoal: Goal): Goal[] {
  // This function is no longer needed since Goal type doesn't have weight property
  // Return goals unchanged
  return goals;
}

export function redistributeWeightsAfterArchiving(goals: Goal[], archivedGoal: Goal): Goal[] {
  // When we archive a goal, update its status to archived
  return goals.map(goal => {
    if (goal.id === archivedGoal.id) {
      return {
        ...goal,
        status: 'archived' as const
      };
    }
    return goal; // Keep all other goals unchanged
  });
}

export function calculateAvailableWeight(goals: Goal[]): number {
  // Calculate available weight is no longer applicable since Goal type doesn't have weight
  // Return 100 as default
  return 100;
}

export function getUnlockedCompanions(totalPoints: number, companions: Companion[]): Companion[] {
  return companions.map(companion => ({
    ...companion,
    unlocked: totalPoints >= companion.requiredPoints
  }));
}

export function getUnlockedItems(totalPoints: number, items: Item[]): Item[] {
  return items.map(item => ({
    ...item,
    unlocked: totalPoints >= item.requiredPoints
  }));
}

export function checkForNewUnlocks(
  oldPoints: number, 
  newPoints: number, 
  companions: Companion[], 
  items: Item[]
): { companions: Companion[], items: Item[] } {
  const newlyUnlockedCompanions = companions.filter(
    companion => companion.requiredPoints > oldPoints && companion.requiredPoints <= newPoints
  );
  
  const newlyUnlockedItems = items.filter(
    item => item.requiredPoints > oldPoints && item.requiredPoints <= newPoints
  );

  return {
    companions: newlyUnlockedCompanions,
    items: newlyUnlockedItems
  };
}

export function calculateGoalPoints(weight: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  const basePoints = weight * 2; // Base points based on weight
  
  switch (difficulty) {
    case 'easy':
      return Math.round(basePoints * 0.8);
    case 'medium':
      return Math.round(basePoints);
    case 'hard':
      return Math.round(basePoints * 1.5);
    default:
      return Math.round(basePoints);
  }
}