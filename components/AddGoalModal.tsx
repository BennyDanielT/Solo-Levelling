'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal } from '@/types';
import { calculateAvailableWeight } from '@/utils/progress';
import { X, Target, Info } from 'lucide-react';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    description: string,
    weight: number,
    difficulty: 'easy' | 'medium' | 'hard',
  ) => void;
  existingGoals: Goal[];
}

export default function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  existingGoals,
}: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium',
  );
  const [availableWeight, setAvailableWeight] = useState(100);

  useEffect(() => {
    if (isOpen) {
      // Calculate available weight using the helper function
      const available = calculateAvailableWeight(existingGoals);

      setAvailableWeight(available);
      setWeight(Math.min(20, Math.max(0, available)));
    }
  }, [isOpen, existingGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim() && weight > 0) {
      onAdd(title.trim(), description.trim(), weight, difficulty);
      setTitle('');
      setDescription('');
      setWeight(20);
      setDifficulty('medium');
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyPoints = (diff: string) => {
    switch (diff) {
      case 'easy':
        return Math.round(weight * 1.6);
      case 'medium':
        return Math.round(weight * 2);
      case 'hard':
        return Math.round(weight * 3);
      default:
        return Math.round(weight * 2);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className='glass-effect rounded-xl p-6 w-full max-w-md'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                <Target className='text-gold-400' />
                Add New Goal
              </h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Title */}
              <div>
                <label className='block text-white font-medium mb-2'>
                  Goal Title
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 transition-colors'
                  placeholder='Enter your goal title...'
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-white font-medium mb-2'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-500 transition-colors resize-none'
                  placeholder='Describe your goal...'
                  rows={3}
                  required
                />
              </div>

              {/* Weight */}
              <div>
                <label className='block text-white font-medium mb-2'>
                  Weight: {weight}%
                  <span className='text-gray-400 text-sm ml-2'>
                    (Available: {availableWeight}%)
                  </span>
                </label>
                <input
                  type='range'
                  min='1'
                  max={availableWeight}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider'
                />
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>1%</span>
                  <span>{availableWeight}%</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className='block text-white font-medium mb-2'>
                  Difficulty
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type='button'
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                        difficulty === diff
                          ? 'border-gold-500 bg-gold-500/20 text-gold-300'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <span
                        className={`capitalize font-medium ${getDifficultyColor(
                          diff,
                        )}`}
                      >
                        {diff}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points Preview */}
              <div className='bg-gray-800/30 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <Info size={16} className='text-blue-400' />
                  <span className='text-white font-medium'>Goal Preview</span>
                </div>
                <div className='text-sm text-gray-300 space-y-1'>
                  <div>
                    Weight: <span className='text-white'>{weight}%</span>
                  </div>
                  <div>
                    Difficulty:{' '}
                    <span className={getDifficultyColor(difficulty)}>
                      {difficulty}
                    </span>
                  </div>
                  <div>
                    Points:{' '}
                    <span className='text-gold-300 font-medium'>
                      {getDifficultyPoints(difficulty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={!title.trim() || !description.trim() || weight <= 0}
                className='w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                Add Goal
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
