import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens } from "@/view/tokens";

export type OfflineStateProps = {
  onRetry: () => void;
  message?: string;
  retryLabel?: string;
};

/**
 * Estado "sem conexão" do design system (design-system/04-componentes/estados-do-sistema.md).
 * Usado quando o app detecta perda de conectividade de rede. Apenas avisa — não opera offline
 * (sem cache local nem fila de ações pendentes) e nunca tenta de novo sozinho.
 */
export function OfflineState({
  onRetry,
  message = "Você está sem conexão com a internet.",
  retryLabel = "Tentar novamente",
}: OfflineStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppIcon name="wifiOff" color={tokens.colors.secondaryText} />
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
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  retryText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.action,
    fontWeight: "600",
  },
});

export default OfflineState;
