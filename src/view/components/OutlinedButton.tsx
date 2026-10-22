import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type OutlinedButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
};

/**
 * Botão contornado do design system (botao.md): ação alternativa à principal, como
 * "Voltar ao login" ou "Já tenho conta". Nunca concorre com o botão preenchido.
 */
export function OutlinedButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  accessibilityLabel,
}: OutlinedButtonProps) {
  const isDisabled = disabled || loading;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.button, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.action} accessibilityLabel={loadingLabel ?? label} />
      ) : (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      backgroundColor: "transparent",
      paddingHorizontal: tokens.spacing[24],
    },
    disabled: { borderColor: colors.disabledBackground },
    label: {
      color: colors.action,
      fontSize: tokens.typography.bodyLarge.fontSize,
      fontFamily: tokens.typography.bodyLarge.fontFamily,
      fontWeight: "600",
    },
    labelDisabled: { color: colors.disabledText },
  });
}

export default OutlinedButton;
