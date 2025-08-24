'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, ProgressStats, Companion, Item } from '@/types';
import {
  calculateProgress,
  redistributeWeights,
  redistributeWeightsAfterCompletion,
  redistributeWeightsAfterDeletion,
  redistributeWeightsAfterArchiving,
  getUnlockedCompanions,
  getUnlockedItems,
  checkForNewUnlocks,
} from '@/utils/progress';
import { companions } from '@/data/companions';
import { items } from '@/data/items';
import GoalCard from '@/components/GoalCard';
import ProgressCard from '@/components/ProgressCard';
import CompanionCard from '@/components/CompanionCard';
import ItemCard from '@/components/ItemCard';
import AddGoalModal from '@/components/AddGoalModal';
import UnlockNotification from '@/components/UnlockNotification';
import Hero3D from '@/components/Hero3D';
import { Plus, Trophy, Users, Sword, Crown, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<ProgressStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalProgress: 0,
    totalPoints: 0,
    currentLevel: 1,
    pointsToNextLevel: 100,
  });
  const [unlockedCompanions, setUnlockedCompanions] = useState<Companion[]>([]);
  const [unlockedItems, setUnlockedItems] = useState<Item[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [unlockNotification, setUnlockNotification] = useState<{
    type: 'companion' | 'item';
    name: string;
    description: string;
    imageUrl?: string;
    modelPath?: string;
  } | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        archived: goal.archived || false, // Add archived property for backward compatibility
        createdAt: new Date(goal.createdAt),
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
      }));
      setGoals(parsedGoals);
    }
  }, []);

  useEffect(() => {
    // Save goals to localStorage
    localStorage.setItem('goals', JSON.stringify(goals));

    // Calculate progress
    const newProgress = calculateProgress(goals);
    setProgress(newProgress);

    // Update unlocked companions and items
    const newCompanions = getUnlockedCompanions(
      newProgress.totalPoints,
      companions,
    );
    const newItems = getUnlockedItems(newProgress.totalPoints, items);

    setUnlockedCompanions(newCompanions);
    setUnlockedItems(newItems);
  }, [goals]);

  const handleAddGoal = (
    title: string,
    description: string,
    weight: number,
    difficulty: 'easy' | 'medium' | 'hard',
  ) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      weight,
      completed: false,
      archived: false,
      points: weight * 2, // Simple point calculation
      createdAt: new Date(),
    };

    // Redistribute weights among incomplete goals
    const updatedGoals = redistributeWeights(goals, weight);
    setGoals([...updatedGoals, newGoal]);
    setShowAddGoal(false);
  };

  const handleToggleGoal = (goalId: string) => {
    const oldPoints = progress.totalPoints;

    // Update goals with completion status
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const completed = !goal.completed;
        return {
          ...goal,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return goal;
    });

    // Check if the goal was completed (not uncompleted)
    const toggledGoal = updatedGoals.find((g) => g.id === goalId);
    const wasCompleted = toggledGoal && toggledGoal.completed;

    // Redistribute weights if goal was completed
    const finalGoals = wasCompleted
      ? redistributeWeightsAfterCompletion(updatedGoals)
      : updatedGoals;

    setGoals(finalGoals);

    // Check for new unlocks
    const newProgress = calculateProgress(finalGoals);
    const newPoints = newProgress.totalPoints;

    if (newPoints > oldPoints) {
      const newUnlocks = checkForNewUnlocks(
        oldPoints,
        newPoints,
        companions,
        items,
      );

      if (newUnlocks.companions.length > 0) {
        const companion = newUnlocks.companions[0];
        setUnlockNotification({
          type: 'companion',
          name: companion.name,
          description: companion.description,
          imageUrl: companion.imageUrl,
          modelPath: companion.modelPath, // Include 3D model path
        });
      } else if (newUnlocks.items.length > 0) {
        const item = newUnlocks.items[0];
        setUnlockNotification({
          type: 'item',
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          modelPath: item.modelPath, // Include 3D model path
        });
      }
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const goalToDelete = goals.find((goal) => goal.id === goalId);
    if (!goalToDelete) return;

    // Remove the goal entirely (including progress if completed)
    const remainingGoals = goals.filter((goal) => goal.id !== goalId);

    // Redistribute the weight of the deleted goal
    const updatedGoals = redistributeWeightsAfterDeletion(
      remainingGoals,
      goalToDelete,
    );
    setGoals(updatedGoals);
  };

  const handleArchiveGoal = (goalId: string) => {
    // Find the goal to archive
    const goalToArchive = goals.find((goal) => goal.id === goalId);
    if (!goalToArchive) return;

    // Archive the goal and release its weight back to the available pool
    const updatedGoals = redistributeWeightsAfterArchiving(
      goals,
      goalToArchive,
    );
    setGoals(updatedGoals);
  };

  // Filter goals based on showArchived state
  const filteredGoals = showArchived
    ? goals
    : goals.filter((goal) => !goal.archived);

  const archivedCount = goals.filter((goal) => goal.archived).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700'>
      {/* 3D Hero Section */}
      <Hero3D />

      <div className='max-w-7xl mx-auto p-4'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-8'
        >
          <h1 className='text-4xl font-bold gradient-text mb-2'>
            Solo Leveling Dashboard
          </h1>
          <p className='text-gray-300 text-lg'>
            Track your goals and unlock powerful companions
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <ProgressCard progress={progress} />
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Goals Section */}
          <div className='lg:col-span-2'>
            <div className='glass-effect rounded-xl p-6 mb-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                  <Trophy className='text-gold-400' />
                  Your Goals
                </h2>
                <div className='flex items-center gap-3'>
                  {/* Archive Toggle */}
                  {archivedCount > 0 && (
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 transition-all duration-200'
                    >
                      {showArchived ? (
                        <>
                          <EyeOff size={16} />
                          Hide Archived
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Show Archived ({archivedCount})
                        </>
                      )}
                    </button>
                  )}

                  {/* Add Goal Button */}
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className='bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl'
                  >
                    <Plus size={20} />
                    Add Goal
                  </button>
                </div>
              </div>

              <div className='space-y-4'>
                <AnimatePresence>
                  {filteredGoals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GoalCard
                        goal={goal}
                        onToggle={handleToggleGoal}
                        onDelete={handleDeleteGoal}
                        onArchive={handleArchiveGoal}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredGoals.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-center py-12 text-gray-400'
                  >
                    <Trophy size={48} className='mx-auto mb-4 opacity-50' />
                    <p className='text-lg'>
                      {showArchived
                        ? 'No archived goals found.'
                        : 'No goals yet. Add your first goal to begin your journey!'}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Companions & Items Section */}
          <div className='space-y-6'>
            {/* Companions */}
            <div className='glass-effect rounded-xl p-6'>
              <h3 className='text-xl font-bold text-white flex items-center gap-2 mb-4'>
                <Users className='text-blue-400' />
                Companions
              </h3>
              <div className='space-y-3'>
                {unlockedCompanions.slice(0, 3).map((companion) => (
                  <CompanionCard key={companion.id} companion={companion} />
                ))}
                {unlockedCompanions.length === 0 && (
                  <p className='text-gray-400 text-sm'>
                    No companions unlocked yet.
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className='glass-effect rounded-xl p-6'>
              <h3 className='text-xl font-bold text-white flex items-center gap-2 mb-4'>
                <Sword className='text-purple-400' />
                Items
              </h3>
              <div className='space-y-3'>
                {unlockedItems.slice(0, 3).map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
                {unlockedItems.length === 0 && (
                  <p className='text-gray-400 text-sm'>
                    No items unlocked yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAdd={handleAddGoal}
        existingGoals={goals}
      />

      {/* Unlock Notification */}
      <AnimatePresence>
        {unlockNotification && (
          <UnlockNotification
            notification={unlockNotification}
            onClose={() => setUnlockNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
