import type { GlassViewProps } from "expo-glass-effect";
import { View } from "react-native";

export const isLiquidGlassAvailable = jest.fn(() => true);
export const isGlassEffectAPIAvailable = jest.fn(() => true);

export function GlassView(props: GlassViewProps) {
  return <View {...props} />;
}
