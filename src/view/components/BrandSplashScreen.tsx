import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { IpeMark } from "@/view/components/IpeMark";
import { Logotipo } from "@/view/components/Logotipo";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";

export type BrandSplashScreenProps = {
  onFinish?: () => void;
  durationMs?: number;
};

/**
 * Tela de abertura com a marca do IpêBook (Spec 111 / Identidade visual).
 * Garante que a abertura do app mostre a logo com o ipê amarelo e o nome da marca
 * por tempo suficiente para visualização confortável (1,6s) antes de transicionar.
 */
export function BrandSplashScreen({ onFinish, durationMs = 1600 }: BrandSplashScreenProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  const [visible, setVisible] = useState(!isTest);

  useEffect(() => {
    if (isTest) {
      onFinish?.();
      return;
    }

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== "web",
      tension: 40,
      friction: 7,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => {
        setVisible(false);
        onFinish?.();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, isTest, onFinish, opacity, scale]);

  if (!visible) return null;

  return (
    <Animated.View
      testID="brand-splash-screen"
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        {
          backgroundColor: colors.surface,
          opacity,
        },
      ]}
    >
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <IpeMark size={112} />
        <Logotipo underline />
        <Text style={[tokens.typography.labelMedium, { color: colors.secondaryText, marginTop: tokens.spacing[4] }]}>
          Livros em Piripiri
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: tokens.spacing[12],
  },
});

export default BrandSplashScreen;
