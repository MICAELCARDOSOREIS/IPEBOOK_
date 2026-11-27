type CacheClearer = () => void;
type CatalogMutationListener = () => void;
type FavoriteChangeListener = (event: { userId: string; bookId: string; selected: boolean }) => void;

const booksMemoryClearers = new Set<CacheClearer>();
const sessionMemoryClearers = new Set<CacheClearer>();
const catalogMutationListeners = new Set<CatalogMutationListener>();
const favoriteChangeListeners = new Set<FavoriteChangeListener>();

/**
 * Registra um cache em memória ligado a livros (catálogo, estante e detalhes).
 * É limpo tanto pela ação "Remover cópia do catálogo" quanto ao sair ou trocar de conta.
 * Retorna função para cancelar o registro.
 */
export function registerBooksMemoryCache(clear: CacheClearer): () => void {
  booksMemoryClearers.add(clear);
  sessionMemoryClearers.add(clear);
  return () => {
    booksMemoryClearers.delete(clear);
    sessionMemoryClearers.delete(clear);
  };
}

/**
 * Registra um cache em memória vinculado à sessão ativa.
 * É limpo ao sair da conta, excluir a conta ou alternar de usuário.
 * Retorna função para cancelar o registro.
 */
export function registerSessionMemoryCache(clear: CacheClearer): () => void {
  sessionMemoryClearers.add(clear);
  return () => {
    sessionMemoryClearers.delete(clear);
  };
}

/** Limpa todos os caches em memória de livros nos ViewModels. */
export function clearBooksMemoryCaches(): void {
  for (const clear of booksMemoryClearers) {
    clear();
  }
}

/** Limpa todos os caches em memória de sessão nos ViewModels. */
export function clearAllSessionMemoryCaches(): void {
  for (const clear of sessionMemoryClearers) {
    clear();
  }
}

/** Assina mutações locais no catálogo (ex.: pausar/excluir na Estante) para sincronizar Início e Explorar. */
export function subscribeBooksCatalogMutated(listener: CatalogMutationListener): () => void {
  catalogMutationListeners.add(listener);
  return () => {
    catalogMutationListeners.delete(listener);
  };
}

/** Avisa telas montadas (Início e Explorar) que um anúncio foi criado, editado, pausado ou removido. */
export function notifyBooksCatalogMutated(): void {
  clearBooksMemoryCaches();
  for (const listener of catalogMutationListeners) {
    listener();
  }
}

/** Assina alterações de favorito para sincronizar corações entre Explorar, Detalhe e Favoritos. */
export function subscribeFavoriteChanged(listener: FavoriteChangeListener): () => void {
  favoriteChangeListeners.add(listener);
  return () => {
    favoriteChangeListeners.delete(listener);
  };
}

/** Propaga instantaneamente favoritar/desfavoritar para todas as telas montadas. */
export function notifyFavoriteChanged(userId: string, bookId: string, selected: boolean): void {
  for (const listener of favoriteChangeListeners) {
    listener({ userId, bookId, selected });
  }
}
