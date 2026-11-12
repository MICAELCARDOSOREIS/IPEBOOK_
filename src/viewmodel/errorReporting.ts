import type { IErrorReporter } from "@/model/services/iErrorReporter";

/** Liga o acompanhamento de erros (Spec 104); sem EXPO_PUBLIC_SENTRY_DSN, não envia nada. */
export function startErrorReporting(reporter: IErrorReporter): void {
  reporter.init();
}
