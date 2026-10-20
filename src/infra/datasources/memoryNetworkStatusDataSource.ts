import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";

/** Sempre reporta conectado; usado em testes e no modo em memória, onde não há rede real. */
export class MemoryNetworkStatusDataSource implements INetworkStatusDataSource {
  async isOnline() {
    return true;
  }

  subscribe() {
    return () => {};
  }
}
