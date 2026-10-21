import { Platform } from "react-native";
import type { ILogger } from "@/model/services/iLogger";
import type { IPwaService } from "@/model/services/iPwaService";

/**
 * Serviço de gerenciamento do ciclo de vida do Service Worker para Web / PWA (Spec 041, ADR 0035).
 * Isola chamadas de navegador e garante segurança em plataformas nativas e ambientes de teste.
 */
export class PwaService implements IPwaService {
  private isRegistered = false;

  constructor(
    private readonly logger?: ILogger,
    private readonly swUrl: string = "/sw.js",
    private readonly scope: string = "/"
  ) {}

  isSupported(): boolean {
    if (Platform.OS !== "web") return false;
    if (typeof window === "undefined" || typeof navigator === "undefined") return false;
    if (!("serviceWorker" in navigator)) return false;

    // Service Workers exigem protocolo seguro (HTTPS) ou localhost
    const protocol = window.location?.protocol ?? "";
    const hostname = window.location?.hostname ?? "";
    const isSecureContext =
      protocol === "https:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local");

    return isSecureContext;
  }

  async register(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    if (this.isRegistered) {
      return true;
    }

    try {
      const registration = await navigator.serviceWorker.register(this.swUrl, {
        scope: this.scope,
      });

      this.isRegistered = true;
      this.logger?.info("Service Worker registrado com sucesso", {
        scope: registration.scope,
      });
      return true;
    } catch (error) {
      this.logger?.warn("Falha ao registrar Service Worker do PWA", {
        erro: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      this.isRegistered = false;
      this.logger?.info("Service Workers desregistrados com sucesso");
      return true;
    } catch (error) {
      this.logger?.warn("Erro ao desregistrar Service Workers", {
        erro: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
