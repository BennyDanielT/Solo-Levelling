'use client';

import { motion } from 'framer-motion';
import { Goal } from '@/types';
import { CheckCircle, Circle, Trash2, Archive, Star } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onToggle: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onArchive: (goalId: string) => void;
}

export default function GoalCard({
  goal,
  onToggle,
  onDelete,
  onArchive,
}: GoalCardProps) {
  const isCompleted = goal.completed;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-effect rounded-lg p-4 transition-all duration-200 ${
        isCompleted
          ? 'border-green-500/30 bg-green-500/10'
          : 'border-gray-500/30 hover:border-gray-400/50'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-3 flex-1'>
          {/* Checkbox */}
          <button
            onClick={() => onToggle(goal.id)}
            className={`mt-1 p-1 rounded-full transition-all duration-200 ${
              isCompleted
                ? 'text-green-400 hover:text-green-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {isCompleted ? (
              <CheckCircle size={24} className='animate-pulse' />
            ) : (
              <Circle size={24} />
            )}
          </button>

          {/* Goal Content */}
          <div className='flex-1 min-w-0'>
            <h3
              className={`font-semibold text-lg mb-1 transition-all duration-200 ${
                isCompleted ? 'text-green-300 line-through' : 'text-white'
              }`}
            >
              {goal.title}
            </h3>
            <p
              className={`text-sm mb-3 transition-all duration-200 ${
                isCompleted ? 'text-green-400/70' : 'text-gray-300'
              }`}
            >
              {goal.description}
            </p>

            {/* Goal Stats */}
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                <span className='text-gray-400'>Weight:</span>
                <span className='text-white font-medium'>
                  {goal.weight.toFixed(1)}%
                </span>
              </div>

              <div className='flex items-center gap-1'>
                <Star size={14} className='text-gold-400' />
                <span className='text-gray-400'>Points:</span>
                <span className='text-gold-300 font-medium'>{goal.points}</span>
              </div>

              {isCompleted && goal.completedAt && (
                <div className='text-green-400 text-xs'>
                  Completed {goal.completedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 ml-4'>
          {isCompleted ? (
            // Archive button for completed goals
            <button
              onClick={() => onArchive(goal.id)}
              className='text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-blue-500/20 transition-all duration-200'
              title='Archive goal (preserves progress)'
            >
              <Archive size={18} />
            </button>
          ) : (
            // Delete button for incomplete goals
            <button
              onClick={() => onDelete(goal.id)}
              className='text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/20 transition-all duration-200'
              title='Delete goal (removes all progress)'
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Completion Animation */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg pointer-events-none'
        />
      )}
    </motion.div>
  );
}
