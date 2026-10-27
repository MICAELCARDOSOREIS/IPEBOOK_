import { useMemo, type ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import estrelas from "@/view/assets/capas/estrelas.svg";
import ondas from "@/view/assets/capas/ondas.svg";
import ipe from "@/view/assets/capas/ipe.svg";

/**
 * Casca das telas de acesso na web larga (Figma `01.02`–`01.05`): painel da marca à esquerda
 * (640 px, `secondary-container`) e o formulário à direita. Em celular e janelas estreitas devolve
 * só o formulário, como sempre foi.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const wide = useIsWideWeb();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!wide) return <>{children}</>;

  return (
    <View testID="auth-shell" style={styles.row}>
      <View style={styles.brandPanel}>
        <Text style={styles.brand}>IpêBook</Text>
        <Text accessibilityRole="header" style={styles.headline}>
          Histórias que seguem.
        </Text>
        <Text style={styles.lead}>
          Venda, troque e doe livros com vizinhos de Piripiri. Cada livro ganha um novo leitor.
        </Text>
        <View style={styles.covers}>
          <Cover color={colors.cover.brown} author="MACHADO DE ASSIS" title="Dom Casmurro" art={ondas} style={styles.coverLeft} />
          <Cover color={colors.cover.green} author="LISPECTOR" title="A hora da estrela" art={ipe} style={styles.coverRight} />
          <Cover color={colors.cover.blue} author="SAINT-EXUPÉRY" title="O Pequeno Príncipe" art={estrelas} style={styles.coverCenter} />
        </View>
      </View>
      <View style={styles.formPane}>{children}</View>
    </View>
  );
}

function Cover({ color, author, title, art, style }: { color: string; author: string; title: string; art: number | string; style: object }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.cover, { backgroundColor: color }, style]}>
      <View style={styles.coverSpine} />
      <View style={styles.coverFrame} />
      <Text numberOfLines={1} style={styles.coverAuthor}>{author}</Text>
      <Image source={typeof art === "string" ? { uri: art } : art} style={styles.coverArt} resizeMode="stretch" accessible={false} />
      <Text style={styles.coverTitle}>{title}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flex: 1, flexDirection: "row", backgroundColor: colors.background },
    brandPanel: {
      width: 640,
      maxWidth: "45%",
      gap: tokens.spacing[24],
      paddingTop: 96,
      paddingHorizontal: 80,
      backgroundColor: colors.m3.secondaryContainer,
    },
    brand: { fontFamily: fontFamily.brand, fontSize: 24, letterSpacing: -0.48, color: colors.brandBrown },
    headline: { fontFamily: fontFamily.brand, fontSize: 36, lineHeight: 41, color: colors.m3.onSecondaryContainer },
    lead: { ...tokens.typography.bodyLarge, fontSize: 19, lineHeight: 30, color: colors.m3.onSecondaryContainer },
    covers: {
      height: 360,
      maxWidth: 480,
      borderRadius: 28,
      backgroundColor: colors.m3.primaryContainer,
      overflow: "hidden",
    },
    cover: {
      position: "absolute",
      width: 170,
      height: 241,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      borderTopRightRadius: 11,
      borderBottomRightRadius: 11,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 14 },
    },
    coverLeft: { left: 6, top: 90, transform: [{ rotate: "10deg" }] },
    coverRight: { left: 262, top: 60, transform: [{ rotate: "-10deg" }] },
    coverCenter: { left: 150, top: 30 },
    coverSpine: { position: "absolute", left: 0, top: 0, bottom: 0, width: "8%", backgroundColor: "rgba(0,0,0,0.25)" },
    coverFrame: {
      position: "absolute",
      left: 23,
      top: 10,
      width: 139,
      height: 221,
      borderWidth: 1.4,
      borderColor: colors.cover.text,
      borderRadius: 4,
    },
    coverArt: { position: "absolute", left: 0, top: 62, width: 170, height: 99 },
    coverAuthor: {
      position: "absolute",
      left: 31,
      right: 14,
      top: 20,
      fontSize: 12.75,
      letterSpacing: 1,
      opacity: 0.85,
      color: colors.cover.text,
    },
    coverTitle: {
      position: "absolute",
      left: 31,
      right: 14,
      bottom: 14,
      fontFamily: fontFamily.brand,
      fontSize: 21,
      lineHeight: 25,
      color: colors.cover.text,
    },
    formPane: { flex: 1 },
  });
}

export default AuthShell;
