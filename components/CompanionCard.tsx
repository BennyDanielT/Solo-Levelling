'use client';

import { motion } from 'framer-motion';
import { Companion } from '@/types';
import { Users, Lock, Unlock } from 'lucide-react';

interface CompanionCardProps {
  companion: Companion;
}

export default function CompanionCard({ companion }: CompanionCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-500 to-pink-500';
      case 'rare':
        return 'from-blue-500 to-cyan-500';
      case 'common':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'Legendary';
      case 'epic':
        return 'Epic';
      case 'rare':
        return 'Rare';
      case 'common':
        return 'Common';
      default:
        return 'Common';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-effect rounded-lg p-4 transition-all duration-200 ${
        companion.unlocked
          ? 'border-green-500/30 bg-green-500/10'
          : 'border-gray-500/30 opacity-60'
      }`}
    >
      <div className='flex items-start gap-3'>
        {/* Companion Icon */}
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityColor(
            companion.rarity,
          )} flex items-center justify-center flex-shrink-0`}
        >
          {companion.unlocked ? (
            <Users className='text-white' size={20} />
          ) : (
            <Lock className='text-white' size={20} />
          )}
        </div>

        {/* Companion Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h4
              className={`font-semibold text-sm transition-all duration-200 ${
                companion.unlocked ? 'text-white' : 'text-gray-400'
              }`}
            >
              {companion.name}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(
                companion.rarity,
              )} text-white font-medium`}
            >
              {getRarityText(companion.rarity)}
            </span>
          </div>

          <p
            className={`text-xs mb-2 transition-all duration-200 ${
              companion.unlocked ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {companion.description}
          </p>

          {/* Unlock Status */}
          <div className='flex items-center gap-2'>
            {companion.unlocked ? (
              <div className='flex items-center gap-1 text-green-400 text-xs'>
                <Unlock size={12} />
                <span>Unlocked</span>
              </div>
            ) : (
              <div className='flex items-center gap-1 text-gray-400 text-xs'>
                <Lock size={12} />
                <span>{companion.requiredPoints} points required</span>
              </div>
            )}
          </div>

          {/* Abilities Preview */}
          {companion.unlocked && companion.abilities.length > 0 && (
            <div className='mt-2'>
              <div className='flex flex-wrap gap-1'>
                {companion.abilities.slice(0, 2).map((ability, index) => (
                  <span
                    key={index}
                    className='text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  >
                    {ability}
                  </span>
                ))}
                {companion.abilities.length > 2 && (
                  <span className='text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30'>
                    +{companion.abilities.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unlock Animation */}
      {companion.unlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className='absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg pointer-events-none'
        />
      )}
    </motion.div>
  );
}
