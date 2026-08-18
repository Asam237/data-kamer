import { useCallback, useEffect, useState } from "react";

export type FavoriteKind = "region" | "university";

interface FavoriteEntry {
  kind: FavoriteKind;
  key: string;
  label: string;
}

const STORAGE_KEY = "datakamer-favorites";

const readStore = (): FavoriteEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
  } catch {
    return [];
  }
};

const writeStore = (entries: FavoriteEntry[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("datakamer-favorites-changed"));
};

export const useFavorites = (kind?: FavoriteKind) => {
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    setEntries(readStore());
    const onChange = () => setEntries(readStore());
    window.addEventListener("datakamer-favorites-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("datakamer-favorites-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isFavorite = useCallback(
    (favKind: FavoriteKind, key: string) =>
      entries.some((e) => e.kind === favKind && e.key === key),
    [entries]
  );

  const toggleFavorite = useCallback(
    (favKind: FavoriteKind, key: string, label: string) => {
      const current = readStore();
      const exists = current.some((e) => e.kind === favKind && e.key === key);
      const next = exists
        ? current.filter((e) => !(e.kind === favKind && e.key === key))
        : [...current, { kind: favKind, key, label }];
      writeStore(next);
      setEntries(next);
    },
    []
  );

  const filtered = kind ? entries.filter((e) => e.kind === kind) : entries;

  return { favorites: filtered, isFavorite, toggleFavorite };
};
