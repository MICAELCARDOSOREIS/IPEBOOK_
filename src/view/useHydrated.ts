import { useEffect, useState } from "react";

/**
 * `false` no HTML estático e na primeira renderização do cliente; `true` logo após a hidratação.
 * Usado por telas cujo conteúdo inicial depende de sessão para não divergir do servidor (Spec 136).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
