import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";

/**
 * `isConnected` pode vir `null` enquanto o NetInfo ainda não determinou o estado inicial;
 * tratamos isso como "online" (otimista) e só reportamos offline quando `false` é explícito,
 * conforme a própria documentação do NetInfo recomenda.
 */
function toIsOnline(state: NetInfoState): boolean {
  return state.isConnected !== false;
}

/** Detecta perda de conectividade real via `@react-native-community/netinfo` (iOS/Android/Web). */
export class NetInfoNetworkStatusDataSource implements INetworkStatusDataSource {
  async isOnline() {
    const state = await NetInfo.fetch();
    return toIsOnline(state);
  }

  subscribe(onChange: (isOnline: boolean) => void) {
    return NetInfo.addEventListener((state) => onChange(toIsOnline(state)));
  }
}
