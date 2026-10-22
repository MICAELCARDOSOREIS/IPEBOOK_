import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type LoadingStateProps = {
  /** Nome acessível, sem reticências (ex: "Carregando livros"). */
  label?: string;
};

/**
 * Estado de carregamento padrão do design system (design-system/04-componentes/estados-do-sistema.md).
 * Usado em listas que buscam dados de um datasource (Explorar, Estante, Conversas etc.).
 */
export function LoadingState({ label = "Carregando" }: LoadingStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.action} accessibilityLabel={label} />
      <Text style={styles.label}>{label}…</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[48],
    },
    label: {
      color: colors.secondaryText,
      ...tokens.typography.bodyMedium,
    },
  });
}

export default LoadingState;
