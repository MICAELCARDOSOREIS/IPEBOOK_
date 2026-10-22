import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import type { SearchModalityFilter, SearchPriceRange, SearchSortOption } from "@/viewmodel/useSearchViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
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
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

export type SearchProps = {
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

/** Busca e Exploração (US3, T019, Spec 028, Issue #93): filtra por termo, modalidade, categoria e preço. */
export default function Search({ onNavigateToBookDetail, onNavigateToAlerts, initialModality }: SearchProps) {
  const [auth] = useAuthViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useSearchViewModel(auth.user?.id ?? null);
  const { isOnline } = useNetworkStatus();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const appliedInitialModality = useRef(false);

  useEffect(() => {
    if (appliedInitialModality.current) return;
    if (initialModality && initialModality !== "all") {
      actions.setModality(initialModality);
    }
    appliedInitialModality.current = true;
  }, [initialModality, actions]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text accessibilityRole="header" style={styles.heading}>Pesquisa</Text>
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
        </View>

        <SearchField
          value={state.term}
          onChangeText={actions.setTerm}
          onSubmitEditing={() => void actions.registerSearch(state.term)}
        />

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

        {state.loading ? (
          <LoadingState label="Carregando livros" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : (
          <FlatList
            data={state.books}
            keyExtractor={(book) => book.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
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
            }
            renderItem={({ item }) => {
              return (
                <View style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                    onPress={() => { void actions.registerSearch(state.term); onNavigateToBookDetail?.(item.id); }}
                    style={styles.rowMain}
                  >
                    <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                    <View style={styles.rowInfo}>
                      <View style={styles.rowHeader}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        <Tag variant={item.modality} />
                      </View>
                      <Text style={styles.body}>{item.author}</Text>
                      {item.category ? <Text style={styles.categoryBadge}>{item.category}</Text> : null}
                      {item.price ? <Text style={styles.priceText}>R$ {item.price.toFixed(2).replace(".", ",")}</Text> : null}
                    </View>
                  </Pressable>
                  <FavoriteButton bookId={item.id} userId={auth.user?.id ?? null} />
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], gap: tokens.spacing[16] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heading: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: colors.action },
  clearFiltersButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[8] },
  clearFiltersText: { color: colors.error, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
  filterSection: { gap: tokens.spacing[6] },
  filterLabel: { fontSize: tokens.typography.labelSmall.fontSize, fontWeight: "600", color: colors.secondaryText },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: colors.secondaryText },
  list: { paddingBottom: tokens.spacing[24] },
  empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
  emptyTitle: { fontSize: 19, fontWeight: "600", color: colors.action },
  emptyActionButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center", backgroundColor: colors.soft, borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[16] },
  emptyActionText: { color: colors.action, fontWeight: "600", fontSize: 15 },
  alertLink: { color: colors.action, fontWeight: "600", padding: tokens.spacing[12] },
  historySection: { gap: tokens.spacing[8] },
  historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyTitle: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: "600", color: colors.secondaryText },
  historyChips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  historyChip: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", borderRadius: tokens.radius.full, backgroundColor: colors.soft, paddingHorizontal: tokens.spacing[16] },
  historyChipText: { color: colors.text, fontSize: tokens.typography.bodyLarge.fontSize },
  row: { flexDirection: "row", gap: tokens.spacing[12], paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1, flexDirection: "row", gap: tokens.spacing[12] },
  rowInfo: { flex: 1, gap: 4 },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
  rowTitle: { fontSize: 19, fontWeight: "600", color: colors.action },
  categoryBadge: { fontSize: tokens.typography.labelSmall.fontSize, color: colors.secondaryText, fontStyle: "italic" },
  priceText: { fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600", color: colors.action },
  });
}
