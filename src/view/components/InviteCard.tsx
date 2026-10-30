import { type ComponentRef, forwardRef, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens } from "@/view/tokens";
import { IpeMark } from "@/view/components/IpeMark";

export type InviteCardProps = {
  /** Endereço do app, mostrado em destaque na imagem (sem `https://`). */
  url: string;
};

/**
 * Imagem do convite (Spec 092): é este cartão que a tela captura e envia como PNG, então traz tudo o que o
 * convite precisa dizer, inclusive o link por escrito, já que a imagem compartilhada não leva texto junto.
 * Usa os tokens do tema claro (`tokens.colors`): a imagem tem que ficar igual para quem a recebe.
 */
export const InviteCard = forwardRef<ComponentRef<typeof View>, InviteCardProps>(function InviteCard({ url }, ref) {
  const styles = useMemo(() => createStyles(), []);
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

function createStyles() {
  const light = tokens.colors;
  return StyleSheet.create({
    card: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[20],
      borderRadius: tokens.radius.extraLarge,
      borderWidth: 6,
      borderColor: light.ipe.trunk,
      backgroundColor: light.ipe.container,
    },
    top: { alignItems: "center", gap: tokens.spacing[2] },
    brand: { ...tokens.typography.brandHeadline, color: light.ipe.onContainer },
    tagline: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.tagline, textTransform: "uppercase", color: light.ipe.onContainer, opacity: 0.8 },
    title: { ...tokens.typography.brandDisplaySm, textAlign: "center", color: light.ipe.onContainer },
    body: { ...tokens.typography.subheadline, lineHeight: tokens.lineHeight[22], textAlign: "center", color: light.ipe.onContainer },
    chips: { flexDirection: "row", gap: tokens.spacing[8] },
    chip: { overflow: "hidden", paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[4], borderRadius: tokens.radius.small, ...tokens.typography.footnote, fontWeight: tokens.fontWeight.bold },
    chipSale: { backgroundColor: light.badge.sale.background, color: light.badge.sale.text },
    chipTrade: { backgroundColor: light.badge.trade.background, color: light.badge.trade.text },
    chipDonation: { backgroundColor: light.badge.donation.background, color: light.badge.donation.text },
    linkPill: {
      alignSelf: "stretch",
      alignItems: "center",
      paddingVertical: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      backgroundColor: light.ipe.trunk,
    },
    linkLabel: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.tagline, textTransform: "uppercase", color: light.ipe.container, opacity: 0.85 },
    link: { ...tokens.typography.brandTitle, color: light.ipe.container },
  });
}
