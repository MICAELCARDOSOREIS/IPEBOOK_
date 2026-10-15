import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { SearchField } from "@/view/components/SearchField";
import type { BookModality } from "@/model/entities/book";

const modalityTag: Record<BookModality, { background: string; text: string; label: string }> = {
  sale: { background: tokens.colors.badge.sale.background, text: tokens.colors.badge.sale.text, label: "Venda" },
  trade: { background: tokens.colors.badge.trade.background, text: tokens.colors.badge.trade.text, label: "Troca" },
  donation: { background: tokens.colors.badge.donation.background, text: tokens.colors.badge.donation.text, label: "Doação" },
};

export type SearchProps = {
  onNavigateToBookDetail?: (bookId: string) => void;
};

/** Busca (US3, T019): filtra o catálogo já carregado por título ou autor (FR-005). */
export default function Search({ onNavigateToBookDetail }: SearchProps) {
  const [state, actions] = useSearchViewModel();

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>Pesquisa</Text>
        <SearchField value={state.term} onChangeText={actions.setTerm} />
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando livros" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <AppIcon name="error" color={tokens.colors.error} />
            <Text accessibilityRole="alert" style={styles.body}>{state.error}</Text>
          </View>
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
              </View>
            }
            renderItem={({ item }) => {
              const tag = modalityTag[item.modality];
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                  onPress={() => onNavigateToBookDetail?.(item.id)}
                  style={styles.row}
                >
                  <BookCover id={item.id} title={item.title} variant="list" />
                  <View style={styles.rowInfo}>
                    <View style={styles.rowHeader}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <View style={[styles.tag, { backgroundColor: tag.background }]}>
                        <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.body}>{item.author}</Text>
                  </View>
                </Pressable>
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
  status: { alignItems: "center", gap: tokens.spacing[12], paddingTop: tokens.spacing[32] },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: tokens.colors.secondaryText },
  list: { paddingBottom: tokens.spacing[24] },
  empty: { alignItems: "center", paddingTop: tokens.spacing[32], gap: tokens.spacing[8] },
  emptyTitle: { fontSize: 19, fontWeight: "600", color: tokens.colors.action },
  row: { flexDirection: "row", gap: tokens.spacing[12], paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: tokens.colors.border },
  rowInfo: { flex: 1, gap: 6 },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
  rowTitle: { fontSize: 19, fontWeight: "600", color: tokens.colors.action },
  tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6] },
  tagText: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
});
