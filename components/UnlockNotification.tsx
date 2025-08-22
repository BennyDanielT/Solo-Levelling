'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Users, Sword } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [timeLeft, setTimeLeft] = useState(10);

  // Auto-close functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'companion':
        return <Users size={48} className='text-blue-400' />;
      case 'item':
        return <Sword size={48} className='text-purple-400' />;
      default:
        return <Star size={48} className='text-gold-400' />;
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
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
        onClick={onClose}
      />

      {/* Centered Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
      >
        {/* Glow Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='absolute inset-0 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-2xl blur-2xl opacity-50 animate-pulse'
        />

        {/* Main Card */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className='relative glass-effect rounded-2xl p-8 border border-gold-500/30 shadow-2xl max-w-md w-full mx-4'
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 hover:bg-gray-800/50 rounded-full'
          >
            <X size={24} />
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='text-center mb-6'
          >
            <div className='flex items-center justify-center gap-3 mb-4'>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTypeColor()} flex items-center justify-center shadow-lg`}
              >
                {getIcon()}
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className='text-gold-400 font-bold text-xl mb-2'>
                🎉 NEW {getTypeText().toUpperCase()} UNLOCKED! 🎉
              </h3>
              <p className='text-gray-300 text-base'>
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
            <h4 className='text-white font-bold text-2xl mb-3 gradient-text'>
              {notification.name}
            </h4>
            <p className='text-gray-300 text-base mb-6 leading-relaxed'>
              {notification.description}
            </p>

            {/* Sparkle Effects */}
            <div className='relative mb-6'>
              {[...Array(8)].map((_, i) => (
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
                  className='absolute w-3 h-3 bg-gold-400 rounded-full'
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${10 + (i % 2) * 30}px`,
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
            className='mb-4 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 rounded-full overflow-hidden'
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
            className='text-center'
          >
            <p className='text-gray-400 text-sm font-medium'>
              This notification will auto-close in {timeLeft} seconds
            </p>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: Math.random() * 300 - 150,
              y: Math.random() * 300 - 150,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              delay: 1 + i * 0.15,
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
            className='absolute w-2 h-2 bg-gold-400 rounded-full'
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
