type CacheClearer = () => void;

const booksMemoryClearers = new Set<CacheClearer>();
const sessionMemoryClearers = new Set<CacheClearer>();

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
