import { type ReactNode, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RequestStatus } from "@/model/entities/bookRequest";
import type { RequestWithListing } from "@/viewmodel/useSentRequestsViewModel";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { WEB_MAX_WIDTH, WEB_GUTTER, useWebColumns } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

export const statusLabel: Record<RequestStatus, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

type Props = {
  title: string;
  emptyText: string;
  items: readonly RequestWithListing[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBack?: () => void;
  renderExtra: (item: RequestWithListing) => ReactNode;
};

/**
 * Estrutura visual comum às telas de pedidos recebidos (`05.03`, `06.03`) e enviados.
 */
export function RequestListLayout({
  title,
  emptyText,
  items,
  loading,
  error,
  onRetry,
  onBack,
  renderExtra,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isOnline } = useNetworkStatus();
  // Web larga: coluna mais larga e dois pedidos por linha, em vez de uma faixa estreita no meio.
  const wide = useIsWideWeb();
  const listColumns = useWebColumns(2, 3);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "history">("all");

  const pendingCount = items.filter((item) => item.request.status === "pending").length;
  const acceptedCount = items.filter((item) => item.request.status === "accepted").length;
  const isHistory = (status: RequestStatus) => status === "rejected" || status === "cancelled";
  const historyCount = items.filter((item) => isHistory(item.request.status)).length;

  const filteredItems = items.filter((item) => {
    if (statusFilter === "pending") return item.request.status === "pending";
    if (statusFilter === "accepted") return item.request.status === "accepted";
    if (statusFilter === "history") return isHistory(item.request.status);
    return true;
  });
  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title={title} onBack={() => onBack?.()} contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} />
      <View style={[styles.content, wide && styles.contentWide]}>
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>Sua estante em movimento.</Text>
          <Text style={styles.body}>Acompanhe as propostas dos seus livros.</Text>
          {items.length > 0 ? (
            <View style={styles.filterRow}>
              {(
                [
                  { key: "all", label: `Todos (${items.length})`, a11y: "Filtrar pedidos por Todos" },
                  { key: "pending", label: `Pendentes (${pendingCount})`, a11y: "Filtrar pedidos por Pendentes" },
                  { key: "accepted", label: `Aceitos (${acceptedCount})`, a11y: "Filtrar pedidos por Aceitos" },
                  { key: "history", label: `Histórico (${historyCount})`, a11y: "Filtrar pedidos por Histórico" },
                ] as const
              ).map((chip) => {
                const selected = statusFilter === chip.key;
                return (
                  <Pressable
                    key={chip.key}
                    accessibilityRole="button"
                    accessibilityLabel={chip.a11y}
                    accessibilityState={{ selected }}
                    onPress={() => setStatusFilter(chip.key)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                      pressed && styles.filterChipPressed,
                    ]}
                  >
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
        {loading ? (
          <LoadingState label="Carregando pedidos" />
        ) : error ? (
          isOnline ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : (
            <OfflineState onRetry={onRetry} />
          )
        ) : (
          <>
            <FlatList
              key={wide ? `colunas-${listColumns}` : "uma-coluna"}
              numColumns={wide ? listColumns : 1}
              columnWrapperStyle={wide ? styles.columns : undefined}
              data={filteredItems}
              keyExtractor={(item) => item.request.id}
              contentContainerStyle={styles.listContent}
              // O aviso acompanha o fim da lista, em vez de ficar preso no rodapé da janela.
              ListFooterComponent={
                items.length > 0 ? (
                  <View style={styles.infoCard}>
                    <IconBadge icon="chat" tone="action" />
                    <View style={styles.bookInfo}>
                      <Text style={styles.infoCardTitle}>Tudo pela conversa</Text>
                      <Text style={styles.body}>
                        Confira a proposta e combine os detalhes antes de reservar seu livro.
                      </Text>
                    </View>
                  </View>
                ) : undefined
              }
              ListEmptyComponent={
                items.length > 0 ? (
                  <View style={styles.emptyBox}>
                    <IconBadge icon="swap" tone="neutral" size="large" />
                    <Text style={styles.body}>Nenhum pedido encontrado neste filtro.</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Ver todos os pedidos"
                      onPress={() => setStatusFilter("all")}
                      style={withPress(styles.filterChip)}
                    >
                      <Text style={styles.link}>Ver todos os pedidos</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <IconBadge icon="swap" tone="neutral" size="large" />
                    <Text accessibilityRole="header" style={styles.emptyTitle}>
                      Nenhuma proposta ainda
                    </Text>
                    <Text style={[styles.body, { textAlign: "center" }]}>{emptyText}</Text>
                  </View>
                )
              }
              renderItem={({ item }) => (
                <View style={[styles.item, wide && styles.itemWide]}>
                  <View style={styles.bookRow}>
                    <BookCover
                      id={item.listing.id}
                      title={item.listing.title}
                      photoUrl={item.listing.photoUrl}
                      variant="list"
                    />
                    <View style={styles.bookInfo}>
                      <View style={styles.row}>
                        <Text style={styles.itemTitle}>{item.listing.title}</Text>
                        <Text style={[styles.badge, styles[item.request.status]]}>
                          {statusLabel[item.request.status]}
                        </Text>
                      </View>
                      <Text style={styles.body}>{item.listing.author}</Text>
                      <View style={styles.tagRow}>
                        <Tag variant={item.listing.modality} />
                        {item.listing.modality === "sale" && item.listing.price !== undefined ? (
                          <Text style={styles.price}>{formatPrice(item.listing.price)}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                  {renderExtra(item)}
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export function createRequestStyles(colors: ColorPalette) {
  return StyleSheet.create({
  actions: { flexDirection: "row", gap: tokens.spacing[12], marginTop: tokens.spacing[8] },
  primary: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[20],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.action,
  },
  primaryText: {
    color: colors.surface,
    ...tokens.typography.bodyLarge,
    fontWeight: tokens.fontWeight.semiBold,
  },
  secondary: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[20],
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: colors.m3.outline,
  },
  secondaryText: {
    color: colors.action,
    ...tokens.typography.bodyLarge,
    fontWeight: tokens.fontWeight.semiBold,
  },
  meta: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
    error: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}

function createStyles(colors: ColorPalette) {
  const requestStyles = createRequestStyles(colors);
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    paddingTop: tokens.spacing[32],
  },
  contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
  columns: { gap: tokens.spacing[12] },
  itemWide: { flex: 1, maxWidth: "50%" },
  back: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  link: {
    color: colors.action,
    ...tokens.typography.bodyMedium,
    fontWeight: tokens.fontWeight.semiBold,
  },
  heading: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    marginBottom: tokens.spacing[8],
  },
  heroBox: {
    marginBottom: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[8],
  },
  filterChip: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.shapeMorph.chipUnselected,
    backgroundColor: colors.m3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
  },
  filterChipSelected: {
    backgroundColor: colors.m3.secondaryContainer,
    borderColor: colors.m3.secondaryContainer,
    borderRadius: tokens.shapeMorph.chipSelected,
    borderWidth: 0,
  },
  filterChipPressed: {
    borderRadius: tokens.shapeMorph.chipSelected,
    transform: [{ scale: 0.96 }],
  },
  filterChipText: {
    ...tokens.typography.labelLarge,
    color: colors.m3.onSurfaceVariant,
  },
  filterChipTextSelected: {
    color: colors.m3.onSecondaryContainer,
  },
  heroTitle: {
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.soft,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[8],
  },
  infoCardTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.actionDeep,
  },
  listContent: {
    gap: tokens.spacing[12],
    paddingBottom: tokens.spacing[24],
  },
  emptyBox: {
    alignItems: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[12],
  },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    textAlign: "center",
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  bookInfo: {
    flex: 1,
    gap: tokens.spacing[4],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[12],
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[4],
  },
  price: {
    ...tokens.typography.bodyMedium,
    fontWeight: tokens.fontWeight.semiBold,
    color: colors.action,
  },
  body: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  itemTitle: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  badge: {
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[4],
    ...tokens.typography.labelMedium,
    overflow: "hidden",
  },
  pending: {
    backgroundColor: colors.badge.trade.background,
    color: colors.badge.trade.text,
  },
  accepted: {
    backgroundColor: colors.badge.donation.background,
    color: colors.badge.donation.text,
  },
  rejected: {
    backgroundColor: colors.disabledBackground,
    color: colors.secondaryText,
  },
  cancelled: {
    backgroundColor: colors.disabledBackground,
    color: colors.secondaryText,
  },
  primary: requestStyles.primary,
  primaryText: requestStyles.primaryText,
  });
}
