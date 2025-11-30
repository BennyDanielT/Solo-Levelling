'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  StatsCards,
  GoalProgressChart,
  CategoryBreakdownChart,
  WeeklyStatsChart,
} from '@/components/dashboard/DashboardWidgets';
import { GoalList } from '@/components/dashboard/GoalList';
import { AddGoalModal } from '@/components/dashboard/AddGoalModal';
import { useToast } from '@/components/dashboard/ToastSystem';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import { Goal } from '@/types';

// Sample goals data
const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Complete React project',
    description: 'Finish the dashboard project with all features implemented',
    category: 'work',
    priority: 'high',
    status: 'active',
    progress: 75,
    targetValue: 100,
    currentValue: 75,
    unit: 'percent',
    deadline: new Date('2025-12-01'),
    tags: ['react', 'project', 'work'],
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-20'),
    points: 25,
  },
  {
    id: '2',
    title: 'Exercise 5 days a week',
    description: 'Maintain regular exercise routine for better health',
    category: 'health',
    priority: 'medium',
    status: 'active',
    progress: 60,
    targetValue: 5,
    currentValue: 3,
    unit: 'days',
    deadline: new Date('2025-11-30'),
    tags: ['health', 'fitness', 'routine'],
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-20'),
    points: 15,
  },
  {
    id: '3',
    title: 'Read 12 books this year',
    description: 'Expand knowledge through regular reading',
    category: 'learning',
    priority: 'medium',
    status: 'active',
    progress: 25,
    targetValue: 12,
    currentValue: 3,
    unit: 'books',
    deadline: new Date('2025-12-31'),
    tags: ['reading', 'learning', 'personal-growth'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-20'),
    points: 20,
  },
  {
    id: '4',
    title: 'Save $5000 for emergency fund',
    description: 'Build financial security with emergency savings',
    category: 'finance',
    priority: 'high',
    status: 'active',
    progress: 40,
    targetValue: 5000,
    currentValue: 2000,
    unit: 'dollars',
    deadline: new Date('2026-06-01'),
    tags: ['finance', 'savings', 'security'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-20'),
    points: 30,
  },
  {
    id: '5',
    title: 'Learn Spanish conversation',
    description: 'Become conversational in Spanish for travel',
    category: 'learning',
    priority: 'low',
    status: 'completed',
    progress: 100,
    targetValue: 1,
    currentValue: 1,
    unit: 'level',
    deadline: new Date('2025-10-01'),
    tags: ['language', 'spanish', 'travel'],
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-10-01'),
    completedAt: new Date('2025-10-01'),
    points: 18,
  },
];

// Main dashboard content component
function DashboardContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals'>('overview');
  const { showSuccess } = useToast();

  const handleAddGoal = (
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setGoals((prev) => [...prev, newGoal]);
    showSuccess(
      'Goal Created!',
      `Successfully added "${newGoal.title}" to your goals.`,
    );
  };

  const handleEditGoal = (goal: Goal) => {
    // TODO: Implement edit functionality
    showSuccess('Edit Goal', 'Edit functionality coming soon!');
  };

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    showSuccess(
      'Goal Deleted',
      `"${goal?.title}" has been removed from your goals.`,
    );
  };

  const handleToggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newStatus =
            goal.status === 'completed' ? 'active' : 'completed';
          const updates: Partial<Goal> = {
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : goal.progress,
            updatedAt: new Date(),
          };

          if (newStatus === 'completed') {
            updates.completedAt = new Date();
          }

          return { ...goal, ...updates };
        }
        return goal;
      }),
    );

    const goal = goals.find((g) => g.id === goalId);
    if (goal?.status !== 'completed') {
      showSuccess(
        'Goal Completed! 🎉',
        `Congratulations on completing "${goal?.title}"!`,
      );
    }
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, progress, updatedAt: new Date() }
          : goal,
      ),
    );
  };

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Tab Navigation */}
        <div className='border-b border-gray-200 dark:border-white/10'>
          <nav className='flex space-x-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-deep_sky_blue-500 text-deep_sky_blue-600 dark:text-deep_sky_blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-deep_sky_blue-500 text-deep_sky_blue-600 dark:text-deep_sky_blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              Goals ({goals.length})
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className='bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#14b8a6] rounded-2xl p-6 text-white shadow-xl border border-white/10'>
              <h1 className='text-3xl font-bold mb-2'>Welcome back! 👋</h1>
              <p className='text-lg opacity-90 mb-4'>
                You've completed{' '}
                {goals.filter((g) => g.status === 'completed').length} out of{' '}
                {goals.length} goals this month. Keep up the great work!
              </p>
              <ThemeButton
                onClick={() => setIsAddGoalModalOpen(true)}
                variant='secondary'
                className='bg-white text-deep_sky_blue-600 hover:bg-gray-50'
              >
                + Add New Goal
              </ThemeButton>
            </div>

            {/* Stats Overview */}
            <StatsCards />

            {/* Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <GoalProgressChart />
              <CategoryBreakdownChart />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-1 gap-6'>
              <WeeklyStatsChart />
            </div>
          </>
        )}

        {activeTab === 'goals' && (
          <GoalList
            goals={goals}
            onAddGoal={() => setIsAddGoalModalOpen(true)}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onToggleGoal={handleToggleGoal}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {/* Quick Actions */}
        <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f1f3a] via-[#181826] to-[#0f0f17] p-6 text-white shadow-2xl'>
          <h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <ThemeButton
              variant='primary'
              className='justify-center'
              onClick={() => setIsAddGoalModalOpen(true)}
            >
              + Add Goal
            </ThemeButton>
            <ThemeButton variant='secondary' className='justify-center'>
              📅 Schedule Reminder
            </ThemeButton>
            <ThemeButton variant='success' className='justify-center'>
              📊 View Analytics
            </ThemeButton>
            <ThemeButton variant='error' className='justify-center'>
              ⚙️ Settings
            </ThemeButton>
          </div>
        </div>

        {/* Custom Color Test Buttons */}
        <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-white via-deep_sky_blue-50 to-bright_gold-50 dark:from-[#1f1f1f] dark:via-[#222] dark:to-[#151515] shadow-xl p-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Custom Color Test - Light Mode
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            <button className='px-4 py-2 bg-deep_sky_blue-500 hover:bg-deep_sky_blue-600 text-white rounded-lg font-medium transition-colors'>
              Deep Sky Blue
            </button>
            <button className='px-4 py-2 bg-bright_gold-500 hover:bg-bright_gold-600 text-white rounded-lg font-medium transition-colors'>
              Bright Gold
            </button>
            <button className='px-4 py-2 bg-vivid_tangerine-500 hover:bg-vivid_tangerine-600 text-white rounded-lg font-medium transition-colors'>
              Vivid Tangerine
            </button>
            <button className='px-4 py-2 bg-neon_pink-500 hover:bg-neon_pink-600 text-white rounded-lg font-medium transition-colors'>
              Neon Pink
            </button>
            <button className='px-4 py-2 bg-slime_lime-500 hover:bg-slime_lime-600 text-white rounded-lg font-medium transition-colors'>
              Slime Lime
            </button>
          </div>
        </div>

        {/* Dark Mode Color Test Buttons */}
        <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d0d0d] via-[#161616] to-[#1f1f1f] shadow-xl p-6'>
          <h2 className='text-xl font-semibold text-white mb-4'>
            Custom Color Test - Dark Mode
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4'>
            <button className='px-4 py-2 bg-strawberry_red-500 hover:bg-strawberry_red-600 text-white rounded-lg font-medium transition-colors'>
              Strawberry Red
            </button>
            <button className='px-4 py-2 bg-atomic_tangerine-500 hover:bg-atomic_tangerine-600 text-white rounded-lg font-medium transition-colors'>
              Atomic Tangerine
            </button>
            <button className='px-4 py-2 bg-carrot_orange-500 hover:bg-carrot_orange-600 text-white rounded-lg font-medium transition-colors'>
              Carrot Orange
            </button>
            <button className='px-4 py-2 bg-tuscan_sun-500 hover:bg-tuscan_sun-600 text-white rounded-lg font-medium transition-colors'>
              Tuscan Sun
            </button>
            <button className='px-4 py-2 bg-willow_green-500 hover:bg-willow_green-600 text-white rounded-lg font-medium transition-colors'>
              Willow Green
            </button>
            <button className='px-4 py-2 bg-seagrass-500 hover:bg-seagrass-600 text-white rounded-lg font-medium transition-colors'>
              Seagrass
            </button>
            <button className='px-4 py-2 bg-blue_slate-500 hover:bg-blue_slate-600 text-white rounded-lg font-medium transition-colors'>
              Blue Slate
            </button>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onAdd={handleAddGoal}
        existingGoals={goals}
      />
    </DashboardLayout>
  );
}

// Main page component
export default function Dashboard() {
  return <DashboardContent />;
}
