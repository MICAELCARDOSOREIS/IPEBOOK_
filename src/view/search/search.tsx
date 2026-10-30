import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import type { SearchModalityFilter } from "@/viewmodel/useSearchViewModel";
import { SORT_LABELS } from "@/viewmodel/searchFilters";
import { FilterSheet } from "@/view/search/FilterSheet";
import { WebFilterSidebar } from "@/view/search/WebFilterSidebar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { SortSheet } from "@/view/search/SortSheet";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { categoryTone } from "@/view/categoryTone";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { ErrorState } from "@/view/components/ErrorState";
import { SearchField } from "@/view/components/SearchField";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { Dialog } from "@/view/components/Dialog";
import { Chip } from "@/view/components/Chip";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { WEB_MAX_WIDTH, useWebGridColumns } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type SearchProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToAlerts?: (term: string) => void;
  /** Pré-aplica um filtro de modalidade ao abrir, vindo do "Ver mais" da Home (Issue #146). */
  initialModality?: SearchModalityFilter;
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
  onNavigateToAlerts,
  initialModality,
}: SearchProps = {}) {
  const neighborhoodHook = useActiveNeighborhood("all");
  const effectiveNeighborhood =
    currentNeighborhood !== undefined ? currentNeighborhood : neighborhoodHook.activeNeighborhood;
  const handleSelectNeighborhood = onSelectNeighborhood ?? neighborhoodHook.openSelector;

  const [auth] = useAuthViewModel();
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useSearchViewModel(auth.user?.id ?? null);
  const { isOnline } = useNetworkStatus();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const wideWeb = useIsWideWeb();
  const gridColumns = useWebGridColumns();
  const [showSortSheet, setShowSortSheet] = useState(false);
  const appliedInitialModality = useRef(false);

  useEffect(() => {
    if (appliedInitialModality.current) return;
    if (initialModality && initialModality !== "all") {
      actions.setModality(initialModality);
    }
    appliedInitialModality.current = true;
  }, [initialModality, actions]);

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

  const displayNeighborhood =
    !effectiveNeighborhood ||
    effectiveNeighborhood === "all" ||
    effectiveNeighborhood === "Todos os bairros (Piripiri)"
      ? "Piripiri (Todos)"
      : effectiveNeighborhood;

  const handleSelectNeighborhoodOption = (bairro: string) => {
    void neighborhoodHook.selectNeighborhood(bairro);
    if (typeof actions.setNeighborhood === "function") {
      actions.setNeighborhood(bairro);
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
          <Text style={styles.neighborhoodText}>{displayNeighborhood}</Text>
          <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
        </Pressable>

        <View style={styles.topRightActions}>
          {state.hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar todos os filtros de busca"
              onPress={actions.resetFilters}
              style={withPress(styles.clearFiltersButton)}
            >
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
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
            <AppIcon name="tune" size={24} color={colors.m3.onSurfaceVariant} />
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
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickCategoriesScroll}
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
              <AppIcon name="close" size={16} color={colors.m3.onSecondaryContainer} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* 6. Resumo da faixa de resultados e ordenação (Figma `02.04`: "1 livro à venda · Literatura") */}
      {!state.loading && !state.error && state.books.length > 0 ? (
        <View style={styles.summaryRow}>
          <Text numberOfLines={2} style={styles.summaryText}>{state.resultsSummary}</Text>
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
    <LoadingState label="Carregando livros" />
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
          onPress={actions.clearFilters}
          style={withPress(styles.emptyActionButton)}
        >
          <Text style={styles.emptyActionText}>Limpar filtros</Text>
        </Pressable>
      ) : null}
      {state.term.trim() ? (
        <Pressable accessibilityRole="button" onPress={() => onNavigateToAlerts?.(state.term.trim())}>
          <Text style={styles.alertLink}>Criar alerta para esta busca</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <View style={wideWeb ? styles.wideRow : styles.flexOne}>
      {wideWeb ? (
        <WebFilterSidebar
          filters={state.filters}
          categories={state.availableCategories}
          hasActiveFilters={state.hasActiveFilters}
          onModality={actions.setModality}
          onCondition={actions.setCondition}
          onCategory={actions.setCategory}
          onClear={actions.resetFilters}
        />
      ) : null}
      <FlatList
        key={wideWeb ? `grade-${gridColumns}` : "lista"}
        numColumns={wideWeb ? gridColumns : 1}
        columnWrapperStyle={wideWeb ? styles.gridRow : undefined}
        data={state.loading || state.error ? [] : state.books}
        keyExtractor={(book) => book.id}
        style={styles.flexOne}
        contentContainerStyle={wideWeb ? styles.contentWide : styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          wideWeb && !state.loading && !state.error && state.books.length > 0 ? (
            <View style={styles.alertCard}>
              <AppIcon name="bell" size={24} color={colors.m3.onTertiaryContainer} />
              <View style={styles.alertCardText}>
                <Text style={styles.alertCardTitle}>Não achou o livro?</Text>
                <Text style={styles.alertCardBody}>Crie um alerta e avisamos quando alguém anunciar.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Criar alerta de busca"
                onPress={() => onNavigateToAlerts?.(state.term.trim())}
                style={withPress(styles.alertCardButton)}
              >
                <Text style={styles.alertCardButtonText}>Criar alerta</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const priceOrCondition =
            item.price != null
              ? `R$ ${item.price.toFixed(2).replace(".", ",")}`
              : item.modality === "trade"
              ? "Por outro livro"
              : "Gratuito";

          return (
            <View style={[styles.card, wideWeb && styles.cardWide, wideWeb && { maxWidth: `${100 / gridColumns}%` }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}${item.neighborhood ? ` em ${item.neighborhood}` : ""}`}
                onPress={() => { void actions.registerSearch(state.term); onNavigateToBookDetail?.(item.id); }}
                style={({ pressed }) => [
                  styles.cardMain,
                  wideWeb && styles.cardMainWide,
                  pressed && styles.cardMainPressed,
                ]}
              >
                <ModalityCoverArea modality={item.modality}>
                  <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant={wideWeb ? "card" : "list"} />
                </ModalityCoverArea>
                <View style={[styles.cardInfo, wideWeb && styles.cardInfoWide]}>
                  <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.cardAuthor}>{item.author}</Text>
                  <View style={[styles.cardMetaRow, wideWeb && styles.cardMetaRowWide]}>
                    <Tag variant={item.modality} />
                    <Text numberOfLines={1} style={styles.priceText}>{priceOrCondition}</Text>
                    {item.neighborhood ? (
                      <View style={styles.cardLocationBadge}>
                        <AppIcon name="place" size={12} color={colors.m3.onSurfaceVariant} />
                        <Text style={styles.cardLocationText}>{item.neighborhood}</Text>
                      </View>
                    ) : null}
                  </View>
                  {item.category ? <Text style={styles.categoryBadge}>{item.category}</Text> : null}
                </View>
              </Pressable>
              <View style={[styles.cardActions, wideWeb && styles.cardActionsWide]}>
                <FavoriteButton bookId={item.id} userId={auth.user?.id ?? null} />
                {wideWeb ? null : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${item.title}`}
                  onPress={() => { void actions.registerSearch(state.term); onNavigateToBookDetail?.(item.id); }}
                  style={withPress(styles.chevronButton)}
                >
                  <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
                </Pressable>
                )}
              </View>
            </View>
          );
        }}
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
          actions.resetFilters();
          setShowFilterSheet(false);
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
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    flexOne: { flex: 1 },
    // Web larga (Figma `34:229`): filtros fixos à esquerda e resultados em grade de 4 colunas.
    wideRow: { flex: 1, flexDirection: "row", gap: tokens.spacing[24], width: "100%", maxWidth: WEB_MAX_WIDTH, alignSelf: "center", paddingHorizontal: tokens.spacing[80], paddingTop: tokens.spacing[32] },
    contentWide: { flexGrow: 1, paddingBottom: tokens.spacing[32], gap: tokens.spacing[24] },
    gridRow: { gap: tokens.spacing[24] },
    cardMainWide: { flexDirection: "column", alignItems: "stretch", gap: tokens.spacing[8] },
    // Na grade, o texto começa logo abaixo da capa para os títulos ficarem alinhados entre colunas.
    cardInfoWide: { justifyContent: "flex-start" },
    cardMetaRowWide: { flexWrap: "wrap", rowGap: tokens.spacing[4] },
    cardActionsWide: { position: "absolute", top: 8, right: 8, width: 48 },
    cardWide: { alignItems: "stretch", paddingLeft: tokens.spacing[12], paddingRight: tokens.spacing[12], marginBottom: 0, flex: 1, flexDirection: "column", maxWidth: "25%", borderRadius: tokens.radius.xl, backgroundColor: colors.m3.surfaceContainerLowest },
    content: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[24],
    },
    filters: { gap: tokens.spacing[16], marginBottom: tokens.spacing[16] },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    },
    neighborhoodText: {
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.medium,
    },
    topRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    tuneButton: {
      width: 48,
      height: 48,
      borderRadius: tokens.radius.extraLarge,
      justifyContent: "center",
      alignItems: "center",
    },
    // Contador de filtros aplicados sobre o ícone de ajustes (chip de 18 dp do Material 3).
    tuneBadge: {
      position: "absolute",
      top: 6,
      right: 6,
      minWidth: 18,
      height: 18,
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
    quickCategoriesScroll: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
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
      backgroundColor: colors.m3.secondaryContainer,
    },
    activeFilterText: { ...tokens.typography.labelLarge, color: colors.m3.onSecondaryContainer },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
    },
    summaryText: { flex: 1, ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: tokens.spacing[2],
      minHeight: tokens.accessibility.touchTarget,
      paddingLeft: tokens.spacing[8],
    },
    sortText: { ...tokens.typography.labelLarge, color: colors.m3.primary },
    body: { ...tokens.typography.bodyLarge, lineHeight: tokens.lineHeight[25], color: colors.secondaryText },
    empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
    emptyWide: { width: "100%", paddingVertical: tokens.spacing[48], paddingHorizontal: tokens.spacing[48], borderRadius: tokens.radius.xxl, backgroundColor: colors.m3.surfaceContainerLow, gap: tokens.spacing[16] },
    emptyIcon: { width: 64, height: 64, borderRadius: tokens.radius.circle64, alignItems: "center", justifyContent: "center", backgroundColor: colors.m3.secondaryContainer },
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
      backgroundColor: colors.soft,
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
      backgroundColor: colors.soft,
      paddingHorizontal: tokens.spacing[16],
    },
    historyChipText: { ...tokens.typography.bodyLarge, color: colors.text },

    // Card de Livro (Figma 02.02 · Explorar nós 137:2471 a 137:2490)
    // Figma: sem borda, background branco (#FFF), sombra dupla elevation level1
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.card,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[4],
      paddingVertical: tokens.spacing[12],
      marginBottom: tokens.spacing[12],
      elevation: 2,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 3,
      gap: tokens.spacing[14],
    },
    cardMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
    },
    cardMainPressed: {
      transform: [{ scale: 0.985 }],
    },
    cardInfo: {
      flex: 1,
      gap: tokens.spacing[4],
      justifyContent: "center",
    },
    cardTitle: {
      ...tokens.typography.brandCardTitle,
      color: colors.text,
    },
    cardAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    cardMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[4],
    },
    cardLocationBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[2],
    },
    cardLocationText: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    priceText: {
      ...tokens.typography.labelLarge,
      color: colors.text,
    },
    cardActions: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: tokens.accessibility.touchTarget,
    },
    chevronButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryBadge: { ...tokens.typography.labelSmall, color: colors.secondaryText, fontStyle: "italic" },
  });
}
