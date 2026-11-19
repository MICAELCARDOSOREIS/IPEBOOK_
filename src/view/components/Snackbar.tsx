import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useReduceTransparency } from "@/view/useReduceTransparency";

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
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useReduceTransparency();
  const iosGlass = isIos && !reduceTransparency;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(0.95)).current;
  const guardedAction = useGuardedPress(onAction);

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
          useNativeDriver: Platform.OS !== "web",
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
    <Animated.View
      style={[
        styles.container,
        isIos && (iosGlass ? styles.iosGlassContainer : styles.iosOpaqueContainer),
        { transform: [{ scale }] },
      ]}
    >
      {iosGlass ? (
        <View pointerEvents="none" style={styles.iosBlurClip}>
          <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
        </View>
      ) : null}
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.message, isIos && styles.iosMessage]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={guardedAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={[styles.actionText, isIos && styles.iosActionText]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  // M3 Snackbar: superfície inversa e rótulo de ação contrastante.
  const actionColor = colors.m3.primaryContainer;
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
    iosGlassContainer: {
      backgroundColor: tokens.glass.fill,
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: tokens.glass.stroke,
      shadowColor: "#2e2b21",
      shadowOpacity: 0.14,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      overflow: "hidden",
    },
    iosOpaqueContainer: {
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    iosBlurClip: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
    },
    iosMessage: {
      color: colors.m3.onSurface,
    },
    iosActionText: {
      color: colors.action,
    },
  });
}

export default Snackbar;
