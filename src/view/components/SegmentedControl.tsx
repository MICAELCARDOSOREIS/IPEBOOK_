import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
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
 * Controle segmentado adaptativo por plataforma:
 * - iOS: estilo iOS 26 (Liquid Glass com fallback opaco, cantos contínuos e háptica).
 * - Android / Web: Material Design 3 Segmented Button (pílula com borda outline, divisores,
 *   preenchimento `secondaryContainer` e ícone de verificação no segmento ativo).
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
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const nativeGlass = isIos && !opaqueIos;

  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={styles.track}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const showM3Divider = !isIos && index > 0;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                if (isIos) triggerHaptic("selection");
                onChange(option.value);
              }
            }}
            style={({ pressed }) => [
              styles.segment,
              showM3Divider && styles.segmentDivider,
              selected && (nativeGlass ? styles.segmentGlass : styles.segmentActive),
              pressed && !selected && styles.segmentPressed,
            ]}
          >
            {selected && nativeGlass ? <IosGlassBackdrop style={styles.segmentGlass} /> : null}
            {!isIos && selected ? (
              <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} />
            ) : null}
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
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isIos ? colors.m3.surfaceContainer : colors.surface,
      borderRadius: isIos ? tokens.radius.segmentInner + 2 : tokens.radius.full,
      ...(isIos
        ? { borderCurve: "continuous" as const, padding: tokens.spacing[4], gap: tokens.spacing[4] }
        : { borderWidth: 1, borderColor: colors.m3.outline, overflow: "hidden" as const }),
    },
    segment: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      gap: tokens.spacing[6],
      minHeight: isIos ? tokens.accessibility.touchTarget : 44,
      paddingHorizontal: isIos ? tokens.spacing[12] : tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      borderRadius: isIos ? tokens.radius.segmentInner : 0,
      ...(isIos ? { borderCurve: "continuous" as const } : {}),
      alignItems: "center",
      justifyContent: "center",
    },
    segmentDivider: {
      borderLeftWidth: 1,
      borderLeftColor: colors.m3.outline,
    },
    segmentActive: {
      backgroundColor: isIos ? colors.m3.surfaceContainerLowest : colors.m3.secondaryContainer,
      ...(isIos
        ? {
            shadowColor: colors.m3.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
          }
        : {}),
    },
    segmentGlass: { borderRadius: tokens.radius.segmentInner },
    segmentPressed: {
      opacity: 0.78,
    },
    label: {
      ...tokens.typography.labelLarge,
      flexShrink: 1,
      color: isIos ? colors.m3.onSurfaceVariant : colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
      textAlign: "center",
    },
    labelActive: {
      color: isIos ? colors.action : colors.m3.onSecondaryContainer,
      fontWeight: isIos ? tokens.fontWeight.bold : tokens.fontWeight.semiBold,
    },
  });
}

export default SegmentedControl;
