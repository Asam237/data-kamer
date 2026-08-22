import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "datakamer-pro";
const EVENT_NAME = "datakamer-pro-changed";

export const FREE_FEATURES = [
  "Toutes les données régions & universités",
  "Comparateur (2 régions max)",
  "Carte interactive & coupures ENEO",
  "Favoris illimités",
];

export const PRO_FEATURES = [
  "Comparateur étendu (jusqu'à 6 régions)",
  "Export CSV illimité (comparateur & statistiques)",
  "Graphiques avancés (radar, tendances)",
  "Badge Pro dans l'application",
];

const readStore = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const writeStore = (value: boolean) => {
  window.localStorage.setItem(STORAGE_KEY, String(value));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const usePro = () => {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsPro(readStore());
    const onChange = () => setIsPro(readStore());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const unlock = useCallback(() => {
    writeStore(true);
    setIsPro(true);
  }, []);

  const lock = useCallback(() => {
    writeStore(false);
    setIsPro(false);
  }, []);

  return { isPro, unlock, lock };
};
