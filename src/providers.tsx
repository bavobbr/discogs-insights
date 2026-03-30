"use client";

import { DiscogsSyncProvider } from './context/DiscogsSyncContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DiscogsSyncProvider>
      {children}
    </DiscogsSyncProvider>
  );
}
