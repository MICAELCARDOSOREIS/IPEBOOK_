import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type LoadingStateProps = {
  /** Nome acessível, sem reticências (ex: "Carregando livros"). */
  label?: string;
};

/**
 * Estado de carregamento M3 Expressive (design-system/04-componentes/estados-do-sistema.md):
 * indicador contido em squircle `secondaryContainer` (56×56 dp) com entrada em mola espacial.
 */
export function LoadingState({ label = "Carregando" }: LoadingStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const badgeScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          badgeScale.setValue(1);
          return;
        }
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: tokens.spring.spatialSlow.tension,
          friction: tokens.spring.spatialSlow.friction,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        badgeScale.setValue(1);
      });
  }, [badgeScale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicatorBadge, { transform: [{ scale: badgeScale }] }]}>
        <ActivityIndicator color={colors.m3.onSecondaryContainer} accessibilityLabel={label} />
      </Animated.View>
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
    indicatorBadge: {
      width: 56,
      height: 56,
      borderRadius: tokens.shapeMorph.cardPressed,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      color: colors.secondaryText,
      ...tokens.typography.bodyMedium,
    },
  });
}

export default LoadingState;
