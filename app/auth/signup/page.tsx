'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  dimGrey: '#7C6F66',
  white: '#F2F2F2',
};
const AUTH_KEY = 'pcbuilder_auth_user';

export default function SignUpPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => loading || !email || !password || !confirmPassword || !nickname,
    [loading, email, password, confirmPassword, nickname],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, nickname }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Could not create account');
      }

      setSuccess(`Account created. Hi ${data?.nickname || nickname}! You can sign in now.`);
      try {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            id: data?.id,
            email: data?.email || email,
            nickname: data?.nickname || nickname,
            admin: data?.admin === true,
          }),
        );
      } catch {
        // ignore
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNickname('');
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#302F2C]/5 via-transparent to-white/40" />
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
              href="/auth/login"
              className="px-4 py-2 rounded-xl font-semibold border border-[#302F2C]/15 bg-white/70 text-[#302F2C] hover:bg-white transition shadow-sm"
            >
              I already have an account
            </Link>
          </header>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
            <div className="rounded-3xl bg-white/75 backdrop-blur-md border border-[#302F2C]/10 p-8 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)]">
              <p className="text-sm font-semibold text-[#302F2C]/70">Create your account</p>
              <h1 className="mt-2 text-4xl font-black text-[#302F2C] leading-tight">
                Start building your PC with guidance.
              </h1>
              <p className="mt-3 text-[#302F2C]/75">
                Sign up to save builds, test compatibility, and access the catalog quickly. This is
                for development only; passwords are stored in plain text.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm font-semibold text-[#302F2C]">
                <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#302F2C]/10 px-4 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
                  Save and resume your builds
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#302F2C]/10 px-4 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#FFBE1D]" />
                  Clone community builds to start faster
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/80 border border-[#302F2C]/10 px-4 py-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#7C6F66]" />
                  Keep compatibility alerts with your account
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-[#302F2C]/5 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl bg-white/90 backdrop-blur border border-[#302F2C]/10 p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#302F2C]/70">Sign up</p>
                    <h2 className="text-2xl font-black text-[#302F2C]">Create your account</h2>
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
                    <label className="text-sm font-semibold text-[#302F2C]">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-4 py-3 text-[#302F2C] shadow-inner shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[#FFBE1D]/60"
                      placeholder="GamerPro"
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
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#302F2C]">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-4 py-3 text-[#302F2C] shadow-inner shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[#FFBE1D]/60"
                      placeholder="Repeat the password"
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
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>

                <p className="mt-4 text-sm text-[#302F2C]/70">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold text-[#302F2C] underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

