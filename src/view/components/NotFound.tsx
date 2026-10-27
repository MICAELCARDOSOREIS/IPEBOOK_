import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";

export type NotFoundProps = {
  onGoHome: () => void;
  onExplore: () => void;
};

/** Rota inexistente: mensagem em português, sem expor o endereço, com saída para o início e a busca. */
export function NotFound({ onGoHome, onExplore }: NotFoundProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.box}>
        <View style={styles.icon}>
          <AppIcon name="search" size={32} color={colors.m3.onSurface} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>Página não encontrada</Text>
        <Text style={styles.body}>
          O endereço que você abriu não existe ou o anúncio foi removido. Volte ao início ou procure outro livro.
        </Text>
        <View style={styles.actions}>
          <FilledButton label="Ir para o início" onPress={onGoHome} />
          <OutlinedButton label="Explorar livros" onPress={onExplore} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    box: { width: "100%", maxWidth: 420, alignItems: "center", gap: tokens.spacing[12], padding: tokens.spacing[24] },
    icon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.secondaryContainer },
    title: { fontFamily: fontFamily.brand, fontSize: 28, lineHeight: 36, fontWeight: "700", color: colors.m3.onSurface, textAlign: "center" },
    body: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant, textAlign: "center" },
    actions: { alignSelf: "stretch", gap: tokens.spacing[8], marginTop: tokens.spacing[12] },
  });
}

export default NotFound;
