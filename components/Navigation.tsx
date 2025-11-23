'use client';

import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { LogOut, User, Crown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null; // Don't show navigation while loading
  }

  if (!session) {
    return null; // Don't show navigation for unauthenticated users
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className='fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10'
    >
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo/Title */}
          <div className='flex items-center gap-6'>
            <Link
              href='/'
              className='flex items-center gap-2 text-white hover:text-gold-400 transition-colors'
            >
              <Crown className='w-8 h-8 text-gold-400' />
              <span className='text-xl font-bold'>Solo Leveling</span>
            </Link>
            <Link
              href='/coach'
              className='flex items-center gap-2 text-gray-300 hover:text-gold-400 transition-colors'
            >
              <MessageSquare className='w-5 h-5' />
              <span className='text-sm font-medium'>Coach</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className='flex items-center gap-4'>
            {/* User Info */}
            <div className='flex items-center gap-2 text-white'>
              <div className='w-8 h-8 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center'>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className='w-8 h-8 rounded-full'
                  />
                ) : (
                  <User className='w-4 h-4 text-white' />
                )}
              </div>
              <span className='hidden sm:block text-sm font-medium'>
                {session.user?.name || 'Hunter'}
              </span>
            </div>

            {/* Sign Out Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className='flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 hover:text-red-200 transition-all duration-200'
            >
              <LogOut className='w-4 h-4' />
              <span className='hidden sm:block text-sm'>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
