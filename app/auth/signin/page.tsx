'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Mail, Sword } from 'lucide-react';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn(provider, { callbackUrl: '/' });
      if (result?.error) {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4'>
      {/* Animated background effects */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div
          className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative max-w-md w-full'
      >
        {/* Main card */}
        <div className='glass-effect rounded-2xl p-8 border border-white/10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'
            >
              <Sword className='w-8 h-8 text-white' />
            </motion.div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Welcome Back, Hunter
            </h1>
            <p className='text-gray-300'>Sign in to continue your journey</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6'
            >
              <p className='text-red-300 text-sm'>{error}</p>
            </motion.div>
          )}

          {/* OAuth buttons */}
          <div className='space-y-4 mb-6'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className='w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all duration-200 disabled:opacity-50'
            >
              <Mail className='w-6 h-6 text-white' />
              <span className='text-white font-medium text-lg'>
                Continue with Google
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className='w-full flex items-center justify-center space-x-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-600 rounded-lg p-4 transition-all duration-200 disabled:opacity-50'
            >
              <Github className='w-6 h-6 text-white' />
              <span className='text-white font-medium text-lg'>
                Continue with GitHub
              </span>
            </motion.button>
          </div>

          {/* Info about current limitations */}
          <div className='text-center'>
            <div className='bg-blue-500/20 border border-blue-500 rounded-lg p-4'>
              <p className='text-blue-300 text-sm'>
                🚧 <strong>OAuth Only</strong> - Currently supporting Google &
                GitHub sign-in.
                <br />
                Email/password authentication will be available once database is
                configured.
              </p>
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className='mt-4 flex justify-center'>
              <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-gray-500 text-sm'>
            Join the ranks of elite hunters in Solo Leveling Dashboard
          </p>
        </div>
      </motion.div>
    </div>
  );
}
