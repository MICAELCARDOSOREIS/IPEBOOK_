import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "@/view/tokens";

export type FilledButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
};

/** Botão preenchido do design system (botao.md): pílula, uma única ação principal por tela. */
export function FilledButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  loadingLabel,
  accessibilityLabel,
}: FilledButtonProps) {
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
        <ActivityIndicator color={tokens.colors.surface} accessibilityLabel={loadingLabel ?? label} />
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
    backgroundColor: tokens.colors.action,
    paddingHorizontal: tokens.spacing[24],
  },
  disabled: { backgroundColor: tokens.colors.disabledBackground },
  label: { color: tokens.colors.surface, fontSize: 16, fontWeight: "600" },
  labelDisabled: { color: tokens.colors.disabledText },
});

export default FilledButton;
