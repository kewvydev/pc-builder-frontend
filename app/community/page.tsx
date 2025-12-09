'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  dim: '#7C6F66',
  white: '#F2F2F2',
};

type ComponentDto = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
};

type BuildSummaryDto = {
  id: string;
  name: string;
  totalPrice: number;
  budget?: number | null;
  imageUrl?: string | null;
  userEmail?: string | null;
  userNickname?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  components: ComponentDto[];
  compatibilityAlerts: string[];
  recommendations: string[];
};

type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
};

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );
};

const formatDate = (iso?: string | null) => {
  if (!iso) return 'Recently updated';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function CommunityPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [data, setData] = useState<PagedResponse<BuildSummaryDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/builds/community?page=${page}&size=${size}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`We couldn't load the community (${res.status})`);
        }
        const json = (await res.json()) as PagedResponse<BuildSummaryDto>;
        setData(json);
      } catch (err: any) {
        setError(err?.message || 'Unexpected error loading community builds.');
      } finally {
        setLoading(false);
      }
    };
    fetchBuilds();
  }, [apiBase, page, size]);

  const stats = useMemo(() => {
    const total = data?.totalElements ?? 0;
    const pages = data?.totalPages ?? 0;
    return {
      total,
      pages,
    };
  }, [data]);

  const builds = data?.content ?? [];

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Hero */}
      <div
        className="relative min-h-[55vh] w-full overflow-hidden"
        style={{
          backgroundImage: 'url("/images/community_builds.jpg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: palette.gold,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26]/80 via-[#FFDD26]/55 to-[#FFDD26]/35" />
        <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent mix-blend-multiply" />

        <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
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
            href="/build"
            className="px-5 py-3 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/15"
          >
            Create my build
          </Link>
        </header>

        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#302F2C]/10">
            <p className="text-sm font-semibold text-[#302F2C]/80">Community</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-tight text-[#302F2C]">
              Get inspired by recent builds
            </h1>
            <p className="mt-3 text-lg text-[#302F2C]/80">
              Explore the latest configurations from the community. Check parts, prices, and trends
              for your next PC.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFDD26] px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm border border-[#302F2C]/10">
              <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
              {stats.total} public builds
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26] via-[#FFBE1D]/60 to-[#F2F2F2]/90" />
        <div className="relative container mx-auto px-6 pb-20 -mt-10">
          <div className="rounded-3xl bg-white/92 backdrop-blur border border-[#302F2C]/10 p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#302F2C]/70">Most recent builds</p>
                <h2 className="text-3xl font-black text-[#302F2C]">Community showcase</h2>
                <p className="text-[#302F2C]/75">Each card shows total price, budget, and key parts.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#302F2C] px-4 py-2 text-sm font-semibold text-[#FFDD26] shadow-sm border border-[#302F2C]/10">
                <span className="h-2 w-2 rounded-full bg-[#FFDD26]" />
                Page {page + 1} of {Math.max(stats.pages, 1)}
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 p-4 text-[#302F2C]">
                <p className="font-semibold text-[#7f1d1d]">We couldn't load the community</p>
                <p className="text-sm text-[#302F2C]/80">{error}</p>
              </div>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-full rounded-2xl border border-[#302F2C]/10 bg-[#FFDD26]/25 animate-pulse"
                      style={{ minHeight: 260 }}
                    />
                  ))
                : builds.map((build) => <BuildCard key={build.id} build={build} />)}
            </div>

            {!loading && builds.length === 0 && !error && (
              <div className="mt-8 rounded-2xl border border-[#302F2C]/10 bg-[#FFDD26]/20 p-6 text-center text-[#302F2C]">
                <p className="text-xl font-bold">No public builds yet</p>
                <p className="text-[#302F2C]/70">Be the first to publish from the builder and check back.</p>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#302F2C]/70">
                {stats.total > 0 ? `${stats.total} total builds` : 'No builds yet'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading || page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  className="rounded-xl px-4 py-2 text-sm font-semibold border border-[#302F2C]/25 text-[#302F2C] hover:bg-[#302F2C]/5 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={loading || data?.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BuildCard({ build }: { build: BuildSummaryDto }) {
  const slots = [
    { key: 'cpu', label: 'CPU', icon: '/icons/cpu.png', optional: false },
    { key: 'motherboard', label: 'Motherboard', icon: '/icons/motherboard.png', optional: false },
    { key: 'gpu', label: 'GPU', icon: '/icons/graphic-card.png', optional: false },
    { key: 'ram', label: 'RAM', icon: '/icons/ram.png', optional: false },
    { key: 'storage', label: 'Storage', icon: '/icons/storage.png', optional: false },
    { key: 'psu', label: 'Power Supply', icon: '/icons/power-supply.png', optional: false },
    { key: 'case', label: 'Case', icon: '/icons/case.png', optional: false },
    { key: 'cooling', label: 'CPU Cooler', icon: '/icons/fan.png', optional: true },
    { key: 'monitor', label: 'Monitor', icon: '/icons/monitor.png', optional: true },
    { key: 'os', label: 'Operating System', icon: '/icons/operative_system.png', optional: true },
    { key: 'peripherals', label: 'Peripherals', icon: '/icons/keyboard.png', optional: true },
  ];

  const byCategory = build.components.reduce<Record<string, ComponentDto>>((acc, comp) => {
    if (comp.category) {
      acc[comp.category.toLowerCase()] = comp;
    }
    return acc;
  }, {});

  const missingOptional = slots
    .filter((s) => s.optional)
    .filter((s) => !byCategory[s.key])
    .map((s) => s.label);

  const heroImage =
    build.imageUrl ||
    build.components.find((c) => c.imageUrl)?.imageUrl ||
    '/images/community_builds.jpg';

  const mergedRecommendations = [
    ...build.recommendations,
    ...(missingOptional.length ? [`Missing optional parts: ${missingOptional.join(', ')}`] : []),
  ];
  const author = build.userNickname || build.userEmail;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-[#302F2C]/10 bg-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.6fr]">
        <div className="relative min-h-[220px] bg-[#FFDD26]/50">
          <Image src={heroImage} alt={build.name} fill className="object-cover" sizes="320px" />
          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                {formatDate(build.createdAt)}
              </p>
              <h3 className="text-2xl font-black leading-tight drop-shadow">{build.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#302F2C]">
                {build.components.length} components
              </span>
              {build.budget !== null && build.budget !== undefined && (
                <span className="inline-flex items-center rounded-full bg-[#302F2C]/80 px-3 py-1 text-xs font-semibold text-[#FFDD26]">
                  Budget: {formatCurrency(build.budget)}
                </span>
              )}
              {author && (
                <span className="inline-flex items-center rounded-full bg-[#FFBE1D]/90 px-3 py-1 text-xs font-semibold text-[#302F2C]">
                  By: {author}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((slot) => {
              const comp = byCategory[slot.key];
              return (
                <div
                  key={slot.key}
                  className="flex items-start gap-3 rounded-2xl border border-[#302F2C]/10 bg-[#FFDD26]/25 px-3 py-2"
                >
                  <div className="relative h-10 w-10 rounded-xl bg-white/85 border border-[#302F2C]/10 overflow-hidden shrink-0">
                    <Image src={slot.icon} alt={slot.label} fill className="object-contain p-2" sizes="40px" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#302F2C]/70">{slot.label}</p>
                    {comp ? (
                      <>
                        <p className="text-sm font-semibold text-[#302F2C] truncate" title={comp.name}>
                          {comp.name}
                        </p>
                        {comp.brand && (
                          <p className="text-[11px] text-[#302F2C]/60 truncate">{comp.brand}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-[#302F2C]/50">
                        {slot.optional ? 'Skipped' : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {mergedRecommendations.length > 0 && (
            <div className="rounded-2xl border border-[#302F2C]/10 bg-[#302F2C]/5 px-4 py-3 text-xs text-[#302F2C] space-y-1">
              <p className="font-semibold text-[#302F2C]/80">Recommendations</p>
              <ul className="list-disc list-inside space-y-1">
                {mergedRecommendations.map((rec, idx) => (
                  <li key={`${rec}-${idx}`} className="leading-snug">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

