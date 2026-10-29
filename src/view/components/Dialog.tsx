import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type FocusableElement = { focus: () => void };

function focusSafely(element: FocusableElement | null | undefined): void {
  if (element != null && typeof element.focus === "function") element.focus();
}

function isFocusable(el: FocusableElement | null): el is HTMLElement & FocusableElement {
  return el != null && typeof el.focus === "function" && (el as unknown as HTMLElement).tabIndex >= 0;
}

/**
 * Decide para onde o foco deve ir quando Tab/Shift+Tab é pressionado dentro do
 * diálogo, prendendo-o entre o primeiro e o último elemento focável (ciclo).
 * Função pura para ser testável sem depender de refs/DOM reais.
 */
export function resolveDialogTabWrap(
  focusables: readonly FocusableElement[],
  activeElement: unknown,
  event: { shiftKey?: boolean },
): FocusableElement | null {
  if (focusables.length === 0) return null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && activeElement === first) return last;
  if (!event.shiftKey && activeElement === last) return first;
  return null;
}

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
 * Véu translúcido escuro que cobre o conteúdo atrás do diálogo — mesmo valor nos dois temas
 * (`design-system/tokens.json`: "scrim" varia pouco entre claro/escuro, dentro da tolerância).
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
  const cancelRef = useRef<FocusableElement | null>(null);
  const confirmRef = useRef<FocusableElement | null>(null);
  const triggerRef = useRef<FocusableElement | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Gestão de foco (Web): o diálogo prende o foco enquanto aberto e o devolve ao
  // gatilho ao fechar (design-system/06-acessibilidade.md e 04-componentes/dialogo.md).
  // Native (iOS/Android) já recebe isso do leitor de tela via accessibilityViewIsModal.
  const isWeb = Platform.OS === "web" && typeof document !== "undefined";

  useEffect(() => {
    if (!isWeb) return;
    if (visible) {
      triggerRef.current = (document.activeElement as unknown as FocusableElement) ?? null;
      const firstFocusable = loading ? null : cancelRef.current ?? confirmRef.current;
      focusSafely(firstFocusable);
    } else {
      focusSafely(triggerRef.current);
      triggerRef.current = null;
    }
  }, [visible, loading, isWeb]);

  useEffect(() => {
    if (!isWeb || !visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = [cancelRef.current, confirmRef.current].filter(isFocusable);
      const next = resolveDialogTabWrap(focusables, document.activeElement, event);
      if (next) {
        event.preventDefault();
        focusSafely(next);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      if (typeof document !== "undefined") document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [visible, onCancel, isWeb]);

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
              ref={cancelRef as never}
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
              ref={confirmRef as never}
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
                <ActivityIndicator color={colors.surface} />
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
      backgroundColor: colors.surface,
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
      color: colors.text,
      ...tokens.typography.titleMedium,
    },
    message: {
      color: colors.secondaryText,
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
      color: colors.action,
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
      backgroundColor: colors.action,
    },
    confirmDestructive: {
      backgroundColor: colors.error,
    },
    confirmDisabled: {
      opacity: 0.6,
    },
    confirmText: {
      color: colors.surface,
      ...tokens.typography.bodyMedium,
      fontWeight: "600",
    },
  });
}

export default Dialog;
