import { useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Book, BookModality } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { IpeMark } from "@/view/components/IpeMark";
import { withPress } from "@/view/pressFeedback";
import { formatPrice } from "@/view/formatPrice";
import { standardHorizontalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useIsWideWeb } from "@/view/useIsWideWeb";

export const MODALITY_PLURAL = {
  sale: "livros à venda",
  trade: "livros para troca",
  donation: "livros para doação",
} as const;

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.nature.foliageDeep, text: "#FFFFFF", label: "Venda" },
    trade: { background: colors.brandBrown, text: "#FFFFFF", label: "Troca" },
    donation: { background: colors.ipe.bloom, text: colors.ipe.onContainer, label: "Doação" },
  };
}

const CAROUSEL_ITEM_WIDTH = 168;
const CAROUSEL_ITEM_GAP = tokens.spacing[12];
const CAROUSEL_ITEM_STRIDE = CAROUSEL_ITEM_WIDTH + CAROUSEL_ITEM_GAP;
export const CAROUSEL_MAX_ITEMS = 4;

export function carouselOffsetFor(index: number): number {
  return index * CAROUSEL_ITEM_STRIDE;
}

export type CatalogCarouselProps = {
  title: string;
  displayTitle?: string;
  badgeText?: string;
  books: readonly Book[];
  onNavigateToBookDetail?: (bookId: string) => void;
  onViewMore: () => void;
  viewMoreLabel: string;
  viewMoreButtonText?: string;
};

/**
 * Seção destacada da Home (Figma `02.01 · Início`, `02.02 · Explorar por seção`).
 */
export function CatalogCarousel({
  title,
  displayTitle,
  badgeText,
  books,
  onNavigateToBookDetail,
  onViewMore,
  viewMoreLabel,
  viewMoreButtonText = "Ver mais",
}: CatalogCarouselProps) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Book> | null>(null);
  const lastIndex = Math.max(0, books.length - 1);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);
  const wideWeb = useIsWideWeb();
  const guardedNavigateToBookDetail = useGuardedPress((id: string) => onNavigateToBookDetail?.(id));

  const renderCard = (item: Book, wide = false) => {
    const tag = modalityTag[item.modality];
    const priceText =
      item.modality === "sale" && item.price != null
        ? formatPrice(item.price)
        : item.modality === "donation"
          ? "Gratuito"
          : "Para troca";

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}${item.neighborhood ? ` em ${item.neighborhood}` : ""}`}
        onPress={() => guardedNavigateToBookDetail(item.id)}
        style={({ pressed }) => [
          styles.carouselCard,
          wide && styles.carouselCardWide,
          pressed && styles.carouselCardPressed,
        ]}
      >
        <View
          style={[
            styles.carouselCardCoverArea,
            wide && styles.carouselCardCoverAreaWide,
            { backgroundColor: tag.background },
          ]}
        >
          <BookCover
            id={item.id}
            title={item.title}
            photoUrl={item.photoUrl}
            variant="card"
            showRibbon={item.modality === "donation" || item.modality === "trade"}
          />
        </View>
        <View style={styles.carouselCardMeta}>
          <View style={styles.carouselCardTopGroup}>
            <View style={styles.carouselCardModalityRow}>
              <View style={[styles.carouselCardModalityPill, { backgroundColor: tag.background }]}>
                <Text numberOfLines={1} style={[styles.carouselCardModality, { color: tag.text }]}>
                  {tag.label}
                </Text>
              </View>
              {item.isBox ? (
                <View
                  style={[
                    styles.carouselCardModalityPill,
                    { backgroundColor: colors.m3.secondaryContainer },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.carouselCardModality,
                      { color: colors.m3.onSecondaryContainer },
                    ]}
                  >
                    {item.boxVolumesCount ? `Box (${item.boxVolumesCount} vols)` : "Box"}
                  </Text>
                </View>
              ) : null}
              <Text numberOfLines={1} style={styles.carouselCardPrice}>
                {priceText}
              </Text>
            </View>
            <View style={styles.carouselCardTitleBlock}>
              <Text numberOfLines={2} style={styles.carouselCardTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.carouselCardAuthor}>{item.author}</Text>
            </View>
          </View>
          {item.neighborhood || item.status === "reserved" ? (
            <View style={styles.carouselCardFooterRow}>
              {item.neighborhood ? (
                <View style={styles.carouselCardLocationRow}>
                  <AppIcon name="place" size={13} color={colors.nature.foliageDeep} />
                  <Text numberOfLines={1} style={styles.carouselCardNeighborhood}>
                    {item.neighborhood}
                  </Text>
                </View>
              ) : null}
              {item.status === "reserved" ? (
                <View
                  style={[
                    styles.carouselCardModalityPill,
                    { backgroundColor: colors.badge.donation.background },
                  ]}
                >
                  <Text style={[styles.carouselCardModality, { color: colors.badge.donation.text }]}>
                    Reservado
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  function goTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, lastIndex));
    setIndex(clamped);
    listRef.current?.scrollToOffset?.({ offset: carouselOffsetFor(clamped), animated: true });
  }

  return (
    <View style={styles.carouselSection} testID={`carousel-${title}`}>
      <View style={styles.carouselHeader}>
        <View style={styles.carouselTitleGroup}>
          <Text
            accessibilityRole="header"
            accessibilityLabel={title}
            numberOfLines={1}
            style={styles.carouselTitle}
          >
            {displayTitle ?? title}
          </Text>
          {badgeText ? (
            <View style={styles.carouselBadge}>
              <Text style={styles.carouselBadgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Item anterior de ${title}`}
          accessibilityState={{ disabled: index <= 0 }}
          disabled={index <= 0}
          onPress={() => goTo(index - 1)}
          style={withPress([styles.carouselNavButton, styles.carouselNavButtonLeft])}
        >
          <Text style={styles.carouselNavText}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Próximo item de ${title}`}
          accessibilityState={{ disabled: index >= lastIndex }}
          disabled={index >= lastIndex}
          onPress={() => goTo(index + 1)}
          style={withPress([styles.carouselNavButton, styles.carouselNavButtonRight])}
        >
          <Text style={styles.carouselNavText}>›</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={viewMoreLabel}
          onPress={onViewMore}
          style={withPress(styles.viewMoreButton)}
        >
          <Text style={styles.viewMoreText}>{viewMoreButtonText}</Text>
        </Pressable>
      </View>
      <View style={[styles.booksGridContainer, wideWeb && styles.booksGridContainerWide]}>
        {books.map((item) => (
          <View key={item.id} style={wideWeb ? styles.booksGridCellWide : styles.booksGridCell}>
            {renderCard(item, wideWeb)}
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Explorar catálogo completo de ${title}`}
        onPress={onViewMore}
        style={withPress(styles.viewMoreBottomButton)}
      >
        <Text style={styles.viewMoreBottomText}>
          {viewMoreButtonText === "Ver mais" ? "Ver mais no Explorar" : viewMoreButtonText}
        </Text>
        <AppIcon name="chevronRight" size={16} color={colors.nature.foliageDeep} />
      </Pressable>
    </View>
  );
}

export type HomeShortcutsSectionProps = {
  wideWeb: boolean;
  donationSummary: string;
  onNavigateToSearch: (filter?: { modality?: BookModality; neighborhood?: string }) => void;
  onNavigateToHelp?: () => void;
};

/**
 * Atalhos comunitários na parte inferior da Home (grade 3 colunas na web larga ou banner de doações no celular).
 */
export function HomeShortcutsSection({
  wideWeb,
  donationSummary,
  onNavigateToSearch,
  onNavigateToHelp,
}: HomeShortcutsSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  if (wideWeb) {
    return (
      <View style={styles.shortcuts}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Doações da semana: ${donationSummary}`}
          onPress={() => onNavigateToSearch({ modality: "donation" })}
          style={withPress([styles.shortcut, { backgroundColor: colors.m3.doacaoContainer }])}
        >
          <AppIcon name="bookmark" size={24} color={colors.m3.onDoacaoContainer} />
          <View style={styles.shortcutText}>
            <Text style={[styles.shortcutTitle, { color: colors.m3.onDoacaoContainer }]}>Doações da semana</Text>
            <Text style={[styles.shortcutBody, { color: colors.m3.onDoacaoContainer }]}>{donationSummary}</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Troque o que já leu"
          onPress={() => onNavigateToSearch({ modality: "trade" })}
          style={withPress([styles.shortcut, { backgroundColor: colors.m3.tertiaryContainer }])}
        >
          <AppIcon name="swap" size={24} color={colors.m3.onTertiaryContainer} />
          <View style={styles.shortcutText}>
            <Text style={[styles.shortcutTitle, { color: colors.m3.onTertiaryContainer }]}>Troque o que já leu</Text>
            <Text style={[styles.shortcutBody, { color: colors.m3.onTertiaryContainer }]}>
              Proponha uma troca direto pelo chat, sem intermediários.
            </Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Encontro seguro: Locais públicos sugeridos e avaliação depois de cada troca"
          disabled={!onNavigateToHelp}
          onPress={() => onNavigateToHelp?.()}
          style={withPress([styles.shortcut, { backgroundColor: colors.m3.primaryContainer }])}
        >
          <AppIcon name="checkCircle" size={24} color={colors.m3.onPrimaryContainer} />
          <View style={styles.shortcutText}>
            <Text style={[styles.shortcutTitle, { color: colors.m3.onPrimaryContainer }]}>Encontro seguro</Text>
            <Text style={[styles.shortcutBody, { color: colors.m3.onPrimaryContainer }]}>
              Locais públicos sugeridos e avaliação depois de cada troca.
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Doações da semana: ${donationSummary}`}
      onHoverIn={() => setIsBannerHovered(true)}
      onHoverOut={() => setIsBannerHovered(false)}
      onPress={() => onNavigateToSearch({ modality: "donation" })}
      style={({ pressed }) => [
        styles.donationBanner,
        isBannerHovered && styles.donationBannerHovered,
        pressed && styles.donationBannerPressed,
      ]}
    >
      <View style={styles.donationBannerIconBox}>
        <AppIcon name="bookmark" size={22} color={colors.ipe.onContainer} />
      </View>
      <View style={styles.donationBannerTextBox}>
        <Text style={styles.donationBannerTitle}>Doações da semana</Text>
        <Text style={styles.donationBannerSubtitle}>{donationSummary}</Text>
      </View>
      <View style={[styles.donationBannerChevronBox, isBannerHovered && styles.donationBannerChevronBoxHovered]}>
        <AppIcon name="chevronRight" size={22} color={colors.ipe.onContainer} />
      </View>
    </Pressable>
  );
}

export type HomeEmptyCatalogSectionProps = {
  carouselDisplayTitle: string;
  hasAnyBooks: boolean;
  isSpecificNeighborhood: boolean;
  effectiveNeighborhood: string;
  selectedModality: BookModality | "all";
  onExploreAllPiripiri: () => void;
  onChangeNeighborhood: () => void;
  onResetModality?: () => void;
};

/**
 * Estado vazio da estante na Home (com ações para explorar toda Piripiri ou trocar de bairro).
 */
export function HomeEmptyCatalogSection({
  carouselDisplayTitle,
  hasAnyBooks,
  isSpecificNeighborhood,
  effectiveNeighborhood,
  selectedModality,
  onExploreAllPiripiri,
  onChangeNeighborhood,
  onResetModality,
}: HomeEmptyCatalogSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isFilteredByModalityOnly =
    hasAnyBooks && !isSpecificNeighborhood && selectedModality !== "all";

  const titleText =
    hasAnyBooks && isSpecificNeighborhood
      ? `Ainda não há ${selectedModality === "all" ? "livros" : MODALITY_PLURAL[selectedModality]} no ${effectiveNeighborhood}.`
      : isFilteredByModalityOnly
        ? `Ainda não há ${MODALITY_PLURAL[selectedModality]} em Piripiri.`
        : "Ainda não há livros por aqui.";

  const bodyText =
    hasAnyBooks && isSpecificNeighborhood
      ? "Seja a primeira pessoa a fazer a estante circular no seu bairro ou explore livros em toda Piripiri."
      : isFilteredByModalityOnly
        ? "Explore todas as modalidades disponíveis na estante comunitária."
        : "Quando houver livros disponíveis, eles aparecerão neste espaço.";

  const showExploreAll = hasAnyBooks && isSpecificNeighborhood;
  const showChangeNeighborhood = hasAnyBooks && isSpecificNeighborhood;
  const showResetModality = isFilteredByModalityOnly && Boolean(onResetModality);
  const hasActions = showExploreAll || showChangeNeighborhood || showResetModality;

  return (
    <View style={styles.empty}>
      <Text accessibilityRole="header" style={styles.carouselTitle}>{carouselDisplayTitle}</Text>
      <View testID="home-empty-catalog-card" style={styles.emptyCard}>
        <View style={styles.emptyIpeContainer}>
          <IpeMark size={56} />
        </View>
        <Text style={styles.emptyTitle}>{titleText}</Text>
        <Text style={styles.body}>{bodyText}</Text>
        {hasActions ? (
          <View style={styles.emptyActionsRow}>
            {showExploreAll ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver livros em toda Piripiri"
                onPress={onExploreAllPiripiri}
                style={withPress(styles.emptyPrimaryButton)}
              >
                <AppIcon name="search" size={18} color={colors.m3.onPrimary} />
                <Text style={styles.emptyPrimaryButtonText}>Explorar toda Piripiri</Text>
              </Pressable>
            ) : null}
            {showChangeNeighborhood ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar outro bairro"
                onPress={onChangeNeighborhood}
                style={withPress(styles.emptySecondaryButton)}
              >
                <AppIcon name="place" size={16} color={colors.m3.onSurfaceVariant} />
                <Text style={styles.emptySecondaryButtonText}>Trocar bairro</Text>
              </Pressable>
            ) : null}
            {showResetModality ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver todas as modalidades"
                onPress={onResetModality}
                style={withPress(styles.emptyPrimaryButton)}
              >
                <Text style={styles.emptyPrimaryButtonText}>Ver todos os livros</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    donationBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
      minHeight: tokens.spacing[64],
      gap: tokens.spacing[14],
      marginBottom: tokens.spacing[24],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.ipe.bloom,
      borderWidth: 1,
      borderColor: "rgba(69, 26, 3, 0.08)",
      elevation: 2,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      ...(Platform.OS === "web"
        ? ({
            cursor: "pointer",
            userSelect: "none",
          } as never)
        : {}),
    },
    donationBannerHovered: {
      transform: [{ scale: 1.01 }],
      elevation: 4,
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
    donationBannerPressed: {
      transform: [{ scale: 0.985 }],
      opacity: 0.92,
    },
    donationBannerIconBox: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.petalSoft,
      justifyContent: "center",
      alignItems: "center",
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    donationBannerTextBox: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    donationBannerTitle: {
      fontFamily: tokens.fontFamily.brand,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: tokens.fontWeight.bold,
      color: colors.ipe.onContainer,
    },
    donationBannerSubtitle: {
      fontFamily: tokens.fontFamily.regular,
      fontSize: 14,
      lineHeight: 18,
      color: colors.ipe.onContainer,
      opacity: 0.88,
    },
    donationBannerChevronBox: {
      width: tokens.spacing[28],
      height: tokens.spacing[28],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    donationBannerChevronBoxHovered: {
      transform: [{ translateX: 2 }],
    },
    carouselSection: { marginBottom: tokens.spacing[24] },
    carouselHeader: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[12],
    },
    carouselTitleGroup: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginRight: tokens.spacing[8],
    },
    carouselTitle: {
      flexShrink: 1,
      ...tokens.typography.titleBar,
      color: colors.m3.onSurface,
    },
    carouselBadge: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      alignSelf: "center",
    },
    carouselBadgeText: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onSecondaryContainer,
    },
    viewMoreButton: {
      flexShrink: 0,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    viewMoreText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
    },
    carouselRow: {
      position: "relative",
      marginHorizontal: -tokens.spacing[16],
    },
    shortcuts: { flexDirection: "row", gap: tokens.spacing[24] },
    shortcut: { flex: 1, flexDirection: "row", gap: tokens.spacing[16], padding: tokens.spacing[24], borderRadius: tokens.radius.large },
    shortcutText: { flex: 1, gap: tokens.spacing[4] },
    shortcutTitle: { ...tokens.typography.titleBlock },
    shortcutBody: { ...tokens.typography.bodyMedium },
    carouselGrid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[24], alignItems: "stretch", width: "100%" },
    carouselGridCell: { flexGrow: 1, flexBasis: 220, minWidth: 180, maxWidth: 320, flexDirection: "column" },
    carouselCardCoverAreaWide: { paddingVertical: tokens.spacing[12] },
    carouselCardWide: { flex: 1, width: "100%", borderRadius: tokens.radius.xl, backgroundColor: colors.m3.surfaceContainerLowest },
    carouselList: { flexGrow: 0 },
    carouselListContent: {
      paddingHorizontal: tokens.spacing[16],
      gap: CAROUSEL_ITEM_GAP,
      alignItems: "stretch",
    },
    carouselNavButton: {
      position: "absolute",
      top: 0,
      zIndex: 2,
      width: tokens.accessibility.touchTarget,
      height: tokens.spacing[32],
      alignItems: "center",
      justifyContent: "center",
      opacity: 0,
    },
    carouselNavButtonLeft: { left: 0 },
    carouselNavButtonRight: { left: tokens.accessibility.touchTarget },
    carouselNavText: { ...tokens.typography.titleBar, color: colors.action, fontWeight: tokens.fontWeight.bold },
    carouselCard: {
      flex: 1,
      width: "100%",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.large,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 2,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    carouselCardPressed: {
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.98 }],
    },
    carouselCardCoverArea: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[12],
      minHeight: 124,
      borderTopLeftRadius: tokens.radius.large,
      borderTopRightRadius: tokens.radius.large,
      overflow: "hidden",
    },
    carouselCardMeta: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[10],
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderBottomLeftRadius: tokens.radius.large,
      borderBottomRightRadius: tokens.radius.large,
    },
    carouselCardTopGroup: {
      gap: tokens.spacing[6],
    },
    carouselCardTitleBlock: {
      gap: 2,
    },
    carouselCardModalityRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: tokens.spacing[6] },
    carouselCardModalityPill: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
    },
    carouselCardModality: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    carouselCardPrice: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.bold,
      color: colors.nature.foliageDeep,
    },
    carouselCardTitle: {
      ...tokens.typography.brandCardTitle,
      fontSize: 15,
      lineHeight: 19,
      color: colors.m3.onSurface,
    },
    carouselCardAuthor: {
      ...tokens.typography.bodyMedium,
      fontSize: 12,
      lineHeight: 16,
      color: colors.m3.onSurfaceVariant,
    },
    carouselCardReserved: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onTertiaryContainer,
    },
    carouselCardFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: tokens.spacing[6],
      marginTop: "auto",
      paddingTop: tokens.spacing[2],
    },
    carouselCardLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      flexShrink: 1,
    },
    carouselCardNeighborhood: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      flexShrink: 1,
    },
    booksGridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "stretch",
      rowGap: tokens.spacing[14],
    },
    booksGridContainerWide: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: tokens.spacing[16],
    },
    booksGridCell: {
      width: "48%",
      alignSelf: "stretch",
    },
    booksGridCellWide: {
      flexGrow: 1,
      flexBasis: 200,
      minWidth: 180,
      maxWidth: 300,
    },
    viewMoreBottomButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.full,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[20],
      marginTop: tokens.spacing[16],
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    viewMoreBottomText: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.bold,
      color: colors.nature.foliageDeep,
    },
    empty: {
      gap: tokens.spacing[12],
      marginBottom: tokens.spacing[24],
    },
    emptyCard: {
      width: "100%",
      backgroundColor: colors.book.pageCard,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      paddingVertical: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[24],
      gap: tokens.spacing[12],
      alignItems: "center",
    },
    emptyIpeContainer: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.container,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[4],
    },
    emptyActionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
      alignItems: "center",
    },
    emptyPrimaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[20],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
    },
    emptyPrimaryButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onPrimary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    emptySecondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[18],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    emptySecondaryButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.medium,
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
      lineHeight: tokens.lineHeight[24],
      textAlign: "center",
    },
    body: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      lineHeight: tokens.lineHeight[20],
      textAlign: "center",
      maxWidth: 440,
    },
  });
}
