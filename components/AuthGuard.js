'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../lib/auth';

export default function AuthGuard({ children, requireRole = null }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    if (requireRole && session.role !== requireRole) {
      // If user is partner and tries to open admin, redirect to chat
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [router, requireRole]);

  if (!authorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🌸</div>
          <p style={{ fontSize: '0.9rem' }}>Loading AlwaysUs...</p>
        </div>
      </div>
    );
  }

  return children;
}
