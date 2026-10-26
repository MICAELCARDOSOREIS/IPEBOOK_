/** Contrato de limpeza de dados guardados no dispositivo (Spec 073). */
export interface ILocalCacheDataSource {
  /** Remove as entradas de cache do catálogo offline. */
  clearBooksCache(): Promise<void>;
}
