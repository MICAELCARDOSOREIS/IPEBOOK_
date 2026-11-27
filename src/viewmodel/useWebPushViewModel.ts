import { useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { IWebPushService, WebPushStatus } from "@/model/services/iWebPushService";

export function useWebPushViewModel(service: IWebPushService | undefined, userId: string | null) {
  const [status, setStatus] = useState<WebPushStatus>("unavailable");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    let mounted = true;
    setStatus("unavailable");
    setError(null);
    if (service && userId) {
      void service.status().then((result) => {
        if (mounted) setStatus(result);
      }).catch((failure: unknown) => {
        if (mounted && failure instanceof DomainError) setError(failure.message);
      });
    }
    return () => { mounted = false; };
  }, [service, userId]);

  async function toggle() {
    if (!service || !userId || (status !== "active" && status !== "inactive") || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    try {
      if (status === "active") {
        await service.disable();
        setStatus("inactive");
      } else {
        await service.enable(userId);
        setStatus("active");
      }
    } catch (failure) {
      setError(failure instanceof DomainError ? failure.message : "Não foi possível alterar os avisos agora.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return { status, busy, error, toggle };
}
