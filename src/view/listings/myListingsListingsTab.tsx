import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Book, BookModality, BookStatus } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { ShelfRow } from "@/view/listings/shelfRow";

const MODALITY_LABELS: Readonly<Record<BookModality, string>> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

const STATUS_LABELS: Readonly<Record<BookStatus, string>> = {
  available: "Disponível",
  paused: "Pausado",
  reserved: "Reservado",
  draft: "Rascunho",
};

export function listingSummary(book: Book): string {
  const offer =
    book.modality === "sale" && book.price ? formatPrice(book.price) : MODALITY_LABELS[book.modality];
  return [offer, book.neighborhood, STATUS_LABELS[book.status]].filter(Boolean).join(" · ");
}

export type ListingsFilter = "all" | "active" | "paused" | "reserved";

export type MyListingsListingsTabProps = {
  books: readonly Book[];
  statusFilter: ListingsFilter;
  onStatusFilterChange: (filter: ListingsFilter) => void;
  onNavigateToManageListing?: (bookId: string) => void;
};

export function MyListingsListingsTab({
  books,
  statusFilter,
  onStatusFilterChange,
  onNavigateToManageListing,
}: MyListingsListingsTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const activeCount = books.filter((b) => b.status === "available").length;
  const pausedCount = books.filter((b) => b.status === "paused").length;
  const reservedCount = books.filter((b) => b.status === "reserved").length;

  const filteredBooks = books.filter((b) => {
    if (statusFilter === "active") return b.status === "available";
    if (statusFilter === "paused") return b.status === "paused";
    if (statusFilter === "reserved") return b.status === "reserved";
    return true;
  });

  // Cada situação usa a cor da sua etiqueta (Disponível, Pausado, Reservado); "Todos" fica neutro.
  const filterChips: { key: ListingsFilter; label: string; a11y: string; tone?: { background: string; text: string } }[] = [
    { key: "all", label: `Todos (${books.length})`, a11y: "Filtrar por Todos" },
    { key: "active", label: `Ativos (${activeCount})`, a11y: "Filtrar por Ativos", tone: { background: colors.soft, text: colors.action } },
    { key: "paused", label: `Pausados (${pausedCount})`, a11y: "Filtrar por Pausados", tone: { background: colors.disabledBackground, text: colors.disabledText } },
    { key: "reserved", label: `Reservados (${reservedCount})`, a11y: "Filtrar por Reservados", tone: colors.badge.reserved },
  ];

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {/* Mesmo Chip do resto do app (Home, Explorar, filtros): raio, check e cores iguais. */}
        {filterChips.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            accessibilityLabel={chip.a11y}
            tone={chip.tone}
            selected={statusFilter === chip.key}
            onPress={() => onStatusFilterChange(chip.key)}
          />
        ))}
      </ScrollView>
      {filteredBooks.length === 0 ? (
        <View style={styles.empty}>
          <IconBadge icon="shelf" tone="neutral" size="large" />
          <Text style={styles.emptyTitle}>Nenhum anúncio encontrado neste filtro.</Text>
          <View style={styles.emptyAction}>
            <FilledButton
              label="Ver todos os anúncios"
              onPress={() => onStatusFilterChange("all")}
            />
          </View>
        </View>
      ) : (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>
            {`${filteredBooks.length} ${filteredBooks.length === 1 ? "anúncio" : "anúncios"}`}
          </Text>
          {filteredBooks.map((book) => (
            <ShelfRow
              key={book.id}
              book={book}
              summary={listingSummary(book)}
              accessibilityLabel={`Gerenciar anúncio de ${book.title}`}
              onPress={() => onNavigateToManageListing?.(book.id)}
            />
          ))}
        </View>
      )}
      {/* `05.01` traz a dica de uso depois da lista, não antes dela. */}
      <Text style={styles.orientationHint}>
        Toque em um livro para editar, pausar ou marcar como concluído.
      </Text>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    filterRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      paddingBottom: tokens.spacing[8],
    },
    empty: { paddingTop: tokens.spacing[48], alignItems: "center", gap: tokens.spacing[12] },
    emptyTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyAction: { marginTop: tokens.spacing[16], width: "100%" },
    listCard: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[4],
      borderRadius: 16,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    listTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    orientationHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      marginTop: tokens.spacing[8],
    },
  });
}
