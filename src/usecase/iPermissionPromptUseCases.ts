/** O que o app faz antes de usar uma funcionalidade que depende de uma permissão (Spec 020). */
export type PermissionDecision =
  /** O aparelho já concedeu: nada a explicar, a funcionalidade pode seguir. */
  | "granted"
  /** Nunca foi explicada nem pedida: mostrar o motivo antes do prompt do sistema. */
  | "explain"
  /** Já foi pedida e negada: não insiste; a tela diz como habilitar depois. */
  | "asked";

export interface IPermissionPromptUseCases {
  resolve(): Promise<PermissionDecision>;
  /** Abre o prompt do sistema, grava que a permissão foi pedida e devolve a resposta da pessoa. */
  request(): Promise<boolean>;
  /** "Agora não": grava que a permissão foi pedida sem abrir o prompt do sistema. */
  markAsked(): Promise<void>;
}
