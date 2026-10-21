/**
 * Gerenciador de cache em memória para capas de livros (Spec 040, ADR 0034).
 * Evita recarregamentos desnecessários e flicker visual durante rolagens de listas.
 * Mantém no máximo `capacity` entradas com política LRU simples via Map.
 */

export type BookCoverCacheStatus = "loaded" | "error";

export class BookCoverCache {
  private readonly capacity: number;
  private readonly entries = new Map<string, BookCoverCacheStatus>();

  constructor(capacity = 300) {
    this.capacity = capacity;
  }

  /** Retorna o status da URL no cache ou undefined se não estiver presente. */
  getStatus(url: string): BookCoverCacheStatus | undefined {
    if (!this.entries.has(url)) return undefined;
    const status = this.entries.get(url)!;
    // Move para o final para preservar LRU
    this.entries.delete(url);
    this.entries.set(url, status);
    return status;
  }

  /** Informa se a URL já foi carregada com sucesso. */
  isLoaded(url: string): boolean {
    return this.getStatus(url) === "loaded";
  }

  /** Informa se a URL falhou definitivamente. */
  hasFailed(url: string): boolean {
    return this.getStatus(url) === "error";
  }

  /** Registra URL como carregada com sucesso. */
  setLoaded(url: string): void {
    if (!url) return;
    if (this.entries.has(url)) {
      this.entries.delete(url);
    } else if (this.entries.size >= this.capacity) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
    this.entries.set(url, "loaded");
  }

  /** Registra URL como erro definitivo (após retries esgotados). */
  setError(url: string): void {
    if (!url) return;
    if (this.entries.has(url)) {
      this.entries.delete(url);
    } else if (this.entries.size >= this.capacity) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) {
        this.entries.delete(oldestKey);
      }
    }
    this.entries.set(url, "error");
  }

  /** Remove uma URL do cache. */
  delete(url: string): boolean {
    return this.entries.delete(url);
  }

  /** Limpa todas as entradas em memória (útil para testes ou logout). */
  clear(): void {
    this.entries.clear();
  }

  /** Retorna a quantidade atual de entradas registradas. */
  size(): number {
    return this.entries.size;
  }
}

/** Instância singleton compartilhada de cache de capas de livros. */
export const bookCoverCache = new BookCoverCache();

export default bookCoverCache;
