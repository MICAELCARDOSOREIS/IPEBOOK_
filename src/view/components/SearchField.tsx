import { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
};

/** Campo de busca do design system (campo-de-busca.md): pílula com botão Limpar. */
export function SearchField({ value, onChangeText, placeholder = "Buscar título, autor ou categoria", onSubmitEditing }: SearchFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
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
          style={styles.clearButton}
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
      height: 56,
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
    },
    input: { flex: 1, color: colors.text, fontSize: tokens.typography.bodyLarge.fontSize },
    clearButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    clearIcon: { color: colors.secondaryText, fontSize: 16 },
  });
}

export default SearchField;
