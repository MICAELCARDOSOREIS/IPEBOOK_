/**
 * Acesso à permissão de uma funcionalidade no aparelho (Spec 020).
 * A instância é criada por permissão pelo container; o prompt do sistema só abre em `request`.
 */
export interface IPermissionService {
  /** Estado atual, sem abrir o prompt do sistema. */
  isGranted(): Promise<boolean>;
  /** Abre o prompt do sistema e devolve se a pessoa concedeu. */
  request(): Promise<boolean>;
}
