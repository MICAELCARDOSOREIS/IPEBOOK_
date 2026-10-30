import { useMemo, type ReactNode } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useExpressivePress } from "@/view/useExpressivePress";

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
  const guardedPress = useGuardedPress(onPress);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({ disabled: isDisabled });
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={guardedPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          isPressed && !isDisabled && styles.pressedShape,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.action} accessibilityLabel={loadingLabel ?? label} />
        ) : (
          <View style={styles.contentRow}>
            {icon}
            <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      // Figma `01.03`/`01.04`: mesmo tamanho do preenchido, borda `outline-variant` de 1 dp.
      minHeight: 52,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.shapeMorph.buttonRest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: "transparent",
      paddingHorizontal: tokens.spacing[24],
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
    disabled: { borderColor: colors.disabledBackground },
    label: {
      color: colors.m3.onSurface,
      ...tokens.typography.labelLarge,
    },
    labelDisabled: { color: colors.disabledText },
  });
}

export default OutlinedButton;
