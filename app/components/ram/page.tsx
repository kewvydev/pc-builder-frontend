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
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  attributes?: Record<string, string>;
};

type Range = { min: number; max: number };

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  white: '#F2F2F2',
};

const numAttr = (item: ComponentItem, key: string) => {
  const raw = item.attributes?.[key];
  if (!raw) return undefined;
  const cleaned = raw.replace(/,/g, '').match(/[\d.]+/g);
  const parsed = cleaned ? parseFloat(cleaned[0]) : parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseModulesCount = (item: ComponentItem) => {
  const raw = item.attributes?.modules;
  if (!raw) return undefined;
  const first = raw.split(/[,x]/)[0];
  const parsed = parseInt(first, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function RamPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [data, setData] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [speedMin, setSpeedMin] = useState<number | null>(null);
  const [modulesMin, setModulesMin] = useState<number | null>(null);
  const [casMax, setCasMax] = useState<number | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/api/components/ram`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load RAM (${res.status})`);
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

  // Derived stats/options
  const { speedStats, modulesStats, casStats, colorOptions, brands } = useMemo(() => {
    const speeds: number[] = [];
    const modulesCounts: number[] = [];
    const casLat: number[] = [];
    const colorCount: Record<string, number> = {};
    const brandSet = new Set<string>();

    data.forEach((item) => {
      const speed = numAttr(item, 'speed');
      if (speed !== undefined) speeds.push(speed);
      const mods = parseModulesCount(item);
      if (mods !== undefined) modulesCounts.push(mods);
      const cas = numAttr(item, 'cas_latency');
      if (cas !== undefined) casLat.push(cas);
      const color = item.attributes?.color;
      if (color) colorCount[color] = (colorCount[color] || 0) + 1;
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
      speedStats: stats(speeds),
      modulesStats: stats(modulesCounts),
      casStats: stats(casLat),
      colorOptions: topOptions(colorCount, 10),
      brands: Array.from(brandSet).sort(),
    };
  }, [data]);

  useEffect(() => {
    if (speedStats && speedMin === null) setSpeedMin(speedStats.min);
    if (modulesStats && modulesMin === null) setModulesMin(modulesStats.min);
    if (casStats && casMax === null) setCasMax(casStats.max);
  }, [speedStats, modulesStats, casStats, speedMin, modulesMin, casMax]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term);

      const matchesBrand = brand === 'all' || item.brand === brand;

      const speed = numAttr(item, 'speed');
      const speedOk = speedMin !== null ? speed !== undefined && speed >= speedMin : true;

      const mods = parseModulesCount(item);
      const modulesOk = modulesMin !== null ? mods !== undefined && mods >= modulesMin : true;

      const cas = numAttr(item, 'cas_latency');
      const casOk = casMax !== null ? cas !== undefined && cas <= casMax : true;

      const color = item.attributes?.color;
      const colorOk = colors.length ? colors.includes(color || '') : true;

      return matchesSearch && matchesBrand && speedOk && modulesOk && casOk && colorOk;
    });
  }, [data, search, brand, speedMin, modulesMin, casMax, colors]);

  useEffect(() => {
    setPage(1);
  }, [search, brand, speedMin, modulesMin, casMax, colors]);

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
        <span className="font-semibold text-[#302F2C]">{filtered.length}</span> RAM kits
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
          {totalPages > 5 && (
            <span className="px-2 py-2 text-sm text-[#302F2C]/60">… {totalPages}</span>
          )}
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
    suffix,
  }: {
    label: string;
    value: number | null;
    min?: number | null;
    max?: number | null;
    step?: number;
    onChange: (v: number) => void;
    suffix?: string;
  }) => {
    if (min === null || max === null || min === undefined || max === undefined) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-[#302F2C]">
          <span>{label}</span>
          <span className="text-[#302F2C]/70">
            {value !== null ? `${value}${suffix || ''}` : '--'}
          </span>
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
        <div className="flex justify-between text-xs text-[#302F2C]/60">
          <span>
            {min}
            {suffix}
          </span>
          <span>
            {max}
            {suffix}
          </span>
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
        active
          ? 'border-[#302F2C] bg-[#302F2C] text-[#FFDD26]'
          : 'border-[#302F2C]/30 bg-white text-[#302F2C]'
      }`}
    >
      {label}
    </button>
  );

  const resetFilters = () => {
    setSearch('');
    setBrand('all');
    setSpeedMin(speedStats?.min ?? null);
    setModulesMin(modulesStats?.min ?? null);
    setCasMax(casStats?.max ?? null);
    setColors([]);
  };

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-[#302F2C]/10 bg-[#FFDD26]/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logos/logo_bg.png"
                alt="PCBuilder+ logo"
                fill
                className="object-contain rounded-md"
                sizes="40px"
                priority
              />
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
                    <p className="text-sm font-semibold text-[#302F2C]/70">Browse · RAM</p>
                    <h1 className="text-3xl font-black text-[#302F2C]">Pick RAM</h1>
                    <p className="text-[#302F2C]/75">
                      Use filters to narrow by speed, modules, latency, and color.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="hidden lg:block">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for RAM..."
                        className="w-64 rounded-xl border border-[#302F2C]/30 bg-white px-4 py-3 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#302F2C]/70">
                  {badge(`${filtered.length} compatible`)}
                  {speedStats && badge(`${speedStats.min}-${speedStats.max} MHz speed`)}
                  {modulesStats && badge(`${modulesStats.min}+ modules`)}
                </div>
              </div>

              {loading && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#302F2C]/10 bg-white/70 h-52 animate-pulse"
                    />
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
                  We could not find RAM with the current filters. Try adjusting search or ranges.
                </div>
              )}

              {!loading && !error && paginated.length > 0 && (
                <div className="space-y-4">
                  {paginated.map((item) => {
                    const speed = item.attributes?.speed;
                    const mods = item.attributes?.modules;
                    const cas = item.attributes?.cas_latency;
                    const fwl = item.attributes?.first_word_latency;
                    const color = item.attributes?.color;
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#302F2C]/10 bg-white p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative h-20 w-20 rounded-xl bg-[#FFBE1D]/30 border border-[#302F2C]/10 flex items-center justify-center overflow-hidden">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-2"
                                  sizes="80px"
                                />
                              ) : (
                                <span className="text-lg font-bold text-[#302F2C]">
                                  {item.brand?.slice(0, 3) || 'RAM'}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-[#302F2C] leading-tight">
                                {item.name}
                              </h3>
                              <p className="text-sm text-[#302F2C]/70">
                                {item.brand || 'Unknown brand'}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs text-[#302F2C]/80">
                                {speed && badge(`${speed} MHz`)}
                                {mods && badge(`${mods} kit`)}
                                {cas && badge(`CL ${cas}`)}
                                {fwl && badge(`FWL ${fwl}`)}
                                {color && badge(color)}
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
                                defaultSlot="ram"
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
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-[#302F2C] hover:underline"
                  >
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

                  <Slider
                    label="Min speed (MHz)"
                    value={speedMin}
                    min={speedStats?.min ?? null}
                    max={speedStats?.max ?? null}
                    step={100}
                    onChange={(v) => setSpeedMin(v)}
                  />

                  <Slider
                    label="Min modules"
                    value={modulesMin}
                    min={modulesStats?.min ?? null}
                    max={modulesStats?.max ?? null}
                    step={1}
                    onChange={(v) => setModulesMin(v)}
                  />

                  <Slider
                    label="Max CAS latency"
                    value={casMax}
                    min={casStats?.min ?? null}
                    max={casStats?.max ?? null}
                    step={1}
                    onChange={(v) => setCasMax(v)}
                  />

                  {!!colorOptions.length && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#302F2C]">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((opt) => {
                          const active = colors.includes(opt);
                          return (
                            <TogglePill
                              key={opt}
                              label={opt}
                              active={active}
                              onClick={() =>
                                setColors((prev) =>
                                  active ? prev.filter((m) => m !== opt) : [...prev, opt]
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

