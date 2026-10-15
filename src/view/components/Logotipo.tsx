import { Text } from "react-native";
import { fontFamily, tokens } from "@/view/tokens";

export type LogotipoProps = {
  inverse?: boolean;
};

/** Logotipo da marca (design-system/04-componentes/logotipo.md): "IpêBook" em Source Serif 4 Bold. */
export function Logotipo({ inverse = false }: LogotipoProps) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: fontFamily.brand,
        fontSize: 24,
        color: inverse ? tokens.colors.cover.text : tokens.colors.brandBrown,
      }}
    >
      IpêBook
    </Text>
  );
}

export default Logotipo;
