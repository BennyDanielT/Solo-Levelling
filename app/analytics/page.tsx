'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  GoalProgressChart, 
  CategoryBreakdownChart, 
  WeeklyStatsChart 
} from '@/components/dashboard/DashboardWidgets';
import { Goal } from '@/types';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (session: any) => {
  if ((session as any)?.accessToken) {
    return (session as any).accessToken;
  }
  return session?.user?.email || '';
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchGoals();
    }
  }, [status, router]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      
      const res = await fetch(`${FASTAPI_URL}/goals`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken(session)}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setGoals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data from goals
  const calculateAnalytics = () => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate average progress for active goals
    const activeGoalsWithProgress = goals.filter(g => g.status === 'active' && g.progress !== undefined);
    const avgProgress = activeGoalsWithProgress.length > 0
      ? Math.round(activeGoalsWithProgress.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoalsWithProgress.length)
      : 0;

    // Goals by category
    const categoryCounts: Record<string, number> = {};
    goals.forEach(goal => {
      categoryCounts[goal.category] = (categoryCounts[goal.category] || 0) + 1;
    });

    // Goals by priority
    const priorityCounts = {
      high: goals.filter(g => g.priority === 'high').length,
      medium: goals.filter(g => g.priority === 'medium').length,
      low: goals.filter(g => g.priority === 'low').length,
    };

    // Calculate stall rate
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const activeGoalsList = goals.filter(g => g.status === 'active');
    const stalledGoals = activeGoalsList.filter(goal => {
      if (!goal.updatedAt) return false;
      const lastUpdate = new Date(goal.updatedAt);
      return lastUpdate < fiveDaysAgo;
    });
    const stallRate = activeGoalsList.length > 0 
      ? Math.round((stalledGoals.length / activeGoalsList.length) * 100) 
      : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      completionRate,
      avgProgress,
      categoryCounts,
      priorityCounts,
      stallRate,
      stalledGoals: stalledGoals.length,
    };
  };

  const analytics = calculateAnalytics();

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent'>
            Analytics Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Visualize your progress and goal insights
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <MetricCard
            title='Total Goals'
            value={analytics.totalGoals}
            icon='🎯'
            color='from-blue-500 to-cyan-500'
            description='All tracked goals'
          />
          <MetricCard
            title='Active Goals'
            value={analytics.activeGoals}
            icon='⚡'
            color='from-emerald-500 to-teal-500'
            description='Currently in progress'
          />
          <MetricCard
            title='Completion Rate'
            value={`${analytics.completionRate}%`}
            icon='✅'
            color='from-purple-500 to-pink-500'
            description={`${analytics.completedGoals} completed`}
          />
          <MetricCard
            title='Avg Progress'
            value={`${analytics.avgProgress}%`}
            icon='📈'
            color='from-orange-500 to-red-500'
            description='Active goals average'
          />
        </div>

        {/* Additional Stats Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <MetricCard
            title='High Priority'
            value={analytics.priorityCounts.high}
            icon='🔴'
            color='from-red-500 to-rose-500'
            description='Critical focus areas'
          />
          <MetricCard
            title='Stalled Goals'
            value={analytics.stalledGoals}
            icon='⏸️'
            color='from-yellow-500 to-amber-500'
            description={`${analytics.stallRate}% stall rate`}
          />
          <MetricCard
            title='Categories'
            value={Object.keys(analytics.categoryCounts).length}
            icon='📊'
            color='from-indigo-500 to-purple-500'
            description='Diverse focus areas'
          />
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <GoalProgressChart />
          <CategoryBreakdownChart />
        </div>

        {/* Full Width Chart */}
        <div className='w-full'>
          <WeeklyStatsChart />
        </div>

        {/* Category Breakdown Table */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            📊 Goals by Category
          </h3>
          <div className='space-y-3'>
            {Object.entries(analytics.categoryCounts).map(([category, count]) => (
              <div key={category} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center'>
                    <span className='text-xl'>{getCategoryIcon(category)}</span>
                  </div>
                  <span className='text-gray-900 dark:text-white font-medium capitalize'>
                    {category}
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500'
                      style={{ 
                        width: `${analytics.totalGoals > 0 ? (count / analytics.totalGoals) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className='text-lg font-bold text-gray-900 dark:text-white w-12 text-right'>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            🎯 Priority Distribution
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <PriorityCard
              priority='High'
              count={analytics.priorityCounts.high}
              total={analytics.totalGoals}
              color='from-red-500 to-rose-500'
              icon='🔴'
            />
            <PriorityCard
              priority='Medium'
              count={analytics.priorityCounts.medium}
              total={analytics.totalGoals}
              color='from-yellow-500 to-amber-500'
              icon='🟡'
            />
            <PriorityCard
              priority='Low'
              count={analytics.priorityCounts.low}
              total={analytics.totalGoals}
              color='from-green-500 to-emerald-500'
              icon='🟢'
            />
          </div>
        </div>

        {/* Insights Section */}
        <div className='bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/5 dark:to-cyan-500/5 rounded-2xl p-6 border border-emerald-500/20 dark:border-emerald-500/10'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
            💡 Insights & Recommendations
          </h3>
          <div className='space-y-3'>
            {analytics.stallRate > 30 && (
              <InsightCard
                type='warning'
                message={`${analytics.stallRate}% of your active goals are stalled. Consider reviewing and updating them.`}
              />
            )}
            {analytics.completionRate >= 70 && (
              <InsightCard
                type='success'
                message={`Great job! You've completed ${analytics.completionRate}% of your goals.`}
              />
            )}
            {analytics.priorityCounts.high > analytics.activeGoals * 0.5 && (
              <InsightCard
                type='info'
                message='You have many high-priority goals. Consider focusing on fewer critical items for better results.'
              />
            )}
            {analytics.activeGoals === 0 && analytics.completedGoals > 0 && (
              <InsightCard
                type='success'
                message='All your goals are complete! Time to set new challenges.'
              />
            )}
            {analytics.totalGoals === 0 && (
              <InsightCard
                type='info'
                message='Start tracking your goals to see personalized insights and analytics.'
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to get category icons
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    productivity: '⚡',
    learning: '📚',
    career: '💼',
    fitness: '💪',
    personal: '🎯',
    work: '💻',
    health: '❤️',
    finance: '💰',
  };
  return icons[category] || '🎯';
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  description: string;
}

function MetricCard({ title, value, icon, color, description }: MetricCardProps) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300'>
      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${color} rounded-xl mb-4 shadow-lg`}>
        <span className='text-3xl'>{icon}</span>
      </div>
      <h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>{title}</h3>
      <p className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>{value}</p>
      <p className='text-xs text-gray-500 dark:text-gray-500'>{description}</p>
    </div>
  );
}

// Priority Card Component
interface PriorityCardProps {
  priority: string;
  count: number;
  total: number;
  color: string;
  icon: string;
}

function PriorityCard({ priority, count, total, color, icon }: PriorityCardProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>{icon}</span>
          <span className='font-semibold text-gray-900 dark:text-white'>{priority}</span>
        </div>
        <span className='text-2xl font-bold text-gray-900 dark:text-white'>{count}</span>
      </div>
      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden'>
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className='text-xs text-gray-500 dark:text-gray-500 mt-2'>
        {percentage}% of all goals
      </p>
    </div>
  );
}

// Insight Card Component
interface InsightCardProps {
  type: 'success' | 'warning' | 'info';
  message: string;
}

function InsightCard({ type, message }: InsightCardProps) {
  const styles = {
    success: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: '✅',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      border: 'border-blue-500/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'ℹ️',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4`}>
      <div className='flex items-start gap-3'>
        <span className='text-xl'>{style.icon}</span>
        <p className={`${style.text} text-sm font-medium flex-1`}>{message}</p>
      </div>
    </div>
  );
}
