import { useEffect, useState } from "react";
import { pwaService as defaultPwaService } from "@/di/container";
import type { IPwaService } from "@/model/services/iPwaService";

export interface UsePwaViewModelOptions {
  autoRegister?: boolean;
  pwaService?: IPwaService;
}

export function usePwaViewModel(options: UsePwaViewModelOptions = {}) {
  const service = options.pwaService ?? defaultPwaService;
  const autoRegister = options.autoRegister ?? true;

  const [isSupported] = useState<boolean>(() => service.isSupported());
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (autoRegister && service.isSupported()) {
      service.register().then((registered) => {
        if (isMounted) {
          setIsRegistered(registered);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [autoRegister, service]);

  const register = async (): Promise<boolean> => {
    const success = await service.register();
    setIsRegistered(success);
    return success;
  };

  const unregister = async (): Promise<boolean> => {
    const success = await service.unregister();
    if (success) {
      setIsRegistered(false);
    }
    return success;
  };

  return {
    isSupported,
    isRegistered,
    register,
    unregister,
  };
}
