import { useMemo, type ReactNode } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { triggerHaptic } from "@/view/haptics";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useExpressivePress } from "@/view/useExpressivePress";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";

export type OutlinedButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
  /** Ícone exibido à esquerda do rótulo (ex.: GoogleLogo). */
  icon?: ReactNode;
};

/**
 * Botão contornado do design system (botao.md): ação alternativa à principal, com resposta
 * M3 Expressive (mola e shape morphing).
 */
export function OutlinedButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  accessibilityLabel,
  icon,
}: OutlinedButtonProps) {
  const isDisabled = disabled || loading;
  const guardedPress = useGuardedPress(() => {
    if (Platform.OS === "ios") triggerHaptic("light");
    onPress();
  });
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({ disabled: isDisabled });
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const reduceTransparency = useOpaqueIosSurfaces();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, Platform.OS === "ios" && !isDisabled && styles.iosShadow]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={loading ? { disabled: isDisabled, busy: true } : { disabled: isDisabled }}
        disabled={isDisabled}
        onPress={guardedPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          Platform.OS === "ios" && !isDisabled && (reduceTransparency ? styles.iosOpaque : styles.iosGlass),
          Boolean(icon) && styles.buttonWithIcon,
          isPressed && !isDisabled && Platform.OS !== "ios" && styles.pressedShape,
          isDisabled && styles.disabled,
        ]}
      >
        {Platform.OS === "ios" && !reduceTransparency && !isDisabled ? (
          <IosGlassBackdrop isInteractive style={styles.iosGlassShape} testID="outlined-button-glass" />
        ) : null}
        {loading ? (
          <ActivityIndicator color={colors.action} accessibilityLabel={loadingLabel ?? label} />
        ) : (
          <View style={styles.contentRow}>
            {icon ? (
              <View accessible={false} aria-hidden={true}>
                {icon}
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={[styles.label, isDisabled && styles.labelDisabled]}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      minHeight: 52,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.shapeMorph.buttonRest,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      backgroundColor: "transparent",
      paddingHorizontal: Platform.OS === "ios" ? tokens.spacing[14] : tokens.spacing[24],
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    iosGlass: {
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    iosOpaque: {
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderColor: colors.m3.outlineVariant,
    },
    iosShadow: {
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
    },
    iosGlassShape: {
      ...StyleSheet.absoluteFill,
      overflow: "hidden",
      borderRadius: tokens.radius.full,
    },
    buttonWithIcon: {
      paddingLeft: tokens.spacing[16],
      paddingRight: tokens.spacing[24],
    },
    pressedShape: {
      borderRadius: tokens.shapeMorph.buttonPressed,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[12],
    },
    disabled: {
      borderColor: colors.disabledBackground,
      ...(Platform.OS === "web" ? ({ cursor: "not-allowed" } as never) : {}),
    },
    label: {
      color: colors.m3.onSurface,
      ...tokens.typography.labelLarge,
    },
    labelDisabled: { color: colors.disabledText },
  });
}

export default OutlinedButton;
