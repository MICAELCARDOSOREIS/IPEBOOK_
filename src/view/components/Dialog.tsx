import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

export type DialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Token scrim de design-system/04-componentes/dialogo.md (#00000052).
 * Véu translúcido escuro que cobre o conteúdo atrás do diálogo.
 */
const SCRIM_COLOR = "#00000052";

/**
 * Diálogo do design system (design-system/04-componentes/dialogo.md).
 * Usado para confirmação de ações irreversíveis ou destrutivas (ex: exclusão de anúncio).
 */
export function Dialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
      aria-modal
    >
      <View style={styles.scrim}>
        <Pressable
          accessibilityRole="none"
          accessibilityLabel="Fechar diálogo"
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
        />
        <View
          accessibilityRole="alert"
          accessibilityLabel={title}
          style={styles.card}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              accessibilityState={{ disabled: loading }}
              disabled={loading}
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: loading }}
              disabled={loading}
              onPress={onConfirm}
              style={[
                styles.confirmButton,
                destructive ? styles.confirmDestructive : styles.confirmDefault,
                loading && styles.confirmDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={tokens.colors.surface} />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: SCRIM_COLOR,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing[24],
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.extraLarge,
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
    // Elevação M3 level 3 (design-system/04-componentes/dialogo.md)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    color: tokens.colors.text,
    ...tokens.typography.titleMedium,
  },
  message: {
    color: tokens.colors.secondaryText,
    ...tokens.typography.bodyMedium,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[8],
  },
  cancelButton: {
    minHeight: tokens.accessibility.touchTarget,
    minWidth: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    borderRadius: tokens.radius.full,
  },
  cancelText: {
    color: tokens.colors.action,
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
  },
  confirmButton: {
    minHeight: tokens.accessibility.touchTarget,
    minWidth: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[20],
    borderRadius: tokens.radius.full,
  },
  confirmDefault: {
    backgroundColor: tokens.colors.action,
  },
  confirmDestructive: {
    backgroundColor: tokens.colors.error,
  },
  confirmDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: tokens.colors.surface,
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
  },
});

export default Dialog;
