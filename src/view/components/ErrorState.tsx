import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens } from "@/view/tokens";

export type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

/**
 * Estado de erro genérico do design system (design-system/04-componentes/estados-do-sistema.md).
 * Usado quando uma chamada a datasource falha (erro do servidor, dado inválido). A ação de
 * tentar de novo é sempre explícita (botão), nunca automática.
 */
export function ErrorState({ message, onRetry, retryLabel = "Tentar novamente" }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppIcon name="error" color={tokens.colors.error} />
        <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
        <Text style={styles.retryText}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing[16],
    alignItems: "flex-start",
    paddingVertical: tokens.spacing[24],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  message: {
    flex: 1,
    color: tokens.colors.secondaryText,
    ...tokens.typography.bodyMedium,
  },
  retry: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[20],
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.action,
  },
  retryText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.surface,
    fontWeight: "600",
  },
});

export default ErrorState;
