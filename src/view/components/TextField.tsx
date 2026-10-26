import { useId, useMemo, useState } from "react";
import type { KeyboardTypeOptions } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  helperText?: string;
  placeholder?: string;
  placeholderTextColor?: string;
  maxLength?: number;
  accessibilityLabel?: string;
  /** Campo de várias linhas, como a descrição de `04.05` (Spec 043, RN-08). */
  multiline?: boolean;
  /** Fundo atrás do rótulo flutuante; precisa ser o mesmo do contêiner que hospeda o campo. */
  labelBackgroundColor?: string;
};

/**
 * Campo de texto do design system (campo-de-texto.md), Material 3 contornado como no Figma
 * (`01.03`, `01.06`, `04.05`): contêiner de 56 dp com raio de 4 dp, rótulo flutuante sobre a
 * borda quando há foco ou valor e rótulo dentro do campo quando está vazio.
 */
export function TextField({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  editable = true,
  helperText,
  placeholder,
  placeholderTextColor,
  maxLength,
  accessibilityLabel,
  multiline = false,
  labelBackgroundColor,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const errorId = useId();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasValue = value.length > 0;
  const floating = focused || hasValue;
  const accentColor = hasError ? colors.error : focused ? colors.action : colors.m3.onSurfaceVariant;
  const borderColor = hasError ? colors.error : focused ? colors.action : colors.m3.outline;

  return (
    <View style={styles.field}>
      <View
        style={[
          styles.container,
          { borderColor, borderWidth: focused || hasError ? 2 : 1 },
          multiline && styles.containerMultiline,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={hasError ? error ?? undefined : undefined}
          aria-describedby={hasError ? errorId : undefined}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
          placeholder={floating ? placeholder : undefined}
          placeholderTextColor={placeholderTextColor ?? colors.m3.onSurfaceVariant}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? 4 : undefined}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {floating ? (
          <View
            pointerEvents="none"
            style={[styles.notch, { backgroundColor: labelBackgroundColor ?? colors.background }]}
          >
            <Text style={[styles.floatingLabel, { color: accentColor }]}>{label}</Text>
          </View>
        ) : (
          <Text
            pointerEvents="none"
            style={[
              styles.restingLabel,
              multiline && styles.restingLabelMultiline,
              { color: placeholderTextColor ?? colors.m3.onSurfaceVariant },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
      {hasError ? (
        <Text nativeID={errorId} accessibilityRole="alert" style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[4] },
    container: {
      minHeight: tokens.spacing[56],
      justifyContent: "center",
      borderRadius: tokens.radius.extraSmall,
      backgroundColor: "transparent",
    },
    containerMultiline: { minHeight: tokens.spacing[64] + tokens.spacing[32] },
    input: {
      minHeight: tokens.spacing[48],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      color: colors.m3.onSurface,
      ...tokens.typography.bodyLarge,
    },
    inputMultiline: {
      minHeight: tokens.spacing[64] + tokens.spacing[24],
      paddingTop: tokens.spacing[16],
    },
    notch: {
      position: "absolute",
      top: -8,
      left: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.extraSmall,
    },
    floatingLabel: { ...tokens.typography.labelMedium },
    restingLabel: {
      position: "absolute",
      left: tokens.spacing[16],
      right: tokens.spacing[16],
      ...tokens.typography.bodyLarge,
    },
    restingLabelMultiline: { top: tokens.spacing[16] },
    disabled: { opacity: 0.38 },
    errorText: {
      color: colors.error,
      paddingHorizontal: tokens.spacing[16],
      ...tokens.typography.labelMedium,
    },
    helperText: {
      color: colors.m3.onSurfaceVariant,
      paddingHorizontal: tokens.spacing[16],
      ...tokens.typography.labelMedium,
    },
  });
}

export default TextField;
