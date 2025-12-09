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
};

export type BuildItemInput = Omit<BuildItem, 'category'>;

export type BuildState = Partial<Record<BuildSlot, BuildItem>>;

const STORAGE_KEY = 'pcbuilder_build_v1';

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

  return { build, refresh, remove, clear };
}

