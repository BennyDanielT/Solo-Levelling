'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

// Goals will be fetched from database
const sampleGoals: Goal[] = [];

// Main dashboard content component
function DashboardContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals'>('overview');
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const { showSuccess } = useToast();

  // Fetch latest news on component mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using gnews.io API (free, no API key required for basic usage)
        const response = await fetch(
          'https://gnews.io/api/v4/top-headlines?lang=en&max=3&apikey=demo' // Using demo key, replace with real key
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback news if API fails
        setNews([
          {
            title: 'Global Markets Show Strong Recovery',
            description: 'Stock markets worldwide continue upward trend...',
            url: '#',
          },
          {
            title: 'Tech Innovation Reaches New Heights',
            description: 'AI and machine learning reshape industries...',
            url: '#',
          },
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

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
    <DashboardLayout onAddGoal={() => setIsAddGoalModalOpen(true)}>
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
            <div className='group relative overflow-hidden rounded-3xl p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500'>
              {/* Animated background elements */}
              <div className='absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
              <div className='absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700'></div>
              
              {/* Content */}
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300'>
                      <span className='text-2xl'>📰</span>
                    </div>
                    <div>
                      <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent'>
                        Today's Headlines
                      </h1>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {newsLoading ? 'Loading latest news...' : 'Stay informed with global updates'}
                      </p>
                    </div>
                  </div>
                  
                  {/* News Headlines Carousel */}
                  {!newsLoading && news.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      {news.slice(0, 2).map((article, idx) => (
                        <a
                          key={idx}
                          href={article.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group/news'
                        >
                          <div className='flex items-start gap-2'>
                            <span className='text-lg mt-0.5'>🔥</span>
                            <div className='flex-1 min-w-0'>
                              <h3 className='text-sm font-semibold text-gray-900 dark:text-white truncate group-hover/news:text-emerald-600 dark:group-hover/news:text-emerald-400 transition-colors'>
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1'>
                                  {article.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Stats row */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
                  <div className='bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 hover:scale-105 transition-transform duration-300'>
                    <div className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                      {goals.filter((g) => g.status === 'completed').length}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Completed</div>
                  </div>
                  <div className='bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 hover:scale-105 transition-transform duration-300'>
                    <div className='text-2xl font-bold text-cyan-600 dark:text-cyan-400'>
                      {goals.filter((g) => g.status === 'active').length}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>In Progress</div>
                  </div>
                  <div className='bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 hover:scale-105 transition-transform duration-300'>
                    <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                      {goals.length}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Total Goals</div>
                  </div>
                  <div className='bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 hover:scale-105 transition-transform duration-300'>
                    <div className='text-2xl font-bold text-violet-600 dark:text-violet-400'>
                      {Math.round((goals.filter((g) => g.status === 'completed').length / goals.length) * 100) || 0}%
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Success Rate</div>
                  </div>
                </div>
              </div>
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
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/landing');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl animate-pulse'>
            <span className='text-3xl'>⚡</span>
          </div>
          <p className='text-gray-600 dark:text-gray-400'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <DashboardContent />;
}
