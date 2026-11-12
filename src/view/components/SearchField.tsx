import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
};

/** Campo de busca M3 Expressive (campo-de-busca.md): pílula com destaque de foco e botão Limpar elástico. */
export function SearchField({ value, onChangeText, placeholder = "Buscar título, autor ou categoria", onSubmitEditing }: SearchFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <AppIcon name="search" size={24} color={focused ? colors.m3.primary : colors.secondaryText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        accessibilityLabel="Buscar livros"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
          onPress={() => onChangeText("")}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      height: tokens.spacing[56],
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.full,
      borderWidth: 1.5,
      borderColor: "transparent",
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    containerFocused: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      borderColor: colors.m3.primary,
    },
    input: { flex: 1, ...tokens.typography.bodyLarge, color: colors.text },
    clearButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.buttonRest,
      justifyContent: "center",
      alignItems: "center",
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    clearButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainer,
      transform: [{ scale: 0.9 }],
    },
    clearIcon: { color: colors.secondaryText, fontSize: tokens.fontSize[16] },
  });
}

export default SearchField;
