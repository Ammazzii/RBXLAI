'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Using your existing hook

/**
 * This component acts as a gatekeeper for the entire application.
 * Its only job is to check if a user is already logged in.
 * If they are, it redirects them from the landing page to the dashboard.
 */
export default function SessionGatekeeper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the initial authentication check is complete
    if (isLoading) {
      return;
    }

    // THE CORE LOGIC:
    // If we have a logged-in user AND they are currently on the landing page...
    if (user && pathname === '/') {
      // ...redirect them straight to the dashboard.
      router.replace('/dashboard');
    }

  }, [user, isLoading, pathname, router]);

  // While loading or if the user is not on the landing page, just render the children.
  return <>{children}</>;
}