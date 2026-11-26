import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { triggerHaptic } from "@/view/haptics";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * Controle segmentado no padrão iOS 26 (Figma `Prancha iOS 26 · Segmented Control` e `18 · Conversas`),
 * preservando alvo de toque >= 44pt, semântica `tablist`/`tab` e feedback háptico no iPhone.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testID,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={styles.track}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                if (Platform.OS === "ios") triggerHaptic("selection");
                onChange(option.value);
              }
            }}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentActive,
              pressed && !selected && styles.segmentPressed,
            ]}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={[styles.label, selected && styles.labelActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  const isIos = Platform.OS === "ios";
  return StyleSheet.create({
    track: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: isIos ? tokens.radius.segmentInner + 2 : tokens.radius.full,
      ...(isIos ? { borderCurve: "continuous" as const } : {}),
      padding: tokens.spacing[4],
      gap: tokens.spacing[4],
    },
    segment: {
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: isIos ? tokens.radius.segmentInner : tokens.radius.full,
      ...(isIos ? { borderCurve: "continuous" as const } : {}),
      alignItems: "center",
      justifyContent: "center",
    },
    segmentActive: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      ...(isIos
        ? {
            shadowColor: colors.m3.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
          }
        : { elevation: 1 }),
    },
    segmentPressed: {
      opacity: 0.78,
    },
    label: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.medium,
      textAlign: "center",
    },
    labelActive: {
      color: isIos ? colors.action : colors.m3.onSurface,
      fontWeight: tokens.fontWeight.bold,
    },
  });
}

export default SegmentedControl;
