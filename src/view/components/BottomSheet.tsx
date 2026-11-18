import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { type FocusableElement, useModalFocusTrap } from "@/view/components/Dialog";
import { triggerHaptic } from "@/view/haptics";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useReduceTransparency } from "@/view/useReduceTransparency";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  testID?: string;
  /** Estilo extra do container da folha */
  style?: StyleProp<ViewStyle>;
  /** Mostra botão 'Fechar' no topo */
  showCloseButton?: boolean;
  /** Referência opcional para foco inicial na Web */
  initialFocusRef?: React.RefObject<FocusableElement | null>;
};

/**
 * Componente BottomSheet unificado do design system (Apple HIG / Spec 137, Material 3):
 * - Cantos arredondados contínuos (tokens.radius.xxl = 28dp com borderCurve continuous no iOS)
 * - Drag handle superior acessível com gesto de arraste (swipe-down) para fechar, oculto no desktop
 * - No iOS, acabamento Liquid Glass com BlurView nativo e fallback sólido (surfaceContainer) quando Reduzir Transparência ativado
 * - Proteção de Safe Area (Home Indicator)
 * - Foco acessível com useModalFocusTrap, aria-modal e accessibilityViewIsModal
 * - Desvio de teclado interno com KeyboardAvoidingView próprio para superfícies modais
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  testID,
  style,
  showCloseButton = false,
  initialFocusRef,
}: BottomSheetProps) {
  const guardedClose = useGuardedPress(onClose);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const reduceTransparency = useReduceTransparency();
  const isIos = Platform.OS === "ios";
  const styles = useMemo(
    () => createStyles(colors, reduceTransparency),
    [colors, reduceTransparency],
  );

  const closeButtonRef = useRef<FocusableElement | null>(null);
  const sheetRef = useRef<View | null>(null);

  useModalFocusTrap(
    visible,
    () => {
      const elements: (FocusableElement | null)[] = [];
      if (initialFocusRef?.current) {
        elements.push(initialFocusRef.current);
      }
      if (Platform.OS === "web" && typeof document !== "undefined" && sheetRef.current) {
        const domNode = sheetRef.current as unknown as HTMLElement;
        if (typeof domNode?.querySelectorAll === "function") {
          const inner = Array.from(
            domNode.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );
          for (const el of inner) {
            if (!elements.includes(el as unknown as FocusableElement)) {
              elements.push(el as unknown as FocusableElement);
            }
          }
        }
      }
      if (closeButtonRef.current && !elements.includes(closeButtonRef.current)) {
        elements.push(closeButtonRef.current);
      }
      return elements;
    },
    guardedClose,
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gestureState) => gestureState.dy > 5,
        onPanResponderRelease: (_evt, gestureState) => {
          if (gestureState.dy > 50 || gestureState.vy > 0.4) {
            triggerHaptic("selection");
            guardedClose();
          }
        },
      }),
    [guardedClose],
  );

  return (
    <Modal
      testID={testID}
      accessibilityViewIsModal
      aria-modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={guardedClose}
    >
      <KeyboardAvoidingView
        behavior={isIos ? "padding" : undefined}
        style={[styles.scrim, wideWeb && styles.scrimWide]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ao tocar fora"
          onPress={guardedClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          ref={sheetRef as never}
          testID={testID ? `${testID}-container` : "bottom-sheet-container"}
          {...(Platform.OS === "web" ? ({ tabIndex: -1 } as never) : {})}
          style={[
            styles.sheet,
            wideWeb && styles.sheetWide,
            { paddingBottom: wideWeb ? tokens.spacing[24] : Math.max(tokens.spacing[16], insets.bottom + tokens.spacing[8]) },
            style,
          ]}
        >
          {isIos && !reduceTransparency ? (
            <BlurView
              pointerEvents="none"
              tint={colors.surface === "#FCFAF5" ? "light" : "dark"}
              intensity={60}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          {/* Drag handle superior estilo Apple HIG com gesto de arraste para fechar (oculto no desktop) */}
          {wideWeb ? null : (
            <View
              {...panResponder.panHandlers}
              style={styles.handleContainer}
              testID="bottom-sheet-drag-area"
            >
              <View
                accessible={false}
                importantForAccessibility="no"
                style={styles.handle}
                testID="bottom-sheet-handle"
              />
            </View>
          )}

          {title || showCloseButton ? (
            <View style={styles.header}>
              {title ? (
                <Text accessibilityRole="header" style={styles.title}>
                  {title}
                </Text>
              ) : (
                <View style={styles.headerSpacer} />
              )}
              {showCloseButton ? (
                <Pressable
                  ref={closeButtonRef as never}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                  onPress={guardedClose}
                  hitSlop={8}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                >
                  <AppIcon name="close" size={20} color={colors.m3.onSurfaceVariant} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ColorPalette, reduceTransparency: boolean = false) {
  const isIos = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  // Liquid Glass no iOS com fallback para surfaceContainer sob Reduzir Transparência (tokens.json:526)
  const sheetBg = isIos
    ? (reduceTransparency ? colors.m3.surfaceContainer : tokens.glass.fill)
    : colors.background;

  const sheetBorderColor = isIos && !reduceTransparency ? tokens.glass.stroke : "transparent";

  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: colors.m3.scrim,
      justifyContent: "flex-end",
    },
    scrimWide: {
      justifyContent: "center",
      alignItems: "center",
      padding: tokens.spacing[24],
    },
    sheet: {
      backgroundColor: sheetBg,
      maxHeight: "90%",
      borderTopLeftRadius: tokens.radius.xxl,
      borderTopRightRadius: tokens.radius.xxl,
      borderTopWidth: isIos && !reduceTransparency ? 1 : 0,
      borderLeftWidth: isIos && !reduceTransparency ? 1 : 0,
      borderRightWidth: isIos && !reduceTransparency ? 1 : 0,
      borderColor: sheetBorderColor,
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[8],
      gap: tokens.spacing[12],
      overflow: "hidden",
      ...(isIos ? ({ borderCurve: "continuous" } as const) : {}),
      ...(isWeb
        ? ({
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          } as never)
        : {}),
    },
    sheetWide: {
      width: "100%",
      maxWidth: 480,
      borderRadius: tokens.radius.xxl,
      borderWidth: 1,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.m3.outlineVariant,
      ...(isIos ? ({ borderCurve: "continuous" } as const) : {}),
    },
    handleContainer: {
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[8],
      cursor: isWeb ? "grab" : undefined,
    } as ViewStyle,
    handle: {
      alignSelf: "center",
      width: 36,
      height: 5,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.onSurfaceVariant,
      opacity: 0.35,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
    },
    headerSpacer: {
      flex: 1,
    },
    title: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.semiBold,
      flex: 1,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButtonPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
  });
}
