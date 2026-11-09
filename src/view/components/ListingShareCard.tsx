import { type ComponentRef, forwardRef, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { BOOK_CONDITION_LABELS, type Book } from "@/model/entities/book";
import { fontFamily, tokens } from "@/view/tokens";
import { formatPrice } from "@/view/formatPrice";
import { getIllustrativeCover } from "@/view/components/BookCover";
import { IpeMark } from "@/view/components/IpeMark";
import { IpeRibbon } from "@/view/components/IpeRibbon";

export type ListingShareCardProps = {
  book: Pick<Book, "id" | "title" | "author" | "modality" | "price" | "neighborhood" | "photoUrl"> &
    Partial<Pick<Book, "condition" | "category" | "isBox" | "boxVolumesCount">>;
  /** Endereço do anúncio, escrito na imagem (sem `https://`). */
  url: string;
  /** Chamado quando a capa terminou de carregar (ou falhou): a captura espera por isso. */
  onCoverSettled?: () => void;
};

const MODALITY_LABELS = { sale: "Venda", trade: "Troca", donation: "Doação" } as const;
const COVER_WIDTH = 150;
const COVER_HEIGHT = 240;
const GOLD = tokens.colors.cover.gold;

function offerText(book: ListingShareCardProps["book"]): string {
  if (book.modality === "sale" && book.price != null) return formatPrice(book.price);
  if (book.modality === "trade") return "Aceita troca";
  return "Gratuito";
}

/**
 * Imagem de compartilhamento do anúncio (Spec 092): capa real do anúncio (ou capa ilustrativa oficial
 * do IpêBook quando não houver foto), título, autor, oferta, conservação/categoria, bairro e endereço
 * por escrito. É renderizada fora da tela e capturada em PNG ao compartilhar. Usa as cores do tema
 * claro de propósito: a imagem tem que ficar igual para quem a recebe.
 */
export const ListingShareCard = forwardRef<ComponentRef<typeof View>, ListingShareCardProps>(function ListingShareCard(
  { book, url, onCoverSettled },
  ref,
) {
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [book.photoUrl]);

  const tone = tokens.colors.badge[book.modality];
  const display = url.replace(/^https?:\/\//, "");
  const styles = useMemo(() => createStyles(), []);
  const illustrative = useMemo(() => getIllustrativeCover(book.id), [book.id]);

  const hasValidPhoto = Boolean(book.photoUrl?.trim()) && !photoFailed;
  const conditionLabel = book.condition ? BOOK_CONDITION_LABELS[book.condition] : null;
  const metaDetails = [book.category, conditionLabel].filter(Boolean).join(" · ");

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.header}>
        <IpeMark size={36} />
        <View style={styles.headerTexts}>
          <Text style={styles.brand}>IpêBook</Text>
          <Text style={styles.tagline}>Livros de quem mora perto de você · Piripiri, PI</Text>
        </View>
      </View>

      <View style={[styles.coverArea, { backgroundColor: tone.background }]}>
        {hasValidPhoto ? (
          <View style={styles.coverFrame}>
            <Image
              source={{ uri: book.photoUrl }}
              accessibilityLabel={`Capa de ${book.title}`}
              resizeMode="cover"
              style={styles.coverImage}
              onLoadEnd={onCoverSettled}
              onError={() => {
                setPhotoFailed(true);
                onCoverSettled?.();
              }}
            />
            <View pointerEvents="none" accessible={false} style={styles.photoSpineShadow} />
            <IpeRibbon width={18} height={42} />
          </View>
        ) : (
          <View
            accessibilityRole="image"
            accessibilityLabel={`Capa ilustrativa de ${book.title}`}
            style={[styles.coverFrame, { backgroundColor: illustrative.backgroundColor }]}
          >
            <Image
              source={illustrative.source}
              resizeMode="cover"
              accessible={false}
              style={styles.coverImage}
              onLoadEnd={onCoverSettled}
              onError={onCoverSettled}
            />
            <View pointerEvents="none" accessible={false} style={styles.illustrativeSpine}>
              {[0.07, 0.11, 0.87, 0.91].map((at) => (
                <View
                  key={at}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: COVER_HEIGHT * at,
                    height: 1,
                    backgroundColor: GOLD,
                  }}
                />
              ))}
            </View>
            <IpeRibbon width={18} height={42} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.badges}>
          <Text style={[styles.badge, { backgroundColor: tone.background, color: tone.text }]}>
            {MODALITY_LABELS[book.modality]}
          </Text>
          <Text style={styles.offer}>{offerText(book)}</Text>
          {book.isBox ? (
            <Text style={styles.boxBadge}>
              {book.boxVolumesCount ? `Box (${book.boxVolumesCount} vol.)` : "Box / Coleção"}
            </Text>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={3}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        {metaDetails ? <Text style={styles.metaDetails} numberOfLines={1}>{metaDetails}</Text> : null}
        {book.neighborhood ? <Text style={styles.where}>{`${book.neighborhood}, Piripiri`}</Text> : null}
        <Text style={styles.trustLine}>Ponto Seguro de Piripiri · Confirmação por QR Code</Text>
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
    headerTexts: { flex: 1 },
    brand: { ...tokens.typography.titleBar, fontFamily: fontFamily.brand, fontWeight: tokens.fontWeight.bold, color: brown },
    tagline: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.taglineCompact, color: brown, opacity: 0.8 },
    coverArea: { alignItems: "center", paddingVertical: tokens.spacing[16], borderRadius: tokens.radius.card },
    coverFrame: {
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      borderRadius: tokens.radius.extraSmall,
      backgroundColor: light.m3.surfaceContainerHighest,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    coverImage: {
      position: "absolute",
      left: 0,
      top: 0,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
    },
    photoSpineShadow: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 8,
      backgroundColor: "rgba(0,0,0,0.16)",
      borderRightWidth: 1,
      borderRightColor: "rgba(255,255,255,0.22)",
    },
    illustrativeSpine: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 9,
      backgroundColor: "rgba(0,0,0,0.22)",
      borderRightWidth: 1,
      borderRightColor: "rgba(245,239,232,0.28)",
    },
    info: { gap: tokens.spacing[4] },
    badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: tokens.spacing[8] },
    badge: { overflow: "hidden", paddingHorizontal: tokens.spacing[10], paddingVertical: tokens.spacing[3], borderRadius: tokens.radius.small, ...tokens.typography.footnote, fontWeight: tokens.fontWeight.bold },
    boxBadge: {
      overflow: "hidden",
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.small,
      backgroundColor: light.m3.secondaryContainer,
      color: light.m3.onSecondaryContainer,
      ...tokens.typography.captionSmall,
      fontWeight: tokens.fontWeight.bold,
    },
    offer: { ...tokens.typography.titleBlock, fontWeight: tokens.fontWeight.bold, color: brown },
    title: { ...tokens.typography.brandTitle, color: brown },
    author: { ...tokens.typography.subheadline, color: brown, opacity: 0.85 },
    metaDetails: { ...tokens.typography.footnote, fontWeight: tokens.fontWeight.medium, color: brown, opacity: 0.78 },
    where: { ...tokens.typography.footnote, fontWeight: tokens.fontWeight.semiBold, color: brown, opacity: 0.85 },
    trustLine: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.semiBold, color: light.nature.foliage },
    linkPill: { alignItems: "center", paddingVertical: tokens.spacing[8], borderRadius: tokens.radius.medium, backgroundColor: light.ipe.trunk },
    linkLabel: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.semiBold, letterSpacing: tokens.letterSpacing.tagline, textTransform: "uppercase", color: light.ipe.container, opacity: 0.85 },
    link: { ...tokens.typography.titleMedium, fontWeight: tokens.fontWeight.bold, color: light.ipe.container },
  });
}
