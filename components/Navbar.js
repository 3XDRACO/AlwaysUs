'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, clearSession } from '../lib/auth';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setSession(getSession());

    const handleAuthChange = () => {
      setSession(getSession());
    };

    window.addEventListener('alwaysus_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('alwaysus_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  // If on login page, render simplified minimal header
  if (pathname === '/login') {
    return (
      <header className="app-header">
        <Link href="/login" className="brand-title">
          AlwaysUs <span className="brand-heart">♥</span>
        </Link>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Private Companion
        </span>
      </header>
    );
  }

  return (
    <>
      <header className="app-header">
        <Link href="/" className="brand-title">
          AlwaysUs <span className="brand-heart">♥</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            {session ? (
              <>
                <li className="nav-item">
                  <Link href="/" className={pathname === '/' ? 'active' : ''}>
                    Chat
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/memories" className={pathname === '/memories' ? 'active' : ''}>
                    Memories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/photos" className={pathname === '/photos' ? 'active' : ''}>
                    Photos
                  </Link>
                </li>
                {/* ONLY OWNER CAN SEE ADMIN BUTTON */}
                {session.role === 'owner' && (
                  <li className="nav-item">
                    <Link href="/admin" className={pathname.startsWith('/admin') ? 'active' : ''}>
                      Owner Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      background: session.role === 'owner' ? '#EDE9FE' : '#FCE7F3',
                      color: session.role === 'owner' ? '#6D28D9' : '#BE185D',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {session.avatar} {session.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    title="Sign out"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : mounted ? (
              <li className="nav-item">
                <Link href="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        {/* Mobile Nav Right: Badge + Hamburger */}
        <div className="mobile-nav-toggle-wrap">
          {session && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                background: session.role === 'owner' ? '#EDE9FE' : '#FCE7F3',
                color: session.role === 'owner' ? '#6D28D9' : '#BE185D',
                fontWeight: 600,
                marginRight: '0.4rem'
              }}
            >
              {session.avatar} {session.name}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="brand-title" style={{ fontSize: '1.1rem' }}>
                AlwaysUs <span className="brand-heart">♥</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            {session ? (
              <div className="mobile-drawer-links">
                <Link
                  href="/"
                  className={`mobile-drawer-link ${pathname === '/' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>💬</span> Chat
                </Link>
                <Link
                  href="/memories"
                  className={`mobile-drawer-link ${pathname === '/memories' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>🧠</span> Memories &amp; Facts
                </Link>
                <Link
                  href="/photos"
                  className={`mobile-drawer-link ${pathname === '/photos' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>📸</span> Private Photos
                </Link>
                {session.role === 'owner' && (
                  <Link
                    href="/admin"
                    className={`mobile-drawer-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>👑</span> Owner Admin
                  </Link>
                )}

                <div className="mobile-drawer-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{session.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {session.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {session.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem' }}>
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
