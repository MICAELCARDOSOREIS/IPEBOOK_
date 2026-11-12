import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RequestStatus } from "@/model/entities/bookRequest";
import type { RequestWithListing } from "@/viewmodel/useSentRequestsViewModel";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { makeNetworkStatus } from "@/di/container";
import { BookCover } from "@/view/components/BookCover";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Snackbar } from "@/view/components/Snackbar";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { scrollBottomPadding, standardHorizontalScrollProps, standardVerticalScrollProps } from "@/view/scrollProps";
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
  showHeroDescription?: boolean;
  /** Mostra um atalho com a contagem de propostas que aguardam resposta. */
  showPendingSummary?: boolean;
  /** Mensagem de retorno após responder a um pedido. */
  feedbackMessage?: string | null;
  onDismissFeedback?: () => void;
  renderExtra: (item: RequestWithListing) => ReactNode;
};

type StatusFilter = "all" | "pending" | "accepted" | "completed" | "history";

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
  showHeroDescription = true,
  showPendingSummary = false,
  feedbackMessage,
  onDismissFeedback,
  renderExtra,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isOnline } = makeNetworkStatus();
  // Web larga: coluna mais larga e dois pedidos por linha, em vez de uma faixa estreita no meio.
  const wide = useIsWideWeb();
  const listColumns = useWebColumns(2, 3);
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter | null>(null);

  const pendingCount = items.filter((item) => item.request.status === "pending").length;
  const previousPendingCount = useRef(pendingCount);
  useEffect(() => {
    const hadPendingRequests = previousPendingCount.current > 0;
    previousPendingCount.current = pendingCount;
    if (showPendingSummary && hadPendingRequests && pendingCount === 0) {
      setSelectedFilter((current) => current === "pending" ? "all" : current);
    }
  }, [pendingCount, showPendingSummary]);
  const statusFilter = selectedFilter ?? "all";
  const isCompleted = (item: RequestWithListing) => item.request.status === "accepted" && item.listing.status === "delivered";
  const completedCount = items.filter(isCompleted).length;
  const acceptedCount = items.filter((item) => item.request.status === "accepted" && !isCompleted(item)).length;
  const isHistory = (status: RequestStatus) => status === "rejected" || status === "cancelled";
  const historyCount = items.filter((item) => isHistory(item.request.status)).length;

  const filteredItems = items.filter((item) => {
    if (statusFilter === "pending") return item.request.status === "pending";
    if (statusFilter === "accepted") return item.request.status === "accepted" && !isCompleted(item);
    if (statusFilter === "completed") return isCompleted(item);
    if (statusFilter === "history") return isHistory(item.request.status);
    return true;
  });

  const fallbackBack = useCallback(() => {}, []);
  const guardedBack = useGuardedPress(onBack ?? fallbackBack);

  return (
    <SafeAreaView style={styles.page}>
      {wide ? null : <TopAppBar title={title} onBack={guardedBack} />}
      <View style={[styles.content, wide && styles.contentWide]}>
        {wide ? (
          <Breadcrumb
            items={[
              { label: "Estante", onPress: guardedBack, accessibilityLabel: "Voltar para a Estante" },
              { label: title, isCurrent: true },
            ]}
            style={styles.breadcrumb}
          />
        ) : null}
        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>Sua estante em movimento.</Text>
          {showHeroDescription ? (
            <Text style={styles.body}>Acompanhe as propostas dos seus livros.</Text>
          ) : null}
          {showPendingSummary && pendingCount > 0 && statusFilter !== "pending" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver ${pendingCount} ${pendingCount === 1 ? "pedido pendente" : "pedidos pendentes"}`}
              accessibilityHint="Mostra apenas os pedidos que aguardam sua resposta."
              onPress={() => setSelectedFilter("pending")}
              style={withPress(styles.pendingSummary)}
            >
              <IconBadge icon="mail" tone="action" />
              <View style={styles.pendingSummaryContent}>
                <Text style={styles.pendingSummaryTitle}>
                  {pendingCount} {pendingCount === 1 ? "pedido pendente" : "pedidos pendentes"}
                </Text>
                <Text style={styles.pendingSummaryBody}>
                  Toque para ver os pedidos pendentes.
                </Text>
              </View>
              <AppIcon name="chevronRight" size={20} color={colors.action} />
            </Pressable>
          ) : null}
          {items.length > 0 ? (
            <ScrollView
              horizontal
              {...standardHorizontalScrollProps}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScrollView}
            >
              {(
                [
                  { key: "all", label: `Todos (${items.length})`, a11y: "Filtrar pedidos por Todos" },
                  { key: "pending", label: `Pendentes (${pendingCount})`, a11y: "Filtrar pedidos por Pendentes" },
                  { key: "accepted", label: `Aceitos (${acceptedCount})`, a11y: "Filtrar pedidos por Aceitos" },
                  { key: "completed", label: `Finalizados (${completedCount})`, a11y: "Filtrar pedidos por Finalizados" },
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
                    onPress={() => setSelectedFilter(chip.key)}
                    style={withPress([
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                    ])}
                  >
                    {selected ? <AppIcon name="check" size={16} color={colors.nature.onFoliage} /> : null}
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
          <FlatList
            {...standardVerticalScrollProps}
            style={styles.flexOne}
            key={wide ? `colunas-${listColumns}` : "uma-coluna"}
            numColumns={wide ? listColumns : 1}
              columnWrapperStyle={wide ? styles.columns : undefined}
              data={filteredItems}
              keyExtractor={(item) => item.request.id}
              contentContainerStyle={[styles.listContent, { paddingBottom: scrollBottomPadding.withBottomBar }]}
              keyboardShouldPersistTaps="handled"
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
                      onPress={() => setSelectedFilter("all")}
                      style={withPress(styles.filterChip)}
                    >
                      <Text style={styles.link}>Ver todos os pedidos</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={[styles.emptyBox, wide && styles.emptyBoxWide]}>
                    <IconBadge icon="swap" tone="neutral" size="large" />
                    <Text accessibilityRole="header" style={styles.emptyTitle}>
                      Nenhuma proposta ainda
                    </Text>
                    <Text style={[styles.body, { textAlign: "center" }]}>{emptyText}</Text>
                  </View>
                )
              }
              renderItem={({ item }) => {
                const completed = isCompleted(item);
                return (
                <View style={[styles.item, wide && styles.itemWide]}>
                  <View style={styles.bookRow}>
                    <BookCover
                      id={item.listing.id}
                      title={item.listing.title}
                      photoUrl={item.listing.photoUrl}
                      variant={wide ? "card" : "list"}
                    />
                    <View style={styles.bookInfo}>
                      <View style={styles.row}>
                        <Text style={styles.itemTitle}>{item.listing.title}</Text>
                        <Text style={[styles.badge, completed ? styles.completed : styles[item.request.status]]}>
                          {completed ? "Finalizado" : statusLabel[item.request.status]}
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
                );
              }}
            />
        )}
      </View>
      {onDismissFeedback ? (
        <View pointerEvents="box-none" style={styles.snackbarContainer}>
          <Snackbar
            visible={feedbackMessage != null}
            message={feedbackMessage ?? ""}
            onDismiss={onDismissFeedback}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function createRequestStyles(colors: ColorPalette) {
  return StyleSheet.create({
    actions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[8],
    },
    primary: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
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
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outline,
    },
    secondaryText: {
      color: colors.action,
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
    },
    chatButton: {
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    chatButtonText: {
      color: colors.m3.onSecondaryContainer,
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
    },
    requesterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: tokens.radius.medium,
    },
    requesterInfo: {
      flex: 1,
      gap: 2,
    },
    receivedDetails: { gap: tokens.spacing[8] },
    proposalMessage: {
      padding: tokens.spacing[12],
      gap: tokens.spacing[6],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    proposalMessageHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    proposalMessageLabel: {
      ...tokens.typography.labelLarge,
      color: colors.actionDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    proposalMessageText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
    },
    offeredBookCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    offeredBookInfo: { flex: 1, gap: tokens.spacing[2] },
    offeredBookLabel: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    offeredBookTitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.semiBold,
    },
    offeredBookAuthor: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    pendingActions: {
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[4],
    },
    pendingSecondaryActions: {
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    fullWidthAction: {
      width: "100%",
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    flexAction: { flex: 1 },
    meta: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.medium,
      color: colors.m3.onSurface,
    },
    hintBox: {
      backgroundColor: colors.nature.sprout,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[12],
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[6],
      borderWidth: 1,
      borderColor: colors.nature.foliage,
    },
    hintText: {
      ...tokens.typography.labelMedium,
      color: colors.nature.foliageDeep,
    },
    error: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
      marginTop: tokens.spacing[4],
    },
  });
}

function createStyles(colors: ColorPalette) {
  const requestStyles = createRequestStyles(colors);
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, minHeight: 0 },
  flexOne: { flex: 1, minHeight: 0 },
  snackbarContainer: {
    position: "absolute",
    left: tokens.spacing[16],
    right: tokens.spacing[16],
    bottom: tokens.spacing[16],
    zIndex: 20,
    elevation: 20,
  },
  content: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    padding: tokens.spacing[24],
    paddingTop: tokens.spacing[16],
  },
  contentWide: {
    maxWidth: WIDE_CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: WEB_GUTTER,
    minHeight: 0,
  },
  columns: { gap: tokens.spacing[16] },
  itemWide: { flex: 1, padding: tokens.spacing[20] },
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
  breadcrumb: {
    marginBottom: tokens.spacing[8],
  },
  heroBox: {
    marginBottom: tokens.spacing[8],
    gap: tokens.spacing[4],
  },
  filterScrollView: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[4],
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
    paddingVertical: tokens.spacing[4],
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[6],
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[8],
    borderRadius: tokens.shapeMorph.chipUnselected,
    backgroundColor: colors.m3.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
  },
  filterChipSelected: {
    backgroundColor: colors.nature.foliage,
    borderColor: colors.nature.foliage,
    borderRadius: tokens.shapeMorph.chipSelected,
    borderWidth: 0,
    paddingLeft: tokens.spacing[10],
  },
  filterChipPressed: {
    borderRadius: tokens.shapeMorph.chipSelected,
    transform: [{ scale: 0.96 }],
  },
  filterChipText: {
    ...tokens.typography.labelLarge,
    color: colors.m3.onSurfaceVariant,
    fontWeight: tokens.fontWeight.medium,
  },
  filterChipTextSelected: {
    color: colors.nature.onFoliage,
    fontWeight: tokens.fontWeight.semiBold,
  },
  heroTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[8],
  },
    pendingSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    marginTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[8],
    borderRadius: tokens.radius.medium,
      borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    backgroundColor: colors.m3.surfaceContainerHigh,
    },
  pendingSummaryContent: { flex: 1, gap: tokens.spacing[2] },
    pendingSummaryTitle: {
      ...tokens.typography.labelLarge,
    color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.semiBold,
    },
    pendingSummaryBody: {
    ...tokens.typography.labelMedium,
      color: colors.secondaryText,
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
  emptyBoxWide: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[40],
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    marginTop: tokens.spacing[24],
    elevation: 1,
    shadowColor: colors.m3.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.card,
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
  completed: {
    backgroundColor: colors.badge.completed.background,
    color: colors.badge.completed.text,
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
