'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const AUTH_KEY = 'pcbuilder_auth_user';

type AuthUser = {
  id?: string;
  email?: string;
  nickname?: string;
  admin?: boolean;
};

export function AuthBar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(AUTH_KEY);
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      } finally {
        setReady(true);
      }
    };

    load();
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === AUTH_KEY) load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  // Avoid flicker during hydration
  if (!ready) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-wrap items-center gap-2">
      {user ? (
        <>
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm backdrop-blur">
            {user.nickname || user.email || 'Signed in'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-black/10 bg-[#302F2C] px-4 py-2 text-sm font-semibold text-[#FFDD26] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:opacity-90"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full bg-[#302F2C] px-4 py-2 text-sm font-semibold text-[#FFDD26] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:opacity-90"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}

