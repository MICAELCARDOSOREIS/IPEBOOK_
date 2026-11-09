import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";

/** Reporta status de rede; usado em testes e no modo em memória. */
export class MemoryNetworkStatusDataSource implements INetworkStatusDataSource {
  private online: boolean;
  private readonly listeners = new Set<(isOnline: boolean) => void>();

  constructor(initial = true) {
    this.online = initial;
  }

  async isOnline() {
    return this.online;
  }

  subscribe(onChange: (isOnline: boolean) => void) {
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  setOnline(online: boolean) {
    this.online = online;
    for (const listener of this.listeners) {
      listener(online);
    }
  }
}
