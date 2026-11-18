import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useReduceTransparency } from "@/view/useReduceTransparency";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { type FocusableElement, useModalFocusTrap } from "@/view/components/Dialog";
import { AppIcon } from "@/view/components/AppIcon";

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
};

/**
 * Componente BottomSheet unificado do design system (Apple HIG / Spec 137, Material 3):
 * - Cantos arredondados contínuos (tokens.radius.xxl = 28dp)
 * - Drag handle superior acessível
 * - No iOS, acabamento Liquid Glass com fallback sólido quando Reduzir Transparência ativado
 * - Proteção de Safe Area (Home Indicator)
 * - Foco acessível com useModalFocusTrap e accessibilityViewIsModal
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  testID,
  style,
  showCloseButton = false,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const reduceTransparency = useReduceTransparency();
  const styles = useMemo(
    () => createStyles(colors, reduceTransparency),
    [colors, reduceTransparency],
  );

  const closeButtonRef = useRef<FocusableElement | null>(null);
  useModalFocusTrap(visible, () => [closeButtonRef.current], onClose);

  return (
    <Modal
      accessibilityViewIsModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.scrim, wideWeb && styles.scrimWide]} testID={testID}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ao tocar fora"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.sheet,
            wideWeb && styles.sheetWide,
            { paddingBottom: wideWeb ? tokens.spacing[24] : Math.max(tokens.spacing[16], insets.bottom + tokens.spacing[8]) },
            style,
          ]}
        >
          {/* Drag handle superior estilo Apple HIG */}
          <View accessible={false} importantForAccessibility="no" style={styles.handle} testID="bottom-sheet-handle" />

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
                  onPress={onClose}
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
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette, reduceTransparency: boolean = false) {
  const isIos = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const sheetBg = isIos
    ? (reduceTransparency ? colors.surface : colors.glass.fill)
    : colors.background;

  const sheetBorderColor = isIos && !reduceTransparency ? colors.glass.stroke : "transparent";

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
      borderColor: colors.m3.outlineVariant,
    },
    handle: {
      alignSelf: "center",
      width: 36,
      height: 5,
      borderRadius: tokens.radius.full,
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
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
