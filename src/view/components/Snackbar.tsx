import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export type SnackbarProps = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
};

/**
 * Componente Snackbar M3 Expressive (design-system/04-componentes/snackbar.md).
 * Feedback não intrusivo com entrada em mola espacial (`tokens.spring.spatialStandard`),
 * suporte a acessibilidade e ação reversível opcional.
 */
export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
}: SnackbarProps) {
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, resolvedScheme), [colors, resolvedScheme]);
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.95);
      return;
    }
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          scale.setValue(1);
          return;
        }
        Animated.spring(scale, {
          toValue: 1,
          tension: tokens.spring.spatialStandard.tension,
          friction: tokens.spring.spatialStandard.friction,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        scale.setValue(1);
      });
  }, [visible, scale]);

  useEffect(() => {
    if (!visible || !onDismiss || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, onDismiss, duration]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
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
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette, resolvedScheme: "light" | "dark") {
  // M3 Snackbar: superfície inversa (escura no tema claro, clara no tema escuro) e rótulo de ação contrastante.
  const actionColor = resolvedScheme === "dark" ? colors.m3.onPrimary : colors.m3.primaryContainer;
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.m3.inverseSurface,
      borderRadius: tokens.shapeMorph.cardRest,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      marginVertical: tokens.spacing[8],
      gap: tokens.spacing[12],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    message: {
      flex: 1,
      ...tokens.typography.bodyMedium,
      color: colors.m3.inverseOnSurface,
    },
    actionButton: {
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.buttonRest,
      justifyContent: "center",
    },
    actionButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      transform: [{ scale: 0.95 }],
    },
    actionText: {
      ...tokens.typography.labelMedium,
      color: actionColor,
      fontWeight: tokens.fontWeight.bold,
    },
  });
}

export default Snackbar;
