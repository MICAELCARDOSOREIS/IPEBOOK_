import { type ComponentRef, forwardRef, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { IpeMark } from "@/view/components/IpeMark";

export type InviteCardProps = {
  /** Endereço do app, mostrado em destaque na imagem (sem `https://`). */
  url: string;
};

/**
 * Imagem do convite (Spec 092): é este cartão que a tela captura e envia como PNG, então traz tudo o que o
 * convite precisa dizer, inclusive o link por escrito, já que a imagem compartilhada não leva texto junto.
 * Cores fixas (não seguem o tema escuro): a imagem tem que ficar igual para quem a recebe.
 */
export const InviteCard = forwardRef<ComponentRef<typeof View>, InviteCardProps>(function InviteCard({ url }, ref) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const display = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <View
      ref={ref}
      collapsable={false}
      accessible
      accessibilityLabel={`Convite para o IpêBook em Piripiri. Acesse ${display}`}
      style={styles.card}
    >
      <View style={styles.top}>
        <IpeMark size={88} />
        <Text style={styles.brand}>IpêBook</Text>
        <Text style={styles.tagline}>Biblioteca comunitária de Piripiri</Text>
      </View>

      <Text style={styles.title}>Venha ler com a gente.</Text>
      <Text style={styles.body}>Compre, troque ou receba livros de quem mora perto de você.</Text>

      <View style={styles.chips}>
        <Text style={[styles.chip, styles.chipSale]}>Venda</Text>
        <Text style={[styles.chip, styles.chipTrade]}>Troca</Text>
        <Text style={[styles.chip, styles.chipDonation]}>Doação</Text>
      </View>

      <View style={styles.linkPill}>
        <Text style={styles.linkLabel}>Entre em</Text>
        <Text style={styles.link}>{display}</Text>
      </View>
    </View>
  );
});

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[20],
      borderRadius: 24,
      borderWidth: 6,
      borderColor: "#58331F",
      backgroundColor: "#FCEFCB",
    },
    top: { alignItems: "center", gap: 2 },
    brand: { fontFamily: fontFamily.brand, fontSize: 30, lineHeight: 36, fontWeight: "700", color: "#4A2B16" },
    tagline: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase", color: "#4A2B16", opacity: 0.8 },
    title: { fontFamily: fontFamily.brand, fontSize: 26, lineHeight: 32, fontWeight: "700", textAlign: "center", color: "#4A2B16" },
    body: { fontSize: 15, lineHeight: 22, textAlign: "center", color: "#4A2B16" },
    chips: { flexDirection: "row", gap: tokens.spacing[8] },
    chip: { overflow: "hidden", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, fontSize: 13, lineHeight: 18, fontWeight: "700" },
    chipSale: { backgroundColor: "#DCE8DE", color: "#18291F" },
    chipTrade: { backgroundColor: "#F8D88A", color: "#3A2A10" },
    chipDonation: { backgroundColor: "#F4DDD3", color: "#6E3A28" },
    linkPill: {
      alignSelf: "stretch",
      alignItems: "center",
      paddingVertical: tokens.spacing[12],
      borderRadius: 16,
      backgroundColor: "#58331F",
    },
    linkLabel: { fontSize: 12, lineHeight: 16, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase", color: "#FCEFCB", opacity: 0.85 },
    link: { fontSize: 24, lineHeight: 30, fontWeight: "700", color: "#FCEFCB" },
  });
}
