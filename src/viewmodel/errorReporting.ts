import type { IErrorReporter } from "@/model/services/iErrorReporter";

/** Inicializa o acompanhador local de erros (Spec 145 / ADR 0124). */
export function startErrorReporting(reporter: IErrorReporter): void {
  reporter.init();
}
