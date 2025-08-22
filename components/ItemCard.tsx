'use client';

import { motion } from 'framer-motion';
import { Item } from '@/types';
import { Sword, Shield, Zap, Lock, Unlock } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword size={20} />;
      case 'armor':
        return <Shield size={20} />;
      case 'accessory':
        return <Zap size={20} />;
      case 'consumable':
        return <Zap size={20} />;
      default:
        return <Sword size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon':
        return 'text-red-400';
      case 'armor':
        return 'text-blue-400';
      case 'accessory':
        return 'text-purple-400';
      case 'consumable':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-effect rounded-lg p-4 transition-all duration-200 ${
        item.unlocked
          ? 'border-green-500/30 bg-green-500/10'
          : 'border-gray-500/30 opacity-60'
      }`}
    >
      <div className='flex items-start gap-3'>
        {/* Item Icon */}
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityColor(
            item.rarity,
          )} flex items-center justify-center flex-shrink-0`}
        >
          {item.unlocked ? (
            <div className={getTypeColor(item.type)}>
              {getItemIcon(item.type)}
            </div>
          ) : (
            <Lock className='text-white' size={20} />
          )}
        </div>

        {/* Item Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h4
              className={`font-semibold text-sm transition-all duration-200 ${
                item.unlocked ? 'text-white' : 'text-gray-400'
              }`}
            >
              {item.name}
            </h4>
            <span
              className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(
                item.rarity,
              )} text-white font-medium`}
            >
              {getRarityText(item.rarity)}
            </span>
          </div>

          <p
            className={`text-xs mb-2 transition-all duration-200 ${
              item.unlocked ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {item.description}
          </p>

          {/* Item Type and Unlock Status */}
          <div className='flex items-center justify-between'>
            <div
              className={`flex items-center gap-1 text-xs ${getTypeColor(
                item.type,
              )}`}
            >
              {getItemIcon(item.type)}
              <span className='capitalize'>{item.type}</span>
            </div>

            {item.unlocked ? (
              <div className='flex items-center gap-1 text-green-400 text-xs'>
                <Unlock size={12} />
                <span>Unlocked</span>
              </div>
            ) : (
              <div className='flex items-center gap-1 text-gray-400 text-xs'>
                <Lock size={12} />
                <span>{item.requiredPoints} points</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Animation */}
      {item.unlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className='absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg pointer-events-none'
        />
      )}
    </motion.div>
  );
}
