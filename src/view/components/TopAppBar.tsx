import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

export type TopAppBarProps = {
  title: string;
  onBack: () => void;
};

/** Barra superior do design system (barra-superior.md): botão voltar + nome da tela. */
export function TopAppBar({ title, onBack }: TopAppBarProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={12}
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: tokens.spacing[12],
  },
  backButton: {
    minHeight: tokens.accessibility.touchTarget,
    minWidth: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 20, color: tokens.colors.action },
  title: { marginLeft: tokens.spacing[12], color: tokens.colors.text, ...tokens.typography.titleMedium },
});

export default TopAppBar;
