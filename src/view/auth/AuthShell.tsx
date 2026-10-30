import { useMemo, type ReactNode } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import authLivros from "@/view/assets/auth-livros.png";

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
          <Image
            source={authLivros}
            style={styles.coversImage}
            resizeMode="contain"
            accessible
            accessibilityLabel="Livros O Pequeno Príncipe, Dom Casmurro e A hora da estrela entre pétalas de ipê amarelo"
          />
        </View>
      </View>
      <View style={styles.formPane}>{children}</View>
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
      paddingTop: tokens.spacing[96],
      paddingHorizontal: tokens.spacing[80],
      backgroundColor: colors.m3.secondaryContainer,
    },
    brand: { ...tokens.typography.brandTitle, letterSpacing: tokens.letterSpacing.brandTight, color: colors.brandBrown },
    headline: { ...tokens.typography.brandDisplayMd, color: colors.m3.onSecondaryContainer },
    lead: { ...tokens.typography.webLead, color: colors.m3.onSecondaryContainer },
    covers: {
      height: 360,
      maxWidth: 480,
      borderRadius: tokens.radius.xxl,
      backgroundColor: colors.m3.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      padding: tokens.spacing[12],
    },
    coversImage: {
      width: "100%",
      height: "100%",
    },
    formPane: { flex: 1 },
  });
}

export default AuthShell;
