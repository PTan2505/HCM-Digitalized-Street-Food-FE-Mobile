import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface FavoriteEntry {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
}

const getUserKey = (user: {
  id?: number;
  username: string | null;
  email: string | null;
}): string | null => {
  const key = user.id?.toString() ?? user.username ?? user.email;
  return key ? `@favorites_${key}` : null;
};

const loadFavorites = async (storageKey: string): Promise<FavoriteEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
};

const saveFavorites = async (
  storageKey: string,
  entries: FavoriteEntry[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    // Silently ignore storage errors
  }
};

interface UseFavoriteBranchesResult {
  favoriteBranches: FavoriteEntry[];
  isFavorite: (branchId: number) => boolean;
  toggleFavorite: (
    branch: ActiveBranch,
    displayName: string,
    imageUri?: string
  ) => void;
  reload: () => void;
}

export const useFavoriteBranches = (): UseFavoriteBranchesResult => {
  const user = useAppSelector(selectUser);
  const storageKey = user ? getUserKey(user) : null;
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    if (!storageKey) return;
    loadFavorites(storageKey)
      .then(setFavorites)
      .catch(() => {});
  }, [storageKey]);

  const isFavorite = useCallback(
    (branchId: number): boolean =>
      favorites.some((e) => e.branch.branchId === branchId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (branch: ActiveBranch, displayName: string, imageUri?: string): void => {
      if (!storageKey) return;
      setFavorites((prev) => {
        const exists = prev.some((e) => e.branch.branchId === branch.branchId);
        const next = exists
          ? prev.filter((e) => e.branch.branchId !== branch.branchId)
          : [...prev, { branch, displayName, imageUri }];
        void saveFavorites(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const reload = useCallback((): void => {
    if (!storageKey) return;
    loadFavorites(storageKey)
      .then(setFavorites)
      .catch(() => {});
  }, [storageKey]);

  return { favoriteBranches: favorites, isFavorite, toggleFavorite, reload };
};
