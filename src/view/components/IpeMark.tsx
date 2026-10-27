import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type IpeMarkProps = {
  /** Largura e altura em dp; o desenho escala proporcionalmente. */
  size?: number;
  testID?: string;
};

/** Copa do ipê em unidades de 0 a 1: [x do centro, y do centro, raio, flor profunda?]. */
const CANOPY: readonly (readonly [number, number, number, boolean])[] = [
  [0.5, 0.2, 0.15, false],
  [0.33, 0.27, 0.12, true],
  [0.67, 0.27, 0.12, true],
  [0.36, 0.22, 0.11, false],
  [0.64, 0.22, 0.11, false],
  [0.22, 0.43, 0.11, false],
  [0.78, 0.43, 0.11, false],
  [0.5, 0.31, 0.1, true],
];

/**
 * Ipê amarelo brotando de um livro aberto, versão desenhada do logotipo (`assets/logo-clean.png`),
 * feita só com `View` para não exigir dependência de SVG (Spec 078). Puramente decorativo.
 */
export function IpeMark({ size = 64, testID }: IpeMarkProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, size), [colors, size]);

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      pointerEvents="none"
      style={styles.box}
    >
      <View style={styles.trunk} />
      <View style={[styles.page, styles.pageLeft]} />
      <View style={[styles.page, styles.pageRight]} />
      {CANOPY.map(([x, y, r, deep], index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            left: (x - r) * size,
            top: (y - r) * size,
            width: r * 2 * size,
            height: r * 2 * size,
            borderRadius: r * size,
            backgroundColor: deep ? colors.ipe.bloomDeep : colors.ipe.bloom,
          }}
        />
      ))}
    </View>
  );
}

function createStyles(colors: ColorPalette, size: number) {
  const stroke = Math.max(2, size * 0.055);
  return StyleSheet.create({
    box: { width: size, height: size },
    trunk: {
      position: "absolute",
      left: size / 2 - stroke / 2,
      top: size * 0.3,
      width: stroke,
      height: size * 0.56,
      borderRadius: stroke,
      backgroundColor: colors.ipe.trunk,
    },
    // Páginas do livro aberto: contorno em "U" achatado de cada lado, unidas no centro.
    page: {
      position: "absolute",
      top: size * 0.4,
      width: size * 0.42,
      height: size * 0.44,
      borderColor: colors.ipe.trunk,
      borderLeftWidth: stroke,
      borderBottomWidth: stroke,
      borderRightWidth: 0,
      borderTopWidth: 0,
    },
    pageLeft: {
      left: size * 0.08,
      borderBottomLeftRadius: size * 0.08,
      borderBottomRightRadius: size * 0.2,
    },
    pageRight: {
      right: size * 0.08,
      borderLeftWidth: 0,
      borderRightWidth: stroke,
      borderBottomRightRadius: size * 0.08,
      borderBottomLeftRadius: size * 0.2,
    },
  });
}
