'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (status === 'authenticated' && session) {
      router.replace('/dashboard');
      return;
    }

    // Check for verification success
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified! You can now sign in.');
    }
    
    // Check for error messages
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting sign in with:', email);
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('SignIn error:', result.error);
        // Show specific error message if it's available
        if (result.error.includes('verify your email')) {
          setError(result.error);
        } else {
          setError('Invalid email or password');
        }
      } else if (result?.ok) {
        console.log('Sign in successful, redirecting...');
        router.push('/dashboard');
        router.refresh();
      } else {
        console.error('Unexpected result:', result);
        setError('Sign in failed');
      }
    } catch (error) {
      console.error('Exception during sign in:', error);
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative flex items-center justify-center p-4 overflow-hidden'>
      {/* Background matching signup page */}
      <div className='absolute inset-0 w-full h-full'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-cyan-900/80 to-blue-900/80 z-10'></div>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900/30 to-cyan-900/30'></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative max-w-md w-full z-20'
      >
        <div className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700/50'>
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4'
            >
              <span className='text-3xl'>⚡</span>
            </motion.div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2'>
              Welcome Back
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>Sign in to Life Hacker</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl'>
              <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0' />
              <p className='text-emerald-600 dark:text-emerald-400 text-sm'>{success}</p>
            </motion.div>
          )}

          <div className='space-y-3 mb-6'>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleOAuthSignIn('google')} disabled={isLoading}
              className='w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg border border-gray-300 disabled:opacity-50'>
              <svg className='w-5 h-5' viewBox='0 0 24 24'>
                <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
              </svg>
              Continue with Google
            </motion.button>
          </div>

          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-gray-300 dark:border-gray-600'></div></div>
            <div className='relative flex justify-center text-sm'><span className='px-4 bg-white dark:bg-gray-800/95 text-gray-600 dark:text-gray-400'>Or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Email Address</label>
              <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent' placeholder='you@example.com' />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Password</label>
              <div className='relative'>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12' placeholder='Your password' />
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type='submit' disabled={isLoading}
              className='w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 shadow-lg'>
              {isLoading ? <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div> : <><LogIn className='w-5 h-5' /><span>Sign In</span></>}
            </motion.button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              Don't have an account?{' '}
              <Link href='/auth/signup' className='text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold'>Sign Up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
