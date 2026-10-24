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
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import type { Book, BookModality } from "@/model/entities/book";
import type { ThemePreference } from "@/model/entities/themePreference";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.badge.sale.background, text: colors.badge.sale.text, label: "Venda" },
    trade: { background: colors.badge.trade.background, text: colors.badge.trade.text, label: "Troca" },
    donation: { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Doação" },
  };
}

const CAROUSEL_ITEM_WIDTH = 152;
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
                <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="carousel" />
                <View style={styles.carouselCardMeta}>
                  <Text numberOfLines={1} style={[styles.carouselCardModality, { color: tag.text }]}>
                    {tag.label}{priceSuffix}
                  </Text>
                  <Text numberOfLines={2} style={styles.carouselCardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.carouselCardAuthor}>{item.author}</Text>
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
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToAlerts?: () => void;
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
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToNotifications,
  onNavigateToFavorites,
  onNavigateToAlerts,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const [state, actions] = useHomeViewModel();
  const [authState, authActions] = useAuthViewModel();
  const { isOnline } = useNetworkStatus();
  const { colors, preference, setPreference } = useTheme();
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
  const donationBooks = state.books
    .filter((book) => book.modality === "donation" && book.status === "available")
    .slice(0, CAROUSEL_MAX_ITEMS);

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
          <AppIcon name="place" size={16} color={colors.action} />
          <Text style={styles.neighborhoodText}>{currentNeighborhood}</Text>
          <AppIcon name="chevronDown" size={16} color={colors.action} />
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
            <AppIcon name="bell" size={22} color={colors.text} />
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
        <View style={styles.brandBadge}>
          <View style={styles.mark} accessible={false} />
          <Text accessibilityRole="header" style={styles.brandTitle}>Ipebook</Text>
        </View>
        <Text accessibilityRole="header" style={styles.heroTitle}>
          Encontre sua próxima história.
        </Text>
        <Text style={styles.heroSubtitle}>
          Compre, troque ou receba livros de quem mora perto de você.
        </Text>
        {/* Subtítulo institucional legado para conformidade de acessibilidade */}
        <Text style={styles.legacySubtitle}>Um lugar para descobrir sua próxima leitura.</Text>
      </View>

      {/* 3. Campo de Busca Integrado */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buscar título, autor ou categoria"
        onPress={() => onNavigateToSearch?.(selectedModality === "all" ? undefined : { modality: selectedModality })}
        style={styles.searchBar}
      >
        <AppIcon name="search" size={20} color={colors.secondaryText} />
        <Text style={styles.searchPlaceholder}>Buscar título, autor ou categoria</Text>
      </Pressable>

      {/* 4. Chips de Filtro Rápido (Todos, Venda, Troca, Doação) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
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
              {isSelected ? <Text style={styles.filterChipCheck}>✓ </Text> : null}
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 5. Carrossel "Perto de você" (Figma 02.01) */}
      {!state.loading && !state.error && recentBooks.length > 0 ? (
        <CatalogCarousel
          title="Recém-adicionados"
          displayTitle="Perto de você"
          books={recentBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => (selectedModality === "all" ? onNavigateToSearch?.() : onNavigateToSearch?.({ modality: selectedModality }))}
          viewMoreLabel="Ver mais livros recém-adicionados"
          viewMoreButtonText="Ver todos"
        />
      ) : null}

      {/* 6. Banner de Destaque Comunitário ("Doações da semana") */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Doações da semana: 3 livros gratuitos em Piripiri"
        onPress={() => onNavigateToSearch?.({ modality: "donation" })}
        style={styles.donationBanner}
      >
        <View style={styles.donationBannerIconBox}>
          <AppIcon name="bookmark" size={20} color={colors.action} />
        </View>
        <View style={styles.donationBannerTextBox}>
          <Text style={styles.donationBannerTitle}>Doações da semana</Text>
          <Text style={styles.donationBannerSubtitle}>
            {donationBooks.length > 0 ? `${donationBooks.length} livros gratuitos em Piripiri` : "3 livros gratuitos em Piripiri"}
          </Text>
        </View>
        <AppIcon name="chevronRight" size={18} color={colors.secondaryText} />
      </Pressable>

      {/* 7. Carrossel adicional de Doações (Spec 051) se houver */}
      {!state.loading && !state.error && donationBooks.length > 0 ? (
        <CatalogCarousel
          title="Doações disponíveis na comunidade"
          books={donationBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => onNavigateToSearch?.({ modality: "donation" })}
          viewMoreLabel="Ver mais doações disponíveis em Piripiri"
        />
      ) : null}

      {/* Título de seção para o catálogo vertical */}
      <Text accessibilityRole="header" style={styles.heading}>Livros</Text>
    </View>
  );

  const listFooter = (
    <View style={styles.footerContainer}>
      {/* Alternador de tema em área de preferências acessível */}
      <View style={styles.preferencesSection}>
        <Text style={styles.preferencesLabel}>Aparência</Text>
        <View testID="theme-toggle-radiogroup" accessibilityRole="radiogroup" style={styles.themeToggleRow}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={`Tema ${option.label}`}
                accessibilityState={{ checked: isSelected }}
                onPress={() => void setPreference(option.value)}
                style={[styles.themeToggleOption, isSelected && styles.themeToggleOptionSelected]}
              >
                <Text style={[styles.themeToggleText, isSelected && styles.themeToggleTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footerLinks}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigateToTerms?.()}
          style={styles.legalButton}
        >
          <Text style={styles.legalText}>Termos e Privacidade</Text>
        </Pressable>
        <Text style={styles.footerSeparator}>•</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigateToHelp?.()}
          style={styles.legalButton}
        >
          <Text style={styles.legalText}>Central de Ajuda</Text>
        </Pressable>
      </View>
    </View>
  );

  const listEmpty = state.loading ? (
    <LoadingState label="Carregando livros" />
  ) : state.error ? (
    isOnline ? (
      <ErrorState message={state.error} onRetry={() => void actions.reload()} />
    ) : (
      <OfflineState onRetry={() => void actions.reload()} />
    )
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Ainda não há livros por aqui.</Text>
      <Text style={styles.body}>Quando houver livros disponíveis, eles aparecerão neste espaço.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={state.loading || state.error ? [] : filteredBooks}
        keyExtractor={(book) => book.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => {
          const tag = modalityTag[item.modality];
          const priceSuffix = item.modality === "sale" && item.price != null
            ? ` · R$ ${item.price.toFixed(2).replace(".", ",")}`
            : "";
          return (
            <View style={styles.book}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                onPress={() => onNavigateToBookDetail?.(item.id)}
                style={styles.bookMain}
              >
                <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                <View style={styles.bookInfo}>
                  <View style={styles.bookHeader}>
                    <Text numberOfLines={2} style={styles.bookTitle}>{item.title}</Text>
                    <View style={[styles.tag, { backgroundColor: tag.background }]}>
                      <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}{priceSuffix}</Text>
                    </View>
                  </View>
                  <Text style={styles.body}>{item.author}</Text>
                  {item.status === "reserved" ? (
                    <Text style={styles.reserved}>Reservado</Text>
                  ) : null}
                </View>
              </Pressable>
              <FavoriteButton bookId={item.id} userId={authState.user?.id ?? null} />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      padding: tokens.spacing[20],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[32],
    },
    headerContainer: {
      marginBottom: tokens.spacing[16],
    },

    // 1. Top bar
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[20],
    },
    neighborhoodPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.soft,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      minHeight: tokens.accessibility.touchTarget,
    },
    neighborhoodText: {
      ...tokens.typography.labelMedium,
      fontWeight: "600",
      color: colors.text,
    },
    topRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
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
      marginBottom: tokens.spacing[20],
    },
    brandBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[8],
    },
    mark: {
      width: 12,
      height: 22,
      backgroundColor: colors.highlight,
      borderTopRightRadius: tokens.radius.small,
    },
    brandTitle: {
      ...tokens.typography.labelMedium,
      fontWeight: "700",
      color: colors.action,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      marginTop: tokens.spacing[8],
      lineHeight: 24,
    },
    legacySubtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.secondaryText,
      marginTop: tokens.spacing[4],
      opacity: 0.7,
    },

    // 3. Campo de Busca
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      height: 52,
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[12],
      marginBottom: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchPlaceholder: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      fontSize: 15,
    },

    // 4. Chips de Filtro
    chipsScroll: {
      marginBottom: tokens.spacing[20],
    },
    chipsContainer: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 38,
    },
    filterChipSelected: {
      backgroundColor: colors.badge.sale.background,
      borderColor: colors.action,
    },
    filterChipCheck: {
      ...tokens.typography.labelMedium,
      color: colors.badge.sale.text,
      fontWeight: "700",
    },
    filterChipText: {
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: "500",
    },
    filterChipTextSelected: {
      color: colors.badge.sale.text,
      fontWeight: "700",
    },

    // 5. Destaque Comunitário ("Doações da semana")
    donationBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: tokens.spacing[16],
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.medium,
      gap: tokens.spacing[12],
      marginBottom: tokens.spacing[24],
      borderWidth: 1,
      borderColor: colors.border,
    },
    donationBannerIconBox: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.small,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    donationBannerTextBox: {
      flex: 1,
      gap: 2,
    },
    donationBannerTitle: {
      ...tokens.typography.titleMedium,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    donationBannerSubtitle: {
      ...tokens.typography.bodyMedium,
      fontSize: 13,
      color: colors.secondaryText,
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
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    viewMoreButton: {
      flexShrink: 0,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    viewMoreText: {
      fontSize: tokens.typography.labelMedium.fontSize,
      color: colors.action,
      fontWeight: "600",
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
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    carouselCardMeta: {
      padding: tokens.spacing[8],
      gap: 2,
    },
    carouselCardModality: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    carouselCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 18,
    },
    carouselCardAuthor: {
      fontSize: 12,
      color: colors.secondaryText,
    },

    // 7. Lista Vertical e Geral
    heading: {
      fontSize: tokens.typography.titleLarge.fontSize,
      fontWeight: tokens.typography.titleLarge.fontWeight,
      color: colors.action,
      marginBottom: tokens.spacing[16],
    },
    book: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[16],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bookMain: { flex: 1, flexDirection: "row", gap: tokens.spacing[12] },
    bookInfo: { flex: 1, gap: 6 },
    bookHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
    },
    bookTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    tag: {
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    tagText: {
      fontSize: tokens.typography.labelMedium.fontSize,
      fontWeight: tokens.typography.labelMedium.fontWeight,
    },
    reserved: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      color: colors.secondaryText,
      fontStyle: "italic",
    },

    // 8. Estado vazio e rodapé
    empty: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 28,
      gap: 10,
    },
    emptyTitle: { fontSize: 19, fontWeight: "600", color: colors.action },
    body: {
      fontSize: tokens.typography.bodyLarge.fontSize,
      lineHeight: 25,
      color: colors.secondaryText,
    },
    footerContainer: {
      marginTop: tokens.spacing[24],
      paddingTop: tokens.spacing[16],
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: tokens.spacing[16],
    },
    preferencesSection: {
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    preferencesLabel: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    themeToggleRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    themeToggleOption: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    themeToggleOptionSelected: {
      backgroundColor: colors.soft,
      borderColor: colors.action,
    },
    themeToggleText: {
      fontSize: tokens.typography.labelMedium.fontSize,
      color: colors.secondaryText,
      fontWeight: "600",
    },
    themeToggleTextSelected: { color: colors.action },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
    },
    footerSeparator: {
      color: colors.secondaryText,
      fontSize: tokens.typography.labelMedium.fontSize,
    },
    legalButton: {
      paddingVertical: tokens.spacing[8],
    },
    legalText: {
      fontSize: tokens.typography.labelMedium.fontSize,
      color: colors.secondaryText,
      textDecorationLine: "underline",
    },
  });
}
