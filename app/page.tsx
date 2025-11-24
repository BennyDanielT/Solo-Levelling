'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  StatsCards,
  GoalProgressChart,
  CategoryBreakdownChart,
  WeeklyStatsChart,
} from '@/components/dashboard/DashboardWidgets';
import { useToast } from '@/components/dashboard/ToastSystem';
import { ThemeButton } from '@/lib/theme/ThemeButton';

// Main dashboard content component
function DashboardContent() {
  const { showSuccess } = useToast();

  // Simulate achievement unlock for demo
  const handleDemoAchievement = () => {
    showSuccess(
      'Goal Completed! 🎉',
      'Congratulations! You completed "Morning Workout" and earned 25 points!',
    );
  };

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-deep_sky_blue-500 to-bright_gold-500 rounded-lg p-6 text-white'>
          <h1 className='text-3xl font-bold mb-2'>Welcome back, John! 👋</h1>
          <p className='text-lg opacity-90 mb-4'>
            You've completed 3 out of 5 goals this week. Keep up the great work!
          </p>
          <ThemeButton
            onClick={handleDemoAchievement}
            variant='secondary'
            className='bg-white text-deep_sky_blue-600 hover:bg-gray-50'
          >
            Test Achievement Toast
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

        {/* Quick Actions */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <ThemeButton variant='primary' className='justify-center'>
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
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
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
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
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
    </DashboardLayout>
  );
}

// Main page component
export default function Dashboard() {
  return <DashboardContent />;
}
