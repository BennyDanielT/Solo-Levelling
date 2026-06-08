'use client';

import React, { useState } from 'react';
import { Goal } from '@/types';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import { PlusIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface GoalListProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleGoal: (goalId: string) => void;
  onUpdateProgress: (goalId: string, progress: number) => void;
}

export function GoalList({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onToggleGoal,
  onUpdateProgress,
}: GoalListProps) {
  const [filter, setFilter] = useState<
    'all' | 'active' | 'completed' | 'archived'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGoals = goals.filter((goal) => {
    const matchesStatus = filter === 'all' || goal.status === filter;
    const matchesCategory =
      categoryFilter === 'all' || goal.category === categoryFilter;
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categories = [
    'work',
    'personal',
    'health',
    'learning',
    'finance',
    'relationships',
    'other',
  ];
  const statusCounts = {
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    archived: goals.filter((g) => g.status === 'archived').length,
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-purple-500',
      health: 'bg-green-500',
      learning: 'bg-yellow-500',
      finance: 'bg-emerald-500',
      relationships: 'bg-pink-500',
      other: 'bg-gray-500',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Goals
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Track your progress and achieve your objectives
          </p>
        </div>
        <ThemeButton onClick={onAddGoal} variant='primary'>
          <PlusIcon className='h-4 w-4 mr-2' />
          Add Goal
        </ThemeButton>
      </div>

      {/* Filters and Search */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Status Filter */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Status
            </label>
            <div className='flex gap-2'>
              {[
                { key: 'all', label: 'All', count: goals.length },
                { key: 'active', label: 'Active', count: statusCounts.active },
                {
                  key: 'completed',
                  label: 'Completed',
                  count: statusCounts.completed,
                },
                {
                  key: 'archived',
                  label: 'Archived',
                  count: statusCounts.archived,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-deep_sky_blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
            >
              <option value='all'>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Search
            </label>
            <div className='relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search goals...'
                className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => onEditGoal(goal)}
            onDelete={() => onDeleteGoal(goal.id)}
            onToggle={() => onToggleGoal(goal.id)}
            onUpdateProgress={(progress) => onUpdateProgress(goal.id, progress)}
            categoryColor={getCategoryColor(goal.category)}
            priorityColor={getPriorityColor(goal.priority)}
          />
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-gray-400 dark:text-gray-500 text-lg mb-2'>
            No goals found
          </div>
          <p className='text-gray-500 dark:text-gray-400 mb-4'>
            {searchQuery || filter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Start by adding your first goal to track your progress.'}
          </p>
          <ThemeButton onClick={onAddGoal} variant='primary'>
            <PlusIcon className='h-4 w-4 mr-2' />
            Add Your First Goal
          </ThemeButton>
        </div>
      )}
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onUpdateProgress: (progress: number) => void;
  categoryColor: string;
  priorityColor: string;
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onToggle,
  onUpdateProgress,
  categoryColor,
  priorityColor,
}: GoalCardProps) {
  const isCompleted = goal.status === 'completed';
  const isArchived = goal.status === 'archived';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
        isCompleted
          ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
          : isArchived
          ? 'border-l-gray-400 bg-gray-50 dark:bg-gray-900/20'
          : 'border-l-deep_sky_blue-500'
      }`}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className={`w-3 h-3 rounded-full ${categoryColor}`}></div>
          <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
            {goal.category}
          </span>
        </div>
        <div className={`text-xs font-medium ${priorityColor}`}>
          {goal.priority} priority
        </div>
      </div>

      {/* Title and Description */}
      <h3
        className={`font-semibold text-lg mb-2 ${
          isCompleted
            ? 'line-through text-gray-500 dark:text-gray-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {goal.title}
      </h3>
      <p
        className={`text-sm mb-4 ${
          isCompleted
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-600 dark:text-gray-300'
        }`}
      >
        {goal.description}
      </p>

      {/* Progress */}
      <div className='mb-4'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Progress
          </span>
          <span className='text-sm font-medium text-gray-900 dark:text-white'>
            {goal.progress}%
          </span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-deep_sky_blue-500'
            }`}
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        {goal.targetValue && (
          <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            {goal.currentValue || 0} / {goal.targetValue} {goal.unit || 'units'}
          </div>
        )}
      </div>

      {/* Tags */}
      {goal.tags.length > 0 && (
        <div className='flex flex-wrap gap-1 mb-4'>
          {goal.tags.map((tag) => (
            <span
              key={tag}
              className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full'
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Deadline */}
      {goal.deadline && (
        <div className='text-xs text-gray-500 dark:text-gray-400 mb-4'>
          Due: {goal.deadline.toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      <div className='flex gap-2'>
        {!isCompleted && !isArchived && (
          <ThemeButton
            onClick={onToggle}
            variant='success'
            size='sm'
            className='flex-1'
          >
            Mark Complete
          </ThemeButton>
        )}
        <ThemeButton onClick={onEdit} variant='secondary' size='sm'>
          Edit
        </ThemeButton>
        <ThemeButton onClick={onDelete} variant='error' size='sm'>
          Delete
        </ThemeButton>
      </div>
    </div>
  );
}

