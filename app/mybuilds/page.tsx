'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuildSlot, SavedBuild, useBuildState, useSavedBuilds } from '@/lib/buildStore';

const palette = {
  gold: '#FFDD26',
  amber: '#FFBE1D',
  graphite: '#302F2C',
  white: '#F2F2F2',
};

const slotMeta: Record<BuildSlot, { label: string; icon: string }> = {
  cpu: { label: 'CPU', icon: '/icons/cpu.png' },
  motherboard: { label: 'Motherboard', icon: '/icons/motherboard.png' },
  cooling: { label: 'CPU Cooler', icon: '/icons/fan.png' },
  ram: { label: 'RAM', icon: '/icons/ram.png' },
  storage: { label: 'Storage', icon: '/icons/storage.png' },
  gpu: { label: 'GPU', icon: '/icons/graphic-card.png' },
  case: { label: 'Case', icon: '/icons/case.png' },
  psu: { label: 'Power Supply', icon: '/icons/power-supply.png' },
  os: { label: 'Operating System', icon: '/icons/operative_system.png' },
  monitor: { label: 'Monitor', icon: '/icons/monitor.png' },
  peripherals: { label: 'Peripherals', icon: '/icons/keyboard.png' },
};

const PUBLISHED_KEY = 'pcbuilder_published_builds_v1';
const AUTH_KEY = 'pcbuilder_auth_user';

export default function MyBuildsPage() {
  const router = useRouter();
  const { saved, remove } = useSavedBuilds();
  const { replace } = useBuildState();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<Record<string, string>>({});
  const [published, setPublished] = useState<Set<string>>(new Set());
  const [authUser, setAuthUser] = useState<{ id?: number; email?: string; nickname?: string; admin?: boolean } | null>(
    null,
  );
  // Cargar builds ya publicadas (cliente) para evitar duplicar envío del mismo usuario/navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PUBLISHED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPublished(new Set(parsed));
        }
      }
      const authRaw = localStorage.getItem(AUTH_KEY);
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        if (parsed && typeof parsed === 'object') {
          setAuthUser(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const markPublished = (id: string) => {
    setPublished((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PUBLISHED_KEY, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const hasBuilds = saved.length > 0;

  const handleLoad = (build: SavedBuild) => {
    setBusyId(build.id);
    replace(build.components);
    router.push('/build');
  };

  const handleDelete = (id: string) => {
    setBusyId(id);
    remove(id);
    setBusyId(null);
  };

  const slotToCategory = (slot: BuildSlot): string | null => {
    switch (slot) {
      case 'cpu':
        return 'cpu';
      case 'motherboard':
        return 'motherboard';
      case 'cooling':
        return 'cpu-cooler';
      case 'ram':
        return 'ram';
      case 'storage':
        return 'storage';
      case 'gpu':
        return 'gpu';
      case 'case':
        return 'case';
      case 'psu':
        return 'psu';
      case 'os':
        return 'os';
      case 'monitor':
        return 'monitor';
      default:
        return null;
    }
  };

  const handlePublish = async (build: SavedBuild, recommendedOverride?: boolean) => {
    if (!authUser) {
      setPublishMsg((prev) => ({ ...prev, [build.id]: 'Please sign in to publish your build.' }));
      return;
    }
    const wantsRecommended = recommendedOverride === true;
    if (wantsRecommended && !authUser.admin) {
      setPublishMsg((prev) => ({ ...prev, [build.id]: 'Only admins can publish recommended builds.' }));
      return;
    }
    if (!wantsRecommended && published.has(build.id)) {
      setPublishMsg((prev) => ({ ...prev, [build.id]: 'Already published.' }));
      return;
    }
    setPublishId(build.id);
    setPublishMsg((prev) => ({ ...prev, [build.id]: '' }));
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const components = Object.entries(build.components)
        .map(([slot, item]) => ({ slot: slot as BuildSlot, item }))
        .filter(({ item }) => !!item)
        .map(({ slot, item }) => {
          const category = slotToCategory(slot);
          if (!category || !item) return null;
          return { category, componentId: item.id };
        })
        .filter(Boolean) as { category: string; componentId: string }[];

      if (components.length === 0) {
        setPublishMsg((prev) => ({ ...prev, [build.id]: 'Add at least one component before publishing.' }));
        return;
      }

      const res = await fetch(`${apiBase}/api/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: build.name,
          imageUrl: build.imageUrl || undefined,
          userEmail: authUser?.email,
          userNickname: authUser?.nickname,
          recommended: wantsRecommended || undefined,
          components,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Could not publish (${res.status})`);
      }

      setPublishMsg((prev) => ({ ...prev, [build.id]: 'Build published in the community.' }));
      markPublished(build.id);
    } catch (err: any) {
      setPublishMsg((prev) => ({ ...prev, [build.id]: err?.message || 'Could not publish.' }));
    } finally {
      setPublishId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFDD26] text-[#302F2C]">
      {/* Hero */}
      <div
        className="relative min-h-[50vh] w-full overflow-hidden"
        style={{
          backgroundImage: 'url("/images/components_header.webp")',
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
            Back to builder
          </Link>
        </header>

        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#302F2C]/10">
            <p className="text-sm font-semibold text-[#302F2C]/80">My builds</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black leading-tight text-[#302F2C]">
              Save, review, and revisit your configs
            </h1>
            <p className="mt-3 text-lg text-[#302F2C]/80">
              Use this view to keep your favorite combinations. Jump back to the builder with one click
              and keep tweaking.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFDD26] px-4 py-2 text-sm font-semibold text-[#302F2C] shadow-sm border border-[#302F2C]/10">
              <span className="h-2 w-2 rounded-full bg-[#302F2C]" />
              {saved.length} builds saved
            </div>
          </div>
        </div>
      </div>

      {/* Saved builds */}
      <main className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-[#FFDD26] via-[#FFBE1D]/60 to-[#F2F2F2]/85" />
        <div className="relative container mx-auto px-6 pb-20 -mt-10">
          <div className="rounded-3xl bg-white/90 backdrop-blur border border-[#302F2C]/10 p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
            {!hasBuilds ? (
              <div className="flex flex-col items-center gap-4 text-center py-12">
                <div className="relative h-28 w-28">
                  <Image
                    src="/logos/logo_no_bg.png"
                    alt="PCBuilder+"
                    fill
                    className="object-contain"
                    sizes="112px"
                    priority
                  />
                </div>
                <p className="text-xl font-bold text-[#302F2C]">You have no saved builds yet</p>
                <p className="text-[#302F2C]/70 max-w-xl">
                  Save your first configuration from the build page. You can name it, add an image, and
                  return whenever you want.
                </p>
                <Link
                  href="/build"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#302F2C] px-5 py-3 text-sm font-semibold text-[#FFDD26] hover:opacity-90 transition"
                >
                  Create my first build
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {saved.map((build) => (
                  <BuildCard
                    key={build.id}
                    build={build}
                    onLoad={() => handleLoad(build)}
                    onDelete={() => handleDelete(build.id)}
                    onPublish={() => handlePublish(build)}
                    onPublishRecommended={authUser?.admin ? () => handlePublish(build, true) : undefined}
                    busy={busyId === build.id}
                    publishing={publishId === build.id}
                    publishMsg={publishMsg[build.id]}
                    alreadyPublished={published.has(build.id)}
                    isAdmin={authUser?.admin === true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type BuildCardProps = {
  build: SavedBuild;
  onLoad: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onPublishRecommended?: () => void;
  busy?: boolean;
  publishing?: boolean;
  publishMsg?: string;
  alreadyPublished?: boolean;
  isAdmin?: boolean;
};

function BuildCard({
  build,
  onLoad,
  onDelete,
  onPublish,
  onPublishRecommended,
  busy,
  publishing,
  publishMsg,
  alreadyPublished,
  isAdmin,
}: BuildCardProps) {
  const filled = useMemo(() => Object.values(build.components).filter(Boolean).length, [build.components]);

  return (
    <div className="flex flex-col rounded-2xl border border-[#302F2C]/10 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)]">
      <div className="flex gap-4">
        <div className="relative h-32 w-32 rounded-xl bg-[#FFBE1D]/25 border border-[#302F2C]/10 overflow-hidden">
          {build.imageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${build.imageUrl})` }}
            />
          )}
          {!build.imageUrl && (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#302F2C]/60">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#302F2C]/70">
                {new Date(build.createdAt).toLocaleString()}
              </p>
              <h3 className="text-xl font-bold text-[#302F2C] leading-tight">{build.name}</h3>
              {build.description && (
                <p className="text-sm text-[#302F2C]/75">{build.description}</p>
              )}
            </div>
            <div className="text-xs font-semibold rounded-full bg-[#302F2C]/8 text-[#302F2C] px-3 py-1">
              {filled} parts
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(build.components).map(([slot, item]) => {
              if (!item) return null;
              const meta = slotMeta[slot as BuildSlot];
              return (
                <div
                  key={slot}
                  className="flex items-start gap-2 rounded-xl border border-[#302F2C]/10 bg-[#FFDD26]/30 px-3 py-2"
                >
                  <div className="relative h-10 w-10 rounded-lg bg-white/80 border border-[#302F2C]/10 overflow-hidden shrink-0">
                    <Image src={meta.icon} alt={meta.label} fill className="object-contain p-2" sizes="40px" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#302F2C]/70">{meta.label}</p>
                    <p className="text-sm font-semibold text-[#302F2C] truncate" title={item.name}>
                      {item.name}
                    </p>
                    {item.brand && (
                      <p className="text-[11px] text-[#302F2C]/60 truncate">{item.brand}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={onLoad}
              disabled={busy}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                busy ? 'bg-[#302F2C]/10 text-[#302F2C]/50 cursor-not-allowed' : 'bg-[#302F2C] text-[#FFDD26] hover:opacity-90'
              }`}
            >
              {busy ? 'Opening...' : 'Open in /build'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border border-[#302F2C]/20 text-[#302F2C]/80 hover:border-[#302F2C]/40 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={busy || publishing || alreadyPublished}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                publishing || alreadyPublished
                  ? 'bg-[#302F2C]/10 text-[#302F2C]/50 cursor-not-allowed'
                  : 'bg-[#FFBE1D] text-[#302F2C] hover:opacity-90'
              }`}
            >
              {alreadyPublished ? 'Already published' : publishing ? 'Publishing…' : 'Publish in community'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={onPublishRecommended}
                disabled={busy || publishing}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  publishing
                    ? 'bg-[#302F2C]/10 text-[#302F2C]/50 cursor-not-allowed'
                    : 'bg-[#302F2C] text-[#FFDD26] hover:opacity-90'
                }`}
              >
                {publishing ? 'Publishing…' : 'Publish as recommended'}
              </button>
            )}
            <Link
              href="/components"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5 transition"
            >
              Keep searching
            </Link>
          </div>
          {publishMsg && (
            <p className="text-xs font-semibold text-[#302F2C]/80 pt-1">{publishMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

