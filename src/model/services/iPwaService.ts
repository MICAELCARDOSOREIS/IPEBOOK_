/**
 * Contrato para serviços de Progressive Web App (PWA) e Service Worker (Spec 041, ADR 0035).
 */
export interface IPwaService {
  /** Verifica se a plataforma e o navegador atual suportam Service Worker. */
  isSupported(): boolean;

  /** Registra o Service Worker da aplicação de forma segura e não intrusiva. */
  register(): Promise<boolean>;

  /** Cancela o registro de Service Workers ativos (útil para limpeza e testes). */
  unregister(): Promise<boolean>;
}
