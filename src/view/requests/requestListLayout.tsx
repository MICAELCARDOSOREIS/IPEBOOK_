import { type ReactNode, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RequestStatus } from "@/model/entities/bookRequest";
import type { RequestWithListing } from "@/viewmodel/useSentRequestsViewModel";
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

export const statusLabel: Record<RequestStatus, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Recusado",
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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "history">("all");

  const pendingCount = items.filter((item) => item.request.status === "pending").length;
  const acceptedCount = items.filter((item) => item.request.status === "accepted").length;
  const historyCount = items.filter((item) => item.request.status === "rejected").length;

  const filteredItems = items.filter((item) => {
    if (statusFilter === "pending") return item.request.status === "pending";
    if (statusFilter === "accepted") return item.request.status === "accepted";
    if (statusFilter === "history") return item.request.status === "rejected";
    return true;
  });
  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title={title} onBack={() => onBack?.()} />
      <View style={styles.content}>
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
                    style={[styles.filterChip, selected && styles.filterChipSelected]}
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
              data={filteredItems}
              keyExtractor={(item) => item.request.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                items.length > 0 ? (
                  <View style={styles.emptyBox}>
                    <IconBadge icon="swap" tone="neutral" />
                    <Text style={styles.body}>Nenhum pedido encontrado neste filtro.</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Ver todos os pedidos"
                      onPress={() => setStatusFilter("all")}
                      style={styles.filterChip}
                    >
                      <Text style={styles.link}>Ver todos os pedidos</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <IconBadge icon="swap" tone="neutral" />
                    <Text accessibilityRole="header" style={styles.emptyTitle}>
                      Nenhuma proposta ainda
                    </Text>
                    <Text style={[styles.body, { textAlign: "center" }]}>{emptyText}</Text>
                  </View>
                )
              }
              renderItem={({ item }) => (
                <View style={styles.item}>
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
            {items.length > 0 ? (
              <View style={styles.infoCard}>
                <IconBadge icon="chat" tone="action" />
                <View style={styles.bookInfo}>
                  <Text style={styles.infoCardTitle}>Tudo pela conversa</Text>
                  <Text style={styles.body}>
                    Confira a proposta e combine os detalhes antes de reservar seu livro.
                  </Text>
                </View>
              </View>
            ) : null}
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
    fontWeight: "600",
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
    fontWeight: "600",
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
  back: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  link: {
    color: colors.action,
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
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
  heroTitle: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
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
    fontWeight: "600",
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
  primary: requestStyles.primary,
  primaryText: requestStyles.primaryText,
  });
}
