import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "@/view/tokens";

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

/** Campo de busca do design system (campo-de-busca.md): pílula com botão Limpar. */
export function SearchField({ value, onChangeText, placeholder = "Busque por título ou autor" }: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: tokens.colors.soft,
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[16],
  },
  input: { flex: 1, color: tokens.colors.text, fontSize: tokens.typography.bodyLarge.fontSize },
  clearButton: {
    minHeight: tokens.accessibility.touchTarget,
    minWidth: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  clearIcon: { color: tokens.colors.secondaryText, fontSize: 16 },
});

export default SearchField;
