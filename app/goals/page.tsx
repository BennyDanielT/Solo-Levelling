'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Goal } from '@/types';
import { Plus, Target, Calendar, Tag, Trash2, Edit2, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/dashboard/ToastSystem';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = (session: any) => {
  // For credentials login, use accessToken from FastAPI
  if ((session as any)?.accessToken) {
    return (session as any).accessToken;
  }
  // For OAuth login, use email as token (backend will handle it)
  return session?.user?.email || '';
};

// Priority weights for weighted progress calculation
// Formula: Weighted Progress = Σ(progress × weight) / Σ(weight)
// High priority goals have 3x impact, Medium 2x, Low 1x
const PRIORITY_WEIGHTS: Record<string, number> = {
  high: 3,    // High priority: 3x weight
  medium: 2,  // Medium priority: 2x weight
  low: 1,     // Low priority: 1x weight
};

// Calculate weighted overall progress
const calculateWeightedProgress = (goals: Goal[]): number => {
  if (goals.length === 0) return 0;
  
  const totalWeightedProgress = goals.reduce((sum, goal) => {
    const weight = PRIORITY_WEIGHTS[goal.priority] || 1;
    const progress = goal.progress || 0;
    return sum + (progress * weight);
  }, 0);
  
  const totalWeight = goals.reduce((sum, goal) => {
    return sum + (PRIORITY_WEIGHTS[goal.priority] || 1);
  }, 0);
  
  return Math.round(totalWeightedProgress / totalWeight);
};

const categoryIcons: Record<string, string> = {
  productivity: '⚡',
  learning: '📚',
  career: '💼',
  fitness: '💪',
  personal: '🎯',
  work: '💻',
  health: '❤️',
  finance: '💰',
};

const categoryColors: Record<string, string> = {
  productivity: 'from-blue-500 to-cyan-500',
  learning: 'from-purple-500 to-pink-500',
  career: 'from-emerald-500 to-teal-500',
  fitness: 'from-orange-500 to-red-500',
  personal: 'from-yellow-500 to-amber-500',
  work: 'from-blue-600 to-indigo-600',
  health: 'from-rose-500 to-pink-500',
  finance: 'from-emerald-600 to-green-600',
};

const priorityColors: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  low: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
};

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { showSuccess, showError } = useToast();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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
      showError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const res = await fetch(`${FASTAPI_URL}/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken(session)}`,
        },
      });

      if (res.ok) {
        setGoals(goals.filter(g => g.id !== goalId));
        showSuccess('Goal deleted successfully');
      }
    } catch (error) {
      showError('Failed to delete goal');
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'completed' ? 'active' : 'completed';
      const res = await fetch(`${FASTAPI_URL}/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken(session)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchGoals();
        showSuccess(newStatus === 'completed' ? 'Goal completed! 🎉' : 'Goal marked as active');
      }
    } catch (error) {
      showError('Failed to update goal');
    }
  };

  // Filter goals based on search, status, and category
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
    <DashboardLayout onAddGoal={() => setIsModalOpen(true)}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent'>
              Your Goals
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Track and manage all your goals
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105'
          >
            <Plus className='w-5 h-5' />
            New Goal
          </button>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <StatCard
            title='Total Goals'
            value={goals.length}
            icon='🎯'
            color='from-blue-500 to-cyan-500'
          />
          <StatCard
            title='Active'
            value={goals.filter(g => g.status === 'active').length}
            icon='⚡'
            color='from-emerald-500 to-teal-500'
          />
          <StatCard
            title='Completed'
            value={goals.filter(g => g.status === 'completed').length}
            icon='✅'
            color='from-purple-500 to-pink-500'
          />
          <StatCard
            title='Completion Rate'
            value={`${goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%`}
            icon='📊'
            color='from-orange-500 to-red-500'
          />
          <StatCard
            title='Overall Progress'
            value={`${calculateWeightedProgress(goals)}%`}
            icon='📈'
            color='from-pink-500 to-rose-500'
          />
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Search */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Search
              </label>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search goals...'
                className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='completed'>Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              >
                <option value='all'>All Categories</option>
                <option value='productivity'>Productivity</option>
                <option value='learning'>Learning</option>
                <option value='career'>Career</option>
                <option value='fitness'>Fitness</option>
                <option value='personal'>Personal</option>
                <option value='work'>Work</option>
                <option value='health'>Health</option>
                <option value='finance'>Finance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700'>
            <Target className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
              {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              {goals.length === 0 
                ? 'Start your journey by creating your first goal!'
                : 'Try adjusting your filters or create a new goal.'
              }
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg'
            >
              <Plus className='w-5 h-5' />
              Create Goal
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onToggleComplete={handleToggleComplete}
                onEdit={(goal) => {
                  setEditingGoal(goal);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          onSuccess={() => {
            fetchGoals();
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          session={session}
        />
      )}
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${color} rounded-xl mb-4`}>
        <span className='text-2xl'>{icon}</span>
      </div>
      <h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>{title}</h3>
      <p className='text-3xl font-bold text-gray-900 dark:text-white'>{value}</p>
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
  onToggleComplete: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
}

function GoalCard({ goal, onDelete, onToggleComplete, onEdit }: GoalCardProps) {
  const icon = categoryIcons[goal.category] || '🎯';
  const colorClass = categoryColors[goal.category] || 'from-gray-500 to-gray-600';
  const priorityClass = priorityColors[goal.priority] || priorityColors.medium;

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300'>
      <div className='flex items-start justify-between mb-4'>
        <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl`}>
          <span className='text-2xl'>{icon}</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityClass}`}>
            {goal.priority}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            goal.status === 'completed' 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {goal.status}
          </span>
        </div>
      </div>
      
      <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>{goal.title}</h3>
      <p className='text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2'>{goal.description}</p>
      
      {/* Progress Bar */}
      {goal.progress !== undefined && (
        <div className='mb-4'>
          <div className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1'>
            <span>Progress</span>
            <span className='font-semibold'>{goal.progress}%</span>
          </div>
          <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
            <div
              className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-300`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {goal.tags && goal.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {goal.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full'>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Target Date */}
      {goal.targetDate && (
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4'>
          <Calendar className='w-4 h-4' />
          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <button
          onClick={() => onToggleComplete(goal)}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            goal.status === 'completed'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
          }`}
        >
          <CheckCircle2 className='w-4 h-4' />
          {goal.status === 'completed' ? 'Reopen' : 'Complete'}
        </button>
        <button
          onClick={() => onEdit(goal)}
          className='p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors'
        >
          <Edit2 className='w-4 h-4' />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className='p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSuccess: () => void;
  session: any;
}

function GoalModal({ goal, onClose, onSuccess, session }: GoalModalProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'personal',
    priority: goal?.priority || 'medium',
    targetDate: goal?.targetDate || '',
    status: goal?.status || 'active',
    progress: goal?.progress || 0,
    tags: goal?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        targetDate: formData.targetDate || null,
        status: formData.status,
        progress: formData.progress,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const url = goal
        ? `${FASTAPI_URL}/goals/${goal.id}`
        : `${FASTAPI_URL}/goals`;

      const res = await fetch(url, {
        method: goal ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken(session)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccess(goal ? 'Goal updated successfully' : 'Goal created successfully');
        onSuccess();
      } else {
        showError('Failed to save goal');
      }
    } catch (error) {
      showError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <span className='text-2xl'>×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Title *
            </label>
            <input
              type='text'
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              placeholder='e.g., Complete React course'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              placeholder='Describe your goal...'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              >
                <option value='productivity'>Productivity</option>
                <option value='learning'>Learning</option>
                <option value='career'>Career</option>
                <option value='fitness'>Fitness</option>
                <option value='personal'>Personal</option>
                <option value='work'>Work</option>
                <option value='health'>Health</option>
                <option value='finance'>Finance</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              >
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Target Date
              </label>
              <input
                type='date'
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Progress: {formData.progress}%
              </label>
              <div className='flex items-center gap-4'>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className='flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500'
                />
                <input
                  type='number'
                  min='0'
                  max='100'
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className='w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center'
                />
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Tags (comma separated)
            </label>
            <input
              type='text'
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
              placeholder='e.g., coding, react, frontend'
            />
          </div>

          <div className='flex items-center gap-4 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
