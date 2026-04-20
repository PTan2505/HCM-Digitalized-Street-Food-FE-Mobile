import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY = 5;

interface SearchHistoryReturn {
  history: string[];
  addToHistory: (keyword: string) => void;
  removeFromHistory: (keyword: string) => void;
  clearHistory: () => void;
}

export const useSearchHistory = (
  storageKey: string = SEARCH_HISTORY_KEY
): SearchHistoryReturn => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (raw) setHistory(JSON.parse(raw) as string[]);
      })
      .catch((): void => {});
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setHistory(next);
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
    },
    [storageKey]
  );

  const addToHistory = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      const deduped = [trimmed, ...history.filter((h) => h !== trimmed)].slice(
        0,
        MAX_HISTORY
      );
      persist(deduped);
    },
    [history, persist]
  );

  const removeFromHistory = useCallback(
    (keyword: string) => {
      persist(history.filter((h) => h !== keyword));
    },
    [history, persist]
  );

  const clearHistory = useCallback(() => {
    persist([]);
  }, [persist]);

  return { history, addToHistory, removeFromHistory, clearHistory };
};
