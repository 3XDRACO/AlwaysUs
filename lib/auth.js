// Authentication & Session Management for AlwaysUs

export const USERS = {
  partner: {
    email: 'partner@alwaysus.local',
    password: 'partner123',
    role: 'partner',
    name: 'Nishuu',
    avatar: '🌸'
  },
  owner: {
    email: 'owner@alwaysus.local',
    password: 'owner123',
    role: 'owner',
    name: 'Owner',
    avatar: '👑'
  }
};

const SESSION_KEY = 'alwaysus_auth_session';

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setSession(user) {
  if (typeof window === 'undefined') return;
  const sessionData = {
    email: user.email,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  // Also store in cookie for server/fast client reads
  document.cookie = `alwaysus_role=${user.role}; path=/; max-age=2592000; SameSite=Lax`;
  // Trigger storage event so other components update immediately
  window.dispatchEvent(new Event('alwaysus_auth_change'));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  document.cookie = 'alwaysus_role=; path=/; max-age=0';
  window.dispatchEvent(new Event('alwaysus_auth_change'));
}

export function authenticate(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (cleanEmail === USERS.partner.email && cleanPass === USERS.partner.password) {
    return { success: true, user: USERS.partner };
  }
  if (cleanEmail === USERS.owner.email && cleanPass === USERS.owner.password) {
    return { success: true, user: USERS.owner };
  }
  return { success: false, error: 'Invalid email or password.' };
}
