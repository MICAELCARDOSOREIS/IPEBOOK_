import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { Book, BookModality, BookStatus } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { AppIcon } from "@/view/components/AppIcon";
import { ShelfRow } from "@/view/listings/shelfRow";
import { useIsWideWeb } from "@/view/useIsWideWeb";

const MODALITY_LABELS: Readonly<Record<BookModality, string>> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

const STATUS_LABELS: Readonly<Record<BookStatus, string>> = {
  available: "Disponível",
  paused: "Pausado",
  reserved: "Reservado",
  delivered: "Entregue",
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
  onShareWhatsApp?: (book: Book) => void;
};

export function MyListingsListingsTab({
  books,
  statusFilter,
  onStatusFilterChange,
  onNavigateToManageListing,
  onShareWhatsApp,
}: MyListingsListingsTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wideWeb = useIsWideWeb();

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
    { key: "active", label: `Ativos (${activeCount})`, a11y: "Filtrar por Ativos", tone: { background: colors.m3.secondaryContainer, text: colors.action } },
    { key: "paused", label: `Pausados (${pausedCount})`, a11y: "Filtrar por Pausados", tone: { background: colors.disabledBackground, text: colors.disabledText } },
    { key: "reserved", label: `Reservados (${reservedCount})`, a11y: "Filtrar por Reservados", tone: colors.badge.reserved },
  ];

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        keyboardShouldPersistTaps="handled"
      >
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
          {wideWeb ? (
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3, minWidth: 220 }]}>Livro</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Modalidade</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Bairro</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.2, minWidth: 100 }]}>Situação</Text>
              <Text style={[styles.tableHeaderText, { width: 110, textAlign: "right" }]}>Ação</Text>
            </View>
          ) : null}
          {filteredBooks.map((book) => (
            <ShelfRow
              key={book.id}
              wide={
                wideWeb
                  ? {
                      statusVariant:
                        book.status === "available"
                          ? "available"
                          : book.status === "reserved"
                            ? "reserved"
                            : "paused",
                      statusLabel: STATUS_LABELS[book.status],
                      offer:
                        book.modality === "sale" && book.price
                          ? formatPrice(book.price)
                          : MODALITY_LABELS[book.modality],
                    }
                  : undefined
              }
              book={book}
              summary={listingSummary(book)}
              accessibilityLabel={`Gerenciar anúncio de ${book.title}`}
              onPress={() => onNavigateToManageListing?.(book.id)}
              onShareWhatsApp={onShareWhatsApp ? () => onShareWhatsApp(book) : undefined}
            />
          ))}
        </View>
      )}
      {/* `05.01` traz a dica de uso depois da lista, com ícone informativo para clareza ergonômica. */}
      <View style={styles.orientationBox}>
        <AppIcon name="info" size={16} color={colors.secondaryText} />
        <Text style={styles.orientationHint}>
          Toque em um livro para editar, pausar ou marcar como concluído.
        </Text>
      </View>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    filterRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      paddingBottom: tokens.spacing[8],
      paddingRight: tokens.spacing[16],
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
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    tableHeader: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[16], paddingHorizontal: tokens.spacing[16], paddingVertical: tokens.spacing[12] },
    tableHeaderText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    listTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    orientationBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[4],
    },
    orientationHint: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      flex: 1,
    },
  });
}
