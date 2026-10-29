import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book, BookModality, BookStatus } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
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

  const filterChips: { key: ListingsFilter; label: string; a11y: string }[] = [
    { key: "all", label: `Todos (${books.length})`, a11y: "Filtrar por Todos" },
    { key: "active", label: `Ativos (${activeCount})`, a11y: "Filtrar por Ativos" },
    { key: "paused", label: `Pausados (${pausedCount})`, a11y: "Filtrar por Pausados" },
    { key: "reserved", label: `Reservados (${reservedCount})`, a11y: "Filtrar por Reservados" },
  ];

  return (
    <>
      <View style={styles.filterRow}>
        {filterChips.map((chip) => {
          const selected = statusFilter === chip.key;
          return (
            <Pressable
              key={chip.key}
              accessibilityRole="button"
              accessibilityLabel={chip.a11y}
              accessibilityState={{ selected }}
              onPress={() => onStatusFilterChange(chip.key)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {filteredBooks.length === 0 ? (
        <View style={styles.empty}>
          <IconBadge icon="shelf" tone="neutral" />
          <Text style={styles.emptyTitle}>Nenhum anúncio encontrado neste filtro.</Text>
          <View style={styles.emptyAction}>
            <FilledButton
              label="Ver todos os anúncios"
              onPress={() => onStatusFilterChange("all")}
            />
          </View>
        </View>
      ) : (
        filteredBooks.map((book) => (
          <ShelfRow
            key={book.id}
            book={book}
            summary={listingSummary(book)}
            accessibilityLabel={`Gerenciar anúncio de ${book.title}`}
            onPress={() => onNavigateToManageListing?.(book.id)}
          />
        ))
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
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[8],
    },
    filterChip: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    filterChipSelected: {
      backgroundColor: colors.action,
      borderColor: colors.action,
    },
    filterChipText: {
      ...tokens.typography.labelMedium,
      color: colors.text,
    },
    filterChipTextSelected: {
      color: colors.surface,
      fontWeight: "600",
    },
    empty: { paddingTop: tokens.spacing[48], alignItems: "center", gap: tokens.spacing[12] },
    emptyTitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    emptyAction: { marginTop: tokens.spacing[16], width: "100%" },
    orientationHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      marginTop: tokens.spacing[8],
    },
  });
}
