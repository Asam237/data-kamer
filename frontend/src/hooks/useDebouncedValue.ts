import { useEffect, useState } from "react";

/**
 * Retourne `value`, mais mis à jour au plus une fois toutes les `delayMs`
 * millisecondes de silence. Utile pour éviter de recalculer un filtrage
 * coûteux à chaque frappe dans un champ de recherche.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}
