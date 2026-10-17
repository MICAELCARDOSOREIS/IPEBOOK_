import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

export type SnackbarProps = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
};

/**
 * Componente Snackbar do Design System do IpêBook (design-system/04-componentes/snackbar.md).
 * Feedback não intrusivo com suporte a acessibilidade e ação reversível opcional.
 */
export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
}: SnackbarProps) {
  useEffect(() => {
    if (!visible || !onDismiss || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, onDismiss, duration]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.message}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#322F2B",
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[12],
    marginVertical: tokens.spacing[8],
    gap: tokens.spacing[12],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    flex: 1,
    color: "#F5EFE8",
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[12],
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  actionText: {
    color: "#CFE9D7",
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: "bold",
  },
});
