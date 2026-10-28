/** Seletor de contas Google do próprio aparelho (Spec 106 / ADR 0082). */
export interface INativeGoogleSignIn {
  /** Falso quando não há ID do cliente configurado ou na Web: o login segue pelo navegador. */
  isAvailable(): boolean;
  /** Abre o seletor de contas e devolve o idToken; `null` quando a pessoa cancela. */
  getIdToken(): Promise<string | null>;
  signOut(): Promise<void>;
}
