import { useId, useState } from "react";
import type { KeyboardTypeOptions } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "@/view/tokens";

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
};

/** Campo de texto do design system (campo-de-texto.md): rótulo sempre visível, estado de foco e erro. */
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
  placeholderTextColor = tokens.colors.secondaryText,
  maxLength,
  accessibilityLabel,
  multiline = false,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const errorId = useId();
  const accentColor = hasError ? tokens.colors.error : focused ? tokens.colors.action : tokens.colors.secondaryText;
  const borderColor = hasError ? tokens.colors.error : focused ? tokens.colors.action : tokens.colors.border;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
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
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 4 : undefined}
        textAlignVertical={multiline ? "top" : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { borderColor, borderWidth: focused || hasError ? 2 : 1 },
          multiline && styles.multiline,
          !editable && styles.disabled,
        ]}
      />
      {hasError ? (
        <Text nativeID={errorId} accessibilityRole="alert" style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: tokens.spacing[6] },
  label: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
  input: {
    minHeight: tokens.accessibility.touchTarget,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[12],
    color: tokens.colors.text,
    backgroundColor: tokens.colors.surface,
    fontSize: tokens.typography.bodyLarge.fontSize,
  },
  multiline: { minHeight: tokens.spacing[64] + tokens.spacing[32], paddingVertical: tokens.spacing[12] },
  disabled: { opacity: 0.38 },
  errorText: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
  helperText: { color: tokens.colors.secondaryText, fontSize: tokens.typography.labelMedium.fontSize },
});

export default TextField;
