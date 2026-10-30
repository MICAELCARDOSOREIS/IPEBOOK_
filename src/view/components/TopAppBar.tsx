import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { topBarInset } from "@/view/topBarInset";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useIsWideWeb } from "@/view/useIsWideWeb";

export type TopAppBarProps = {
  title: string;
  onBack: () => void;
  /** Barra M3 sobre conteúdo em tela cheia (mapa): cobre a barra de status e sobe um nível de elevação. */
  floating?: boolean;
  /** Largura da coluna de conteúdo da tela, para alinhar a barra a ela na web larga. */
  contentMaxWidth?: number;
};

/**
 * Barra superior do design system (barra-superior.md), pequena do Material 3 como no Figma
 * (`01.06`, `01.10`, `04.08`): 64 dp de altura, título de 22 dp e botão voltar circular de 40 dp.
 * Na web larga vira uma trilha discreta ("← Voltar | Título") de 48 px, sem faixa própria, para não
 * competir com o cabeçalho do site nem com a manchete da tela.
 */
export function TopAppBar({ title, onBack, floating = false, contentMaxWidth }: TopAppBarProps) {
  const guardedBack = useGuardedPress(onBack);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const wide = useIsWideWeb() && !floating;
  // Web larga: a barra acompanha a coluna de conteúdo centralizada (não vale para a barra sobre o mapa).
  const alignToContent = Platform.OS === "web" && !floating ? { paddingHorizontal: topBarInset(width, contentMaxWidth) } : null;
  if (wide) {
    return (
      <View style={[styles.crumbBar, alignToContent]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={guardedBack}
          style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
            styles.crumbBack,
            (hovered || pressed) && styles.crumbBackActive,
          ]}
        >
          <AppIcon name="back" size={18} color={colors.m3.onSurface} />
          <Text style={styles.crumbBackText}>Voltar</Text>
        </Pressable>
        <View accessible={false} style={styles.crumbDivider} />
        <Text accessibilityRole="header" numberOfLines={1} style={styles.crumbTitle}>{title}</Text>
      </View>
    );
  }
  return (
    <View style={floating ? [styles.bar, styles.barOverlay, { height: tokens.spacing[64] + insets.top, paddingTop: insets.top }] : [styles.bar, alignToContent]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        onPress={guardedBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <AppIcon name="back" size={24} color={colors.m3.onSurface} />
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>{title}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bar: {
      height: tokens.spacing[64],
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[8],
      gap: tokens.spacing[12],
      backgroundColor: colors.surface,
    },
    crumbBar: {
      height: tokens.spacing[48],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      backgroundColor: colors.background,
    },
    crumbBack: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      height: 32,
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
    },
    crumbBackActive: { backgroundColor: colors.m3.surfaceContainerHigh },
    crumbBackText: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    crumbDivider: { width: 1, height: 16, backgroundColor: colors.m3.outlineVariant },
    crumbTitle: { flexShrink: 1, ...tokens.typography.titleMedium, color: colors.m3.onSurfaceVariant },
    barOverlay: {
      backgroundColor: colors.m3.surfaceContainer,
      elevation: 3,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    backButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.shapeMorph.buttonRest,
      justifyContent: "center",
      alignItems: "center",
    },
    backButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.92 }],
    },
    title: {
      flexShrink: 1,
      color: colors.m3.onSurface,
      ...tokens.typography.titleBar,
      fontWeight: tokens.fontWeight.semiBold,
    },
  });
}

export default TopAppBar;
