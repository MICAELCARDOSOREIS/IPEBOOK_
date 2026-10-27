import { Image, View } from "react-native";
import ipeMedalhao from "@/view/assets/ipe-medalhao.png";

export type IpeMarkProps = {
  /** Diâmetro em dp. */
  size?: number;
  testID?: string;
};

/**
 * Medalhão do ipê amarelo brotando de um livro aberto, em papel recortado (`src/view/assets/ipe-medalhao.png`,
 * arte enviada pelo usuário em 2026-10-26, Spec 078). Puramente decorativo.
 */
export function IpeMark({ size = 64, testID }: IpeMarkProps) {
  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      pointerEvents="none"
      style={{ width: size, height: size }}
    >
      <Image source={ipeMedalhao} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}
