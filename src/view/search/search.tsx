import { CachedBookNotice } from "@/view/components/CachedBookNotice";
import { useReloadOnReconnect } from "@/viewmodel/useReloadOnReconnect";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Keyboard, type NativeScrollEvent, type NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { makeAuthViewModel, makeNetworkStatus, makeSearchViewModel } from "@/di/container";
import type { SearchModalityFilter, SearchFilters, SearchSortOption } from "@/viewmodel/useSearchViewModel";
import { SORT_LABELS } from "@/viewmodel/searchFilters";
import { FilterSheet } from "@/view/search/FilterSheet";
import { WebFilterSidebar } from "@/view/search/WebFilterSidebar";
import { useHydratedWindowWidth, WIDE_WEB_MIN_WIDTH } from "@/view/useIsWideWeb";
import { SortSheet } from "@/view/search/SortSheet";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ErrorState } from "@/view/components/ErrorState";
import { SearchField } from "@/view/components/SearchField";
import { Dialog } from "@/view/components/Dialog";
import { Chip } from "@/view/components/Chip";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { SearchBookCard } from "@/view/search/SearchBookCard";
import { getSearchStyles } from "@/view/search/searchStyles";
import { AppIcon } from "@/view/components/AppIcon";
import { Snackbar } from "@/view/components/Snackbar";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { usePersistedSearchFilters } from "@/viewmodel/usePersistedSearchFilters";
import { WEB_MAX_WIDTH, useWebGridColumns } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useOnRefocus } from "@/view/useRefocusKey";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { withPress } from "@/view/pressFeedback";
import { triggerHaptic } from "@/view/haptics";
import { useReduceTransparency } from "@/view/useReduceTransparency";

export type SearchProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToFavorites?: () => void;
  /** Pré-aplica um filtro de modalidade ao abrir, vindo do "Ver mais" da Home (Issue #146). */
  initialModality?: SearchModalityFilter;
  /** Pré-aplica uma categoria ao abrir, vindo de atalhos e recomendações. */
  initialCategory?: string;
  /** Pré-aplica o termo digitado no campo de busca do cabeçalho web. */
  initialTerm?: string;
  focusKey?: number;
  /** Incrementado ao tocar na aba Explorar já ativa para rolar suave ao topo (Spec 144). */
  scrollToTopTick?: number;
};

const VALID_INITIAL_MODALITIES: readonly SearchModalityFilter[] = ["sale", "trade", "donation"];
const extractBookKey = (book: Book) => book.id;
/** Converte o parâmetro de rota `modalidade` (string) no filtro válido, ou `undefined`. */
export function parseInitialModality(value: string | string[] | undefined): SearchModalityFilter | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_INITIAL_MODALITIES.find((modality) => modality === raw);
}

/** Preposição gramaticalmente correta em português para locais e bairros de Piripiri ("no" vs "na"). */
export function getNeighborhoodPreposition(location: string): "na" | "no" {
  const lower = location.trim().toLowerCase();
  if (
    lower.startsWith("praça") ||
    lower.startsWith("floresta") ||
    lower.startsWith("estação") ||
    lower.startsWith("estacao") ||
    lower.startsWith("caixa") ||
    lower.startsWith("morada") ||
    lower.startsWith("paciência") ||
    lower.startsWith("paciencia") ||
    lower.startsWith("vista") ||
    lower.startsWith("fonte") ||
    lower.startsWith("santa")
  ) {
    return "na";
  }
  return "no";
}

/** Busca e Exploração (Figma `02.02 · Explorar`, nó `10:2`). */
export default function Search({
  currentNeighborhood,
  onSelectNeighborhood,
  onNavigateToBookDetail,
  onNavigateToFavorites,
  initialModality,
  initialCategory,
  initialTerm,
  focusKey,
  scrollToTopTick = 0,
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
  const { colors } = useTheme();
  const styles = getSearchStyles(colors);
  const [state, actions] = makeSearchViewModel(auth.user?.id ?? null);
  useOnRefocus(focusKey, () => {
    void actions.reload();
  });
  const { isOnline } = makeNetworkStatus();
  useReloadOnReconnect(isOnline, actions.reload);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const windowWidth = useHydratedWindowWidth();
  const wideWeb = Platform.OS === "web" && windowWidth >= WIDE_WEB_MIN_WIDTH;
  const compactWeb = Platform.OS === "web" && windowWidth > 0 && windowWidth <= 390;
  const gridColumns = useWebGridColumns();
  const [showSortSheet, setShowSortSheet] = useState(false);
  const appliedInitialFilters = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    if (scrollToTopTick > 0) {
      flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    }
  }, [scrollToTopTick]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarAction, setSnackbarAction] = useState<{ label: string; onPress: () => void } | null>(null);
  const clearedSnapshotRef = useRef<{ term: string; filters: SearchFilters; sortBy: SearchSortOption; neighborhood: string | "all" } | null>(null);
  const { persisted, loaded: persistedLoaded, persist } = usePersistedSearchFilters();
  const insets = useSafeAreaInsets();
  const navBarPaddingBottom = insets.bottom > 0 ? insets.bottom + tokens.spacing[8] : tokens.spacing[12];
  const navBarDockHeight = 62;
  const floatingBottom = wideWeb ? tokens.spacing[32] : navBarPaddingBottom + navBarDockHeight + tokens.spacing[12];

  const guardedNavigateToBookDetail = useGuardedPress((bookId: string) => {
    void actions.registerSearch(state.term);
    onNavigateToBookDetail?.(bookId);
  });
  const guardedNavigateToFavorites = useGuardedPress(onNavigateToFavorites);
  const navigateToBookDetailRef = useRef(guardedNavigateToBookDetail);
  navigateToBookDetailRef.current = guardedNavigateToBookDetail;
  const navigateToFavoritesRef = useRef(guardedNavigateToFavorites);
  navigateToFavoritesRef.current = guardedNavigateToFavorites;
  const hasFavoritesRoute = Boolean(onNavigateToFavorites);

  const handleOpenBookDetail = useCallback((bookId: string) => {
    navigateToBookDetailRef.current(bookId);
  }, []);

  const handleFavoriteToggle = useCallback(
    (selected: boolean, bookTitle?: string) => {
      const label = bookTitle ?? "Livro";
      setSnackbarMessage(
        selected
          ? `"${label}" foi adicionado aos Favoritos!`
          : `"${label}" foi removido dos Favoritos.`,
      );
      setSnackbarAction(
        hasFavoritesRoute
          ? { label: "Ver favoritos", onPress: () => navigateToFavoritesRef.current() }
          : null,
      );
    },
    [hasFavoritesRoute],
  );

  const handleListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > 300;
    setShowScrollTop((prev) => (prev === next ? prev : next));
  }, []);

  const sessionUserId = auth.user?.id ?? null;
  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => (
      <SearchBookCard
        item={item}
        wideWeb={wideWeb}
        compactWeb={compactWeb}
        gridColumns={gridColumns}
        userId={sessionUserId}
        onPress={handleOpenBookDetail}
        onFavoriteToggle={handleFavoriteToggle}
      />
    ),
    [wideWeb, compactWeb, gridColumns, sessionUserId, handleOpenBookDetail, handleFavoriteToggle],
  );

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
    if (snapshot.neighborhood && snapshot.neighborhood !== "all") {
      setSelectedNeighborhoodOverride(snapshot.neighborhood);
      void neighborhoodHook.selectNeighborhood(snapshot.neighborhood);
      actions.setNeighborhood(snapshot.neighborhood);
    } else {
      setSelectedNeighborhoodOverride(null);
      void neighborhoodHook.selectNeighborhood("all");
      actions.setNeighborhood("all");
    }
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
      neighborhood: effectiveNeighborhood,
    };
    setSelectedNeighborhoodOverride(null);
    void neighborhoodHook.selectNeighborhood("all");
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
    if (initialTerm) {
      actions.setTerm(initialTerm);
      void actions.registerSearch(initialTerm);
    }
    appliedInitialFilters.current = true;
  }, [initialModality, initialCategory, initialTerm, actions]);

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
    const f = persisted.filters;
    if (f.modality !== "all") actions.setModality(f.modality);
    if (f.category !== "all") actions.setCategory(f.category);
    if (f.condition !== "all") actions.setCondition(f.condition);
    if (f.priceRange !== "all") actions.setPriceRange(f.priceRange);
    if (f.onlyBoxes) actions.setOnlyBoxes(true);
    if (persisted.sortBy !== "recent") actions.setSortBy(persisted.sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedLoaded, persisted]);

  // Persiste filtros e ordenação atuais após a primeira leitura do storage.
  useEffect(() => {
    if (!persistedLoaded) return;
    persist(state.filters, state.sortBy);
  }, [persistedLoaded, state.filters, state.sortBy, persist]);

  const isAll =
    !effectiveNeighborhood ||
    effectiveNeighborhood === "all" ||
    effectiveNeighborhood === "Todos os bairros (Piripiri)" ||
    effectiveNeighborhood === "Piripiri (Todos os locais)" ||
    effectiveNeighborhood === "Piripiri (Todos)" ||
    effectiveNeighborhood === "Piripiri";

  const displayNeighborhood = isAll ? "Piripiri" : effectiveNeighborhood;

  const handleSelectNeighborhoodOption = (local: string) => {
    setSelectedNeighborhoodOverride(local);
    void neighborhoodHook.selectNeighborhood(local);
    if (typeof actions.setNeighborhood === "function") {
      const isSelectedAll =
        local === "Todos os bairros (Piripiri)" ||
        local === "Piripiri (Todos os locais)" ||
        local === "Piripiri (Todos)" ||
        local === "Piripiri" ||
        local === "all";
      actions.setNeighborhood(isSelectedAll ? "all" : local);
    }
  };

  // A categoria já aparece selecionada na fileira de chips do catálogo; repeti-la nos chips
  // removíveis duplicaria o mesmo estado em dois lugares da tela.
  const visibleActiveFilters = state.activeFilters.filter(
    (filter) => filter.key !== "category" && (wideWeb || filter.key !== "modality"),
  );

  // Busca e filtros viajam no cabeçalho da própria lista para rolagem natural no mobile.
  const listHeader = (
    <View style={[styles.filters, wideWeb && styles.filtersWide]}>
      <CachedBookNotice cachedAt={state.cachedAt} variant="catalog" />
      {/* 1. Barra de Topo: Bairro (Pill) e Ações (Limpar filtros / Tune) (Figma nós 137:2457 e 137:2461) */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Selecionar local em Piripiri: ${displayNeighborhood}`}
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
              <AppIcon name="heartFill" size={wideWeb ? 18 : 20} color={colors.ipe.bloom} />
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
        placeholder={compactWeb ? "Título, autor ou categoria" : undefined}
        value={state.term}
        onChangeText={actions.setTerm}
        onSubmitEditing={() => void actions.registerSearch(state.term)}
        onCancel={() => {
          actions.setTerm("");
          Keyboard.dismiss();
        }}
      />

      {/* 4. Modalidades em chips rápidos. Na web larga o painel "Filtros" já tem o grupo Modalidade. */}
      {wideWeb ? null : (
        <View style={styles.quickModalitiesRow}>
          {(["all", "sale", "trade", "donation"] as const).map((mod) => {
            const isSelected = state.modality === mod;
            const label = mod === "all" ? "Todas" : mod === "sale" ? "Venda" : mod === "trade" ? "Troca" : "Doação";
            const tone =
              mod === "all"
                ? { background: colors.nature.foliage, text: colors.nature.onFoliage }
                : colors.badge[mod];
            return (
              <Chip
                key={mod}
                size="compact"
                label={label}
                accessibilityLabel={`Filtrar por ${label}`}
                selected={isSelected}
                tone={tone}
                onPress={() => actions.setModality(mod)}
              />
            );
          })}
        </View>
      )}

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
          <Text numberOfLines={1} style={styles.summaryText}>
            {state.resultsSummary}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ordenar por ${SORT_LABELS[state.sortBy]}`}
            onPress={() => setShowSortSheet(true)}
            style={withPress(styles.sortButton)}
          >
            <Text style={styles.sortText}>{SORT_LABELS[state.sortBy]}</Text>
            <AppIcon name="chevronDown" size={14} color={colors.m3.onSurfaceVariant} />
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

      {confirmingClear ? (
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
      ) : null}
    </View>
  );

  const neighborhoodApplied = !isAll;
  const onlyNeighborhoodBlocks = neighborhoodApplied && state.matchesInOtherNeighborhoods > 0;
  const hasOtherActiveFilters = Boolean(state.term.trim()) || state.activeFilters.length > 0;
  const prep = getNeighborhoodPreposition(displayNeighborhood);

  const listEmpty = state.loading ? (
    <LoadingState label="Carregando livros" variant="catalog" />
  ) : state.error ? (
    isOnline ? (
      <ErrorState message={state.error} onRetry={() => void actions.reload()} />
    ) : (
      <OfflineState autoRetry={false} onRetry={() => void actions.reload()} />
    )
  ) : (
    <View style={[styles.empty, wideWeb && styles.emptyWide]}>
      {wideWeb ? (
        <View style={styles.emptyIcon}>
          <AppIcon name="search" size={32} color={colors.m3.onSurface} />
        </View>
      ) : null}
      <Text style={styles.emptyTitle}>
        {onlyNeighborhoodBlocks
          ? `Nenhum livro ${prep} ${displayNeighborhood} com essa busca.`
          : "Nenhum livro encontrado."}
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
      <View style={styles.emptyActions}>
        {onlyNeighborhoodBlocks ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver em toda Piripiri"
            onPress={() => handleSelectNeighborhoodOption("Todos os bairros (Piripiri)")}
            style={withPress(styles.emptyPrimaryButton)}
          >
            <Text style={styles.emptyPrimaryButtonText}>Ver em toda Piripiri</Text>
          </Pressable>
        ) : null}
        {(onlyNeighborhoodBlocks ? hasOtherActiveFilters : state.hasActiveFilters) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar filtros e buscar novamente"
            onPress={handleClearFilters}
            style={withPress(onlyNeighborhoodBlocks ? styles.emptySecondaryButton : styles.emptyPrimaryButton)}
          >
            <Text style={onlyNeighborhoodBlocks ? styles.emptySecondaryButtonText : styles.emptyPrimaryButtonText}>
              Limpar filtros
            </Text>
          </Pressable>
        ) : null}
      </View>
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

          {showFilterSheet ? (
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
          ) : null}
          {showSortSheet ? (
            <SortSheet
              visible={showSortSheet}
              selected={state.sortBy}
              onSelect={actions.setSortBy}
              onClose={() => setShowSortSheet(false)}
            />
          ) : null}
          {neighborhoodHook.isSelectorOpen ? (
            <NeighborhoodSelectorModal
              visible={neighborhoodHook.isSelectorOpen}
              currentNeighborhood={effectiveNeighborhood}
              onSelect={handleSelectNeighborhoodOption}
              onClose={neighborhoodHook.closeSelector}
            />
          ) : null}
        </>
      }
    >
      <View style={wideWeb ? styles.wideRow : styles.flexOne}>
      {wideWeb ? (
        <WebFilterSidebar
          filters={state.filters}
          categories={state.availableCategories}
          hasActiveFilters={state.hasActiveFilters}
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
        keyExtractor={extractBookKey}
        initialNumToRender={wideWeb ? 8 : 5}
        maxToRenderPerBatch={wideWeb ? 8 : 5}
        windowSize={wideWeb ? 9 : 7}
        updateCellsBatchingPeriod={40}
        removeClippedSubviews={Platform.OS === "android"}
        style={styles.flexOne}
        contentContainerStyle={wideWeb ? styles.contentWide : [styles.content, { paddingBottom: scrollBottomPadding.withBottomBarAndFab + tokens.spacing[24] }]}
        onScroll={handleListScroll}
        scrollEventThrottle={32}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={renderBookItem}
      />
      </View>
    </ScreenContainer>
  );
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
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useReduceTransparency();
  const iosGlass = isIos && !reduceTransparency;

  useEffect(() => { Animated.spring(scaleAnim, { toValue: 1, tension: tokens.spring.spatialStandard.tension, friction: tokens.spring.spatialStandard.friction, useNativeDriver: Platform.OS !== "web", }).start(); }, [scaleAnim]);

  const isWeb = Platform.OS === "web";
  const webFabBg =
    colors.surface === "#FCFAF5" ? "rgba(235, 244, 236, 0.92)" : "rgba(39, 66, 44, 0.90)";

  return (
    <Animated.View
      style={{ position: "absolute", right: tokens.spacing[16], bottom, zIndex: 90, transform: [{ scale: scaleAnim }], }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar ao topo da lista"
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={() => {
          if (isIos) triggerHaptic("light");
          onPress();
        }}
        style={({ pressed }) => [
          stylesScrollTop.scrollTopFab,
          {
            backgroundColor: isIos
              ? iosGlass
                ? tokens.glass.fill
                : colors.m3.surfaceContainer
              : isWeb
                ? webFabBg
                : colors.nature.sprout,
            borderColor: iosGlass ? tokens.glass.stroke : colors.m3.outlineVariant,
            shadowColor: isIos ? "#302e24" : colors.m3.shadow,
            shadowOpacity: iosGlass ? 0.14 : 0.2,
            overflow: "hidden",
          },
          isHovered && stylesScrollTop.scrollTopFabHovered,
          pressed && stylesScrollTop.scrollTopFabPressed,
        ]}
      >
        {iosGlass ? (
          <View pointerEvents="none" style={stylesScrollTop.iosBlurClip}>
            <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
          </View>
        ) : null}
        <AppIcon name="chevronUp" size={24} color={isIos ? colors.m3.onSurface : colors.nature.foliage} />
      </Pressable>
    </Animated.View>
  );
}

const stylesScrollTop = StyleSheet.create({
  iosBlurClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: tokens.radius.full,
    overflow: "hidden",
  },
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
      ? ({ cursor: "pointer", userSelect: "none", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", } as never)
      : {}),
  },
  scrollTopFabHovered: { transform: [{ scale: 1.06 }], elevation: 8, shadowOpacity: 0.26, shadowRadius: 12, },
  scrollTopFabPressed: { transform: [{ scale: 0.94 }], opacity: 0.9, },
});
