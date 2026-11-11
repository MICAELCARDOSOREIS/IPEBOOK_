import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { formatBookLocation } from "@/model/entities/location";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag, type TagProps } from "@/view/components/Tag";

import { withPress } from "@/view/pressFeedback";
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
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={withPress([styles.row, styles.tableRow])}
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
          {wide.offer && wide.offer !== book.modality ? (
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
        <View style={styles.cellActionBox}>
          {onShareWhatsApp && book.status === "available" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Compartilhar ${book.title} no WhatsApp`}
              hitSlop={8}
              onPress={(e) => {
                e?.stopPropagation?.();
                onShareWhatsApp();
              }}
              style={withPress(styles.whatsappButton)}
            >
              <AppIcon name="share" size={18} color={colors.nature.foliage} />
            </Pressable>
          ) : null}
          <View style={styles.actionButton}>
            <Text style={styles.cellAction}>{actionText}</Text>
            <AppIcon name="chevronRight" size={16} color={colors.m3.primary} />
          </View>
        </View>
      </Pressable>
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

  const hasNegotiationAction = book.status === "reserved" && Boolean(onNavigateToNegotiation);
  const handleCardPress = hasNegotiationAction ? onNavigateToNegotiation! : onPress;

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
            <Text style={styles.priceText} numberOfLines={1}>
              {offerText}
            </Text>
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
          <View style={styles.footerRow}>
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
        <View style={styles.trailingActions}>
          {onShareWhatsApp && book.status === "available" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Compartilhar ${book.title} no WhatsApp`}
              hitSlop={8}
              onPress={(e) => {
                e?.stopPropagation?.();
                onShareWhatsApp();
              }}
              style={withPress(styles.whatsappButton)}
            >
              <AppIcon name="share" size={18} color={colors.nature.foliage} />
            </Pressable>
          ) : null}
          <AppIcon name="chevronRight" size={22} color={colors.m3.onSurfaceVariant} />
        </View>
      </Pressable>
      {hasNegotiationAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver negociação de ${book.title}`}
          hitSlop={8}
          onPress={(e) => {
            e?.stopPropagation?.();
            onNavigateToNegotiation?.();
          }}
          style={({ pressed }) => [
            styles.negotiationFooterBar,
            pressed && styles.negotiationFooterBarPressed,
          ]}
        >
          <View style={styles.negotiationFooterLeft}>
            <AppIcon name="chat" size={15} color={colors.nature.foliageDeep} />
            <Text style={styles.negotiationFooterLabel}>Negociação em andamento</Text>
          </View>
          <View style={styles.negotiationFooterRight}>
            <Text style={styles.negotiationFooterAction}>Ver negociação</Text>
            <AppIcon name="chevronRight" size={16} color={colors.nature.foliageDeep} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    mobileCardContainer: {
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
      gap: tokens.spacing[14],
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
      paddingTop: tokens.spacing[6],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
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
    negotiationFooterBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      backgroundColor: colors.nature.sprout,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
      minHeight: tokens.accessibility.touchTarget,
    },
    negotiationFooterBarPressed: {
      backgroundColor: colors.m3.primaryContainer,
    },
    negotiationFooterLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      flexShrink: 1,
    },
    negotiationFooterLabel: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
    },
    negotiationFooterRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[2],
      flexShrink: 0,
    },
    negotiationFooterAction: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: tokens.fontWeight.bold,
      fontFamily: fontFamily.semiBold,
      color: colors.nature.foliageDeep,
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
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    cellBook: { flex: 3, minWidth: 220, flexDirection: "row", alignItems: "center", gap: tokens.spacing[16] },
    cellModality: { flex: 1.5, minWidth: 120, alignItems: "flex-start", gap: tokens.spacing[4] },
    cellPrice: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSurface },
    cellNeighborhood: { flex: 1.5, minWidth: 120, flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    cellNeighborhoodText: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    cellStatus: { flex: 1.2, minWidth: 100, alignItems: "flex-start" },
    cellActionBox: { minWidth: 140, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: tokens.spacing[8] },
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
      alignItems: "center",
      justifyContent: "center",
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
