import type { IPermissionAskDataSource } from "@/model/datasources/iPermissionAskDataSource";

/** Registro em memória de que a permissão já foi pedida neste aparelho (Spec 020). */
export class MemoryPermissionAskDataSource implements IPermissionAskDataSource {
  private asked = false;

  async hasAsked(): Promise<boolean> {
    return this.asked;
  }

  async markAsked(): Promise<void> {
    this.asked = true;
  }

  /** Ajusta o estado inicial, para os testes que partem da permissão já pedida. */
  setAsked(asked: boolean): void {
    this.asked = asked;
  }
}
