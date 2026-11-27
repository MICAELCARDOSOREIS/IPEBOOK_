import { type ReactNode, useMemo } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";

/** Superfícies iOS da biblioteca IpêBook no Figma (tema claro; Spec 137 / ADR 0115). */
export type IosCardVariant = "neutral" | "paper" | "glass" | "success" | "info" | "donation";

export type IosCardSurfaceProps = {
  children: ReactNode;
  variant?: IosCardVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
};

/**
 * Card visual, sem lógica de negócio. O vidro é reservado a controles/superfícies
 * secundárias; dados de livros e textos longos usam cartões opacos.
 * Android e Web recebem somente o estilo passado pelo consumidor.
 */
export function IosCardSurface({
  children,
  variant = "neutral",
  style,
  testID,
  accessible,
  accessibilityLabel,
}: IosCardSurfaceProps) {
  const { colors } = useTheme();
  const reduceTransparency = useOpaqueIosSurfaces();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ios = Platform.OS === "ios";
  const glassActive = ios && variant === "glass" && !reduceTransparency;

  return (
    <View
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[
        style,
        ios && styles.base,
        ios && styles[variant],
        ios && variant === "glass" && reduceTransparency && styles.glassOpaque,
      ]}
    >
      {glassActive ? (
        <IosGlassBackdrop style={styles.glassShape} testID="ios-card-glass" />
      ) : null}
      {children}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      borderRadius: tokens.radius.xl,
      borderCurve: "continuous",
      borderWidth: 1,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
    },
    neutral: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderColor: colors.m3.outlineVariant,
    },
    paper: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderColor: colors.book.paperEdge,
    },
    glass: {
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    glassOpaque: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderColor: colors.m3.outlineVariant,
    },
    success: {
      backgroundColor: colors.m3.primaryContainer,
      borderColor: colors.m3.outlineVariant,
    },
    info: {
      backgroundColor: colors.ipe.petalSoft,
      borderColor: colors.ipe.bloom,
    },
    donation: {
      backgroundColor: colors.ipe.container,
      borderColor: colors.ipe.bloom,
    },
    glassShape: {
      ...StyleSheet.absoluteFill,
      overflow: "hidden",
      borderRadius: tokens.radius.xl,
    },
  });
}

export default IosCardSurface;

/**
 * Estilo de cartão neutro elevado do iOS 26 (Figma `iPhone · Superfície de card`)
 * para uso em `StyleSheet.create`; retorna `null` no Android e na Web.
 */
export function iosNeutralCardStyle(colors: ColorPalette): ViewStyle | null {
  if (Platform.OS !== "ios") return null;
  return {
    backgroundColor: colors.m3.surfaceContainerLowest,
    borderColor: colors.m3.outlineVariant,
    borderRadius: tokens.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    shadowColor: colors.m3.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
  };
}
