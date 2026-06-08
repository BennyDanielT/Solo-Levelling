'use client';

import React, { useState } from 'react';
import { Goal } from '@/types';
import { ThemeButton } from '@/lib/theme/ThemeButton';
import { Cross1Icon, TargetIcon, CalendarIcon } from '@radix-ui/react-icons';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingGoals: Goal[];
}

export function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  existingGoals,
}: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    targetValue: '',
    unit: '',
    deadline: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'work', label: 'Work', color: 'bg-blue-500' },
    { value: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { value: 'health', label: 'Health', color: 'bg-green-500' },
    { value: 'learning', label: 'Learning', color: 'bg-yellow-500' },
    { value: 'finance', label: 'Finance', color: 'bg-emerald-500' },
    { value: 'relationships', label: 'Relationships', color: 'bg-pink-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'high', label: 'High', color: 'text-red-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    const goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      status: 'active',
      progress: 0,
      targetValue: formData.targetValue
        ? parseFloat(formData.targetValue)
        : undefined,
      currentValue: 0,
      unit: formData.unit || undefined,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      tags: formData.tags,
      completedAt: undefined,
      points: calculatePoints(formData.category, formData.priority),
    };

    onAdd(goal);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      targetValue: '',
      unit: '',
      deadline: '',
      tags: [],
    });
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const calculatePoints = (category: string, priority: string) => {
    const basePoints = 10;
    const categoryMultiplier = {
      work: 1.5,
      health: 1.3,
      learning: 1.4,
      finance: 1.6,
      relationships: 1.2,
      personal: 1.0,
      other: 1.0,
    };
    const priorityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.3,
    };

    return Math.round(
      basePoints *
        (categoryMultiplier[category as keyof typeof categoryMultiplier] || 1) *
        (priorityMultiplier[priority as keyof typeof priorityMultiplier] || 1),
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <TargetIcon className='h-6 w-6 text-deep_sky_blue-500' />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Add New Goal
            </h2>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <Cross1Icon className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Goal Title *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
              placeholder='Enter your goal title...'
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500 resize-none'
              placeholder='Describe your goal in detail...'
              rows={3}
              required
            />
          </div>

          {/* Category and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as Goal['category'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as Goal['priority'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Measurable Goal */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Measurable Target (Optional)
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  Target Value
                </label>
                <input
                  type='number'
                  value={formData.targetValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetValue: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
                  placeholder='e.g., 10'
                  min='0'
                  step='0.1'
                />
              </div>
              <div>
                <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  Unit
                </label>
                <input
                  type='text'
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
                  placeholder='e.g., hours, pages, lbs'
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Deadline (Optional)
            </label>
            <div className='relative'>
              <CalendarIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='date'
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Tags
            </label>
            <div className='flex gap-2 mb-2'>
              <input
                type='text'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
                className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-deep_sky_blue-500 focus:border-deep_sky_blue-500'
                placeholder='Add a tag...'
              />
              <ThemeButton
                type='button'
                onClick={addTag}
                variant='secondary'
                size='sm'
              >
                Add
              </ThemeButton>
            </div>
            {formData.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-2 py-1 bg-deep_sky_blue-100 dark:bg-deep_sky_blue-900 text-deep_sky_blue-800 dark:text-deep_sky_blue-200 text-xs rounded-full'
                  >
                    #{tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='hover:text-red-500 transition-colors'
                    >
                      <Cross1Icon className='h-3 w-3' />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-900 dark:text-white mb-2'>
              Goal Preview
            </h4>
            <div className='text-sm text-gray-600 dark:text-gray-300 space-y-1'>
              <div>
                <strong>Title:</strong> {formData.title || 'Not set'}
              </div>
              <div>
                <strong>Category:</strong>{' '}
                {categories.find((c) => c.value === formData.category)?.label}
              </div>
              <div>
                <strong>Priority:</strong>{' '}
                {priorities.find((p) => p.value === formData.priority)?.label}
              </div>
              {formData.targetValue && (
                <div>
                  <strong>Target:</strong> {formData.targetValue}{' '}
                  {formData.unit || 'units'}
                </div>
              )}
              <div>
                <strong>Points:</strong>{' '}
                {calculatePoints(formData.category, formData.priority)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <ThemeButton
              type='button'
              onClick={handleClose}
              variant='secondary'
              className='flex-1'
            >
              Cancel
            </ThemeButton>
            <ThemeButton type='submit' variant='primary' className='flex-1'>
              Create Goal
            </ThemeButton>
          </div>
        </form>
      </div>
    </div>
  );
}

