'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BuildItem,
  BuildSlot,
  SavedBuild,
  saveCurrentBuild,
  useBuildState,
  useSavedBuilds,
} from '@/lib/buildStore';

type Row = {
  slot: BuildSlot;
  label: string;
  href: string;
  icon: string;
  helper: string;
  optional?: boolean;
};

const rows: Row[] = [
  { slot: 'cpu', label: 'CPU', href: '/components/cpu', icon: '/icons/cpu.png', helper: 'Choose CPU' },
  {
    slot: 'motherboard',
    label: 'Motherboard',
    href: '/components/motherboard',
    icon: '/icons/motherboard.png',
    helper: 'Choose Motherboard',
  },
  { slot: 'cooling', label: 'CPU Cooler', href: '/components/cooling', icon: '/icons/fan.png', helper: 'Choose CPU Cooler' },
  { slot: 'ram', label: 'RAM', href: '/components/ram', icon: '/icons/ram.png', helper: 'Choose RAM' },
  { slot: 'gpu', label: 'GPU', href: '/components/gpu', icon: '/icons/graphic-card.png', helper: 'Choose GPU' },
  { slot: 'case', label: 'Case', href: '/components/case', icon: '/icons/case.png', helper: 'Choose Case' },
  { slot: 'psu', label: 'Power Supply', href: '/components/psu', icon: '/icons/power-supply.png', helper: 'Choose Power Supply' },
  {
    slot: 'os',
    label: 'Operating System',
    href: '/components/os',
    icon: '/icons/operative_system.png',
    helper: 'Choose Operating System',
    optional: true,
  },
  {
    slot: 'monitor',
    label: 'Monitor',
    href: '/components/monitor',
    icon: '/icons/monitor.png',
    helper: 'Choose Monitor',
    optional: true,
  },
  {
    slot: 'peripherals',
    label: 'Peripherals',
    href: '/components/peripherals',
    icon: '/icons/keyboard.png',
    helper: 'Headphones, keyboard, mouse, speakers, webcam',
    optional: true,
  },
];

const buildLink = (row: Row) => `${row.href}?slot=${row.slot}&returnTo=${encodeURIComponent('/build')}`;

const requiredForBoot: BuildSlot[] = ['cpu', 'motherboard', 'ram', 'psu', 'case'];

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  white: '#F2F2F2',
};

export default function BuildPage() {
  const { build, remove, clear } = useBuildState();
  const { saved, refresh: refreshSaved } = useSavedBuilds();
  const [skipped, setSkipped] = useState<Partial<Record<BuildSlot, boolean>>>({});
  const [saveForm, setSaveForm] = useState({ name: '', description: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<SavedBuild | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const filled = useMemo(() => rows.filter((row) => !!build[row.slot]).length, [build]);

  const compatibility = useMemo(() => {
    const missing = requiredForBoot.filter((slot) => !build[slot]);
    return {
      ok: missing.length === 0,
      missing,
    };
  }, [build]);

  const handleSkip = (slot: BuildSlot) => {
    setSkipped((prev) => ({ ...prev, [slot]: true }));
  };

  const handleUnskip = (slot: BuildSlot) => {
    setSkipped((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const handleSaveBuild = () => {
    setSaveStatus({ type: null, message: '' });
    setSaving(true);

    try {
      const savedBuild = saveCurrentBuild(saveForm);
      setLastSaved(savedBuild);
      clear();
      setSkipped({});
      setSaveForm({ name: '', description: '', imageUrl: '' });
      setSaveStatus({ type: 'success', message: 'Build saved to "My builds".' });
      refreshSaved();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save the build.';
      setSaveStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const canSave = filled > 0 && saveForm.name.trim().length > 0 && !saving;

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Hero */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: 'url("/images/components_header.webp")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundColor: palette.gold,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26]/80 via-[#FFDD26]/55 to-[#FFDD26]/25" />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent mix-blend-multiply" />

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
            href="/components"
            className="px-5 py-3 rounded-xl font-semibold bg-[#302F2C] text-[#FFDD26] hover:opacity-90 transition shadow-md shadow-black/15"
          >
            Browse components
          </Link>
        </header>

        <div className="relative z-10 container mx-auto px-6 pb-16 pt-8">
          <div className="max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#302F2C]/10">
            <p className="text-sm font-semibold text-[#302F2C]/80">Live build</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-tight text-[#302F2C]">
              Build your PC with confidence
            </h1>
            <p className="mt-3 text-lg text-[#302F2C]/80">
              Pick every component, check the fit, then return with “Add to build”. Your progress
              stays in this browser so you can come back anytime.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFDD26] px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm border border-[#302F2C]/10">
              <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
              {filled}/{rows.length} components ready
            </div>
          </div>
        </div>
      </div>

      {/* Build table */}
      <main className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26] via-[#FFBE1D]/50 to-[#F2F2F2]/80" />
        <div className="relative container mx-auto px-6 pb-20 -mt-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
            <div className="rounded-3xl bg-white/90 backdrop-blur border border-[#302F2C]/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="grid grid-cols-[1.2fr,2fr] items-center px-6 py-5 bg-[#302F2C]/5 text-xs font-semibold text-[#302F2C]/80 uppercase tracking-wide">
                <span>Component</span>
                <span>Product</span>
              </div>
              <div className="divide-y divide-[#302F2C]/10">
                {rows.map((row) => (
                  <BuildRow
                    key={row.slot}
                    row={row}
                    item={build[row.slot]}
                    skipped={!!skipped[row.slot]}
                    onSkip={handleSkip}
                    onUnskip={handleUnskip}
                    onRemove={remove}
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-6 bg-white/85">
                <Link
                  href="/components"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#302F2C] px-4 py-3 font-semibold text-[#302F2C] hover:bg-[#302F2C]/5 transition"
                >
                  Add more parts
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#302F2C]/40 px-4 py-3 font-semibold text-[#302F2C]/80 hover:bg-[#302F2C]/5 transition"
                >
                  Start over
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl bg-white/90 backdrop-blur border border-[#302F2C]/10 p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] space-y-3">
                <p className="text-xs font-semibold text-[#302F2C]/70">Quick checks</p>
                <div className="rounded-xl border border-[#302F2C]/10 bg-[#FFDD26]/35 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#302F2C]">Compatibility</span>
                  <span
                    className={`text-xs font-semibold ${
                      compatibility.ok ? 'text-[#0f5132]' : 'text-[#7f1d1d]'
                    }`}
                  >
                    {compatibility.ok ? 'No issues detected' : 'Needs attention'}
                  </span>
                </div>
                {!compatibility.ok && (
                  <div className="rounded-xl border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 py-3 text-sm text-[#302F2C] space-y-1">
                    <p className="font-semibold text-[#7f1d1d]">Missing for a bootable build:</p>
                    <ul className="list-disc list-inside text-[#302F2C]/80">
                      {compatibility.missing.map((slot) => (
                        <li key={slot} className="capitalize">{slot}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-xl border border-[#302F2C]/10 bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-[#302F2C]">Components</span>
                  <span className="text-xs font-semibold text-[#302F2C]/80">
                    {filled} / {rows.length}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[#302F2C]/10 overflow-hidden">
                  <div
                    className="h-full bg-[#302F2C]"
                    style={{ width: `${Math.min((filled / rows.length) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white/95 backdrop-blur border border-[#302F2C]/10 p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#302F2C]/70">Save your build</p>
                    <p className="text-lg font-semibold text-[#302F2C]">Add a name and image</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FFDD26] px-3 py-1 text-[11px] font-semibold text-[#302F2C] border border-[#302F2C]/10">
                    <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
                    {saved.length} saved
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#302F2C]/70">Name</label>
                  <input
                    value={saveForm.name}
                    onChange={(e) => setSaveForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Gaming build, workstation, etc."
                    className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-3 py-2 text-sm text-[#302F2C] placeholder:text-[#302F2C]/50 focus:border-[#302F2C]/40 outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#302F2C]/70">Image (link)</label>
                  <input
                    value={saveForm.imageUrl}
                    onChange={(e) => setSaveForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-3 py-2 text-sm text-[#302F2C] placeholder:text-[#302F2C]/50 focus:border-[#302F2C]/40 outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#302F2C]/70">Description</label>
                  <textarea
                    value={saveForm.description}
                    onChange={(e) => setSaveForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Build goal, budget, or quick notes."
                    className="w-full rounded-xl border border-[#302F2C]/15 bg-white px-3 py-2 text-sm text-[#302F2C] placeholder:text-[#302F2C]/50 focus:border-[#302F2C]/40 outline-none transition resize-none"
                  />
                </div>

                {saveStatus.type && (
                  <div
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      saveStatus.type === 'success'
                        ? 'bg-[#0f5132]/10 text-[#0f5132]'
                        : 'bg-[#7f1d1d]/10 text-[#7f1d1d]'
                    }`}
                  >
                    {saveStatus.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveBuild}
                  disabled={!canSave}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    canSave
                      ? 'bg-[#302F2C] text-[#FFDD26] hover:opacity-90'
                      : 'bg-[#302F2C]/10 text-[#302F2C]/50 cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save build'}
                </button>

                <Link
                  href="/mybuilds"
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#302F2C] px-4 py-3 text-sm font-semibold text-[#302F2C] hover:bg-[#302F2C]/5 transition"
                >
                  View my builds
                </Link>

                {lastSaved && (
                  <div className="rounded-xl border border-[#302F2C]/10 bg-[#302F2C]/5 px-4 py-3">
                    <p className="text-xs font-semibold text-[#302F2C]/70">Last saved</p>
                    <p className="text-sm font-semibold text-[#302F2C]">{lastSaved.name}</p>
                    <p className="text-xs text-[#302F2C]/70">
                      {new Date(lastSaved.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#302F2C] text-[#FFDD26] p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.45)]">
                <p className="text-sm font-semibold text-white/90">Quick cart</p>
                <p className="mt-1 text-2xl font-black">
                  Keep adding parts
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Add pieces from each category and come back here with “Add to build”.
                </p>
                <Link
                  href="/components"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#FFDD26] px-4 py-3 text-sm font-semibold text-[#302F2C] hover:opacity-90 transition"
                >
                  Buy everything together
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

type BuildRowProps = {
  row: Row;
  item?: BuildItem;
  skipped?: boolean;
  onRemove: (slot: BuildSlot) => void;
  onSkip: (slot: BuildSlot) => void;
  onUnskip: (slot: BuildSlot) => void;
};

function BuildRow({ row, item, skipped, onRemove, onSkip, onUnskip }: BuildRowProps) {
  return (
    <div className="grid grid-cols-[1.2fr,2fr] items-center gap-4 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 rounded-xl bg-[#FFBE1D]/25 border border-[#302F2C]/10 flex items-center justify-center overflow-hidden">
          <Image src={row.icon} alt={row.label} fill className="object-contain p-2.5" sizes="56px" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-[#302F2C]">{row.label}</p>
            {row.optional && (
              <span className="text-[11px] font-semibold text-[#302F2C]/60 bg-[#302F2C]/5 px-2 py-0.5 rounded-full">
                Optional · you can skip
              </span>
            )}
          </div>
          <p className="text-sm text-[#302F2C]/70">{row.helper}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {item ? (
          <>
            <div className="flex items-center gap-3">
              {item.imageUrl && (
                <div className="relative h-12 w-12 rounded-lg bg-[#FFDD26]/40 border border-[#302F2C]/10 overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1.5" sizes="48px" />
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-[#302F2C] leading-tight">{item.name}</p>
                <p className="text-xs text-[#302F2C]/70">{item.brand || 'Added from catalog'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={buildLink(row)}
                className="text-xs font-semibold rounded-full border border-[#302F2C]/30 px-3 py-1 text-[#302F2C] hover:border-[#302F2C] transition"
              >
                Change
              </Link>
              <button
                type="button"
                onClick={() => onRemove(row.slot)}
                className="text-xs font-semibold rounded-full border border-[#302F2C]/10 px-3 py-1 text-[#302F2C]/80 hover:border-[#302F2C]/40 hover:text-[#302F2C] transition"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            {!skipped && (
              <>
                <Link
                  href={buildLink(row)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#302F2C] bg-[#FFDD26]/50 border border-[#302F2C]/15 hover:border-[#302F2C]/40 transition"
                >
                  + {row.helper}
                </Link>
                {row.optional && (
                  <button
                    type="button"
                    onClick={() => onSkip(row.slot)}
                    className="text-xs font-semibold text-[#302F2C]/60 hover:text-[#302F2C]"
                  >
                    Skip
                  </button>
                )}
              </>
            )}
            {skipped && row.optional && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#302F2C]/70">
                <span className="inline-flex items-center rounded-full bg-[#302F2C]/10 px-2 py-1 text-[#302F2C]">
                  Skipped
                </span>
                <button
                  type="button"
                  onClick={() => onUnskip(row.slot)}
                  className="text-[#302F2C] hover:underline"
                >
                  Undo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

