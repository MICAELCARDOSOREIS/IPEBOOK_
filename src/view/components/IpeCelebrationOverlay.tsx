import { useEffect, useState } from "react";
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";
import { subscribeIpePetals } from "@/view/components/ipeCelebrationController";
import { useIsWideWeb } from "@/view/useIsWideWeb";

export type IpeCelebrationOverlayProps = {
  testID?: string;
};

/**
 * Overlay de florada do Ipê posicionado no topo absoluto da aplicação.
 * Cobre a tela inteira, inclusive a barra de navegação inferior (Tab Bar),
 * permitindo que as flores e folhas caiam e pousem graciosamente sobre a barra.
 */
export function IpeCelebrationOverlay({ testID = "ipe-celebration-overlay" }: IpeCelebrationOverlayProps) {
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);
  const wideWeb = useIsWideWeb();

  useEffect(() => {
    return subscribeIpePetals(() => {
      setKey((prev) => prev + 1);
      setActive(true);
    });
  }, []);

  if (!active) return null;

  return (
    <IpePetalsCelebration
      key={key}
      active={active}
      testID={testID}
      bottomOffset={wideWeb ? 24 : 0}
      onComplete={() => setActive(false)}
    />
  );
}
