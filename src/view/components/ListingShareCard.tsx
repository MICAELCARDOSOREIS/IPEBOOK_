import { type ComponentRef, forwardRef, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { fontFamily, tokens } from "@/view/tokens";
import { IpeMark } from "@/view/components/IpeMark";

export type ListingShareCardProps = {
  book: Pick<Book, "id" | "title" | "author" | "modality" | "price" | "neighborhood" | "photoUrl">;
  /** Endereço do anúncio, escrito na imagem (sem `https://`). */
  url: string;
  /** Chamado quando a capa terminou de carregar (ou falhou): a captura espera por isso. */
  onCoverSettled?: () => void;
};

const MODALITY_LABELS = { sale: "Venda", trade: "Troca", donation: "Doação" } as const;

function offerText(book: ListingShareCardProps["book"]): string {
  if (book.modality === "sale" && book.price != null) return `R$ ${book.price.toFixed(2).replace(".", ",")}`;
  if (book.modality === "trade") return "Aceita troca";
  return "Gratuito";
}

/**
 * Imagem de compartilhamento do anúncio (Spec 092): capa sobre o fundo da modalidade, título, autor, oferta,
 * bairro e o endereço por escrito. É renderizada fora da tela e capturada em PNG ao compartilhar. Usa as cores
 * do tema claro de propósito: a imagem tem que ficar igual para quem a recebe.
 */
export const ListingShareCard = forwardRef<ComponentRef<typeof View>, ListingShareCardProps>(function ListingShareCard(
  { book, url, onCoverSettled },
  ref,
) {
  const tone = tokens.colors.badge[book.modality];
  const display = url.replace(/^https?:\/\//, "");
  const styles = useMemo(() => createStyles(), []);

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.header}>
        <IpeMark size={36} />
        <View>
          <Text style={styles.brand}>IpêBook</Text>
          <Text style={styles.tagline}>Livros de quem mora perto de você</Text>
        </View>
      </View>

      <View style={[styles.coverArea, { backgroundColor: tone.background }]}>
        {book.photoUrl ? (
          <Image
            source={{ uri: book.photoUrl }}
            resizeMode="cover"
            style={styles.cover}
            onLoadEnd={onCoverSettled}
          />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Text style={styles.placeholderInitial}>{book.title.trim().charAt(0).toLocaleUpperCase("pt-BR")}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.badges}>
          <Text style={[styles.badge, { backgroundColor: tone.background, color: tone.text }]}>{MODALITY_LABELS[book.modality]}</Text>
          <Text style={styles.offer}>{offerText(book)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        {book.neighborhood ? <Text style={styles.where}>{`${book.neighborhood}, Piripiri`}</Text> : null}
      </View>

      <View style={styles.linkPill}>
        <Text style={styles.linkLabel}>Veja no IpêBook</Text>
        <Text style={styles.link} numberOfLines={1}>{display}</Text>
      </View>
    </View>
  );
});

function createStyles() {
  const light = tokens.colors;
  const brown = light.ipe.onContainer;
  return StyleSheet.create({
    card: {
      width: 340,
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.extraLarge,
      borderWidth: 6,
      borderColor: light.ipe.trunk,
      backgroundColor: light.ipe.container,
    },
    header: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    brand: { ...tokens.typography.titleBar, fontFamily: fontFamily.brand, fontWeight: tokens.fontWeight.bold, color: brown },
    tagline: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.taglineCompact, color: brown, opacity: 0.8 },
    coverArea: { alignItems: "center", paddingVertical: tokens.spacing[16], borderRadius: tokens.radius.card },
    cover: { width: 150, height: 240, borderRadius: tokens.radius.extraSmall, backgroundColor: light.m3.surfaceContainerHighest },
    placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: light.success },
    placeholderInitial: { fontFamily: fontFamily.brand, fontSize: tokens.fontSize[64], color: light.m3.onPrimary, opacity: 0.9 },
    info: { gap: tokens.spacing[4] },
    badges: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    badge: { overflow: "hidden", paddingHorizontal: tokens.spacing[10], paddingVertical: tokens.spacing[3], borderRadius: tokens.radius.small, ...tokens.typography.footnote, fontWeight: tokens.fontWeight.bold },
    offer: { ...tokens.typography.titleBlock, fontWeight: tokens.fontWeight.bold, color: brown },
    title: { ...tokens.typography.brandTitle, color: brown },
    author: { ...tokens.typography.subheadline, color: brown, opacity: 0.85 },
    where: { ...tokens.typography.footnote, fontWeight: tokens.fontWeight.semiBold, color: brown, opacity: 0.8 },
    linkPill: { alignItems: "center", paddingVertical: tokens.spacing[8], borderRadius: tokens.radius.medium, backgroundColor: light.ipe.trunk },
    linkLabel: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.tagline, textTransform: "uppercase", color: light.ipe.container, opacity: 0.85 },
    link: { ...tokens.typography.titleMedium, fontWeight: tokens.fontWeight.bold, color: light.ipe.container },
  });
}
