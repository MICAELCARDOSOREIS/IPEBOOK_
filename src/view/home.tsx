import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import type { Book, BookModality } from "@/model/entities/book";

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.badge.sale.background, text: colors.badge.sale.text, label: "Venda" },
    trade: { background: colors.badge.trade.background, text: colors.badge.trade.text, label: "Troca" },
    donation: { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Doação" },
  };
}

const CAROUSEL_ITEM_WIDTH = 168;
const CAROUSEL_ITEM_GAP = tokens.spacing[12];
const CAROUSEL_ITEM_STRIDE = CAROUSEL_ITEM_WIDTH + CAROUSEL_ITEM_GAP;
const CAROUSEL_MAX_ITEMS = 8;

export function carouselOffsetFor(index: number): number {
  return index * CAROUSEL_ITEM_STRIDE;
}

type CatalogCarouselProps = {
  title: string;
  displayTitle?: string;
  books: readonly Book[];
  onNavigateToBookDetail?: (bookId: string) => void;
  onViewMore: () => void;
  viewMoreLabel: string;
  viewMoreButtonText?: string;
};

/**
 * Seção destacada da Home (Figma `02.01 · Início`, `02.02 · Explorar por seção`).
 */
function CatalogCarousel({
  title,
  displayTitle,
  books,
  onNavigateToBookDetail,
  onViewMore,
  viewMoreLabel,
  viewMoreButtonText = "Ver todos",
}: CatalogCarouselProps) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Book> | null>(null);
  const lastIndex = Math.max(0, books.length - 1);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);

  function goTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, lastIndex));
    setIndex(clamped);
    listRef.current?.scrollToOffset?.({ offset: carouselOffsetFor(clamped), animated: true });
  }

  return (
    <View style={styles.carouselSection} testID={`carousel-${title}`}>
      <View style={styles.carouselHeader}>
        <Text
          accessibilityRole="header"
          accessibilityLabel={title}
          numberOfLines={1}
          style={styles.carouselTitle}
        >
          {displayTitle ?? title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={viewMoreLabel}
          onPress={onViewMore}
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>{viewMoreButtonText}</Text>
        </Pressable>
      </View>
      <View style={styles.carouselRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Item anterior de ${title}`}
          accessibilityState={{ disabled: index <= 0 }}
          disabled={index <= 0}
          onPress={() => goTo(index - 1)}
          style={[styles.carouselNavButton, index <= 0 ? styles.carouselNavButtonDisabled : null]}
        >
          <Text style={styles.carouselNavText}>‹</Text>
        </Pressable>
        <FlatList
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={books as Book[]}
          keyExtractor={(item) => item.id}
          style={styles.carouselList}
          renderItem={({ item }) => {
            const tag = modalityTag[item.modality];
            const priceSuffix = item.modality === "sale" && item.price != null
              ? ` · R$ ${item.price.toFixed(2).replace(".", ",")}`
              : "";
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                onPress={() => onNavigateToBookDetail?.(item.id)}
                style={styles.carouselCard}
              >
                <View style={styles.carouselCardCoverArea}>
                  <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="card" />
                </View>
                <View style={styles.carouselCardMeta}>
                  <Text numberOfLines={1} style={styles.carouselCardModality}>
                    {tag.label}{priceSuffix}
                  </Text>
                  <Text numberOfLines={2} style={styles.carouselCardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.carouselCardAuthor}>{item.author}</Text>
                  {item.status === "reserved" ? <Text style={styles.carouselCardReserved}>Reservado</Text> : null}
                </View>
              </Pressable>
            );
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Próximo item de ${title}`}
          accessibilityState={{ disabled: index >= lastIndex }}
          disabled={index >= lastIndex}
          onPress={() => goTo(index + 1)}
          style={[styles.carouselNavButton, index >= lastIndex ? styles.carouselNavButtonDisabled : null]}
        >
          <Text style={styles.carouselNavText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

export type HomeProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToMyListings?: () => void;
  onNavigateToReceivedRequests?: () => void;
  onNavigateToSentRequests?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  /** "Ver mais" das seções destacadas; `modality` pré-aplica o filtro na Pesquisa. */
  onNavigateToSearch?: (filter?: { modality?: BookModality }) => void;
  /** Mudar este valor força o catálogo a recarregar (ex.: ao voltar de cadastrar um anúncio). */
  focusKey?: unknown;
};

export default function Home({
  currentNeighborhood = "Centro",
  onSelectNeighborhood,
  onNavigateToSignIn,
  onNavigateToCreateListing,
  onNavigateToMyListings,
  onNavigateToReceivedRequests,
  onNavigateToSentRequests,
  onNavigateToBookDetail,
  onNavigateToNotifications,
  onNavigateToFavorites,
  onNavigateToAlerts,
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const [state, actions] = useHomeViewModel();
  const [authState, authActions] = useAuthViewModel();
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);
  const [selectedModality, setSelectedModality] = useState<BookModality | "all">("all");

  const isFirstFocus = useRef(true);
  useEffect(() => {
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      return;
    }
    void actions.reload();
  }, [focusKey]);

  const filteredBooks = useMemo(() => {
    if (selectedModality === "all") return state.books;
    return state.books.filter((b) => b.modality === selectedModality);
  }, [state.books, selectedModality]);

  const recentBooks = filteredBooks.slice(0, CAROUSEL_MAX_ITEMS);
  const donationCount = state.books.filter(
    (book) => book.modality === "donation" && book.status === "available",
  ).length;
  const donationSummary =
    donationCount === 0
      ? "Veja as doações em Piripiri"
      : `${donationCount} ${donationCount === 1 ? "livro gratuito" : "livros gratuitos"} em Piripiri`;

  const listHeader = (
    <View style={styles.headerContainer}>
      {/* 1. Barra de Topo: Bairro (Pill) e Sino de Notificações + Sessão */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Selecionar bairro: ${currentNeighborhood}`}
          onPress={() => onSelectNeighborhood?.()}
          style={styles.neighborhoodPill}
        >
          <AppIcon name="place" size={20} color={colors.m3.primary} />
          <Text style={styles.neighborhoodText}>{currentNeighborhood}</Text>
          <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
        </Pressable>

        <View style={styles.topRightActions}>
          {authState.loading ? null : authState.user ? (
            <View style={styles.sessionHeaderRow}>
              <Text numberOfLines={1} style={styles.sessionText}>Olá, {authState.user.email}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => onNavigateToCreateListing?.()}
                style={styles.sessionPill}
              >
                <Text style={styles.sessionPillText}>Anunciar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void authActions.signOut()}
                style={styles.sessionPill}
              >
                <Text style={styles.sessionPillText}>Sair</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar no aplicativo"
              onPress={() => onNavigateToSignIn?.()}
              style={styles.sessionPill}
            >
              <Text style={styles.sessionPillText}>Entrar</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir notificações"
            onPress={() => onNavigateToNotifications?.()}
            style={styles.notificationButton}
          >
            <AppIcon name="bell" size={24} color={colors.m3.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Atalhos de negociação quando autenticado */}
      {authState.user ? (
        <View style={styles.userShortcutsRow}>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToFavorites?.()} style={styles.shortcutChip}>
            <Text style={styles.shortcutChipText}>Favoritos</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToAlerts?.()} style={styles.shortcutChip}>
            <Text style={styles.shortcutChipText}>Meus alertas</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToMyListings?.()} style={styles.shortcutChip}>
            <Text style={styles.shortcutChipText}>Meus anúncios</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToReceivedRequests?.()} style={styles.shortcutChip}>
            <Text style={styles.shortcutChipText}>Pedidos recebidos</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToSentRequests?.()} style={styles.shortcutChip}>
            <Text style={styles.shortcutChipText}>Meus pedidos</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 2. Manchete Editorial (Hero do Figma 02.01) */}
      <View style={styles.heroSection}>
        <Text accessibilityRole="header" style={styles.heroTitle}>
          Encontre sua próxima história.
        </Text>
        <Text style={styles.heroSubtitle}>
          Compre, troque ou receba livros de quem mora perto de você.
        </Text>
      </View>

      {/* 3. Campo de Busca Integrado */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buscar título, autor ou categoria"
        onPress={() => onNavigateToSearch?.(selectedModality === "all" ? undefined : { modality: selectedModality })}
        style={styles.searchBar}
      >
        <AppIcon name="search" size={24} color={colors.m3.onSurfaceVariant} />
        <Text style={styles.searchPlaceholder}>Buscar título, autor ou categoria</Text>
      </Pressable>

      {/* 4. Chips de Filtro Rápido (Todos, Venda, Troca, Doação) */}
      <View style={styles.chipsContainer}>
        {(["all", "sale", "trade", "donation"] as const).map((mod) => {
          const isSelected = selectedModality === mod;
          const label = mod === "all" ? "Todos" : mod === "sale" ? "Venda" : mod === "trade" ? "Troca" : "Doação";
          return (
            <Pressable
              key={mod}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${label}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedModality(mod)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
            >
              {isSelected ? <AppIcon name="check" size={18} color={colors.m3.onSecondaryContainer} /> : null}
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 5. "Perto de você" (Figma 02.01): carrossel ou estado de carregamento, erro ou vazio */}
      {state.loading ? (
        <LoadingState label="Carregando livros" />
      ) : state.error ? (
        isOnline ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : (
          <OfflineState onRetry={() => void actions.reload()} />
        )
      ) : recentBooks.length > 0 ? (
        <CatalogCarousel
          title="Recém-adicionados"
          displayTitle="Perto de você"
          books={recentBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => (selectedModality === "all" ? onNavigateToSearch?.() : onNavigateToSearch?.({ modality: selectedModality }))}
          viewMoreLabel="Ver mais livros recém-adicionados"
          viewMoreButtonText="Ver todos"
        />
      ) : (
        <View style={styles.empty}>
          <Text accessibilityRole="header" style={styles.carouselTitle}>Perto de você</Text>
          <Text style={styles.emptyTitle}>Ainda não há livros por aqui.</Text>
          <Text style={styles.body}>Quando houver livros disponíveis, eles aparecerão neste espaço.</Text>
        </View>
      )}

      {/* 6. Banner de Destaque Comunitário ("Doações da semana") */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Doações da semana: ${donationSummary}`}
        onPress={() => onNavigateToSearch?.({ modality: "donation" })}
        style={styles.donationBanner}
      >
        <View style={styles.donationBannerIconBox}>
          <AppIcon name="bookmark" size={24} color={colors.m3.onSurfaceVariant} />
        </View>
        <View style={styles.donationBannerTextBox}>
          <Text style={styles.donationBannerTitle}>Doações da semana</Text>
          <Text style={styles.donationBannerSubtitle}>
            {donationSummary}
          </Text>
        </View>
        <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
      </Pressable>

    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>{listHeader}</ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    content: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[24],
    },
    headerContainer: {
      marginBottom: tokens.spacing[16],
    },

    // 1. Top bar
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[12],
    },
    neighborhoodPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.surfaceContainerHigh,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      minHeight: tokens.accessibility.touchTarget,
    },
    neighborhoodText: {
      ...tokens.typography.bodyMedium,
      fontFamily: tokens.typography.labelMedium.fontFamily,
      fontWeight: "500",
      color: colors.m3.onSurface,
    },
    topRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    notificationButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      borderRadius: tokens.radius.full,
      justifyContent: "center",
      alignItems: "center",
    },
    sessionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    sessionPill: {
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      minHeight: 36,
      justifyContent: "center",
    },
    sessionPillText: {
      ...tokens.typography.labelMedium,
      fontWeight: "600",
      color: colors.action,
    },
    sessionText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      maxWidth: 120,
    },
    userShortcutsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[16],
    },
    shortcutChip: {
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    shortcutChipText: {
      ...tokens.typography.labelSmall,
      color: colors.action,
      fontWeight: "500",
    },

    // 2. Hero editorial
    heroSection: {
      marginBottom: tokens.spacing[12],
    },
    heroTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.brandBrown,
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[8],
    },

    // 3. Campo de Busca
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      height: tokens.spacing[56],
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[16],
      marginBottom: tokens.spacing[8],
    },
    searchPlaceholder: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
    },

    // 4. Chips de Filtro
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[24],
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.small,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: "transparent",
      minHeight: tokens.spacing[32],
    },
    filterChipSelected: {
      paddingLeft: tokens.spacing[8],
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
    },
    filterChipText: {
      ...tokens.typography.bodyMedium,
      fontFamily: tokens.typography.labelMedium.fontFamily,
      color: colors.m3.onSurfaceVariant,
      fontWeight: "500",
    },
    filterChipTextSelected: {
      color: colors.m3.onSecondaryContainer,
    },

    // 5. Destaque Comunitário ("Doações da semana")
    donationBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      minHeight: tokens.spacing[56],
      gap: tokens.spacing[16],
      marginBottom: tokens.spacing[24],
    },
    donationBannerIconBox: {
      justifyContent: "center",
      alignItems: "center",
    },
    donationBannerTextBox: {
      flex: 1,
      gap: 2,
    },
    donationBannerTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    donationBannerSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },

    // 6. Carrossel
    carouselSection: { marginBottom: tokens.spacing[24] },
    carouselHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[12],
    },
    carouselTitle: {
      flexShrink: 1,
      ...tokens.typography.bodyLarge,
      fontSize: 22,
      lineHeight: 28,
      color: colors.m3.onSurface,
    },
    viewMoreButton: {
      flexShrink: 0,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    viewMoreText: {
      ...tokens.typography.bodyMedium,
      fontFamily: tokens.typography.labelMedium.fontFamily,
      color: colors.m3.primary,
      fontWeight: "500",
    },
    carouselRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    carouselList: { flexGrow: 0 },
    carouselNavButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    carouselNavButtonDisabled: { opacity: 0.3 },
    carouselNavText: { fontSize: 22, color: colors.action, fontWeight: "700" },
    carouselCard: {
      width: CAROUSEL_ITEM_WIDTH,
      marginRight: CAROUSEL_ITEM_GAP,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.medium,
      overflow: "hidden",
      boxShadow: tokens.elevation.level1,
    },
    carouselCardCoverArea: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[8],
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    carouselCardMeta: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    carouselCardModality: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    carouselCardTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    carouselCardAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    carouselCardReserved: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onTertiaryContainer,
    },


    // 8. Estado vazio e rodapé
    empty: {
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[24],
    },
    emptyTitle: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    body: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
