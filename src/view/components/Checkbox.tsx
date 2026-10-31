import { useId, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string | null;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/**
 * Caixa de seleção do design system (caixa-de-selecao.md): escolha binária independente, como o
 * aceite dos termos no cadastro. A área de toque cobre a caixa e o rótulo (48 dp).
 */
export function Checkbox({
  label,
  checked,
  onChange,
  description,
  error,
  disabled = false,
  accessibilityLabel,
}: CheckboxProps) {
  const errorId = useId();
  const hasError = Boolean(error);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ checked, disabled }}
        accessibilityHint={hasError ? error ?? undefined : description}
        aria-describedby={hasError ? errorId : undefined}
        disabled={disabled}
        onPress={() => onChange(!checked)}
        style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
      >
        <AppIcon
          name={checked ? "checkboxOn" : "checkboxOff"}
          size={24}
          color={
            disabled
              ? colors.disabledText
              : checked
                ? colors.action
                : hasError
                  ? colors.error
                  : colors.m3.outline
          }
        />
        <View style={styles.texts}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </Pressable>
      {hasError ? (
        <Text nativeID={errorId} accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrapper: { gap: tokens.spacing[4] },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    rowPressed: {
      transform: [{ scale: 0.98 }],
    },
    texts: { flex: 1, gap: tokens.spacing[2] },
    label: {
      ...tokens.typography.bodyLarge,
      color: colors.text,
    },
    labelDisabled: { color: colors.disabledText },
    description: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    error: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}

export default Checkbox;
