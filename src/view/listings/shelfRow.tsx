import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { formatBookLocation } from "@/model/entities/location";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag, type TagProps } from "@/view/components/Tag";
import { formatPrice } from "@/view/formatPrice";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, fontFamily, tokens } from "@/view/tokens";
export type ShelfRowProps = {
  book: Book;
  summary: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** Dispara compartilhamento formatado no WhatsApp de 1 toque (Spec 122). */
  onShareWhatsApp?: () => void;
  /** Navega diretamente para a negociação ativa quando o livro está reservado. */
  onNavigateToNegotiation?: () => void;
  /** Web larga (Figma `05.01`): linha de tabela com a situação em etiqueta e a ação "Editar". */
  wide?: { statusVariant: TagProps["variant"]; statusLabel: string; offer: string; actionLabel?: string };
};

/** Linha da estante: capa, título, resumo e seta de avanço, como em `05.01` e `05.03`. */
export function ShelfRow({ book, summary, accessibilityLabel, onPress, onShareWhatsApp, onNavigateToNegotiation, wide }: ShelfRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (wide) {
    const actionText = wide.actionLabel ?? "Editar";
    const redundantOffers = new Set([
      book.modality.toLowerCase(),
      "venda",
      "troca",
      "doação",
      "doacao",
    ]);
    const showOfferText =
      Boolean(wide.offer) && !redundantOffers.has(wide.offer.trim().toLowerCase());

    return (
      <View style={styles.tableRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={withPress(styles.tableMain)}
        >
          <View style={styles.cellBook}>
            <ModalityCoverArea modality={book.modality}>
              <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
            </ModalityCoverArea>
            <View style={styles.rowText}>
              <View style={styles.titleRow}>
                <Text style={styles.tableTitle} numberOfLines={1}>
                  {book.title}
                </Text>
                {book.isBox ? (
                  <Tag
                    variant="box"
                    label={book.boxVolumesCount ? `Box (${book.boxVolumesCount} vols)` : "Box"}
                  />
                ) : null}
              </View>
              {book.author ? (
                <Text style={styles.tableAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.cellModality}>
            <Tag variant={book.modality} />
            {showOfferText ? (
              <Text style={styles.cellPrice} numberOfLines={1}>
                {wide.offer}
              </Text>
            ) : null}
          </View>
          <View style={styles.cellNeighborhood}>
            <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
            <Text style={styles.cellNeighborhoodText} numberOfLines={1}>
              {formatBookLocation(book.neighborhood)}
            </Text>
          </View>
          <View style={styles.cellStatus}>
            <Tag variant={wide.statusVariant} label={wide.statusLabel} />
          </View>
        </Pressable>
        <View style={styles.cellActionBox}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actionText} ${book.title}`}
            onPress={onPress}
            style={withPress(styles.actionButton)}
          >
            <Text style={styles.cellAction}>{actionText}</Text>
            <AppIcon name="chevronRight" size={16} color={colors.m3.onSecondaryContainer} />
          </Pressable>
          {onShareWhatsApp && book.status === "available" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Compartilhar ${book.title} no WhatsApp`}
              hitSlop={8}
              onPress={onShareWhatsApp}
              style={withPress(styles.whatsappButton)}
            >
              <AppIcon name="share" size={18} color={colors.nature.foliage} />
              <Text style={styles.srOnlySummary}>Compartilhar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const offerText =
    book.modality === "sale" && book.price != null
      ? formatPrice(book.price)
      : book.modality === "donation"
        ? "Gratuito"
        : "Para troca";

  const statusTone =
    book.status === "reserved"
      ? { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Reservado" }
      : book.status === "paused"
        ? { background: colors.badge.paused.background, text: colors.badge.paused.text, label: "Pausado" }
        : book.status === "delivered"
          ? { background: colors.m3.secondaryContainer, text: colors.m3.onSecondaryContainer, label: "Concluído" }
          : { background: colors.badge.available.background, text: colors.badge.available.text, label: "Disponível" };

  const handleCardPress =
    book.status === "reserved" && onNavigateToNegotiation ? onNavigateToNegotiation : onPress;

  const showMobileShare = Boolean(onShareWhatsApp && book.status === "available");

  return (
    <View style={styles.mobileCardContainer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handleCardPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <ModalityCoverArea modality={book.modality}>
          <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
        </ModalityCoverArea>
        <View style={styles.rowText}>
          <View style={styles.modalityPriceRow}>
            <View style={styles.modalityBadgesGroup}>
              <Tag variant={book.modality} />
              {book.isBox ? (
                <Tag
                  variant="box"
                  label={book.boxVolumesCount ? `Box (${book.boxVolumesCount} vols)` : "Box"}
                />
              ) : null}
            </View>
            <View style={styles.priceChevronGroup}>
              <Text style={styles.priceText} numberOfLines={1}>
                {offerText}
              </Text>
              <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} />
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {book.title}
            </Text>
            {book.author ? (
              <Text style={styles.rowAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
          </View>
          <View style={[styles.footerRow, showMobileShare && styles.footerRowWithShare]}>
            <View style={styles.locationRow}>
              <AppIcon name="place" size={13} color={colors.nature.foliageDeep} />
              <Text style={styles.locationText} numberOfLines={1}>
                {formatBookLocation(book.neighborhood)}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusTone.background }]}>
              <Text style={[styles.statusPillText, { color: statusTone.text }]}>
                {statusTone.label}
              </Text>
            </View>
          </View>
          <Text style={styles.srOnlySummary} numberOfLines={1}>
            {summary}
          </Text>
        </View>
      </Pressable>
      {showMobileShare ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Compartilhar ${book.title} no WhatsApp`}
          hitSlop={8}
          onPress={onShareWhatsApp}
          style={withPress([styles.whatsappButton, styles.whatsappButtonMobile])}
        >
          <AppIcon name="share" size={16} color={colors.nature.foliage} />
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    mobileCardContainer: {
      position: "relative",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 2,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
    },
    rowPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    rowText: { flex: 1, gap: tokens.spacing[6] },
    modalityPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: tokens.spacing[6],
    },
    modalityBadgesGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[6],
    },
    priceChevronGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    priceText: {
      ...tokens.typography.labelLarge,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: tokens.fontWeight.bold,
      fontVariant: ["tabular-nums"],
      color: colors.nature.foliageDeep,
    },
    titleBlock: {
      gap: 2,
    },
    rowTitle: {
      ...tokens.typography.brandCardTitle,
      fontSize: 16,
      lineHeight: 22,
      color: colors.m3.onSurface,
    },
    rowAuthor: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      gap: tokens.spacing[6],
      minHeight: 28,
      paddingTop: tokens.spacing[6],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    footerRowWithShare: {
      paddingRight: 40,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      flexShrink: 1,
    },
    locationText: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      flexShrink: 1,
    },
    statusPill: {
      flexShrink: 0,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
    },
    statusPillText: {
      ...tokens.typography.captionSmall,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: tokens.fontWeight.bold,
    },
    srOnlySummary: {
      position: "absolute",
      width: 0,
      height: 0,
      opacity: 0,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[2],
      flexWrap: "wrap",
    },
    titleRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[16],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    tableMain: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
    },
    cellBook: { flex: 3, minWidth: 220, flexDirection: "row", alignItems: "center", gap: tokens.spacing[16] },
    cellModality: { flex: 1.5, minWidth: 120, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: tokens.spacing[8] },
    cellPrice: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.semiBold,
      fontVariant: ["tabular-nums"],
      color: colors.m3.onSurface,
    },
    cellNeighborhood: { flex: 1.5, minWidth: 120, flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    cellNeighborhoodText: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    cellStatus: { flex: 1.2, minWidth: 100, alignItems: "flex-start" },
    cellActionBox: { width: 148, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: tokens.spacing[8] },
    trailingActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    whatsappButton: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.sprout,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    whatsappButtonMobile: {
      position: "absolute",
      bottom: tokens.spacing[8],
      right: tokens.spacing[12],
      width: 30,
      height: 30,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    cellAction: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    tableTitle: { ...tokens.typography.brandCardTitle, color: colors.m3.onSurface },
    tableAuthor: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    rowSummary: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
