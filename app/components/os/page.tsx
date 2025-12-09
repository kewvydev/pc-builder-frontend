/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AddToBuildButton from '@/components/AddToBuildButton';

type ComponentItem = {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  productUrl?: string;
  attributes?: Record<string, string>;
};

type Range = { min: number; max: number };

const numAttr = (item: ComponentItem, key: string) => {
  const raw = item.attributes?.[key];
  if (!raw) return undefined;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function OsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [data, setData] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [mode, setMode] = useState('all');
  const [maxMemRange, setMaxMemRange] = useState<Range | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/api/components/os`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load OS (${res.status})`);
        }
        const json = await res.json();
        setData(json || []);
      } catch (err: any) {
        setError(err?.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiBase]);

  const { modeOptions, maxMemStats, brands } = useMemo(() => {
    const modeCount: Record<string, number> = {};
    const maxMems: number[] = [];
    const brandSet = new Set<string>();

    data.forEach((item) => {
      const m = item.attributes?.mode;
      if (m) modeCount[m] = (modeCount[m] || 0) + 1;
      const mm = numAttr(item, 'max_memory');
      if (mm !== undefined) maxMems.push(mm);
      if (item.brand) brandSet.add(item.brand);
    });

    const stats = (arr: number[]) =>
      arr.length ? { min: Math.floor(Math.min(...arr)), max: Math.ceil(Math.max(...arr)) } : null;

    const topOptions = (obj: Record<string, number>, take = 10) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, take)
        .map(([name]) => name);

    return {
      modeOptions: topOptions(modeCount, 10),
      maxMemStats: stats(maxMems),
      brands: Array.from(brandSet).sort(),
    };
  }, [data]);

  useEffect(() => {
    if (maxMemStats && !maxMemRange) setMaxMemRange(maxMemStats);
  }, [maxMemStats, maxMemRange]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term || item.name.toLowerCase().includes(term) || item.brand?.toLowerCase().includes(term);
      const matchesBrand = brand === 'all' || item.brand === brand;

      const modeAttr = item.attributes?.mode;
      const modeOk = mode === 'all' || modeAttr === mode;

      const maxMem = numAttr(item, 'max_memory');
      const memOk =
        maxMemRange && maxMem !== undefined ? maxMem >= maxMemRange.min && maxMem <= maxMemRange.max : true;

      return matchesSearch && matchesBrand && modeOk && memOk;
    });
  }, [data, search, brand, mode, maxMemRange]);

  useEffect(() => {
    setPage(1);
  }, [search, brand, mode, maxMemRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const badge = (label: string) => (
    <span className="inline-flex items-center rounded-full bg-[#302F2C]/10 px-2 py-1 text-xs font-semibold text-[#302F2C]">
      {label}
    </span>
  );

  const Pagination = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-[#302F2C]/70">
        Page <span className="font-semibold text-[#302F2C]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[#302F2C]">{totalPages}</span> ·{' '}
        <span className="font-semibold text-[#302F2C]">{filtered.length}</span> OS entries
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
            currentPage === 1
              ? 'border-[#302F2C]/20 text-[#302F2C]/40 cursor-not-allowed'
              : 'border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5'
          }`}
        >
          Prev
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
            const num = idx + 1;
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  num === currentPage
                    ? 'bg-[#302F2C] text-[#FFDD26]'
                    : 'border border-[#302F2C]/30 text-[#302F2C] hover:bg-[#302F2C]/5'
                }`}
              >
                {num}
              </button>
            );
          })}
          {totalPages > 5 && <span className="px-2 py-2 text-sm text-[#302F2C]/60">… {totalPages}</span>}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
            currentPage === totalPages
              ? 'border-[#302F2C]/20 text-[#302F2C]/40 cursor-not-allowed'
              : 'border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );

  const Slider = ({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
  }: {
    label: string;
    value: number | null;
    min?: number | null;
    max?: number | null;
    step?: number;
    onChange: (v: number) => void;
  }) => {
    if (min === null || max === null || min === undefined || max === undefined) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify_between text-sm font-semibold text-[#302F2C]">
          <span>{label}</span>
          <span className="text-[#302F2C]/70">{value !== null ? value : '--'}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[#302F2C]"
        />
        <div className="flex justify_between text-xs text-[#302F2C]/60">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const TogglePill = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active ? 'border-[#302F2C] bg-[#302F2C] text-[#FFDD26]' : 'border-[#302F2C]/30 bg-white text-[#302F2C]'
      }`}
    >
      {label}
    </button>
  );

  const resetFilters = () => {
    setSearch('');
    setBrand('all');
    setMode('all');
    setMaxMemRange(maxMemStats || null);
  };

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-[#302F2C]/10 bg-[#FFDD26]/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logos/logo_bg.png" alt="PCBuilder+ logo" fill className="object-contain rounded-md" sizes="40px" priority />
            </div>
            <span className="text-lg font-bold text-[#302F2C]">PCBuilder+</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/build"
              className="px-4 py-2 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/15"
            >
              Start now
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26] via-[#FFBE1D]/60 to-[#F2F2F2]/80" />
        <div className="relative container mx-auto px-6 py-10">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Content */}
            <div className="flex-1 space-y-6">
              <div className="rounded-3xl bg-white/80 backdrop-blur border border-[#302F2C]/10 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#302F2C]/70">Browse · OS</p>
                    <h1 className="text-3xl font-black text-[#302F2C]">Pick an Operating System</h1>
                    <p className="text-[#302F2C]/75">Use filters to narrow by mode and supported memory.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="hidden lg:block">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for OS..."
                        className="w-64 rounded-xl border border-[#302F2C]/30 bg-white px-4 py-3 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#302F2C]/70">
                  {badge(`${filtered.length} compatible`)}
                  {maxMemStats && badge(`Up to ${maxMemStats.max} GB`)}
                </div>
              </div>

              {loading && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="rounded-2xl border border-[#302F2C]/10 bg-white/70 h-52 animate-pulse" />
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[#302F2C] bg-white px-4 py-3 text-[#302F2C]">
                  {error}
                </div>
              )}

              {!loading && !error && paginated.length === 0 && (
                <div className="rounded-xl border border-[#302F2C]/30 bg-white px-4 py-6 text-center text-[#302F2C]/80">
                  We could not find OS entries with the current filters. Try adjusting search or ranges.
                </div>
              )}

              {!loading && !error && paginated.length > 0 && (
                <div className="space-y-4">
                  {paginated.map((item) => {
                    const modeAttr = item.attributes?.mode;
                    const maxMem = item.attributes?.max_memory;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#302F2C]/10 bg-white p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative h-20 w-20 rounded-xl bg-[#FFBE1D]/30 border border-[#302F2C]/10 flex items-center justify-center overflow-hidden">
                              {item.imageUrl ? (
                                <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" sizes="80px" />
                              ) : (
                                <span className="text-lg font-bold text-[#302F2C]">{item.brand?.slice(0, 3) || 'OS'}</span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-[#302F2C] leading-tight">{item.name}</h3>
                              <p className="text-sm text-[#302F2C]/70">{item.brand || 'Unknown brand'}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-[#302F2C]/80">
                                {modeAttr && badge(`${modeAttr}-bit`)}
                                {maxMem && badge(`${maxMem} GB max memory`)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <a
                                href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[#FFDD26] text-[#302F2C] border-2 border-[#302F2C] outline-none hover:opacity-90 transition"
                              >
                                <Image src="/icons/amazon.svg" alt="Amazon" width={20} height={20} />
                                View
                              </a>
                              <AddToBuildButton
                                defaultSlot="os"
                                item={{
                                  id: item.id,
                                  name: item.name,
                                  brand: item.brand,
                                  price: item.price,
                                  imageUrl: item.imageUrl,
                                  productUrl: item.productUrl,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && paginated.length > 0 && <Pagination />}
            </div>

            {/* Filters sidebar */}
            <aside className="w-full lg:w-80">
              <div className="sticky top-24 space-y-4 rounded-2xl bg-white/85 backdrop-blur border border-[#302F2C]/10 p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#302F2C]/70">Compatibility Filter</p>
                    <p className="text-sm text-[#302F2C]/70">{filtered.length} items</p>
                  </div>
                  <button onClick={resetFilters} className="text-xs font-semibold text-[#302F2C] hover:underline">
                    Reset
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#302F2C]">Search</label>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or brand..."
                      className="w-full rounded-xl border border-[#302F2C]/30 bg-white px-3 py-2 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#302F2C]">Brand</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full rounded-xl border border-[#302F2C]/30 bg-white px-3 py-2 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                    >
                      <option value="all">All</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {modeOptions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#302F2C]">Mode</p>
                      <div className="flex flex-wrap gap-2">
                        {modeOptions.map((opt) => {
                          const active = mode === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setMode(opt)}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                active
                                  ? 'border-[#302F2C] bg-[#302F2C] text-[#FFDD26]'
                                  : 'border-[#302F2C]/30 bg-white text-[#302F2C]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setMode('all')}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            mode === 'all'
                              ? 'border-[#302F2C] bg-[#302F2C] text-[#FFDD26]'
                              : 'border-[#302F2C]/30 bg-white text-[#302F2C]'
                          }`}
                        >
                          All
                        </button>
                      </div>
                    </div>
                  )}

                  <Slider
                    label="Min max-memory (GB)"
                    value={maxMemRange?.min ?? null}
                    min={maxMemStats?.min ?? null}
                    max={maxMemStats?.max ?? null}
                    step={16}
                    onChange={(v) => setMaxMemRange((prev) => (prev ? { ...prev, min: v } : { min: v, max: v }))}
                  />
                  <Slider
                    label="Max max-memory (GB)"
                    value={maxMemRange?.max ?? null}
                    min={maxMemStats?.min ?? null}
                    max={maxMemStats?.max ?? null}
                    step={16}
                    onChange={(v) => setMaxMemRange((prev) => (prev ? { ...prev, max: v } : { min: v, max: v }))}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

