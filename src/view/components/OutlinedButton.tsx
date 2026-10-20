import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "@/view/tokens";

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
        <ActivityIndicator color={tokens.colors.action} accessibilityLabel={loadingLabel ?? label} />
      ) : (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outline,
    backgroundColor: "transparent",
    paddingHorizontal: tokens.spacing[24],
  },
  disabled: { borderColor: tokens.colors.disabledBackground },
  label: {
    color: tokens.colors.action,
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    fontWeight: "600",
  },
  labelDisabled: { color: tokens.colors.disabledText },
});

export default OutlinedButton;
