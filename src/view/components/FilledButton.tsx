import { useMemo } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useExpressivePress } from "@/view/useExpressivePress";

export type FilledButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
};

/** Botão preenchido do design system (botao.md): pílula com resposta M3 Expressive (mola e shape morphing). */
export function FilledButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  accessibilityLabel,
}: FilledButtonProps) {
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
          <ActivityIndicator color={colors.surface} accessibilityLabel={loadingLabel ?? label} />
        ) : (
          <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      // Figma `01.03`/`01.04`: botão preenchido com 52 dp de altura e raio de pílula.
      minHeight: 52,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.shapeMorph.buttonRest,
      backgroundColor: colors.action,
      paddingHorizontal: tokens.spacing[24],
    },
    pressedShape: {
      borderRadius: tokens.shapeMorph.buttonPressed,
    },
    disabled: { backgroundColor: colors.disabledBackground },
    label: { color: colors.m3.onPrimary, ...tokens.typography.labelLarge },
    labelDisabled: { color: colors.disabledText },
  });
}

export default FilledButton;
