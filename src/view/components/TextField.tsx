import { useId, useMemo, useState } from "react";
import type { KeyboardTypeOptions, ReturnKeyTypeOptions, TextInputProps } from "react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

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
  /** Alinhamento do texto de suporte. `right` é o contador de `04.05` (`39/280` à direita). */
  helperTextAlign?: "left" | "right";
  /** Sugestão para gerenciadores de senha e preenchimento automático (e-mail, nome, senha atual ou nova). */
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  /** "next" nos campos intermediários e "done" no último: o teclado mostra a ação certa. */
  returnKeyType?: ReturnKeyTypeOptions;
  /** Toque na ação do teclado; no último campo costuma enviar o formulário. */
  onSubmitEditing?: () => void;
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
  helperTextAlign = "left",
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  // Campo de senha ganha o olho de mostrar/ocultar (some a dúvida de ter digitado errado no celular).
  const [revealed, setRevealed] = useState(false);
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
          secureTextEntry={secureTextEntry && !revealed}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCorrect={secureTextEntry ? false : undefined}
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
          style={[styles.input, multiline && styles.inputMultiline, secureTextEntry && styles.inputWithToggle]}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Ocultar senha" : "Mostrar senha"}
            accessibilityState={{ selected: revealed }}
            hitSlop={8}
            onPress={() => setRevealed((current) => !current)}
            style={styles.toggle}
          >
            <AppIcon name={revealed ? "visibilityOff" : "visibility"} size={22} color={colors.m3.onSurfaceVariant} />
          </Pressable>
        ) : null}
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
        <Text
          nativeID={errorId}
          accessibilityRole="alert"
          style={[styles.errorText, helperTextAlign === "right" && styles.supportingRight]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, helperTextAlign === "right" && styles.supportingRight]}>
          {helperText}
        </Text>
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
    inputWithToggle: { paddingRight: tokens.spacing[48] },
    toggle: {
      position: "absolute",
      right: tokens.spacing[4],
      top: 0,
      bottom: 0,
      width: tokens.spacing[48],
      alignItems: "center",
      justifyContent: "center",
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
    // Figma `04.05`: contador e texto de suporte alinhados à direita do campo.
    supportingRight: { textAlign: "right" },
  });
}

export default TextField;
