import { Pressable, StyleSheet, Text } from "react-native";
import { tokens } from "@/view/tokens";

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
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
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
  },
  label: {
    color: tokens.colors.action,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
  },
  labelDanger: { color: tokens.colors.error },
  labelDisabled: { color: tokens.colors.disabledText },
});

export default TextButton;
