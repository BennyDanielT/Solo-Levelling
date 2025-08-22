'use client';

import { motion } from 'framer-motion';
import { ProgressStats } from '@/types';
import { Crown, Star, TrendingUp, Target } from 'lucide-react';

interface ProgressCardProps {
  progress: ProgressStats;
}

export default function ProgressCard({ progress }: ProgressCardProps) {
  const progressPercentage = Math.min(progress.totalProgress, 100);

  return (
    <div className='glass-effect rounded-xl p-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'
        >
          <div className='bg-gradient-to-br from-gold-500 to-gold-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg'>
            <Crown className='text-white' size={24} />
          </div>
          <h3 className='text-white font-bold text-lg'>
            Level {progress.currentLevel}
          </h3>
          <p className='text-gray-400 text-sm'>
            {progress.pointsToNextLevel} points to next level
          </p>
        </motion.div>

        {/* Total Points */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className='text-center'
        >
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg'>
            <Star className='text-white' size={24} />
          </div>
          <h3 className='text-white font-bold text-lg'>
            {progress.totalPoints}
          </h3>
          <p className='text-gray-400 text-sm'>Total Points</p>
        </motion.div>

        {/* Goals Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className='text-center'
        >
          <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg'>
            <Target className='text-white' size={24} />
          </div>
          <h3 className='text-white font-bold text-lg'>
            {progress.completedGoals}/{progress.totalGoals}
          </h3>
          <p className='text-gray-400 text-sm'>Goals Completed</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className='text-center'
        >
          <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg'>
            <TrendingUp className='text-white' size={24} />
          </div>
          <h3 className='text-white font-bold text-lg'>
            {progressPercentage.toFixed(1)}%
          </h3>
          <p className='text-gray-400 text-sm'>Overall Progress</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='mt-6'
      >
        <div className='flex justify-between items-center mb-2'>
          <span className='text-white font-medium'>Progress to Next Level</span>
          <span className='text-gray-400 text-sm'>
            {100 - progress.pointsToNextLevel}/100 points
          </span>
        </div>
        <div className='w-full bg-gray-700 rounded-full h-3 overflow-hidden'>
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((100 - progress.pointsToNextLevel) / 100) * 100}%`,
            }}
            transition={{ duration: 1, delay: 0.5 }}
            className='h-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full relative'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse'></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Level Up Message */}
      {progress.pointsToNextLevel <= 10 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className='mt-4 p-3 bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-lg'
        >
          <p className='text-gold-300 text-center font-medium'>
            🎉 Almost there! Just {progress.pointsToNextLevel} more points to
            level up!
          </p>
        </motion.div>
      )}
    </div>
  );
}
