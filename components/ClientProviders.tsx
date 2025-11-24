'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import Navigation from './Navigation';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // If you later have a server session, pass it here:
  // <SessionProvider session={serverSession}>{children}</SessionProvider>
  return (
    <SessionProvider>
      <Navigation />
      {children}
    </SessionProvider>
  );
}
