import type { IPermissionAskDataSource } from "@/model/datasources/iPermissionAskDataSource";
import type { IPermissionService } from "@/model/services/iPermissionService";
import type { IPermissionPromptUseCases, PermissionDecision } from "@/usecase/iPermissionPromptUseCases";

/**
 * Prompt de permissão (Spec 020): explica antes do aviso nativo e não insiste depois da recusa.
 * Uma instância por permissão; o registro de "já perguntado" é do aparelho, não da conta.
 */
export class PermissionPromptUseCases implements IPermissionPromptUseCases {
  constructor(
    private readonly permission: IPermissionService,
    private readonly asked: IPermissionAskDataSource,
  ) {}

  async resolve(): Promise<PermissionDecision> {
    try {
      if (await this.permission.isGranted()) return "granted";
      return (await this.asked.hasAsked()) ? "asked" : "explain";
    } catch {
      // Sem leitura do aparelho ou do registro: explicar uma vez a mais é inofensivo.
      return "explain";
    }
  }

  async request(): Promise<boolean> {
    try {
      const granted = await this.permission.request();
      await this.markAsked();
      return granted;
    } catch {
      return false;
    }
  }

  /** Falha ao gravar só faz a explicação reaparecer na próxima abertura; não bloqueia o app. */
  async markAsked(): Promise<void> {
    try {
      await this.asked.markAsked();
    } catch {
      // intencionalmente silencioso
    }
  }
}
