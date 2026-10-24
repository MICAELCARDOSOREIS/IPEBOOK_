import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import type { SearchModalityFilter, SearchPriceRange, SearchSortOption } from "@/viewmodel/useSearchViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { SearchField } from "@/view/components/SearchField";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { Dialog } from "@/view/components/Dialog";
import { Chip } from "@/view/components/Chip";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

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

const MODALITY_FILTERS: Array<{ id: SearchModalityFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "sale", label: "Venda" },
  { id: "trade", label: "Troca" },
  { id: "donation", label: "Doação" },
];

/** Categorias rápidas do Figma `02.02 · Explorar` (nó 183:3499). */
const QUICK_CATEGORY_FILTERS = ["Ficção", "Não ficção", "Infantil", "Didático"] as const;

const PRICE_FILTERS: Array<{ id: SearchPriceRange; label: string }> = [
  { id: "all", label: "Todos os preços" },
  { id: "free", label: "Grátis" },
  { id: "under20", label: "Até R$ 20" },
  { id: "under50", label: "Até R$ 50" },
];

const SORT_OPTIONS: Array<{ id: SearchSortOption; label: string }> = [
  { id: "recent", label: "Recentes" },
  { id: "title", label: "A-Z" },
  { id: "price_asc", label: "Menor preço" },
  { id: "price_desc", label: "Maior preço" },
];

/** Busca e Exploração (Figma `02.02 · Explorar`, nó `10:2`). */
export default function Search({
  currentNeighborhood = "Centro",
  onSelectNeighborhood,
  onNavigateToBookDetail,
  onNavigateToAlerts,
  initialModality,
}: SearchProps) {
  const [auth] = useAuthViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useSearchViewModel(auth.user?.id ?? null);
  const { isOnline } = useNetworkStatus();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const appliedInitialModality = useRef(false);

  useEffect(() => {
    if (appliedInitialModality.current) return;
    if (initialModality && initialModality !== "all") {
      actions.setModality(initialModality);
    }
    appliedInitialModality.current = true;
  }, [initialModality, actions]);

  // Busca e filtros viajam no cabeçalho da própria lista para rolagem natural no mobile.
  const listHeader = (
    <View style={styles.filters}>
      {/* 1. Barra de Topo: Bairro (Pill) e Ações (Limpar filtros / Tune) (Figma nós 137:2457 e 137:2461) */}
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
          {state.hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar todos os filtros de busca"
              onPress={actions.clearFilters}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showAdvancedFilters ? "Ocultar filtros avançados" : "Mostrar filtros avançados"}
            onPress={() => setShowAdvancedFilters((visible) => !visible)}
            style={[styles.tuneButton, showAdvancedFilters && styles.tuneButtonActive]}
          >
            <AppIcon
              name="tune"
              size={24}
              color={showAdvancedFilters ? colors.m3.onSecondaryContainer : colors.m3.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>

      {/* 2. Manchete Editorial (Figma nó 137:2463) */}
      <View style={styles.heroSection}>
        <Text accessibilityRole="header" style={styles.heading}>
          O que vamos{"\n"}ler hoje?
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

      {/* 4. Categorias Rápidas em Rolagem Horizontal (Figma nó 183:3499) */}
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
        {QUICK_CATEGORY_FILTERS.map((category) => (
          <Chip
            key={category}
            label={category}
            accessibilityLabel={`Filtrar por categoria ${category}`}
            selected={state.category === category}
            onPress={() => actions.setCategory(category)}
          />
        ))}
      </ScrollView>

      {showAdvancedFilters ? (
        <View style={styles.advancedFilters}>
          {/* Filtro por Modalidade */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Modalidade:</Text>
            <View style={styles.filtersRow}>
              {MODALITY_FILTERS.map((f) => (
                <Chip
                  key={f.id}
                  label={f.label}
                  accessibilityLabel={f.id === "all" ? "Filtrar por todas as modalidades" : `Filtrar por ${f.label}`}
                  selected={state.modality === f.id}
                  onPress={() => actions.setModality(f.id)}
                />
              ))}
            </View>
          </View>

          {/* Filtro por Categoria */}
          {state.availableCategories.length > 0 ? (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoria:</Text>
              <View style={styles.filtersRow}>
                <Chip
                  label="Todas"
                  accessibilityLabel="Filtrar por todas as categorias"
                  selected={state.category === "all"}
                  onPress={() => actions.setCategory("all")}
                />
                {state.availableCategories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    accessibilityLabel={`Filtrar por categoria ${cat}`}
                    selected={state.category === cat}
                    onPress={() => actions.setCategory(cat)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Filtro por Faixa de Preço */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Preço:</Text>
            <View style={styles.filtersRow}>
              {PRICE_FILTERS.map((p) => (
                <Chip
                  key={p.id}
                  label={p.label}
                  accessibilityLabel={`Filtrar por ${p.label}`}
                  selected={state.priceRange === p.id}
                  onPress={() => actions.setPriceRange(p.id)}
                />
              ))}
            </View>
          </View>

          {/* Ordenação */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Ordenar por:</Text>
            <View style={styles.filtersRow}>
              {SORT_OPTIONS.map((s) => (
                <Chip
                  key={s.id}
                  label={s.label}
                  accessibilityLabel={`Ordenar por ${s.label}`}
                  selected={state.sortBy === s.id}
                  onPress={() => actions.setSortBy(s.id)}
                />
              ))}
            </View>
          </View>
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
              <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Buscar novamente por ${item}`} onPress={() => actions.setTerm(item)} style={styles.historyChip}>
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
      <Text style={styles.emptyTitle}>Nenhum livro encontrado.</Text>
      <Text style={styles.body}>
        {state.hasActiveFilters
          ? "Nenhum livro corresponde aos filtros selecionados."
          : "Ainda não há livros no catálogo."}
      </Text>
      {state.hasActiveFilters ? (
        <Pressable accessibilityRole="button" onPress={actions.clearFilters} style={styles.emptyActionButton}>
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
    <SafeAreaView style={styles.page}>
      <FlatList
        data={state.loading || state.error ? [] : state.books}
        keyExtractor={(book) => book.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => {
          const priceOrCondition =
            item.price != null
              ? `R$ ${item.price.toFixed(2).replace(".", ",")}`
              : item.modality === "trade"
              ? "Por outro livro"
              : "Gratuito";

          return (
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                onPress={() => { void actions.registerSearch(state.term); onNavigateToBookDetail?.(item.id); }}
                style={styles.cardMain}
              >
                <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                <View style={styles.cardInfo}>
                  <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.cardAuthor}>{item.author}</Text>
                  <View style={styles.cardMetaRow}>
                    <Tag variant={item.modality} />
                    <Text style={styles.priceText}>{priceOrCondition}</Text>
                  </View>
                  {item.category ? <Text style={styles.categoryBadge}>{item.category}</Text> : null}
                </View>
              </Pressable>
              <View style={styles.cardActions}>
                <FavoriteButton bookId={item.id} userId={auth.user?.id ?? null} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${item.title}`}
                  onPress={() => { void actions.registerSearch(state.term); onNavigateToBookDetail?.(item.id); }}
                  style={styles.chevronButton}
                >
                  <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
                </Pressable>
              </View>
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
      gap: 6,
      backgroundColor: colors.soft,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
    },
    neighborhoodText: {
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: "500",
    },
    topRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    tuneButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    tuneButtonActive: {
      backgroundColor: colors.soft,
    },
    heroSection: {
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
    },
    heading: {
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.secondaryText,
    },
    quickCategoriesScroll: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: 2,
    },
    clearFiltersButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[8],
    },
    clearFiltersText: { color: colors.error, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
    filterSection: { gap: tokens.spacing[6] },
    advancedFilters: { gap: tokens.spacing[16] },
    filterLabel: { fontSize: tokens.typography.labelSmall.fontSize, fontWeight: "600", color: colors.secondaryText },
    filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: colors.secondaryText },
    empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
    emptyTitle: { fontSize: 19, fontWeight: "600", color: colors.action },
    emptyActionButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[16],
    },
    emptyActionText: { color: colors.action, fontWeight: "600", fontSize: 15 },
    alertLink: { color: colors.action, fontWeight: "600", padding: tokens.spacing[12] },
    historySection: { gap: tokens.spacing[8] },
    historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    historyTitle: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: "600", color: colors.secondaryText },
    historyChips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    historyChip: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      paddingHorizontal: tokens.spacing[16],
    },
    historyChipText: { color: colors.text, fontSize: tokens.typography.bodyLarge.fontSize },

    // Card de Livro (Figma 02.02 · Explorar nós 137:2471 a 137:2490)
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[4],
      paddingVertical: tokens.spacing[12],
      marginBottom: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
      gap: 14,
    },
    cardMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    cardInfo: {
      flex: 1,
      gap: tokens.spacing[4],
      justifyContent: "center",
    },
    cardTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 19,
      lineHeight: 24,
      color: colors.text,
    },
    cardAuthor: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.secondaryText,
    },
    cardMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[4],
    },
    priceText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: colors.text,
    },
    cardActions: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 48,
    },
    chevronButton: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryBadge: { fontSize: tokens.typography.labelSmall.fontSize, color: colors.secondaryText, fontStyle: "italic" },
  });
}
