/**
 * Registro de que o app já explicou e pediu uma permissão neste aparelho (Spec 020).
 * A instância é criada por permissão, então não há chave no contrato.
 * Dispositivo, não conta: a pessoa pode trocar de conta no mesmo celular e não deve ser perguntada de novo.
 */
export interface IPermissionAskDataSource {
  hasAsked(): Promise<boolean>;
  markAsked(): Promise<void>;
}
