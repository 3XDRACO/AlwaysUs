'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticate, setSession, getSession, USERS } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'owner') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [router]);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = authenticate(email, password);
    if (result.success) {
      setSession(result.user);
      if (result.user.role === 'owner') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleFillPartner = () => {
    setEmail(USERS.partner.email);
    setPassword(USERS.partner.password);
    setError('');
    // Auto-login on click for convenience as requested
    const result = authenticate(USERS.partner.email, USERS.partner.password);
    if (result.success) {
      setSession(result.user);
      router.replace('/');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2.5rem auto', width: '100%', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.25rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.2rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>♥</div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>
            Welcome to AlwaysUs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Your personalized, affectionate companion (Shakti)
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: '#FEE2E2',
              color: '#B91C1C',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="partner@alwaysus.local"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Partner Credentials Button */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Partner Quick Access (Click to Fill &amp; Login):
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleFillPartner}
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
          >
            🌸 Partner Login (1-Click)
          </button>
        </div>
      </div>
    </div>
  );
}
