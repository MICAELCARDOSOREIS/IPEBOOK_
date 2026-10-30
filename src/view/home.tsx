import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import type { Book, BookModality } from "@/model/entities/book";
import { WEB_GUTTER, WEB_MAX_WIDTH, useWebGridColumns } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
const MODALITY_PLURAL = { sale: "livros à venda", trade: "livros para troca", donation: "livros para doação" } as const;

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
  const wideWeb = useIsWideWeb();
  const webColumns = useWebGridColumns();

  const renderCard = (item: Book, wide = false) => {
    const tag = modalityTag[item.modality];
    const priceSuffix = item.modality === "sale" && item.price != null
      ? ` · R$ ${item.price.toFixed(2).replace(".", ",")}`
      : "";
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}${item.neighborhood ? ` em ${item.neighborhood}` : ""}`}
        onPress={() => onNavigateToBookDetail?.(item.id)}
        style={({ pressed }) => [
          styles.carouselCard,
          wide && styles.carouselCardWide,
          pressed && styles.carouselCardPressed,
        ]}
      >
        {/* Fundo da capa na cor da modalidade, como no topo do detalhe do livro. */}
        <View style={[styles.carouselCardCoverArea, wide && styles.carouselCardCoverAreaWide, { backgroundColor: tag.background }]}>
          <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant={wide ? "detail" : "card"} />
        </View>
        <View style={styles.carouselCardMeta}>
          {/* Modalidade em etiqueta colorida (a mesma cor dos filtros e do detalhe), preço ao lado. */}
          <View style={styles.carouselCardModalityRow}>
            <View style={[styles.carouselCardModalityPill, { backgroundColor: tag.background }]}>
              <Text numberOfLines={1} style={[styles.carouselCardModality, { color: tag.text }]}>
                {tag.label}
              </Text>
            </View>
            {priceSuffix ? (
              <Text numberOfLines={1} style={styles.carouselCardPrice}>
                {priceSuffix.replace(" · ", "")}
              </Text>
            ) : null}
          </View>
          <Text numberOfLines={2} style={styles.carouselCardTitle}>{item.title}</Text>
          <Text numberOfLines={1} style={styles.carouselCardAuthor}>{item.author}</Text>
          {item.neighborhood ? (
            <View style={styles.carouselCardLocationRow}>
              <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
              <Text numberOfLines={1} style={styles.carouselCardNeighborhood}>
                {item.neighborhood}
              </Text>
            </View>
          ) : null}
          {item.status === "reserved" ? <Text style={styles.carouselCardReserved}>Reservado</Text> : null}
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
        <Text
          accessibilityRole="header"
          accessibilityLabel={title}
          numberOfLines={1}
          style={styles.carouselTitle}
        >
          {displayTitle ?? title}
        </Text>
        {/* Figma `02.01` não mostra setas: o carrossel rola por gesto. Estes botões ficam invisíveis
            sobre o título da seção — área sem toque de cartão — para leitores de tela e teclado
            paginarem item a item. */}
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
      {wideWeb ? (
        <View style={styles.carouselGrid}>{books.slice(0, webColumns).map((item) => <View key={item.id} style={styles.carouselGridCell}>{renderCard(item, true)}</View>)}</View>
      ) : (
      <View style={styles.carouselRow}>
        <FlatList
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={books as Book[]}
          keyExtractor={(item) => item.id}
          style={styles.carouselList}
          contentContainerStyle={styles.carouselListContent}
          renderItem={({ item }) => renderCard(item)}
        />
      </View>
      )}
    </View>
  );
}

export type HomeProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToNotifications?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  /** "Ver mais" das seções destacadas; `modality` e `neighborhood` pré-aplicam filtros na Pesquisa. */
  onNavigateToSearch?: (filter?: { modality?: BookModality; neighborhood?: string }) => void;
  /** Mudar este valor força o catálogo a recarregar (ex.: ao voltar de cadastrar um anúncio). */
  focusKey?: unknown;
};

export default function Home({
  currentNeighborhood,
  onSelectNeighborhood,
  onNavigateToSignIn,
  onNavigateToBookDetail,
  onNavigateToNotifications,
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const neighborhoodHook = useActiveNeighborhood("Centro");
  const effectiveNeighborhood = currentNeighborhood ?? neighborhoodHook.activeNeighborhood;
  const handleSelectNeighborhood = onSelectNeighborhood ?? neighborhoodHook.openSelector;

  const [state, actions] = useHomeViewModel();
  const [authState] = useAuthViewModel();
  // Só o contador de não lidas: convite e resposta de encontro chegam por aqui, em tempo real (Spec 086).
  const [notificationsState, notificationsActions] = useNotificationsViewModel(authState.user?.id ?? null);
  const unreadCount = notificationsState.unreadCount;
  const { isOnline } = useNetworkStatus();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);
  const wideWeb = useIsWideWeb();
  const [selectedModality, setSelectedModality] = useState<BookModality | "all">("all");

  const isFirstFocus = useRef(true);
  useEffect(() => {
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      return;
    }
    void actions.reload();
    void notificationsActions.refresh();
  }, [focusKey]);

  // O tempo real pode não chegar com o app em segundo plano: ao voltar, confere os avisos de novo.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") void notificationsActions.refresh();
    });
    return () => subscription.remove();
  }, [notificationsActions]);

  const isSpecificNeighborhood =
    Boolean(effectiveNeighborhood) &&
    effectiveNeighborhood !== "all" &&
    effectiveNeighborhood !== "Todos os bairros (Piripiri)";

  const isCustomNeighborhood =
    isSpecificNeighborhood && effectiveNeighborhood !== "Centro";

  const filteredBooks = useMemo(() => {
    if (selectedModality === "all") return state.books;
    return state.books.filter((b) => b.modality === selectedModality);
  }, [state.books, selectedModality]);

  const neighborhoodBooks = useMemo(() => {
    if (!isSpecificNeighborhood) return filteredBooks;
    if (effectiveNeighborhood === "Centro") {
      return filteredBooks.filter((b) => !b.neighborhood || b.neighborhood === "Centro");
    }
    return filteredBooks.filter((b) => b.neighborhood === effectiveNeighborhood);
  }, [filteredBooks, isSpecificNeighborhood, effectiveNeighborhood]);

  const recentBooks = neighborhoodBooks.slice(0, CAROUSEL_MAX_ITEMS);
  const donationCount = state.books.filter(
    (book) => book.modality === "donation" && book.status === "available",
  ).length;
  const totalBooksCount = state.books.length;
  const uniqueNeighborhoodsCount = useMemo(() => {
    const set = new Set(state.books.map((b) => b.neighborhood).filter(Boolean));
    return Math.max(1, set.size);
  }, [state.books]);
  const donationSummary =
    donationCount === 0
      ? "Veja as doações em Piripiri"
      : `${donationCount} ${donationCount === 1 ? "livro gratuito" : "livros gratuitos"} em Piripiri`;

  const displayNeighborhood =
    !isSpecificNeighborhood
      ? "Piripiri (Todos)"
      : effectiveNeighborhood;

  const carouselDisplayTitle = isCustomNeighborhood
    ? `Perto de você no ${effectiveNeighborhood}`
    : "Perto de você";

  const listHeader = (
    <View style={styles.headerContainer}>
      {/* 1. Barra de Topo: Bairro (Pill), Entrar (sem sessão) e Sino de Notificações */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Selecionar bairro: ${displayNeighborhood}`}
          hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4] }}
          onPress={handleSelectNeighborhood}
          style={withPress(styles.neighborhoodPill)}
        >
          <AppIcon name="place" size={20} color={colors.m3.primary} />
          <Text numberOfLines={1} style={styles.neighborhoodText}>{displayNeighborhood}</Text>
          <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
        </Pressable>

        {wideWeb ? null : (
          <View style={styles.topRightActions}>
            {authState.loading || authState.user ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Entrar no aplicativo"
                hitSlop={{ top: tokens.spacing[6], bottom: tokens.spacing[6] }}
                onPress={() => onNavigateToSignIn?.()}
                style={withPress(styles.sessionPill)}
              >
                <Text style={styles.sessionPillText}>Entrar</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0
                  ? `Abrir notificações, ${unreadCount} ${unreadCount === 1 ? "não lida" : "não lidas"}`
                  : "Abrir notificações"
              }
              hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4], left: tokens.spacing[4], right: tokens.spacing[4] }}
              onPress={() => onNavigateToNotifications?.()}
              style={withPress(styles.notificationButton)}
            >
              <AppIcon name="bell" size={24} color={colors.m3.onSurfaceVariant} />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        )}
      </View>

      {/* 2. Manchete Editorial (Hero do Figma 02.01) */}
      <View style={[styles.heroSection, wideWeb && styles.heroSectionWide]}>
        <Text accessibilityRole="header" style={[styles.heroTitle, wideWeb && styles.heroTitleWide]}>
          Encontre sua próxima história.
        </Text>
        <Text style={[styles.heroSubtitle, wideWeb && styles.heroSubtitleWide]}>
          Compre, troque ou receba livros de quem mora perto de você.
        </Text>
        {wideWeb && totalBooksCount > 0 ? (
          <View style={styles.statsBannerWide} testID="home-community-stats">
            <View style={styles.statItemWide}>
              <Text style={styles.statNumberWide}>{totalBooksCount}</Text>
              <Text style={styles.statLabelWide}>
                {totalBooksCount === 1 ? "livro anunciado" : "livros anunciados"}
              </Text>
            </View>
            <View style={styles.statDividerWide} />
            <View style={styles.statItemWide}>
              <Text style={styles.statNumberWide}>{uniqueNeighborhoodsCount}</Text>
              <Text style={styles.statLabelWide}>
                {uniqueNeighborhoodsCount === 1 ? "bairro com leitores" : "bairros com leitores"}
              </Text>
            </View>
            <View style={styles.statDividerWide} />
            <View style={styles.statItemWide}>
              <Text style={styles.statNumberWide}>{donationCount}</Text>
              <Text style={styles.statLabelWide}>
                {donationCount === 1 ? "doação disponível" : "doações disponíveis"}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* 3. Campo de Busca Integrado */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buscar título, autor ou categoria"
        onPress={() => {
          const filter: { modality?: BookModality; neighborhood?: string } = {};
          if (selectedModality !== "all") filter.modality = selectedModality;
          if (isCustomNeighborhood) filter.neighborhood = effectiveNeighborhood;
          if (Object.keys(filter).length > 0) {
            onNavigateToSearch?.(filter);
          } else {
            onNavigateToSearch?.();
          }
        }}
        style={withPress(styles.searchBar)}
      >
        <AppIcon name="search" size={24} color={colors.m3.onSurfaceVariant} />
        <Text style={styles.searchPlaceholder}>Buscar título, autor ou categoria</Text>
      </Pressable>

      {/* 4. Chips de Filtro Rápido (Todos, Venda, Troca, Doação) */}
      <View style={styles.chipsContainer}>
        {(["all", "sale", "trade", "donation"] as const).map((mod) => {
          const isSelected = selectedModality === mod;
          const label = mod === "all" ? "Todos" : mod === "sale" ? "Venda" : mod === "trade" ? "Troca" : "Doação";
          // Cada modalidade tem a sua cor, a mesma das etiquetas dos livros; "Todos" fica neutro.
          const tone = mod === "all" ? undefined : colors.badge[mod];
          return (
            <Chip
              key={mod}
              size="compact"
              label={label}
              accessibilityLabel={`Filtrar por ${label}`}
              selected={isSelected}
              tone={tone}
              onPress={() => setSelectedModality(mod)}
            />
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
          displayTitle={carouselDisplayTitle}
          books={recentBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => {
            const filter: { modality?: BookModality; neighborhood?: string } = {};
            if (selectedModality !== "all") filter.modality = selectedModality;
            if (isCustomNeighborhood) filter.neighborhood = effectiveNeighborhood;
            if (Object.keys(filter).length > 0) {
              onNavigateToSearch?.(filter);
            } else {
              onNavigateToSearch?.();
            }
          }}
          viewMoreLabel="Ver mais livros recém-adicionados"
          viewMoreButtonText="Ver todos"
        />
      ) : (
        <View style={styles.empty}>
          <Text accessibilityRole="header" style={styles.carouselTitle}>{carouselDisplayTitle}</Text>
          <Text style={styles.emptyTitle}>
            {state.books.length > 0 && isSpecificNeighborhood
              ? `Ainda não há ${selectedModality === "all" ? "livros" : MODALITY_PLURAL[selectedModality]} no ${effectiveNeighborhood}.`
              : "Ainda não há livros por aqui."}
          </Text>
          <Text style={styles.body}>
            {state.books.length > 0 && isSpecificNeighborhood
              ? "Seja a primeira pessoa a anunciar neste bairro ou explore livros de toda Piripiri."
              : "Quando houver livros disponíveis, eles aparecerão neste espaço."}
          </Text>
          {state.books.length > 0 && isSpecificNeighborhood && filteredBooks.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver livros em toda Piripiri"
              onPress={() =>
                onNavigateToSearch?.(
                  selectedModality === "all"
                    ? { neighborhood: "all" }
                    : { modality: selectedModality, neighborhood: "all" },
                )
              }
              style={withPress([styles.viewMoreButton, styles.emptyExploreButton])}
            >
              <Text style={styles.viewMoreText}>Explorar toda Piripiri</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {wideWeb ? (
        <View style={styles.shortcuts}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Doações da semana: ${donationSummary}`}
            onPress={() => onNavigateToSearch?.({ modality: "donation" })}
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
            onPress={() => onNavigateToSearch?.({ modality: "trade" })}
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
      ) : (
      <>
      {/* 6. Banner de Destaque Comunitário ("Doações da semana") */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Doações da semana: ${donationSummary}`}
        onPress={() => onNavigateToSearch?.({ modality: "donation" })}
        style={withPress(styles.donationBanner)}
      >
        <View style={styles.donationBannerIconBox}>
          <AppIcon name="bookmark" size={24} color={colors.m3.onDoacaoContainer} />
        </View>
        <View style={styles.donationBannerTextBox}>
          <Text style={styles.donationBannerTitle}>Doações da semana</Text>
          <Text style={styles.donationBannerSubtitle}>
            {donationSummary}
          </Text>
        </View>
        <AppIcon name="chevronRight" size={24} color={colors.m3.onDoacaoContainer} />
      </Pressable>
      </>
      )}

    </View>
  );

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      maxWidth={wideWeb ? WEB_MAX_WIDTH : 720}
      paddingHorizontal={wideWeb ? WEB_GUTTER : undefined}
      overlay={
        <NeighborhoodSelectorModal
          visible={neighborhoodHook.isSelectorOpen}
          currentNeighborhood={effectiveNeighborhood}
          onSelect={neighborhoodHook.selectNeighborhood}
          onClose={neighborhoodHook.closeSelector}
        />
      }
    >
      {listHeader}
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    headerContainer: {
      marginBottom: tokens.spacing[16],
    },

    // 1. Top bar
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[12],
    },
    neighborhoodPill: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.surfaceContainerHigh,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[8],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
    },
    neighborhoodText: {
      flexShrink: 1,
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurface,
    },
    topRightActions: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    notificationButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      justifyContent: "center",
      alignItems: "center",
    },
    notificationBadge: {
      position: "absolute",
      top: 2,
      right: 2,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationBadgeText: { ...tokens.typography.badgeMicro, color: colors.badge.completed.text },
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
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.action,
    },

    // 2. Hero editorial
    heroSection: {
      marginBottom: tokens.spacing[12],
    },
    heroSectionWide: {
      paddingVertical: tokens.spacing[16],
      marginBottom: tokens.spacing[20],
    },
    heroTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    heroTitleWide: {
      ...tokens.typography.brandDisplayMd,
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[8],
    },
    heroSubtitleWide: {
      ...tokens.typography.webLead,
    },
    statsBannerWide: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: tokens.spacing[32],
      rowGap: tokens.spacing[16],
      marginTop: tokens.spacing[20],
      paddingVertical: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[24],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      alignSelf: "flex-start",
    },
    statItemWide: {
      alignItems: "flex-start",
    },
    statNumberWide: {
      ...tokens.typography.brandTitle,
      color: colors.m3.primary,
    },
    statLabelWide: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[4],
    },
    statDividerWide: {
      width: 1,
      height: 32,
      backgroundColor: colors.m3.outlineVariant,
    },

    // 3. Campo de Busca
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      height: tokens.spacing[56],
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[12],
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

    // 5. Destaque Comunitário ("Doações da semana")
    donationBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      minHeight: tokens.spacing[56],
      gap: tokens.spacing[16],
      marginBottom: tokens.spacing[24],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.doacaoContainer,
    },
    donationBannerIconBox: {
      justifyContent: "center",
      alignItems: "center",
    },
    donationBannerTextBox: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    donationBannerTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onDoacaoContainer,
    },
    donationBannerSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onDoacaoContainer,
    },

    // 6. Carrossel
    carouselSection: { marginBottom: tokens.spacing[24] },
    carouselHeader: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[12],
    },
    carouselTitle: {
      flexShrink: 1,
      ...tokens.typography.titleBar,
      color: colors.m3.onSurface,
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
    carouselRow: { position: "relative" },
    shortcuts: { flexDirection: "row", gap: tokens.spacing[24] },
    shortcut: { flex: 1, flexDirection: "row", gap: tokens.spacing[16], padding: tokens.spacing[24], borderRadius: tokens.radius.large },
    shortcutText: { flex: 1, gap: tokens.spacing[4] },
    shortcutTitle: { ...tokens.typography.titleBlock },
    shortcutBody: { ...tokens.typography.bodyMedium },
    // Web larga (Figma `34:160`): grade de 3 a 5 colunas conforme a largura da janela, com 24 px de respiro.
    carouselGrid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[24], alignItems: "stretch" },
    // Cartões com largura máxima para a capa não ficar perdida em faixas largas com poucos livros.
    carouselGridCell: { flexGrow: 1, flexBasis: 0, minWidth: 160, maxWidth: 280, flexDirection: "column" },
    carouselCardCoverAreaWide: { paddingVertical: tokens.spacing[20] },
    carouselCardWide: { flex: 1, width: "100%", borderRadius: tokens.radius.xl, backgroundColor: colors.m3.surfaceContainerLowest },
    carouselList: { flexGrow: 0 },
    carouselListContent: { gap: CAROUSEL_ITEM_GAP, alignItems: "stretch" },
    // Figma `02.01`: a faixa mostra dois cartões inteiros, então as setas saem do fluxo e ficam
    // invisíveis sobre o título da seção (texto estático, sem toque) para não roubar o toque dos
    // cartões nem empurrar a lista.
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
      width: CAROUSEL_ITEM_WIDTH,
      backgroundColor: colors.m3.surfaceContainerLow,
      // Figma `02.01`: cartão de livro com raio de 12 dp e sem sombra.
      borderRadius: tokens.radius.cardSmall,
      overflow: "hidden",
    },
    carouselCardPressed: {
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.98 }],
    },
    carouselCardCoverArea: {
      alignItems: "center",
      justifyContent: "center",
      // Figma `02.01`: área de capa com 144 dp (capa de 119 dp + 12,5 dp de folga).
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    carouselCardMeta: {
      flex: 1,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
      gap: tokens.spacing[2],
    },
    carouselCardModalityRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    carouselCardModalityPill: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.small,
    },
    carouselCardModality: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    carouselCardPrice: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurface,
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
    carouselCardLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[2],
    },
    carouselCardNeighborhood: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },


    // 8. Estado vazio e rodapé
    empty: {
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[24],
    },
    emptyExploreButton: {
      marginTop: tokens.spacing[12],
      alignSelf: "flex-start",
    },
    emptyTitle: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    body: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
