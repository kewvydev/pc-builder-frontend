'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'pcbuilder_auth_user';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  dimGrey: '#7C6F66',
  white: '#F2F2F2',
};

export default function LoginPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDisabled = useMemo(() => loading || !email || !password, [loading, email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Could not sign in');
      }

      setSuccess(`Welcome ${data?.nickname || data?.email || 'user'}! You are signed in.`);
      try {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            id: data?.id,
            email: data?.email,
            nickname: data?.nickname,
            admin: data?.admin === true,
          }),
        );
        // notify other components (AuthBar) in this tab
        window.dispatchEvent(new Event('storage'));
      } catch {
        // ignore
      }
      setPassword('');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-[#302F2C]"
      style={{
        background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.amber} 50%, ${palette.white} 100%)`,
      }}
    >
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-linear-to-br from-[#302F2C]/6 via-transparent to-white/35" />
        <div className="relative z-10 container mx-auto px-6 py-10">
          <header className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logos/logo_bg.png"
                  alt="PCBuilder+ logo"
                  fill
                  className="object-contain rounded-md"
                  sizes="64px"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-[#302F2C]">PCBuilder+</span>
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl font-semibold border border-[#302F2C]/15 bg-white/70 text-[#302F2C] hover:bg-white transition shadow-sm"
            >
              Create account
            </Link>
          </header>

          <div className="flex flex-col gap-10">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#302F2C]/5 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl bg-white/90 backdrop-blur border border-[#302F2C]/10 p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#302F2C]/70">Login</p>
                    <h2 className="text-2xl font-black text-[#302F2C]">Sign in</h2>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-semibold bg-[#FFDD26]/70 text-[#302F2C] border border-[#302F2C]/10">
                    Dev only
                  </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#302F2C]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-4 py-3 text-[#302F2C] shadow-inner shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[#FFBE1D]/60"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#302F2C]">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-4 py-3 text-[#302F2C] shadow-inner shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[#FFBE1D]/60"
                      placeholder="Your password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full rounded-xl bg-[#302F2C] text-[#FFDD26] px-4 py-3 font-semibold shadow-md shadow-black/20 transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Checking...' : 'Sign in'}
                  </button>
                </form>

                <p className="mt-4 text-sm text-[#302F2C]/70">
                  No account yet?{' '}
                  <Link href="/auth/signup" className="font-semibold text-[#302F2C] underline">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white/82 backdrop-blur-md border border-[#302F2C]/10 p-8 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)] flex flex-col gap-4">
              <p className="text-sm font-semibold text-[#302F2C]/70">Why sign up / log in</p>
              <h1 className="text-3xl font-black text-[#302F2C] leading-tight">
                Keep your builds and insights with you.
              </h1>
              <div className="grid gap-3 text-sm text-[#302F2C]/85 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#302F2C]" />
                  <span>Save and resume your PC builds without losing selections.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#FFBE1D]" />
                  <span>Explore community builds and clone them as your starting point.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7C6F66]" />
                  <span>Keep compatibility alerts and recommendations tied to your account.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#302F2C]" />
                  <span>Jump back to parts browsing with your filters and preferences.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

