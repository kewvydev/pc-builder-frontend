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
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const hasIntegratedGraphics = (item: ComponentItem) => {
  const graphics = item.attributes?.graphics?.toLowerCase() || '';
  if (!graphics) return false;
  return graphics !== 'none' && graphics !== 'no' && graphics !== 'n/a';
};

/**
 * Infiere el socket del CPU basándose en la microarquitectura o nombre.
 * El dataset no incluye socket, así que lo determinamos automáticamente.
 */
const inferCpuSocket = (item: ComponentItem): string | undefined => {
  const micro = item.attributes?.microarchitecture?.toLowerCase() || '';
  const name = item.name.toLowerCase();

  // AMD sockets
  if (micro.includes('zen 5') || micro.includes('zen 4')) {
    return 'AM5';
  }
  if (micro.includes('zen 3') || micro.includes('zen 2') || micro.includes('zen+') || micro.includes('zen')) {
    return 'AM4';
  }

  // Intel sockets (basado en microarquitectura)
  // Arrow Lake (Core Ultra 200 series) usa LGA1851
  if (micro.includes('arrow')) {
    return 'LGA1851';
  }
  // Raptor Lake y Alder Lake usan LGA1700
  if (micro.includes('raptor') || micro.includes('alder')) {
    return 'LGA1700';
  }
  if (micro.includes('rocket') || micro.includes('comet') || micro.includes('coffee') || micro.includes('kaby') || micro.includes('skylake')) {
    return 'LGA1200';
  }

  // Fallback: inferir desde el nombre del procesador
  // AMD Ryzen 9000/7000 series → AM5
  if (name.includes('ryzen') && (name.includes('9000') || name.includes('7000') || /9\d{3}x/i.test(name) || /7\d{3}x/i.test(name))) {
    return 'AM5';
  }
  // AMD Ryzen 5000/3000 series → AM4
  if (name.includes('ryzen') && (name.includes('5000') || name.includes('3000') || /5\d{3}x?/i.test(name) || /3\d{3}x?/i.test(name))) {
    return 'AM4';
  }
  // Intel Core Ultra (200 series) → LGA1851
  if (name.includes('core ultra')) {
    return 'LGA1851';
  }
  // Intel 14th/13th/12th gen → LGA1700
  if (name.includes('14th') || name.includes('13th') || name.includes('12th') || /i[3579]-1[234]\d{3}/i.test(name)) {
    return 'LGA1700';
  }
  // Intel 11th/10th gen → LGA1200
  if (name.includes('11th') || name.includes('10th') || /i[3579]-1[01]\d{3}/i.test(name)) {
    return 'LGA1200';
  }

  return undefined;
};

export default function CpuPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [data, setData] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [coreRange, setCoreRange] = useState<Range | null>(null);
  const [clockMin, setClockMin] = useState<number | null>(null);
  const [tdpMax, setTdpMax] = useState<number | null>(null);
  const [microarch, setMicroarch] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [igFilter, setIgFilter] = useState<'any' | 'yes' | 'no'>('any');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/api/components/cpu`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load CPUs (${res.status})`);
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

  // Derive ranges and option lists
  const { coreStats, clockStats, tdpStats, microOptions, seriesOptions, brands } =
    useMemo(() => {
      const cores: number[] = [];
      const clocks: number[] = [];
      const tdps: number[] = [];
      const microCount: Record<string, number> = {};
      const seriesCount: Record<string, number> = {};
      const brandSet = new Set<string>();

      data.forEach((item) => {
        const c = numAttr(item, 'core_count');
        if (c !== undefined) cores.push(c);
        const clock = numAttr(item, 'core_clock');
        if (clock !== undefined) clocks.push(clock);
        const tdp = numAttr(item, 'tdp');
        if (tdp !== undefined) tdps.push(tdp);

        const m = item.attributes?.microarchitecture;
        if (m) microCount[m] = (microCount[m] || 0) + 1;
        const s = item.attributes?.series;
        if (s) seriesCount[s] = (seriesCount[s] || 0) + 1;
        if (item.brand) brandSet.add(item.brand);
      });

      const microOptions = Object.entries(microCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name]) => name);

      const seriesOptions = Object.entries(seriesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name]) => name);

      const stats = (arr: number[]) =>
        arr.length
          ? {
              min: Math.floor(Math.min(...arr)),
              max: Math.ceil(Math.max(...arr)),
            }
          : null;

      return {
        coreStats: stats(cores),
        clockStats: stats(clocks),
        tdpStats: stats(tdps),
        microOptions,
        seriesOptions,
        brands: Array.from(brandSet).sort(),
      };
    }, [data]);

  // Initialize ranges once data is in
  useEffect(() => {
    if (coreStats && !coreRange) setCoreRange(coreStats);
    if (clockStats && clockMin === null) setClockMin(clockStats.min);
    if (tdpStats && tdpMax === null) setTdpMax(tdpStats.max);
  }, [coreStats, clockStats, tdpStats, coreRange, clockMin, tdpMax]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term);

      const matchesBrand = brand === 'all' || item.brand === brand;

      const cores = numAttr(item, 'core_count');
      const coreOk =
        coreRange && cores !== undefined ? cores >= coreRange.min && cores <= coreRange.max : true;

      const clock = numAttr(item, 'core_clock');
      const clockOk = clockMin !== null ? clock !== undefined && clock >= clockMin : true;

      const tdp = numAttr(item, 'tdp');
      const tdpOk = tdpMax !== null ? tdp !== undefined && tdp <= tdpMax : true;

      const micro = item.attributes?.microarchitecture;
      const microOk = microarch.length ? microarch.includes(micro || '') : true;

      const ser = item.attributes?.series;
      const seriesOk = series.length ? series.includes(ser || '') : true;

      const ig = hasIntegratedGraphics(item);
      const igOk =
        igFilter === 'any' ? true : igFilter === 'yes' ? ig : !ig;

      return (
        matchesSearch &&
        matchesBrand &&
        coreOk &&
        clockOk &&
        tdpOk &&
        microOk &&
        seriesOk &&
        igOk
      );
    });
  }, [data, search, brand, coreRange, clockMin, tdpMax, microarch, series, igFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, brand, coreRange, clockMin, tdpMax, microarch, series, igFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const Pagination = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-[#302F2C]/70">
        Page <span className="font-semibold text-[#302F2C]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[#302F2C]">{totalPages}</span> ·{' '}
        <span className="font-semibold text-[#302F2C]">{filtered.length}</span> CPUs
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

  const resetFilters = () => {
    setSearch('');
    setBrand('all');
    setCoreRange(coreStats || null);
    setClockMin(clockStats?.min ?? null);
    setTdpMax(tdpStats?.max ?? null);
    setMicroarch([]);
    setSeries([]);
    setIgFilter('any');
  };

  const badge = (label: string) => (
    <span className="inline-flex items-center rounded-full bg-[#302F2C]/10 px-2 py-1 text-xs font-semibold text-[#302F2C]">
      {label}
    </span>
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
          <span>{min}{suffix}</span>
          <span>{max}{suffix}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Navbar simple */}
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
                    <p className="text-sm font-semibold text-[#302F2C]/70">Browse · CPU</p>
                    <h1 className="text-3xl font-black text-[#302F2C]">Pick a CPU</h1>
                    <p className="text-[#302F2C]/75">
                      Use filters to narrow by cores, clocks, microarchitecture, and integrated graphics.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="hidden lg:block">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for CPU..."
                        className="w-64 rounded-xl border border-[#302F2C]/30 bg-white px-4 py-3 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#302F2C]/70">
                  {badge(`${filtered.length} compatible`)}
                  {coreStats && badge(`${coreStats.min}-${coreStats.max} cores`)}
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

              {!loading && !error && filtered.length === 0 && (
                <div className="rounded-xl border border-[#302F2C]/30 bg-white px-4 py-6 text-center text-[#302F2C]/80">
                  We could not find CPUs with the current filters. Try adjusting search or ranges.
                </div>
              )}

              {!loading && !error && paginated.length > 0 && (
                <div className="space-y-4">
                  {paginated.map((item) => {
                    const cores = numAttr(item, 'core_count');
                    const base = item.attributes?.core_clock;
                    const boost = item.attributes?.boost_clock;
                    const micro = item.attributes?.microarchitecture;
                    const tdp = item.attributes?.tdp;
                    const graphics = item.attributes?.graphics;
                    const socket = inferCpuSocket(item);
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
                                  {item.brand?.slice(0, 3) || 'CPU'}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-[#302F2C] leading-tight mb-5">
                                {item.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 text-xs text-[#302F2C]/80">
                                {socket && badge(`Socket ${socket}`)}
                                {cores !== undefined && badge(`${cores} cores`)}
                                {base && badge(`Base ${base} GHz`)}
                                {boost && badge(`Boost ${boost} GHz`)}
                                {micro && badge(micro)}
                                {tdp && badge(`${tdp} W TDP`)}
                                {graphics && badge(graphics)}
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
                                defaultSlot="cpu"
                                item={{
                                  id: item.id,
                                  name: item.name,
                                  brand: item.brand,
                                  price: item.price,
                                  imageUrl: item.imageUrl,
                                  productUrl: item.productUrl,
                                  // Guardar atributos clave para compatibilidad
                                  // El socket se infiere de la microarquitectura ya que el dataset no lo incluye
                                  attributes: {
                                    ...(inferCpuSocket(item) && { socket: inferCpuSocket(item)! }),
                                  },
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

            {/* Filters sidebar (right) */}
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
                    label="Min core clock (GHz)"
                    value={clockMin}
                    min={clockStats?.min ?? null}
                    max={clockStats?.max ?? null}
                    step={0.1}
                    suffix=" GHz"
                    onChange={(v) => setClockMin(v)}
                  />

                  <Slider
                    label="Cores"
                    value={coreRange?.min ?? null}
                    min={coreStats?.min ?? null}
                    max={coreStats?.max ?? null}
                    onChange={(v) => setCoreRange((prev) => (prev ? { ...prev, min: v } : null))}
                  />
                  {coreRange && (
                    <input
                      type="range"
                      min={coreStats?.min ?? coreRange.min}
                      max={coreStats?.max ?? coreRange.max}
                      value={coreRange.max}
                      onChange={(e) =>
                        setCoreRange((prev) => (prev ? { ...prev, max: Number(e.target.value) } : null))
                      }
                      className="w-full accent-[#302F2C]"
                    />
                  )}

                  <Slider
                    label="Max TDP (W)"
                    value={tdpMax}
                    min={tdpStats?.min ?? null}
                    max={tdpStats?.max ?? null}
                    onChange={(v) => setTdpMax(v)}
                    suffix=" W"
                  />

                  {!!microOptions.length && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#302F2C]">Microarchitecture</p>
                      <div className="flex flex-wrap gap-2">
                        {microOptions.map((opt) => {
                          const active = microarch.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() =>
                                setMicroarch((prev) =>
                                  active ? prev.filter((m) => m !== opt) : [...prev, opt]
                                )
                              }
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
                      </div>
                    </div>
                  )}

                  {!!seriesOptions.length && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#302F2C]">Series</p>
                      <div className="flex flex-wrap gap-2">
                        {seriesOptions.map((opt) => {
                          const active = series.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() =>
                                setSeries((prev) =>
                                  active ? prev.filter((m) => m !== opt) : [...prev, opt]
                                )
                              }
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
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#302F2C]">Integrated graphics</p>
                    <div className="flex gap-2">
                      {(['any', 'yes', 'no'] as const).map((val) => (
                        <button
                          key={val}
                          onClick={() => setIgFilter(val)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                            igFilter === val
                              ? 'border-[#302F2C] bg-[#302F2C] text-[#FFDD26]'
                              : 'border-[#302F2C]/30 bg-white text-[#302F2C]'
                          }`}
                        >
                          {val === 'any' ? 'Any' : val === 'yes' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

