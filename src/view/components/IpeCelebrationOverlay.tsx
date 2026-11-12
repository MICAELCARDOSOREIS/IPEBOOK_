import { useEffect, useState } from "react";
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";
import { subscribeIpePetals, type IpePetalVariant } from "@/view/components/ipeCelebrationController";
import { useIsWideWeb } from "@/view/useIsWideWeb";

export type IpeCelebrationOverlayProps = {
  testID?: string;
};

/**
 * Florada do Ipê da Home, posicionada sobre a tela sem bloquear toques.
 */
export function IpeCelebrationOverlay({
  testID = "ipe-celebration-overlay",
}: IpeCelebrationOverlayProps) {
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);
  const [variant, setVariant] = useState<IpePetalVariant>("celebration");
  const wideWeb = useIsWideWeb();

  useEffect(() => {
    return subscribeIpePetals((nextVariant) => {
      setVariant(nextVariant);
      setKey((prev) => prev + 1);
      setActive(true);
    });
  }, []);

  if (!active) return null;

  return (
    <IpePetalsCelebration
      key={key}
      active={active}
      variant={variant}
      testID={testID}
      bottomOffset={wideWeb ? 24 : 0}
      onComplete={() => setActive(false)}
    />
  );
}
