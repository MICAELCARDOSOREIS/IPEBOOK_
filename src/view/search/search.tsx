import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { makeAuthViewModel, makeNetworkStatus, makeSearchViewModel } from "@/di/container";
import type { SearchModalityFilter, SearchFilters, SearchSortOption } from "@/viewmodel/useSearchViewModel";
import { SORT_LABELS } from "@/viewmodel/searchFilters";
import { FilterSheet } from "@/view/search/FilterSheet";
import { WebFilterSidebar } from "@/view/search/WebFilterSidebar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { SortSheet } from "@/view/search/SortSheet";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { categoryTone } from "@/view/categoryTone";
import { formatPrice } from "@/view/formatPrice";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { ErrorState } from "@/view/components/ErrorState";
import { SearchField } from "@/view/components/SearchField";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { Dialog } from "@/view/components/Dialog";
import { Chip } from "@/view/components/Chip";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { SearchBookCard } from "@/view/search/SearchBookCard";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { Snackbar } from "@/view/components/Snackbar";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { usePersistedSearchFilters } from "@/viewmodel/usePersistedSearchFilters";
import { WEB_GUTTER, WEB_MAX_WIDTH, useWebGridColumns } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";
export type SearchProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToFavorites?: () => void;
  /** Pré-aplica um filtro de modalidade ao abrir, vindo do "Ver mais" da Home (Issue #146). */
  initialModality?: SearchModalityFilter;
  /** Pré-aplica uma categoria ao abrir, vindo de atalhos e recomendações. */
  initialCategory?: string;
};

const VALID_INITIAL_MODALITIES: readonly SearchModalityFilter[] = ["sale", "trade", "donation"];

/** Converte o parâmetro de rota `modalidade` (string) no filtro válido, ou `undefined`. */
export function parseInitialModality(value: string | string[] | undefined): SearchModalityFilter | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_INITIAL_MODALITIES.find((modality) => modality === raw);
}

/** Busca e Exploração (Figma `02.02 · Explorar`, nó `10:2`). */
export default function Search({
  currentNeighborhood,
  onSelectNeighborhood,
  onNavigateToBookDetail,
  onNavigateToFavorites,
  initialModality,
  initialCategory,
}: SearchProps = {}) {
  const neighborhoodHook = useActiveNeighborhood("all");
  const [selectedNeighborhoodOverride, setSelectedNeighborhoodOverride] = useState<string | null>(null);
  useEffect(() => {
    setSelectedNeighborhoodOverride(null);
  }, [currentNeighborhood]);
  const effectiveNeighborhood =
    selectedNeighborhoodOverride !== null
      ? selectedNeighborhoodOverride
      : currentNeighborhood !== undefined
        ? currentNeighborhood
        : neighborhoodHook.activeNeighborhood;
  const handleSelectNeighborhood = onSelectNeighborhood ?? neighborhoodHook.openSelector;

  const [auth] = makeAuthViewModel();
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = makeSearchViewModel(auth.user?.id ?? null);
  const { isOnline } = makeNetworkStatus();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const wideWeb = useIsWideWeb();
  const gridColumns = useWebGridColumns();
  const [showSortSheet, setShowSortSheet] = useState(false);
  const appliedInitialFilters = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarAction, setSnackbarAction] = useState<{ label: string; onPress: () => void } | null>(null);
  const clearedSnapshotRef = useRef<{ term: string; filters: SearchFilters; sortBy: SearchSortOption; neighborhood: string | "all" } | null>(null);
  const { persisted, loaded: persistedLoaded, persist } = usePersistedSearchFilters();
  const insets = useSafeAreaInsets();
  const navBarPaddingBottom = Math.max(tokens.spacing[20], insets.bottom + tokens.spacing[10]);
  const navBarDockHeight = 88;
  const floatingBottom = wideWeb ? tokens.spacing[32] : navBarPaddingBottom + navBarDockHeight + tokens.spacing[16];

  const guardedNavigateToBookDetail = useGuardedPress((bookId: string) => {
    void actions.registerSearch(state.term);
    onNavigateToBookDetail?.(bookId);
  });
  const guardedNavigateToFavorites = useGuardedPress(onNavigateToFavorites);

  const undoClear = () => {
    const snapshot = clearedSnapshotRef.current;
    if (!snapshot) return;
    actions.setTerm(snapshot.term);
    actions.setModality(snapshot.filters.modality);
    actions.setCategory(snapshot.filters.category);
    actions.setCondition(snapshot.filters.condition);
    actions.setOnlyBoxes(Boolean(snapshot.filters.onlyBoxes));
    actions.setPriceRange(snapshot.filters.priceRange);
    actions.setSortBy(snapshot.sortBy);
    actions.setNeighborhood(snapshot.neighborhood);
    clearedSnapshotRef.current = null;
    setSnackbarMessage(null);
    setSnackbarAction(null);
  };

  const handleResetFilters = () => {
    clearedSnapshotRef.current = {
      term: state.term,
      filters: state.filters,
      sortBy: state.sortBy,
      neighborhood: state.neighborhood,
    };
    actions.resetFilters();
    setSnackbarMessage("Filtros limpos");
    setSnackbarAction({ label: "Desfazer", onPress: undoClear });
  };

  const handleClearFilters = () => {
    clearedSnapshotRef.current = {
      term: state.term,
      filters: state.filters,
      sortBy: state.sortBy,
      neighborhood: state.neighborhood,
    };
    actions.clearFilters();
    setSnackbarMessage("Busca reiniciada");
    setSnackbarAction({ label: "Desfazer", onPress: undoClear });
  };

  useEffect(() => {
    if (appliedInitialFilters.current) return;
    if (initialModality && initialModality !== "all") {
      actions.setModality(initialModality);
    }
    if (initialCategory && initialCategory !== "all") {
      actions.setCategory(initialCategory);
    }
    appliedInitialFilters.current = true;
  }, [initialModality, initialCategory, actions]);

  useEffect(() => {
    if (typeof actions.setNeighborhood === "function") {
      if (
        effectiveNeighborhood &&
        effectiveNeighborhood !== "all" &&
        effectiveNeighborhood !== "Todos os bairros (Piripiri)"
      ) {
        actions.setNeighborhood(effectiveNeighborhood);
      } else {
        actions.setNeighborhood("all");
      }
    }
  }, [effectiveNeighborhood, actions]);

  // Aplica filtros persistidos entre sessões apenas quando aberto sem intenção de navegação.
  useEffect(() => {
    if (!persistedLoaded || !persisted) return;
    if (initialModality || initialCategory) return;
    actions.setModality(persisted.filters.modality);
    actions.setCategory(persisted.filters.category);
    actions.setCondition(persisted.filters.condition);
    actions.setPriceRange(persisted.filters.priceRange);
    actions.setOnlyBoxes(Boolean(persisted.filters.onlyBoxes));
    actions.setSortBy(persisted.sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedLoaded, persisted]);

  // Persiste filtros e ordenação atuais após a primeira leitura do storage.
  useEffect(() => {
    if (!persistedLoaded) return;
    persist(state.filters, state.sortBy);
  }, [persistedLoaded, state.filters, state.sortBy, persist]);

  const displayNeighborhood =
    !effectiveNeighborhood ||
    effectiveNeighborhood === "all" ||
    effectiveNeighborhood === "Todos os bairros (Piripiri)"
      ? "Piripiri (Todos)"
      : effectiveNeighborhood;

  const handleSelectNeighborhoodOption = (bairro: string) => {
    setSelectedNeighborhoodOverride(bairro);
    void neighborhoodHook.selectNeighborhood(bairro);
    if (typeof actions.setNeighborhood === "function") {
      actions.setNeighborhood(
        bairro === "Todos os bairros (Piripiri)" ? "all" : bairro,
      );
    }
  };

  // A categoria já aparece selecionada na fileira de chips do catálogo; repeti-la nos chips
  // removíveis duplicaria o mesmo estado em dois lugares da tela.
  const visibleActiveFilters = state.activeFilters.filter((filter) => filter.key !== "category");

  // Busca e filtros viajam no cabeçalho da própria lista para rolagem natural no mobile.
  const listHeader = (
    <View style={styles.filters}>
      {/* 1. Barra de Topo: Bairro (Pill) e Ações (Limpar filtros / Tune) (Figma nós 137:2457 e 137:2461) */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Selecionar bairro: ${displayNeighborhood}`}
          onPress={handleSelectNeighborhood}
          style={withPress(styles.neighborhoodPill)}
        >
          <AppIcon name="place" size={20} color={colors.m3.primary} />
          <Text numberOfLines={1} style={styles.neighborhoodText}>{displayNeighborhood}</Text>
          <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
        </Pressable>

        <View style={styles.topRightActions}>
          {state.hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar todos os filtros de busca"
              onPress={handleResetFilters}
              style={withPress(styles.clearFiltersButton)}
            >
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </Pressable>
          ) : null}
          {/* Botão de atalho para Favoritos ao lado dos filtros */}
          {onNavigateToFavorites ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver meus livros favoritos"
              onPress={guardedNavigateToFavorites}
              style={withPress([styles.favoritesTopButton, wideWeb && styles.favoritesTopButtonWide])}
            >
              <AppIcon name="heartFill" size={wideWeb ? 18 : 20} color={colors.ipe.bloomDeep} />
              {wideWeb ? <Text style={styles.favoritesButtonText}>Favoritos</Text> : null}
            </Pressable>
          ) : null}

          {/* Na web larga a coluna "Filtros" já está sempre visível; o atalho só existe nas telas estreitas. */}
          {wideWeb ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              state.activeFilterCount > 0 ? `Abrir filtros, ${state.activeFilterCount} ativos` : "Abrir filtros"
            }
            onPress={() => {
              actions.openFilterDraft();
              setShowFilterSheet(true);
            }}
            style={withPress(styles.tuneButton)}
          >
            <AppIcon name="tune" size={20} color={colors.m3.onSurfaceVariant} />
            {state.activeFilterCount > 0 ? (
              <View style={styles.tuneBadge}>
                <Text style={styles.tuneBadgeText}>{state.activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
          )}
        </View>
      </View>

      {/* 2. Manchete Editorial (Figma nó 137:2463) */}
      <View style={styles.heroSection}>
        <Text accessibilityRole="header" style={styles.heading}>
          O que vamos ler hoje?
        </Text>
        <Text style={styles.subtitle}>
          Livros novos e seminovos para trocar, comprar ou receber aqui perto.
        </Text>
      </View>

      {/* 3. Campo de Busca Integrado M3 (Figma nó 99:1733) */}
      <SearchField
        value={state.term}
        onChangeText={actions.setTerm}
        onSubmitEditing={() => void actions.registerSearch(state.term)}
      />

      {/* 4. Categorias do próprio catálogo em rolagem horizontal (Figma nó 183:3499) */}
      {state.availableCategories.length > 0 ? (
        <ScrollView
          horizontal
          {...standardHorizontalScrollProps}
          contentContainerStyle={styles.quickCategoriesScroll}
          style={styles.quickCategoriesScrollView}
        >
          <Chip
            label="Todos"
            accessibilityLabel="Filtrar por todas as categorias"
            selected={state.category === "all"}
            onPress={() => actions.setCategory("all")}
          />
          {state.availableCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              accessibilityLabel={`Filtrar por categoria ${category}`}
              tone={categoryTone(category, resolvedScheme)}
              selected={state.category === category}
              onPress={() => actions.setCategory(category)}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* 5. Filtros aplicados como chips removíveis (Figma `02.04 · Explorar com filtro`) */}
      {visibleActiveFilters.length > 0 ? (
        <View style={styles.activeFiltersRow}>
          {visibleActiveFilters.map((filter) => (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              accessibilityLabel={`Remover filtro ${filter.label}`}
              hitSlop={8}
              onPress={() => actions.removeActiveFilter(filter.key)}
              style={withPress(styles.activeFilterChip)}
            >
              <Text style={styles.activeFilterText}>{filter.label}</Text>
              <AppIcon name="close" size={16} color={colors.nature.onFoliage} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* 6. Resumo da faixa de resultados e ordenação (Figma `02.04`: "1 livro à venda · Literatura") */}
      {!state.loading && !state.error && state.books.length > 0 ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryBadge}>
            <Text numberOfLines={1} style={styles.summaryBadgeText}>{state.resultsSummary}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ordenar por ${SORT_LABELS[state.sortBy]}`}
            onPress={() => setShowSortSheet(true)}
            style={withPress(styles.sortButton)}
          >
            <Text style={styles.sortText}>{SORT_LABELS[state.sortBy]}</Text>
            <AppIcon name="chevronDown" size={16} color={colors.m3.primary} />
          </Pressable>
        </View>
      ) : null}

      {!state.term.trim() && state.history.length > 0 ? (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Buscas recentes</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar histórico de buscas" onPress={() => setConfirmingClear(true)}>
              <Text style={styles.alertLink}>Limpar histórico</Text>
            </Pressable>
          </View>
          <View style={styles.historyChips}>
            {state.history.map((item) => (
              <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Buscar novamente por ${item}`} onPress={() => actions.setTerm(item)} style={withPress(styles.historyChip)}>
                <Text style={styles.historyChipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Dialog
        visible={confirmingClear}
        title="Limpar histórico de buscas?"
        message="As buscas recentes salvas neste dispositivo serão removidas."
        confirmLabel="Limpar histórico"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => { setConfirmingClear(false); void actions.clearHistory(); }}
      />
    </View>
  );

  const neighborhoodApplied = displayNeighborhood !== "Piripiri (Todos)";
  const onlyNeighborhoodBlocks = neighborhoodApplied && state.matchesInOtherNeighborhoods > 0;

  const listEmpty = state.loading ? (
    <LoadingState label="Carregando livros" variant="catalog" />
  ) : state.error ? (
    isOnline ? (
      <ErrorState message={state.error} onRetry={() => void actions.reload()} />
    ) : (
      <OfflineState onRetry={() => void actions.reload()} />
    )
  ) : (
    <View style={[styles.empty, wideWeb && styles.emptyWide]}>
      {wideWeb ? (
        <View style={styles.emptyIcon}>
          <AppIcon name="search" size={32} color={colors.m3.onSurface} />
        </View>
      ) : null}
      <Text style={styles.emptyTitle}>
        {onlyNeighborhoodBlocks ? `Nenhum livro no ${displayNeighborhood} com essa busca.` : "Nenhum livro encontrado."}
      </Text>
      <Text style={styles.body}>
        {onlyNeighborhoodBlocks
          ? `Há ${state.matchesInOtherNeighborhoods} ${state.matchesInOtherNeighborhoods === 1 ? "livro" : "livros"} em outros bairros de Piripiri.`
          : state.activeFilterCount > 0
          ? "Nenhum livro corresponde aos filtros selecionados."
          : state.term.trim()
            ? `Nenhum livro encontrado para "${state.term.trim()}". Tente outro título, autor ou categoria.`
            : "Ainda não há livros no catálogo."}
      </Text>
      {onlyNeighborhoodBlocks ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver em toda Piripiri"
          onPress={() => handleSelectNeighborhoodOption("Todos os bairros (Piripiri)")}
          style={withPress(styles.emptyActionButton)}
        >
          <Text style={styles.emptyActionText}>Ver em toda Piripiri</Text>
        </Pressable>
      ) : null}
      {state.hasActiveFilters ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar filtros e buscar novamente"
          onPress={handleClearFilters}
          style={withPress(styles.emptyActionButton)}
        >
          <Text style={styles.emptyActionText}>Limpar filtros</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      maxWidth={wideWeb ? WEB_MAX_WIDTH : 720}
      scroll={false}
      paddingHorizontal={0}
      paddingTop={0}
      paddingBottom={0}
      overlay={
        <>
          {showScrollTop ? (
            <SearchScrollTopButton
              bottom={floatingBottom}
              colors={colors}
              onPress={() => flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true })}
            />
          ) : null}

          <View pointerEvents="box-none" style={[styles.snackbarContainer, { bottom: wideWeb ? tokens.spacing[16] : floatingBottom }]}>
            <Snackbar
              visible={snackbarMessage !== null}
              message={snackbarMessage ?? ""}
              actionLabel={snackbarAction?.label}
              onAction={snackbarAction?.onPress}
              onDismiss={() => {
                setSnackbarMessage(null);
                setSnackbarAction(null);
                clearedSnapshotRef.current = null;
              }}
              duration={3500}
            />
          </View>

          <FilterSheet
            visible={showFilterSheet}
            draftFilters={state.draftFilters}
            sortBy={state.sortBy}
            availableCategories={state.availableCategories}
            resultCount={state.draftResultCount}
            onChange={actions.updateDraftFilters}
            onSortChange={actions.setSortBy}
            onApply={() => {
              actions.applyDraftFilters();
              setShowFilterSheet(false);
            }}
            onReset={() => {
              clearedSnapshotRef.current = {
                term: state.term,
                filters: state.filters,
                sortBy: state.sortBy,
                neighborhood: state.neighborhood,
              };
              actions.resetFilters();
              setShowFilterSheet(false);
              setSnackbarMessage("Filtros limpos");
              setSnackbarAction({ label: "Desfazer", onPress: undoClear });
            }}
            onClose={() => setShowFilterSheet(false)}
          />
          <SortSheet
            visible={showSortSheet}
            selected={state.sortBy}
            onSelect={actions.setSortBy}
            onClose={() => setShowSortSheet(false)}
          />
          <NeighborhoodSelectorModal
            visible={neighborhoodHook.isSelectorOpen}
            currentNeighborhood={effectiveNeighborhood}
            onSelect={handleSelectNeighborhoodOption}
            onClose={neighborhoodHook.closeSelector}
          />
        </>
      }
    >
      <View style={wideWeb ? styles.wideRow : styles.flexOne}>
      {wideWeb ? (
        <WebFilterSidebar
          filters={state.filters}
          categories={state.availableCategories}
          hasActiveFilters={state.hasActiveFilters}
          sortBy={state.sortBy}
          onSortChange={actions.setSortBy}
          onModality={actions.setModality}
          onCondition={actions.setCondition}
          onCategory={actions.setCategory}
          onToggleOnlyBoxes={actions.setOnlyBoxes}
          onClear={actions.resetFilters}
        />
      ) : null}
      <FlatList
        ref={flatListRef}
        testID="search-flatlist"
        {...standardVerticalScrollProps}
        key={wideWeb ? `grade-${gridColumns}` : "lista"}
        numColumns={wideWeb ? gridColumns : 1}
        columnWrapperStyle={wideWeb ? styles.gridRow : undefined}
        data={state.loading || state.error ? [] : state.books}
        keyExtractor={(book) => book.id}
        style={styles.flexOne}
        contentContainerStyle={wideWeb ? styles.contentWide : [styles.content, { paddingBottom: scrollBottomPadding.withBottomBarAndFab + tokens.spacing[24] }]}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setShowScrollTop(offsetY > 300);
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => (
          <SearchBookCard
            item={item}
            wideWeb={wideWeb}
            gridColumns={gridColumns}
            userId={auth.user?.id ?? null}
            onPress={() => guardedNavigateToBookDetail(item.id)}
            onFavoriteToggle={(selected) => {
              setSnackbarMessage(
                selected
                  ? `"${item.title}" foi adicionado aos Favoritos!`
                  : `"${item.title}" foi removido dos Favoritos.`
              );
              setSnackbarAction(
                onNavigateToFavorites ? { label: "Ver favoritos", onPress: guardedNavigateToFavorites } : null,
              );
            }}
          />
        )}
      />
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    flexOne: { flex: 1 },
    // Web larga: filtros fixos à esquerda e resultados em grade de ponta a ponta.
    wideRow: {
      flex: 1,
      flexDirection: "row",
      gap: tokens.spacing[32],
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[24],
    },
    contentWide: { flexGrow: 1, paddingBottom: tokens.spacing[32], gap: tokens.spacing[24] },
    gridRow: { gap: tokens.spacing[24] },
    cardMainWide: { flexDirection: "column", alignItems: "stretch", gap: tokens.spacing[8] },
    // Na grade, o texto começa logo abaixo da capa para os títulos ficarem alinhados entre colunas.
    cardInfoWide: { justifyContent: "flex-start" },
    cardMetaRowWide: { flexWrap: "wrap", rowGap: tokens.spacing[4] },
    cardActionsWide: { position: "absolute", top: tokens.spacing[8], right: tokens.spacing[8], width: tokens.accessibility.touchTarget },
    cardWide: { alignItems: "stretch", paddingLeft: tokens.spacing[12], paddingRight: tokens.spacing[12], marginBottom: 0, flex: 1, flexDirection: "column", maxWidth: "25%", borderRadius: tokens.radius.xl, backgroundColor: colors.m3.surfaceContainerLowest },
    content: {
      flexGrow: 1,
      width: "100%",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[24],
    },
    filters: { gap: tokens.spacing[16], marginBottom: tokens.spacing[16] },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: tokens.spacing[40],
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
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.medium,
    },
    topRightActions: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    favoritesTopButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    favoritesTopButtonWide: {
      width: "auto",
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[14],
    },
    favoritesButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.medium,
    },
    tuneButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    // Contador de filtros aplicados sobre o ícone de ajustes (chip de 18 dp do Material 3).
    tuneBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: tokens.spacing[18],
      height: tokens.spacing[18],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    tuneBadgeText: {
      ...tokens.typography.captionSmall,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onPrimary,
    },
    heroSection: {
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
    },
    heading: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
      letterSpacing: tokens.letterSpacing.brandTighter,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
    },
    quickCategoriesScrollView: {
      marginHorizontal: -tokens.spacing[16],
    },
    quickCategoriesScroll: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingLeft: tokens.spacing[16],
      paddingRight: tokens.spacing[28],
      paddingVertical: tokens.spacing[2],
    },
    clearFiltersButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[8],
    },
    clearFiltersText: {
      ...tokens.typography.bodyMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
    // Chip removível de filtro aplicado (Figma `02.04`): verde `secondaryContainer` com ✕.
    activeFiltersRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    activeFilterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      height: tokens.spacing[32],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.shapeMorph.chipSelected,
      backgroundColor: colors.nature.foliage,
    },
    activeFilterText: { ...tokens.typography.labelLarge, color: colors.nature.onFoliage, fontWeight: tokens.fontWeight.semiBold },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      marginVertical: tokens.spacing[4],
    },
    summaryBadge: {
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: 3,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.sprout,
      alignSelf: "center",
      maxWidth: "68%",
    },
    summaryBadgeText: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      fontWeight: tokens.fontWeight.bold,
      color: colors.nature.foliageDeep,
    },
    summaryText: { flex: 1, ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: tokens.spacing[4],
      height: tokens.spacing[40],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    sortText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
    body: { ...tokens.typography.bodyLarge, lineHeight: tokens.lineHeight[25], color: colors.secondaryText },
    empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
    emptyWide: { width: "100%", paddingVertical: tokens.spacing[48], paddingHorizontal: tokens.spacing[48], borderRadius: tokens.radius.xxl, backgroundColor: colors.m3.surfaceContainerLow, gap: tokens.spacing[16] },
    emptyIcon: { width: tokens.spacing[64], height: tokens.spacing[64], borderRadius: tokens.radius.circle64, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.secondaryContainer },
    alertCard: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[16], paddingHorizontal: tokens.spacing[24], paddingVertical: tokens.spacing[20], borderRadius: tokens.radius.large, backgroundColor: colors.m3.tertiaryContainer },
    alertCardText: { flex: 1, gap: tokens.spacing[2] },
    alertCardTitle: { ...tokens.typography.titleBlock, color: colors.m3.onTertiaryContainer },
    alertCardBody: { ...tokens.typography.bodyLarge, color: colors.m3.onTertiaryContainer },
    alertCardButton: { height: 52, minWidth: 180, alignItems: "center", justifyContent: "center", borderRadius: tokens.radius.full, backgroundColor: colors.m3.primary },
    alertCardButtonText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary },
    emptyTitle: { ...tokens.typography.brandCardTitle, color: colors.action },
    emptyActionButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[16],
    },
    emptyActionText: { ...tokens.typography.subheadline, color: colors.action, fontWeight: tokens.fontWeight.semiBold },
    alertLink: { color: colors.action, fontWeight: tokens.fontWeight.semiBold, padding: tokens.spacing[12] },
    historySection: { gap: tokens.spacing[8] },
    historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    historyTitle: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.secondaryText },
    historyChips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    historyChip: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      paddingHorizontal: tokens.spacing[16],
    },
    historyChipText: { ...tokens.typography.bodyLarge, color: colors.text },

    categoryBadge: { ...tokens.typography.labelSmall, color: colors.secondaryText, fontStyle: "italic" },
    snackbarContainer: {
      position: "absolute",
      left: tokens.spacing[16],
      right: tokens.spacing[16],
      bottom: tokens.spacing[16],
      zIndex: 20,
    },
  });
}

function SearchScrollTopButton({
  bottom,
  onPress,
  colors,
}: {
  bottom: number;
  onPress: () => void;
  colors: ColorPalette;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: tokens.spring.spatialStandard.tension,
      friction: tokens.spring.spatialStandard.friction,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const isWeb = Platform.OS === "web";
  const webFabBg =
    colors.surface === "#FCFAF5" ? "rgba(235, 244, 236, 0.92)" : "rgba(39, 66, 44, 0.90)";

  return (
    <Animated.View
      style={{
        position: "absolute",
        right: tokens.spacing[16],
        bottom,
        zIndex: 90,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar ao topo da lista"
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={onPress}
        style={({ pressed }) => [
          stylesScrollTop.scrollTopFab,
          {
            backgroundColor: isWeb ? webFabBg : colors.nature.sprout,
            borderColor: colors.m3.outlineVariant,
            shadowColor: colors.m3.shadow,
          },
          isHovered && stylesScrollTop.scrollTopFabHovered,
          pressed && stylesScrollTop.scrollTopFabPressed,
        ]}
      >
        <AppIcon name="chevronUp" size={24} color={colors.nature.foliage} />
      </Pressable>
    </Animated.View>
  );
}

const stylesScrollTop = StyleSheet.create({
  scrollTopFab: {
    width: tokens.spacing[48],
    height: tokens.spacing[48],
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...(Platform.OS === "web"
      ? ({
          cursor: "pointer",
          userSelect: "none",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        } as never)
      : {}),
  },
  scrollTopFabHovered: {
    transform: [{ scale: 1.06 }],
    elevation: 8,
    shadowOpacity: 0.26,
    shadowRadius: 12,
  },
  scrollTopFabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});
