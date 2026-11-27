import { Platform, StyleSheet, type ColorValue, type StyleProp, type ViewStyle } from "react-native";
import { useReduceTransparency } from "@/view/useReduceTransparency";

function nativeGlass() {
  if (Platform.OS !== "ios") return null;
  try {
    const glass = require("expo-glass-effect") as typeof import("expo-glass-effect");
    return glass.isLiquidGlassAvailable() && glass.isGlassEffectAPIAvailable() ? glass : null;
  } catch {
    // Clientes de desenvolvimento sem o módulo usam a superfície opaca.
    return null;
  }
}

/** Inclui clientes sem o módulo e versões do iOS sem a API no caminho de superfície opaca. */
export function useOpaqueIosSurfaces(): boolean {
  const reduceTransparency = useReduceTransparency();
  return Platform.OS === "ios" && (reduceTransparency || !nativeGlass());
}

/** Material decorativo. O controle que o hospeda responde pelo toque e pelo VoiceOver. */
export function IosGlassBackdrop({
  style,
  testID = "ios-native-glass",
  tintColor,
  isInteractive = false,
  colorScheme = "light",
}: {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  tintColor?: ColorValue;
  isInteractive?: boolean;
  colorScheme?: "light" | "dark";
}) {
  const glass = nativeGlass();
  if (!glass) return null;

  return (
    <glass.GlassView
      testID={testID}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      aria-hidden
      glassEffectStyle="regular"
      colorScheme={colorScheme}
      tintColor={tintColor}
      isInteractive={isInteractive}
      style={[StyleSheet.absoluteFill, styles.corner, style]}
    />
  );
}

const styles = StyleSheet.create({
  corner: { borderCurve: "continuous" },
});
