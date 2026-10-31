import { useMemo } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useExpressivePress } from "@/view/useExpressivePress";

export type TextButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  tone?: "default" | "danger";
};

/**
 * Botão de texto do design system (botao.md): ação discreta, como "Esqueci minha senha" ou
 * "Voltar ao início". A variante `danger` é usada só em ação destrutiva já confirmada em diálogo.
 */
export function TextButton({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  tone = "default",
}: TextButtonProps) {
  const guardedPress = useGuardedPress(onPress);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({ disabled, pressedScale: 0.96 });
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={guardedPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.button, isPressed && !disabled && styles.buttonPressed]}
      >
        <Text
          style={[
            styles.label,
            tone === "danger" && styles.labelDanger,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.shapeMorph.buttonRest,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    buttonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
    },
    label: {
      color: colors.m3.primary,
      ...tokens.typography.labelLarge,
    },
    labelDanger: { color: colors.error },
    labelDisabled: {
      color: colors.disabledText,
      ...(Platform.OS === "web" ? ({ cursor: "not-allowed" } as never) : {}),
    },
  });
}

export default TextButton;
