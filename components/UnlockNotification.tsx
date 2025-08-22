'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Users, Sword } from 'lucide-react';

interface UnlockNotificationProps {
  notification: {
    type: 'companion' | 'item';
    name: string;
    description: string;
    imageUrl?: string;
  };
  onClose: () => void;
}

export default function UnlockNotification({
  notification,
  onClose,
}: UnlockNotificationProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'companion':
        return <Users size={32} className='text-blue-400' />;
      case 'item':
        return <Sword size={32} className='text-purple-400' />;
      default:
        return <Star size={32} className='text-gold-400' />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'companion':
        return 'from-blue-500 to-cyan-500';
      case 'item':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gold-500 to-orange-500';
    }
  };

  const getTypeText = () => {
    switch (notification.type) {
      case 'companion':
        return 'Companion';
      case 'item':
        return 'Item';
      default:
        return 'Reward';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className='fixed top-4 right-4 z-50 max-w-sm'
      >
        {/* Glow Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-xl blur-xl opacity-50 animate-pulse'
        />

        {/* Main Card */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className='relative glass-effect rounded-xl p-6 border border-gold-500/30 shadow-2xl'
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className='absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10'
          >
            <X size={20} />
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='text-center mb-4'
          >
            <div className='flex items-center justify-center gap-2 mb-2'>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor()} flex items-center justify-center shadow-lg`}
              >
                {getIcon()}
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className='text-gold-400 font-bold text-lg mb-1'>
                🎉 NEW {getTypeText().toUpperCase()} UNLOCKED! 🎉
              </h3>
              <p className='text-gray-300 text-sm'>
                Congratulations on your achievement!
              </p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='text-center'
          >
            <h4 className='text-white font-bold text-xl mb-2 gradient-text'>
              {notification.name}
            </h4>
            <p className='text-gray-300 text-sm mb-4'>
              {notification.description}
            </p>

            {/* Sparkle Effects */}
            <div className='relative'>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 1 + i * 0.1,
                    duration: 0.3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className='absolute w-2 h-2 bg-gold-400 rounded-full'
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + (i % 2) * 20}px`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress Bar Animation */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.2, duration: 1 }}
            className='mt-4 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full overflow-hidden'
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ delay: 1.2, duration: 1, repeat: Infinity }}
              className='h-full bg-white/30 rounded-full'
            />
          </motion.div>

          {/* Auto-close indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className='text-center mt-3'
          >
            <p className='text-gray-400 text-xs'>
              This notification will auto-close in 5 seconds
            </p>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              delay: 1 + i * 0.2,
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className='absolute w-1 h-1 bg-gold-400 rounded-full'
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
