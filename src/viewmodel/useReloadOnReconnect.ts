import { useEffect, useRef } from "react";

export function useReloadOnReconnect(isOnline: boolean, reload: () => void) {
  const lastOnline = useRef(isOnline);
  useEffect(() => {
    const reconnected = isOnline && !lastOnline.current;
    lastOnline.current = isOnline;
    if (reconnected) reload();
  }, [isOnline, reload]);
}
