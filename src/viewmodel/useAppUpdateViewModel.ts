import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import type { AppUpdateResult } from "@/model/entities/appUpdate";
import type { AppUpdateUseCases } from "@/usecase/appUpdateUseCases";

export type AppUpdateViewModel = AppUpdateResult & {
  loading: boolean;
  dismiss: () => Promise<void>;
  openStore: () => Promise<void>;
};

const INITIAL_RESULT: AppUpdateResult = { status: "up_to_date", policy: null };

export function useAppUpdateViewModel(useCases: AppUpdateUseCases): AppUpdateViewModel {
  const [result, setResult] = useState<AppUpdateResult>(INITIAL_RESULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (Platform.OS === "web") {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    useCases.checkUpdate().then((next) => {
      if (active) {
        setResult(next);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [useCases]);

  const dismiss = useCallback(async () => {
    if (result.status !== "optional" || !result.policy) return;
    await useCases.dismiss(result.policy.latestVersion);
    setResult((current) => ({ ...current, status: "up_to_date" }));
  }, [result, useCases]);

  const openStore = useCallback(async () => {
    if (result.policy) await useCases.openStore(result.policy.storeUrl);
  }, [result.policy, useCases]);

  return { ...result, loading, dismiss, openStore };
}
