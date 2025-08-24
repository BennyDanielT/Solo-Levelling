import { Goal, ProgressStats, Companion, Item } from '@/types';

export function calculateProgress(goals: Goal[]): ProgressStats {
  // Filter out archived goals for display purposes
  const activeGoals = goals.filter(goal => !goal.archived);
  const totalGoals = activeGoals.length;
  const completedGoals = activeGoals.filter(goal => goal.completed).length;
  
  // Calculate progress based on completed goals vs total active goals
  const totalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  // Calculate total points from completed goals (including archived ones)
  const totalPoints = goals
    .filter(goal => goal.completed)
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
  if (goals.length === 0) return goals;

  // Only consider incomplete and non-archived goals for weight redistribution
  const incompleteGoals = goals.filter(goal => !goal.completed && !goal.archived);
  const totalIncompleteWeight = incompleteGoals.reduce((sum, goal) => sum + goal.weight, 0);
  const totalWeight = totalIncompleteWeight + newGoalWeight;
  const remainingWeight = 100 - newGoalWeight;
  
  if (remainingWeight <= 0) {
    // If new goal takes all weight, distribute equally among incomplete goals
    const equalWeight = 100 / (incompleteGoals.length + 1);
    return goals.map(goal => {
      if (goal.completed || goal.archived) {
        return goal; // Keep completed and archived goals unchanged
      } else {
        return { ...goal, weight: equalWeight };
      }
    });
  }

  // Redistribute existing weights proportionally among incomplete goals only
  const scaleFactor = remainingWeight / totalIncompleteWeight;
  
  return goals.map(goal => {
    if (goal.completed || goal.archived) {
      return goal; // Keep completed and archived goals unchanged
    } else {
      return {
        ...goal,
        weight: goal.weight * scaleFactor
      };
    }
  });
}

export function redistributeWeightsAfterCompletion(goals: Goal[]): Goal[] {
  // When a goal is completed, we want to release its weight back to the available pool
  // This means we don't redistribute it to other goals - it becomes available for new goals
  
  return goals.map(goal => {
    if (goal.completed && !goal.archived) {
      return {
        ...goal,
        weight: 0 // Release the weight back to available pool
      };
    }
    return goal; // Keep all other goals unchanged
  });
}

export function redistributeWeightsAfterDeletion(goals: Goal[], deletedGoal: Goal): Goal[] {
  // If the deleted goal was completed or archived, we don't need to redistribute
  if (deletedGoal.completed || deletedGoal.archived) {
    return goals;
  }

  // Get incomplete goals (excluding the deleted one and archived ones)
  const incompleteGoals = goals.filter(goal => !goal.completed && !goal.archived);
  
  if (incompleteGoals.length === 0) {
    return goals;
  }

  // Redistribute the deleted goal's weight among remaining incomplete goals
  const weightPerGoal = deletedGoal.weight / incompleteGoals.length;
  
  return goals.map(goal => {
    if (goal.completed || goal.archived) {
      return goal; // Keep completed and archived goals unchanged
    } else {
      return {
        ...goal,
        weight: goal.weight + weightPerGoal
      };
    }
  });
}

export function redistributeWeightsAfterArchiving(goals: Goal[], archivedGoal: Goal): Goal[] {
  // When we archive a goal, we want to release its weight back to the available pool
  // This means we don't redistribute it to other goals - it becomes available for new goals
  
  return goals.map(goal => {
    if (goal.id === archivedGoal.id) {
      return {
        ...goal,
        archived: true,
        weight: 0 // Release the weight back to available pool
      };
    }
    return goal; // Keep all other goals unchanged
  });
}

export function calculateAvailableWeight(goals: Goal[]): number {
  // Calculate available weight by subtracting weight of active (incomplete + non-archived) goals
  const activeGoals = goals.filter(goal => !goal.completed && !goal.archived);
  const totalActiveWeight = activeGoals.reduce((sum, goal) => sum + goal.weight, 0);
  return Math.max(0, 100 - totalActiveWeight);
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