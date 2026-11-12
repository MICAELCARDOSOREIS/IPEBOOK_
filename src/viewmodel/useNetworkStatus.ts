import { useEffect, useState } from "react";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";

/**
 * Reporta se o app está conectado à rede, para exibir o `OfflineState`
 * (design-system/04-componentes/estados-do-sistema.md). Começa otimista (`true`) até o primeiro
 * retorno do datasource, para não piscar "sem conexão" por um instante no carregamento inicial.
 */
export function useNetworkStatus(
  dataSource: INetworkStatusDataSource,
): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let active = true;
    void dataSource.isOnline().then((online) => {
      if (active) setIsOnline(online);
    });
    const unsubscribe = dataSource.subscribe((online) => {
      if (active) setIsOnline(online);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [dataSource]);

  return { isOnline };
}

export default useNetworkStatus;
