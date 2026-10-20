import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import { tokens } from "@/view/tokens";
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
import type { BookModality } from "@/model/entities/book";

export type SearchProps = {
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToAlerts?: (term: string) => void;
};

const MODALITY_FILTERS: Array<{ id: BookModality | "all"; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "sale", label: "Venda" },
  { id: "trade", label: "Troca" },
  { id: "donation", label: "Doação" },
];

/** Busca (US3, T019, Issue #93): filtra e ordena o catálogo já carregado por termo e modalidade. */
export default function Search({ onNavigateToBookDetail, onNavigateToAlerts }: SearchProps) {
  const [auth] = useAuthViewModel();
  const [state, actions] = useSearchViewModel(auth.user?.id ?? null);
  const { isOnline } = useNetworkStatus();
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>Pesquisa</Text>
        <SearchField value={state.term} onChangeText={actions.setTerm} onSubmitEditing={() => void actions.registerSearch(state.term)} />

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

        {!state.term.trim() && state.history.length > 0 ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Buscas recentes</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Limpar histórico de buscas" onPress={() => setConfirmingClear(true)}>
                <Text style={styles.alertLink}>Limpar</Text>
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
                  {state.term
                    ? "Tente buscar por outro título ou autor."
                    : "Ainda não há livros no catálogo."}
                </Text>
                {state.term.trim() ? <Pressable accessibilityRole="button" onPress={() => onNavigateToAlerts?.(state.term.trim())}>
                  <Text style={styles.alertLink}>Criar alerta para esta busca</Text>
                </Pressable> : null}
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

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], gap: tokens.spacing[16] },
  heading: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: tokens.colors.action },
  filterSection: { gap: tokens.spacing[6] },
  filterLabel: { fontSize: tokens.typography.labelSmall.fontSize, fontWeight: "600", color: tokens.colors.secondaryText },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: tokens.colors.secondaryText },
  list: { paddingBottom: tokens.spacing[24] },
  empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
  emptyTitle: { fontSize: 19, fontWeight: "600", color: tokens.colors.action },
  alertLink: { color: tokens.colors.action, fontWeight: "600", padding: tokens.spacing[12] },
  historySection: { gap: tokens.spacing[8] },
  historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyTitle: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: "600", color: tokens.colors.secondaryText },
  historyChips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  historyChip: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", borderRadius: tokens.radius.full, backgroundColor: tokens.colors.soft, paddingHorizontal: tokens.spacing[16] },
  historyChipText: { color: tokens.colors.text, fontSize: tokens.typography.bodyLarge.fontSize },
  row: { flexDirection: "row", gap: tokens.spacing[12], paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: tokens.colors.border },
  rowMain: { flex: 1, flexDirection: "row", gap: tokens.spacing[12] },
  rowInfo: { flex: 1, gap: 6 },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
  rowTitle: { fontSize: 19, fontWeight: "600", color: tokens.colors.action },
});
