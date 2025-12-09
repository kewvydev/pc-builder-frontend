'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type BuildSlot =
  | 'cpu'
  | 'motherboard'
  | 'cooling'
  | 'ram'
  | 'storage'
  | 'gpu'
  | 'case'
  | 'psu'
  | 'os'
  | 'monitor'
  | 'peripherals';

export type BuildItem = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  productUrl?: string;
  category: BuildSlot;
  /** Atributos clave para compatibilidad (ej: socket, form_factor) */
  attributes?: Record<string, string>;
};

export type BuildItemInput = Omit<BuildItem, 'category'>;

/** Obtiene un atributo específico de un BuildItem */
export const getBuildItemAttribute = (item: BuildItem | undefined, key: string): string | undefined => {
  return item?.attributes?.[key];
};

export type BuildState = Partial<Record<BuildSlot, BuildItem>>;

const STORAGE_KEY = 'pcbuilder_build_v1';
const SAVED_BUILDS_KEY = 'pcbuilder_saved_builds_v1';

export type SavedBuildInput = {
  name: string;
  description?: string;
  imageUrl?: string;
};

export type SavedBuild = SavedBuildInput & {
  id: string;
  createdAt: string;
  components: BuildState;
};

const safeLoad = (): BuildState => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const saveState = (state: BuildState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const safeLoadSavedBuilds = (): SavedBuild[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_BUILDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSavedBuilds = (list: SavedBuild[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(list));
};

export const upsertBuildItem = (item: BuildItem) => {
  const state = safeLoad();
  state[item.category] = item;
  saveState(state);
  return state;
};

export const removeBuildItem = (slot: BuildSlot) => {
  const state = safeLoad();
  delete state[slot];
  saveState(state);
  return state;
};

export const clearBuild = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export const loadBuild = () => safeLoad();

export const replaceBuild = (state: BuildState) => {
  saveState(state);
  return state;
};

export const loadSavedBuilds = () => safeLoadSavedBuilds();

export const saveCurrentBuild = (metadata: SavedBuildInput) => {
  const components = loadBuild();
  const hasComponents = Object.keys(components).length > 0;
  if (!hasComponents) {
    throw new Error('No hay componentes para guardar.');
  }

  const normalizedMeta: SavedBuildInput = {
    ...metadata,
    name: metadata.name.trim() || 'Mi build',
    description: metadata.description?.trim() || undefined,
    imageUrl: metadata.imageUrl?.trim() || undefined,
  };

  const build: SavedBuild = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `build_${Date.now()}`,
    createdAt: new Date().toISOString(),
    components,
    ...normalizedMeta,
  };

  const existing = safeLoadSavedBuilds();
  const next = [build, ...existing];
  saveSavedBuilds(next);
  return build;
};

export const deleteSavedBuild = (id: string) => {
  const next = safeLoadSavedBuilds().filter((build) => build.id !== id);
  saveSavedBuilds(next);
  return next;
};

export const clearSavedBuilds = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SAVED_BUILDS_KEY);
};

export function useAddToBuild(defaultSlot: BuildSlot) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slot = useMemo(() => {
    const param = searchParams.get('slot') as BuildSlot | null;
    return param || defaultSlot;
  }, [defaultSlot, searchParams]);

  const returnTo = useMemo(
    () => searchParams.get('returnTo') || '/build',
    [searchParams],
  );

  const addToBuild = useCallback(
    (item: BuildItemInput) => {
      upsertBuildItem({ ...item, category: slot });
      router.push(returnTo);
    },
    [slot, returnTo, router],
  );

  return { addToBuild, slot, returnTo };
}

export function useBuildState() {
  const [build, setBuild] = useState<BuildState>({});

  useEffect(() => {
    setBuild(loadBuild());
  }, []);

  const refresh = useCallback(() => {
    setBuild(loadBuild());
  }, []);

  const remove = useCallback((slot: BuildSlot) => {
    setBuild(removeBuildItem(slot));
  }, []);

  const clear = useCallback(() => {
    clearBuild();
    setBuild({});
  }, []);

  const replace = useCallback((state: BuildState) => {
    replaceBuild(state);
    setBuild(state);
  }, []);

  return { build, refresh, remove, clear, replace };
}

export function useSavedBuilds() {
  const [saved, setSaved] = useState<SavedBuild[]>([]);

  useEffect(() => {
    setSaved(loadSavedBuilds());
  }, []);

  const refresh = useCallback(() => {
    setSaved(loadSavedBuilds());
  }, []);

  const remove = useCallback((id: string) => {
    setSaved(deleteSavedBuild(id));
  }, []);

  const clear = useCallback(() => {
    clearSavedBuilds();
    setSaved([]);
  }, []);

  return { saved, refresh, remove, clear };
}

