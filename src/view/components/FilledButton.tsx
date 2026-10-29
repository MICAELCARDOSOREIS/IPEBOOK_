import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

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
        <ActivityIndicator color={colors.surface} accessibilityLabel={loadingLabel ?? label} />
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
      backgroundColor: colors.action,
      paddingHorizontal: tokens.spacing[24],
    },
    disabled: { backgroundColor: colors.disabledBackground },
    label: { color: colors.surface, fontSize: 16, fontWeight: "600" },
    labelDisabled: { color: colors.disabledText },
  });
}

export default FilledButton;
