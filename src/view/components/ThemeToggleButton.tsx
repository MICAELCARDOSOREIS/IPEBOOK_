import { Pressable, StyleSheet } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";

/** Botão de ícone do topo que alterna entre tema claro e escuro (Spec 108, site). */
export function ThemeToggleButton() {
  const { colors, resolvedScheme, setPreference } = useTheme();
  const dark = resolvedScheme === "dark";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dark ? "Usar tema claro" : "Usar tema escuro"}
      onPress={() => void setPreference(dark ? "light" : "dark")}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        { backgroundColor: pressed ? colors.m3.surfaceContainerHighest : colors.m3.surfaceContainerHigh },
      ]}
    >
      <AppIcon name={dark ? "lightMode" : "darkMode"} size={22} color={colors.m3.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: tokens.spacing[48],
    height: tokens.spacing[48],
    borderRadius: tokens.shapeMorph.buttonRest,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    borderRadius: tokens.shapeMorph.buttonPressed,
    transform: [{ scale: 0.92 }],
  },
});
