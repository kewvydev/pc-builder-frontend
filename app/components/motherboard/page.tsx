/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AddToBuildButton from '@/components/AddToBuildButton';
import { loadBuild, getBuildItemAttribute } from '@/lib/buildStore';

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

/** Heurística: inferir tipo de memoria soportada por la motherboard */
const inferMemoryType = (item: ComponentItem): 'DDR5' | 'DDR4' | 'DDR3' | undefined => {
  const name = item.name.toLowerCase();
  const socket = item.attributes?.socket?.toLowerCase() || '';

  if (name.includes('ddr5')) return 'DDR5';
  if (name.includes('ddr4')) return 'DDR4';
  if (name.includes('ddr3')) return 'DDR3';

  // Pistas por socket
  if (socket.includes('am5')) return 'DDR5';
  if (socket.includes('am4')) return 'DDR4';
  if (socket.includes('lga1851')) return 'DDR5';
  // LGA1700 puede ser DDR4 o DDR5: intentar decidir por nombre
  if (socket.includes('lga1700')) {
    if (name.includes('ddr4')) return 'DDR4';
    if (name.includes('ddr5')) return 'DDR5';
  }
  if (socket.includes('lga1200')) return 'DDR4';

  return undefined;
};

export default function MotherboardPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  const [data, setData] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [memoryRange, setMemoryRange] = useState<Range | null>(null);
  const [slotRange, setSlotRange] = useState<Range | null>(null);
  const [socket, setSocket] = useState('all');
  const [formFactors, setFormFactors] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // CPU compatibility: get selected CPU socket from build
  const [cpuSocket, setCpuSocket] = useState<string | null>(null);
  const [cpuName, setCpuName] = useState<string | null>(null);
  // RAM compatibility: get selected RAM memory type from build
  const [ramMemoryType, setRamMemoryType] = useState<string | null>(null);
  const [ramName, setRamName] = useState<string | null>(null);

  useEffect(() => {
    const build = loadBuild();
    const cpu = build.cpu;
    if (cpu) {
      const socketAttr = getBuildItemAttribute(cpu, 'socket');
      setCpuSocket(socketAttr || null);
      setCpuName(cpu.name);
      // Auto-set socket filter if CPU has socket defined
      if (socketAttr) {
        setSocket(socketAttr);
      }
    }
    const ram = build.ram;
    if (ram) {
      const ramType = getBuildItemAttribute(ram, 'memory_type');
      setRamMemoryType(ramType || null);
      setRamName(ram.name);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiBase}/api/components/motherboard`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load motherboards (${res.status})`);
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
  const { memoryStats, slotStats, socketOptions, formFactorOptions, colorOptions, brands } =
    useMemo(() => {
      const memories: number[] = [];
      const slots: number[] = [];
      const socketCount: Record<string, number> = {};
      const formCount: Record<string, number> = {};
      const colorCount: Record<string, number> = {};
      const brandSet = new Set<string>();

      data.forEach((item) => {
        const mem = numAttr(item, 'max_memory');
        if (mem !== undefined) memories.push(mem);
        const sl = numAttr(item, 'memory_slots');
        if (sl !== undefined) slots.push(sl);

        const sock = item.attributes?.socket;
        if (sock) socketCount[sock] = (socketCount[sock] || 0) + 1;

        const form = item.attributes?.form_factor;
        if (form) formCount[form] = (formCount[form] || 0) + 1;

        const color = item.attributes?.color;
        if (color) colorCount[color] = (colorCount[color] || 0) + 1;

        if (item.brand) brandSet.add(item.brand);
      });

      const stats = (arr: number[]) =>
        arr.length
          ? {
              min: Math.floor(Math.min(...arr)),
              max: Math.ceil(Math.max(...arr)),
            }
          : null;

      const topOptions = (obj: Record<string, number>, take = 10) =>
        Object.entries(obj)
          .sort((a, b) => b[1] - a[1])
          .slice(0, take)
          .map(([name]) => name);

      return {
        memoryStats: stats(memories),
        slotStats: stats(slots),
        socketOptions: topOptions(socketCount, 12),
        formFactorOptions: topOptions(formCount, 10),
        colorOptions: topOptions(colorCount, 10),
        brands: Array.from(brandSet).sort(),
      };
    }, [data]);

  // Initialize ranges once data is in
  useEffect(() => {
    if (memoryStats && !memoryRange) setMemoryRange(memoryStats);
    if (slotStats && !slotRange) setSlotRange(slotStats);
  }, [memoryStats, slotStats, memoryRange, slotRange]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term);

      const matchesBrand = brand === 'all' || item.brand === brand;

      const mem = numAttr(item, 'max_memory');
      const memOk = memoryRange && mem !== undefined ? mem >= memoryRange.min && mem <= memoryRange.max : true;

      const sl = numAttr(item, 'memory_slots');
      const slotsOk = slotRange && sl !== undefined ? sl >= slotRange.min && sl <= slotRange.max : true;

      const sock = item.attributes?.socket;
      const socketOk = socket === 'all' || sock === socket;

      const form = item.attributes?.form_factor;
      const formOk = formFactors.length ? formFactors.includes(form || '') : true;

      const color = item.attributes?.color;
      const colorOk = colors.length ? colors.includes(color || '') : true;

      const mbMemType = inferMemoryType(item);
      const ramOk = ramMemoryType ? mbMemType === ramMemoryType : true;

      return (
        matchesSearch &&
        matchesBrand &&
        memOk &&
        slotsOk &&
        socketOk &&
        formOk &&
        colorOk &&
        ramOk
      );
    });
  }, [data, search, brand, memoryRange, slotRange, socket, formFactors, colors, ramMemoryType]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, brand, memoryRange, slotRange, socket, formFactors, colors]);

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
        <span className="font-semibold text-[#302F2C]">{filtered.length}</span> motherboards
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
    setMemoryRange(memoryStats || null);
    setSlotRange(slotStats || null);
    // Re-check CPU compatibility on reset
    const build = loadBuild();
    const cpu = build.cpu;
    if (cpu) {
      const socketAttr = getBuildItemAttribute(cpu, 'socket');
      setCpuSocket(socketAttr || null);
      setCpuName(cpu.name);
      setSocket(socketAttr || 'all');
    } else {
      setCpuSocket(null);
      setCpuName(null);
      setSocket('all');
    }
    setFormFactors([]);
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
                    <p className="text-sm font-semibold text-[#302F2C]/70">Browse · Motherboard</p>
                    <h1 className="text-3xl font-black text-[#302F2C]">Pick a Motherboard</h1>
                    <p className="text-[#302F2C]/75">
                      Use filters to narrow by socket, form factor, memory support, and more.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="hidden lg:block">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for motherboard..."
                        className="w-64 rounded-xl border border-[#302F2C]/30 bg-white px-4 py-3 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#302F2C]/70">
                  {badge(`${filtered.length} compatible`)}
                  {memoryStats && badge(`${memoryStats.min}-${memoryStats.max} GB max memory`)}
                  {slotStats && badge(`${slotStats.min}-${slotStats.max} DIMM slots`)}
                </div>

                {/* CPU Compatibility Banner */}
                {cpuSocket && cpuName && (
                  <div className="mt-4 rounded-xl border-2 border-[#302F2C] bg-[#302F2C]/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#302F2C] text-[#FFDD26]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#302F2C]">
                          Filtering for your CPU compatibility
                        </p>
                        <p className="text-xs text-[#302F2C]/70">
                          {cpuName} · Socket <span className="font-semibold">{cpuSocket}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCpuSocket(null);
                          setCpuName(null);
                          setSocket('all');
                        }}
                        className="ml-auto rounded-lg border border-[#302F2C]/30 px-3 py-1 text-xs font-semibold text-[#302F2C] hover:bg-[#302F2C]/10 transition"
                      >
                        See all
                      </button>
                    </div>
                  </div>
                )}

                {/* RAM Compatibility Banner */}
                {ramMemoryType && ramName && (
                  <div className="mt-4 rounded-xl border-2 border-[#302F2C] bg-[#302F2C]/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#302F2C] text-[#FFDD26]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#302F2C]">Filtering for your RAM compatibility</p>
                        <p className="text-xs text-[#302F2C]/70">
                          {ramName} · Memory type <span className="font-semibold">{ramMemoryType}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRamMemoryType(null);
                          setRamName(null);
                        }}
                        className="ml-auto rounded-lg border border-[#302F2C]/30 px-3 py-1 text-xs font-semibold text-[#302F2C] hover:bg-[#302F2C]/10 transition"
                      >
                        See all
                      </button>
                    </div>
                  </div>
                )}
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
                  We could not find motherboards with the current filters. Try adjusting search or ranges.
                </div>
              )}

              {!loading && !error && paginated.length > 0 && (
                <div className="space-y-4">
                  {paginated.map((item) => {
                    const mem = numAttr(item, 'max_memory');
                    const sl = numAttr(item, 'memory_slots');
                    const sock = item.attributes?.socket;
                    const form = item.attributes?.form_factor;
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
                                  {item.brand?.slice(0, 3) || 'MB'}
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
                                {sock && badge(sock)}
                                {form && badge(form)}
                                {mem !== undefined && badge(`${mem} GB max`)}
                                {sl !== undefined && badge(`${sl} DIMM slots`)}
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
                                defaultSlot="motherboard"
                                item={{
                                  id: item.id,
                                  name: item.name,
                                  brand: item.brand,
                                  price: item.price,
                                  imageUrl: item.imageUrl,
                                  productUrl: item.productUrl,
                                  // Guardar atributos clave para compatibilidad
                                  attributes: {
                                    ...(sock && { socket: sock }),
                                    ...(form && { form_factor: form }),
                                    ...(inferMemoryType(item) && { memory_type: inferMemoryType(item)! }),
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

                  {socketOptions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#302F2C] flex items-center gap-2">
                        Socket
                        {cpuSocket && (
                          <span className="text-xs font-normal text-[#302F2C]/60">(por CPU)</span>
                        )}
                      </label>
                      <select
                        value={socket}
                        onChange={(e) => {
                          setSocket(e.target.value);
                          // Si cambia el socket manualmente, desactivar el filtro de compatibilidad
                          if (e.target.value !== cpuSocket) {
                            setCpuSocket(null);
                            setCpuName(null);
                          }
                        }}
                        className={`w-full rounded-xl border px-3 py-2 text-sm text-[#302F2C] focus:outline-none focus:ring-2 focus:ring-[#302F2C] ${
                          cpuSocket 
                            ? 'border-[#302F2C] bg-[#FFDD26]/30' 
                            : 'border-[#302F2C]/30 bg-white'
                        }`}
                      >
                        <option value="all">All</option>
                        {socketOptions.map((s) => (
                          <option key={s} value={s}>
                            {s} {s === cpuSocket ? '(compatible con CPU)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!!formFactorOptions.length && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#302F2C]">Form factor</p>
                      <div className="flex flex-wrap gap-2">
                        {formFactorOptions.map((opt) => {
                          const active = formFactors.includes(opt);
                          return (
                            <TogglePill
                              key={opt}
                              label={opt}
                              active={active}
                              onClick={() =>
                                setFormFactors((prev) =>
                                  active ? prev.filter((m) => m !== opt) : [...prev, opt]
                                )
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Slider
                    label="Max memory (GB)"
                    value={memoryRange?.max ?? null}
                    min={memoryStats?.min ?? null}
                    max={memoryStats?.max ?? null}
                    step={8}
                    suffix=" GB"
                    onChange={(v) =>
                      setMemoryRange((prev) => (prev ? { ...prev, max: v } : { min: v, max: v }))
                    }
                  />
                  <Slider
                    label="Min memory (GB)"
                    value={memoryRange?.min ?? null}
                    min={memoryStats?.min ?? null}
                    max={memoryStats?.max ?? null}
                    step={8}
                    suffix=" GB"
                    onChange={(v) =>
                      setMemoryRange((prev) => (prev ? { ...prev, min: v } : { min: v, max: v }))
                    }
                  />

                  <Slider
                    label="Memory slots"
                    value={slotRange?.max ?? null}
                    min={slotStats?.min ?? null}
                    max={slotStats?.max ?? null}
                    step={1}
                    onChange={(v) =>
                      setSlotRange((prev) => (prev ? { ...prev, max: v } : { min: v, max: v }))
                    }
                  />
                  <Slider
                    label="Min slots"
                    value={slotRange?.min ?? null}
                    min={slotStats?.min ?? null}
                    max={slotStats?.max ?? null}
                    step={1}
                    onChange={(v) =>
                      setSlotRange((prev) => (prev ? { ...prev, min: v } : { min: v, max: v }))
                    }
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

