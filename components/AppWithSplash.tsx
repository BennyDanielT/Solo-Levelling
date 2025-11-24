'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';

interface AppWithSplashProps {
  children: React.ReactNode;
}

export default function AppWithSplash({ children }: AppWithSplashProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't show splash on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  useEffect(() => {
    // Check if user has seen splash in this session
    const splashSeen = sessionStorage.getItem('splashSeen');
    if (splashSeen || isAuthPage) {
      setShowSplash(false);
      setHasSeenSplash(true);
    }
  }, [isAuthPage]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setHasSeenSplash(true);
    sessionStorage.setItem('splashSeen', 'true');
  };

  // Show splash screen if:
  // 1. User hasn't seen it in this session AND
  // 2. User is authenticated AND
  // 3. Not on auth pages
  const shouldShowSplash =
    showSplash && !hasSeenSplash && status === 'authenticated' && !isAuthPage;

  if (shouldShowSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <>{children}</>;
}
