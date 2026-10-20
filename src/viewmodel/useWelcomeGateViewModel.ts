import { useCallback, useEffect, useState } from "react";
import { onboardingUseCases } from "@/di/container";
import type { IOnboardingUseCases } from "@/usecase/iOnboardingUseCases";

export type WelcomeGateStatus = "checking" | "show" | "skip";

/** Decide, a cada abertura do app, se as boas-vindas devem aparecer (ADR 0022). */
export function useWelcomeGateViewModel(useCases: IOnboardingUseCases = onboardingUseCases): [WelcomeGateStatus, () => Promise<void>] {
  const [status, setStatus] = useState<WelcomeGateStatus>("checking");

  useEffect(() => {
    let active = true;
    useCases.shouldShowWelcome().then((show) => {
      if (active) setStatus(show ? "show" : "skip");
    });
    return () => {
      active = false;
    };
  }, [useCases]);

  const dismiss = useCallback(() => useCases.markWelcomeSeen(), [useCases]);
  return [status, dismiss];
}
