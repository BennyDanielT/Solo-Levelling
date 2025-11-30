'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/auth/signin?registered=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white dark:bg-gray-800/50 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700/50'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center'>
              <span className='text-3xl'>⚡</span>
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent'>
              Join Level Up HQ
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-2'>Create your account</p>
          </div>

          {error && (
            <div className='bg-red-500/10 border border-red-500/50 rounded-xl p-3 mb-6'>
              <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
            </div>
          )}

          <button
            type='button'
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className='w-full py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all duration-200 shadow-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 mb-4'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
            </svg>
            Continue with Google
          </button>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'>Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Username
              </label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                required
                minLength={6}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg'
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              Already have an account?{' '}
              <Link href='/auth/signin' className='text-emerald-600 dark:text-emerald-400 font-semibold hover:underline'>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username: username || undefined,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Signing you in...');

        // Auto sign in after successful registration
        setTimeout(async () => {
          await signIn('credentials', {
            email,
            password,
            callbackUrl: '/',
          });
        }, 1500);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4'>
      {/* Animated background effects */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div
          className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse'
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
              className='w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center'
            >
              <Crown className='w-8 h-8 text-white' />
            </motion.div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Join the Guild
            </h1>
            <p className='text-gray-300'>Begin your journey as a hunter</p>
          </div>

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-green-500/20 border border-green-500 rounded-lg p-3 mb-6'
            >
              <p className='text-green-300 text-sm'>{success}</p>
            </motion.div>
          )}

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
          <div className='space-y-3 mb-6'>
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className='w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 transition-all duration-200 disabled:opacity-50'
            >
              <Mail className='w-5 h-5 text-white' />
              <span className='text-white font-medium'>
                Continue with Google
              </span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className='w-full flex items-center justify-center space-x-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-600 rounded-lg p-3 transition-all duration-200 disabled:opacity-50'
            >
              <Github className='w-5 h-5 text-white' />
              <span className='text-white font-medium'>
                Continue with GitHub
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className='relative mb-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-white/20'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-gray-900/50 text-gray-400'>
                Or create an account
              </span>
            </div>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Display Name *
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='Enter your name'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Username (optional)
              </label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='Choose a username'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Email Address *
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='hunter@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Password *
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12'
                  placeholder='Create a password'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Confirm Password *
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12'
                  placeholder='Confirm your password'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6'
            >
              {isLoading ? (
                <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <>
                  <UserPlus className='w-5 h-5' />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Sign in link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-400'>
              Already a hunter?{' '}
              <Link
                href='/auth/signin'
                className='text-purple-400 hover:text-purple-300 font-medium'
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-6'>
          <p className='text-gray-500 text-sm'>
            Start as an E-Rank hunter and level up to become the Shadow Monarch
          </p>
        </div>
      </motion.div>
    </div>
  );
}
