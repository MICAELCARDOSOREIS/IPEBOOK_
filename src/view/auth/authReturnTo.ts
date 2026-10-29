const STORAGE_KEY = "auth_return_to";

/** Guarda a rota para onde o usuário deve voltar após autenticação OAuth. */
export function setAuthReturnTo(destination: string): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, destination);
    } catch {}
  }
}

/** Lê e consome a rota guardada; retorna fallback (default '/') se não houver. */
export function consumeAuthReturnTo(fallback: string = "/"): string {
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const destination = window.sessionStorage.getItem(STORAGE_KEY);
      if (destination) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return destination;
      }
    } catch {}
  }
  return fallback;
}
