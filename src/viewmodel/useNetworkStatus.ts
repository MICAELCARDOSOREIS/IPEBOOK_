import { useEffect, useState } from "react";
import { networkStatusDataSource } from "@/di/container";

/**
 * Reporta se o app está conectado à rede, para exibir o `OfflineState`
 * (design-system/04-componentes/estados-do-sistema.md). Começa otimista (`true`) até o primeiro
 * retorno do datasource, para não piscar "sem conexão" por um instante no carregamento inicial.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let active = true;
    void networkStatusDataSource.isOnline().then((online) => {
      if (active) setIsOnline(online);
    });
    const unsubscribe = networkStatusDataSource.subscribe((online) => {
      if (active) setIsOnline(online);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { isOnline };
}

export default useNetworkStatus;
