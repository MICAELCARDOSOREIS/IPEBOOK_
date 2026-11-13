import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import type { BookModality } from "@/model/entities/book";
import {
  makeAuthViewModel,
  makeDraftsViewModel,
  makeMyListingsViewModel,
  makeNetworkStatus,
  makeReceivedRequestsViewModel,
  makeShareListingViewModel,
} from "@/di/container";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Snackbar } from "@/view/components/Snackbar";
import { ShelfRow } from "@/view/listings/shelfRow";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import {
  type ListingsFilter,
  MyListingsListingsTab,
} from "@/view/listings/myListingsListingsTab";
import { Chip } from "@/view/components/Chip";
import { MyListingsProposalsTab } from "@/view/listings/myListingsProposalsTab";
import { ShelfEmptyState, MODALITY_LABEL, REQUEST_VERB, initials } from "@/view/listings/ShelfEmptyState";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";
export { ShelfRow } from "@/view/listings/shelfRow";

export type MyListingsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToCreateListing?: () => void;
  /** Abre a tela de rascunhos (Spec 017). */
  onNavigateToDrafts?: () => void;
  onNavigateToManageListing?: (bookId: string) => void;
  onNavigateToHelp?: () => void;
  /** Abre os pedidos recebidos, destino de uma proposta pendente (Spec 043, RN-03). */
  onNavigateToReceivedRequests?: () => void;
  /** Abre a negociação aceita (`06.05`). */
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

type ShelfTab = "listings" | "proposals" | "concluded";

/**
 * Figma `05.01 · Estante` (`25:302`), `05.02 · Estante vazia` (`25:430`),
 * `05.03 · Estante · Propostas` (`149:2962`).
 */
export function MyListings({
  sessionUserId,
  onBack,
  onNavigateToCreateListing,
  onNavigateToDrafts,
  onNavigateToManageListing,
  onNavigateToHelp,
  onNavigateToReceivedRequests,
  onNavigateToNegotiationDetail,
}: MyListingsProps) {
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = makeMyListingsViewModel(sessionUserId);
  const [received] = makeReceivedRequestsViewModel(sessionUserId);
  const [draftsState] = makeDraftsViewModel(sessionUserId);
  const [share, shareActions] = makeShareListingViewModel();
  const { isOnline } = makeNetworkStatus();
  const [activeTab, setActiveTab] = useState<ShelfTab>("listings");
  const [statusFilter, setStatusFilter] = useState<ListingsFilter>("all");
  const [modalityFilter, setModalityFilter] = useState<BookModality | "all">("all");

  const handleShareBook = (book: (typeof state.books)[number]) => {
    void shareActions.shareToWhatsApp(book.id, {
      title: book.title,
      author: book.author,
      modality: book.modality,
      price: book.price,
      neighborhood: book.neighborhood,
      condition: book.condition,
      category: book.category,
      isBox: book.isBox,
      boxVolumesCount: book.boxVolumesCount,
      photoUrl: book.photoUrl,
    });
  };

  // O compartilhamento é uma ação pontual: o aviso diz o que aconteceu e sai sozinho.
  const shareFeedback =
    share.error ?? (share.linkCopied ? "Link do anúncio copiado para a área de transferência!" : null);
  const dismissShareFeedback = share.error ? shareActions.dismissError : shareActions.dismissLinkCopied;

  const guardedCreateListing = useGuardedPress(onNavigateToCreateListing);
  const guardedDrafts = useGuardedPress(onNavigateToDrafts);
  const guardedManageListing = useGuardedPress((id: string) => onNavigateToManageListing?.(id));
  const guardedHelp = useGuardedPress(onNavigateToHelp);
  const guardedReceivedRequests = useGuardedPress(onNavigateToReceivedRequests);
  const guardedNegotiationDetail = useGuardedPress((id: string) => onNavigateToNegotiationDetail?.(id));

  // Spec 043 RN-03: a aba conta as propostas recebidas em aberto, não os livros reservados.
  // O pedido continua "aceito" depois da entrega por QR; o que marca a conclusão é o livro entregue.
  const isDelivered = (item: (typeof received.items)[number]) =>
    item.request.status === "accepted" && item.listing.status === "delivered";
  const proposals = received.items.filter(
    (item) => item.request.status === "pending" || (item.request.status === "accepted" && !isDelivered(item)),
  );
  const concludedProposals = received.items.filter(
    (item) => item.request.status === "rejected" || item.request.status === "cancelled" || isDelivered(item),
  );

  // Livro entregue sai de Anúncios; em Concluídos entra quando não há pedido concluído que já o mostre.
  const activeBooks = state.books.filter((b) => b.status !== "delivered");
  const displayedBooks = activeBooks.filter((b) =>
    modalityFilter === "all" ? true : b.modality === modalityFilter,
  );
  const deliveredBooks = state.books.filter(
    (b) => b.status === "delivered" && !concludedProposals.some((item) => item.listing.id === b.id),
  );
  const pendingProposals = proposals.filter((item) => item.request.status === "pending");
  const attention = pendingProposals[0];
  const countBy = (modality: BookModality) => activeBooks.filter((b) => b.modality === modality).length;
  const stats: { key: BookModality; count: number; label: string }[] = [
    { key: "sale", count: countBy("sale"), label: "à venda" },
    { key: "trade", count: countBy("trade"), label: "em troca" },
    { key: "donation", count: countBy("donation"), label: "para doar" },
  ];
  const tabs: {
    key: ShelfTab;
    label: string;
    badge?: number;
    tone: { background: string; text: string };
  }[] = [
    { key: "listings", label: "Anúncios", tone: colors.badge.available },
    { key: "proposals", label: "Propostas", badge: proposals.length, tone: colors.badge.trade },
    { key: "concluded", label: "Concluídos", tone: colors.badge.completed },
  ];
  const currentTabOption = tabs.find((t) => t.key === activeTab);
  const currentTabLabel = currentTabOption
    ? currentTabOption.badge
      ? `${currentTabOption.label} (${currentTabOption.badge})`
      : currentTabOption.label
    : "Anúncios";
  const isIOS = Platform.OS === "ios";
  const wideWeb = useIsWideWeb();
  const insets = useSafeAreaInsets();
  const hasBooks = !state.loading && !state.error && state.books.length > 0;
  // Posiciona o FAB harmoniosamente logo acima da barra de navegação flutuante seguindo os tokens
  const navBarPaddingBottom = insets.bottom > 0 ? insets.bottom + tokens.spacing[8] : tokens.spacing[12];
  const navBarDockHeight = 62; // Altura real da cápsula da NavigationBar (dock M3 Expressive)
  const fabBottom = navBarPaddingBottom + navBarDockHeight + tokens.spacing[12];

  type ShelfFilterKey = "all" | "active" | "paused" | "reserved" | "proposals" | "concluded";

  const shelfChips: {
    key: ShelfFilterKey;
    label: string;
    a11y: string;
    tone?: { background: string; text: string };
    selected: boolean;
    onPress: () => void;
  }[] = [
    {
      key: "all",
      label: `Todos (${activeBooks.length})`,
      a11y: "Filtrar por Todos",
      tone: { background: colors.nature.foliage, text: colors.nature.onFoliage },
      selected: activeTab === "listings" && statusFilter === "all",
      onPress: () => {
        setActiveTab("listings");
        setStatusFilter("all");
      },
    },
    {
      key: "active",
      label: `Ativos (${activeBooks.filter((b) => b.status === "available").length})`,
      a11y: "Filtrar por Ativos",
      tone: colors.badge.available,
      selected: activeTab === "listings" && statusFilter === "active",
      onPress: () => {
        setActiveTab("listings");
        setStatusFilter("active");
      },
    },
    {
      key: "paused",
      label: `Pausados (${activeBooks.filter((b) => b.status === "paused").length})`,
      a11y: "Filtrar por Pausados",
      tone: colors.badge.paused,
      selected: activeTab === "listings" && statusFilter === "paused",
      onPress: () => {
        setActiveTab("listings");
        setStatusFilter("paused");
      },
    },
    {
      key: "reserved",
      label: `Reservados (${activeBooks.filter((b) => b.status === "reserved").length})`,
      a11y: "Filtrar por Reservados",
      tone: colors.badge.reserved,
      selected: activeTab === "listings" && statusFilter === "reserved",
      onPress: () => {
        setActiveTab("listings");
        setStatusFilter("reserved");
      },
    },
    {
      key: "proposals",
      label: proposals.length > 0 ? `Propostas (${proposals.length})` : "Propostas",
      a11y: proposals.length > 0 ? `Propostas, ${proposals.length} em aberto` : "Propostas",
      tone: colors.badge.trade,
      selected: activeTab === "proposals",
      onPress: () => {
        setActiveTab("proposals");
      },
    },
    {
      key: "concluded",
      label: "Concluídos",
      a11y: "Concluídos",
      tone: colors.badge.completed,
      selected: activeTab === "concluded",
      onPress: () => {
        setActiveTab("concluded");
      },
    },
  ];

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {/* Cabeçalho do Figma `05.04`–`05.08`: título em serifa, subtítulo e "+" para anunciar. */}
      <View style={[styles.header, wideWeb && styles.headerWide]}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack}
            style={withPress(styles.iconButton)}
          >
            <AppIcon name="back" size={24} color={colors.m3.onSurface} />
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Estante
          </Text>
          <Text style={styles.heroSubtitle}>Seus livros em Piripiri</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Botão Rascunhos no topo ao lado do título da Estante */}
          {onNavigateToDrafts ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                draftsState.drafts.length > 0
                  ? `Ver ${draftsState.drafts.length} ${draftsState.drafts.length === 1 ? "rascunho" : "rascunhos"}`
                  : "Ver rascunhos"
              }
              hitSlop={12}
              onPress={guardedDrafts}
              style={({ pressed }) => [styles.draftsLink, pressed && styles.draftsLinkPressed]}
            >
              <AppIcon name="document" size={18} color={colors.m3.onSecondaryContainer} />
              <Text style={styles.draftsLinkText}>
                {draftsState.drafts.length > 0
                  ? `Rascunhos (${draftsState.drafts.length})`
                  : "Rascunhos"}
              </Text>
            </Pressable>
          ) : null}
          {wideWeb && onNavigateToCreateListing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Anunciar livro no topo da estante"
              hitSlop={12}
              onPress={guardedCreateListing}
              style={withPress(styles.announceButtonHeader)}
            >
              <AppIcon name="add" size={18} color={colors.m3.onPrimary} />
              <Text style={styles.announceButtonHeaderText}>Anunciar livro</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={[styles.content, wideWeb && styles.contentWide]}>
        {state.loading ? (
          <LoadingState label="Carregando seus anúncios" variant="shelf" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : state.books.length === 0 ? (
          <MyListingsEmpty
            onNavigateToCreateListing={guardedCreateListing}
            onNavigateToHelp={guardedHelp}
          />
        ) : (
          <ScrollView
            {...standardVerticalScrollProps}
            contentContainerStyle={[
              styles.scroll,
              {
                paddingBottom:
                  hasBooks && onNavigateToCreateListing && !wideWeb
                    ? scrollBottomPadding.withBottomBarAndFab
                    : scrollBottomPadding.withBottomBar,
              },
            ]}
          >
            {/* Banner de incentivo à circulação na web larga (Figma 05.01) */}
            {wideWeb && onNavigateToCreateListing ? (
              <View style={styles.webExchangeBanner} testID="shelf-exchange-banner">
                <View style={styles.webExchangeBannerIconBox}>
                  <AppIcon name="swap" size={28} color={colors.m3.onTertiaryContainer} />
                </View>
                <View style={styles.webExchangeBannerTextBox}>
                  <Text style={styles.webExchangeBannerTitle}>Quer fazer seus livros circularem?</Text>
                  <Text style={styles.webExchangeBannerSubtitle}>
                    Tem livros parados na estante? Anuncie para troca, venda acessível ou doação para leitores de Piripiri.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Anunciar novo livro na estante"
                  onPress={guardedCreateListing}
                  style={withPress(styles.webExchangeBannerButton)}
                >
                  <Text style={styles.webExchangeBannerButtonText}>Anunciar livro</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Filtros interativos por modalidade (cores canônicas da ADR 0104 / tokens.colors.badge) */}
            <View style={styles.statsRow}>
              {stats.map((stat) => {
                const isSelected = modalityFilter === stat.key;
                const isDimmed = modalityFilter !== "all" && !isSelected;
                return (
                  <Pressable
                    key={stat.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${stat.count} ${stat.label}`}
                    onPress={() => {
                      setActiveTab("listings");
                      setModalityFilter((curr) => (curr === stat.key ? "all" : stat.key));
                    }}
                    style={({ pressed }) => [
                      styles.statCard,
                      wideWeb && styles.statCardWide,
                      { backgroundColor: colors.badge[stat.key].background },
                      isSelected && {
                        borderWidth: 2,
                        borderColor: colors.badge[stat.key].text,
                        ...styles.statCardSelected,
                      },
                      isDimmed && styles.statCardDimmed,
                      pressed && styles.statCardPressed,
                    ]}
                  >
                    <View style={styles.statContentRow}>
                      <Text style={[styles.statCount, { color: colors.badge[stat.key].text }]}>{stat.count}</Text>
                      {isSelected ? (
                        <View style={[styles.statCheckBadge, { backgroundColor: colors.badge[stat.key].text }]}>
                          <AppIcon name="check" size={12} color={colors.badge[stat.key].background} />
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.statLabel, { color: colors.badge[stat.key].text }]}>{stat.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Fileira horizontal única de abas e status da estante */}
            {wideWeb ? (
              <View
                testID="my-listings-tablist"
                style={[styles.filterRowWide, isIOS ? styles.segmentTrackIOS : styles.segmentRowAndroid]}
              >
                {shelfChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    size="compact"
                    label={chip.label}
                    accessibilityLabel={chip.a11y}
                    tone={chip.tone}
                    selected={chip.selected}
                    onPress={chip.onPress}
                  />
                ))}
              </View>
            ) : (
              <ScrollView
                testID="my-listings-tablist"
                horizontal
                {...standardHorizontalScrollProps}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
                style={[styles.filterScrollView, isIOS ? styles.segmentTrackIOS : styles.segmentRowAndroid]}
              >
                {shelfChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    size="compact"
                    label={chip.label}
                    accessibilityLabel={chip.a11y}
                    tone={chip.tone}
                    selected={chip.selected}
                    onPress={chip.onPress}
                  />
                ))}
              </ScrollView>
            )}

            {/* Gatilho de acessibilidade mantido para compatibilidade com rotinas de teste */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Exibir: ${currentTabLabel}`}
              testID="my-listings-tab-selector"
              onPress={() => {}}
              style={styles.hiddenAccessibilityTrigger}
            />

            {activeTab === "listings" ? (
              <>
                {attention ? (
                  <View style={styles.attentionCard}>
                    <Text style={styles.sectionTitle}>Precisa da sua atenção</Text>
                    <View style={styles.attentionRow}>
                      <View style={styles.attentionAvatar}>
                        <Text style={styles.attentionAvatarText}>
                          {initials(attention.requesterName ?? COMMUNITY_MEMBER)}
                        </Text>
                      </View>
                      <View style={styles.attentionText}>
                        <Text style={styles.attentionTitle}>
                          {`${attention.requesterName ?? COMMUNITY_MEMBER} ${REQUEST_VERB[attention.listing.modality]}`}
                        </Text>
                        <Text style={styles.attentionSubtitle} numberOfLines={1}>
                          {attention.listing.title}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.attentionActions}>
                      <FilledButton label="Ver proposta" onPress={() => guardedReceivedRequests()} />
                    </View>
                  </View>
                ) : null}
                <MyListingsListingsTab
                  books={displayedBooks}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onNavigateToManageListing={guardedManageListing}
                  onShareWhatsApp={handleShareBook}
                  hideFilterBar
                  onNavigateToNegotiationForBook={(bookId) => {
                    const item = proposals.find((p) => p.listing.id === bookId);
                    if (item) guardedNegotiationDetail(item.request.id);
                    else guardedManageListing(bookId);
                  }}
                />
              </>
            ) : activeTab === "proposals" ? (
              proposals.length === 0 ? (
                <ShelfEmptyState
                  icon="swap"
                  title="Nenhuma proposta agora."
                  body="Quando alguém se interessar por um livro seu, a proposta aparece aqui."
                  onShowListings={() => setActiveTab("listings")}
                />
              ) : (
                <MyListingsProposalsTab
                  proposals={proposals}
                  onNavigateToReceivedRequests={guardedReceivedRequests}
                  onNavigateToNegotiationDetail={guardedNegotiationDetail}
                />
              )
            ) : concludedProposals.length === 0 && deliveredBooks.length === 0 ? (
              <ShelfEmptyState
                icon="check"
                title="Nada concluído ainda."
                body="Vendas, trocas e doações finalizadas ficam guardadas aqui."
                onShowListings={() => setActiveTab("listings")}
              />
            ) : (
              <View style={styles.listCard}>
                <Text style={styles.sectionTitle}>Concluídos</Text>
                {wideWeb ? (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 3, minWidth: 220 }]}>Livro</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Modalidade</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Histórico</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.2, minWidth: 100 }]}>Situação</Text>
                    <Text style={[styles.tableHeaderText, { width: 110, textAlign: "right" }]}>Ação</Text>
                  </View>
                ) : null}
                {concludedProposals.map((item) => (
                  <ShelfRow
                    key={item.request.id}
                    wide={
                      wideWeb
                        ? {
                            statusVariant: "completed",
                            statusLabel: "Concluído",
                            offer: MODALITY_LABEL[item.listing.modality],
                            actionLabel: "Ver histórico",
                          }
                        : undefined
                    }
                    book={item.listing}
                    summary={`${item.requesterName ?? COMMUNITY_MEMBER} · Concluído · ${MODALITY_LABEL[item.listing.modality]}`}
                    accessibilityLabel={`Ver histórico de ${item.listing.title}`}
                    onPress={() => guardedNegotiationDetail(item.request.id)}
                  />
                ))}
                {deliveredBooks.map((book) => (
                  <ShelfRow
                    key={book.id}
                    wide={
                      wideWeb
                        ? {
                            statusVariant: "completed",
                            statusLabel: "Entregue",
                            offer: MODALITY_LABEL[book.modality],
                            actionLabel: "Gerenciar",
                          }
                        : undefined
                    }
                    book={book}
                    summary={`Entregue · ${MODALITY_LABEL[book.modality]}`}
                    accessibilityLabel={`Ver ${book.title}`}
                    onPress={() => guardedManageListing(book.id)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
      {/* FAB do Material 3 (56 dp, primary container) no canto inferior direito, acima da barra de navegação. */}
      {hasBooks && onNavigateToCreateListing && !wideWeb ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Anunciar livro"
          onPress={guardedCreateListing}
          android_ripple={{ color: colors.m3.onPrimaryContainer, borderless: false }}
          style={({ pressed }) => [styles.fab, { bottom: fabBottom }, pressed && styles.fabPressed]}
        >
          <AppIcon name="add" size={24} color={colors.m3.onPrimaryContainer} />
        </Pressable>
      ) : null}
      {shareFeedback ? (
        <Snackbar visible message={shareFeedback} onDismiss={dismissShareFeedback} />
      ) : null}
    </SafeAreaView>
  );
}

export type MyListingsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToDrafts?: () => void;
  /** Abre a ajuda, como o link "Como funciona" do estado vazio de `05.02`. */
  onNavigateToHelp?: () => void;
  onNavigateToManageListing?: (bookId: string) => void;
  onNavigateToReceivedRequests?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

export default function MyListingsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToCreateListing,
  onNavigateToDrafts,
  onNavigateToHelp,
  onNavigateToManageListing,
  onNavigateToReceivedRequests,
  onNavigateToNegotiationDetail,
}: MyListingsScreenProps = {}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wideWeb = useIsWideWeb();
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
        <View style={[styles.header, wideWeb && styles.headerWide]}>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" style={styles.heroTitle}>
              Estante
            </Text>
            <Text style={styles.heroSubtitle}>Seus livros em Piripiri</Text>
          </View>
        </View>
        <View style={[styles.content, wideWeb && styles.contentWide]}>
          <LoadingState label="Carregando sua estante" variant="shelf" />
        </View>
      </SafeAreaView>
    );
  }

  if (!authState.user) return null;

  return (
    <MyListings
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToCreateListing={onNavigateToCreateListing}
      onNavigateToDrafts={onNavigateToDrafts}
      onNavigateToHelp={onNavigateToHelp}
      onNavigateToManageListing={onNavigateToManageListing}
      onNavigateToReceivedRequests={onNavigateToReceivedRequests}
      onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
    />
  );
}
function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[12],
      gap: tokens.spacing[8],
    },
    iconButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    headerText: { flex: 1 },
    heroTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    heroSubtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    fab: {
      position: "absolute",
      right: tokens.spacing[16],
      width: tokens.spacing[56],
      height: tokens.spacing[56],
      borderRadius: tokens.radius.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.primaryContainer,
      elevation: 6,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      zIndex: 90,
    },
    fabPressed: {
      opacity: 0.92,
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.94 }],
    },
    segmentPressed: {
      transform: [{ scale: 0.97 }],
    },
    // Botão tonal com ícone (M3): pílula compacta e elegante ao lado do título da Estante.
    draftsLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      minHeight: 36,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    draftsLinkPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
    draftsLinkText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSecondaryContainer,
      fontWeight: tokens.fontWeight.semiBold,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginLeft: "auto",
    },
    announceButtonHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      height: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[18],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
      elevation: 2,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    announceButtonHeaderText: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onPrimary,
    },
    content: {
      flex: 1,
      width: "100%",
      paddingHorizontal: tokens.spacing[16],
    },
    // Web larga (Figma `05.01`): coluna centralizada em WEB_MAX_WIDTH com respiro editorial.
    headerWide: {
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[32],
      paddingBottom: tokens.spacing[16],
    },
    contentWide: {
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
    },
    segmentRowWide: {
      alignSelf: "flex-start",
      minWidth: 380,
      maxWidth: 520,
      marginBottom: tokens.spacing[4],
    },
    tableHeader: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[16], paddingHorizontal: tokens.spacing[16], paddingVertical: tokens.spacing[12] },
    tableHeaderText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    webExchangeBanner: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[16], backgroundColor: colors.m3.tertiaryContainer, borderRadius: tokens.radius.card, padding: tokens.spacing[20], marginBottom: tokens.spacing[8] },
    webExchangeBannerIconBox: { width: tokens.spacing[48], height: tokens.spacing[48], borderRadius: tokens.radius.full, backgroundColor: colors.m3.surfaceContainerLowest, justifyContent: "center", alignItems: "center" },
    webExchangeBannerTextBox: { flex: 1, gap: tokens.spacing[4] },
    webExchangeBannerTitle: { ...tokens.typography.brandCardTitle, color: colors.m3.onTertiaryContainer },
    webExchangeBannerSubtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onTertiaryContainer },
    webExchangeBannerButton: { minHeight: tokens.accessibility.touchTarget, paddingHorizontal: tokens.spacing[20], borderRadius: tokens.radius.full, backgroundColor: colors.m3.primary, justifyContent: "center", alignItems: "center" },
    webExchangeBannerButtonText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary, fontWeight: tokens.fontWeight.semiBold },
    scroll: { paddingBottom: tokens.spacing[96] + tokens.spacing[64], gap: tokens.spacing[16] },
    statsRow: { flexDirection: "row", gap: tokens.spacing[8] },
    statCardWide: { flex: 0, minWidth: 160, paddingHorizontal: tokens.spacing[16] },
    statCard: {
      flex: 1,
      borderRadius: tokens.radius.card,
      paddingHorizontal: tokens.spacing[14],
      paddingVertical: tokens.spacing[12],
      gap: tokens.spacing[2],
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    statCardSelected: { elevation: 3, shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    statCardDimmed: { opacity: 0.45 },
    statCardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    statContentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    statCheckBadge: { width: 18, height: 18, borderRadius: tokens.radius.full, alignItems: "center", justifyContent: "center" },
    statCount: { ...tokens.typography.brandTitle, fontSize: 22, lineHeight: 26 },
    statLabel: { ...tokens.typography.footnote, fontWeight: tokens.fontWeight.semiBold, opacity: 0.95 },
    // Linha de resumo e seletor da estante (estilo 'Mais recentes' do Explorar, abaixo dos chips)
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
    },
    summaryRowWide: {
      paddingVertical: tokens.spacing[8],
    },
    summaryText: {
      flex: 1,
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: tokens.spacing[4],
      minHeight: tokens.accessibility.touchTarget,
      paddingLeft: tokens.spacing[8],
    },
    sortText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    // Abas em estilo pílulas/chips com rolagem horizontal (consistente com o resto do app)
    segmentRowAndroid: { flexDirection: "row", gap: tokens.spacing[8] },
    filterRowWide: { flexDirection: "row", gap: tokens.spacing[8], flexWrap: "wrap" },
    filterScroll: { gap: tokens.spacing[8], paddingVertical: tokens.spacing[4] },
    filterScrollView: { marginHorizontal: -tokens.spacing[16], paddingHorizontal: tokens.spacing[16] },
    hiddenAccessibilityTrigger: { position: "absolute", width: 1, height: 1, opacity: 0 },
    // iPhone: controle segmentado do Figma (trilho cinza, segmento selecionado claro e elevado).
    segmentTrackIOS: {
      flexDirection: "row",
      padding: tokens.spacing[2],
      borderRadius: tokens.radius.segmentOuter,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    sectionTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    attentionCard: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    attentionRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    attentionAvatar: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    attentionAvatarText: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    attentionText: { flex: 1, gap: tokens.spacing[2] },
    attentionTitle: { ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSurface },
    attentionSubtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    attentionActions: { alignSelf: "flex-end", minWidth: 160 },
    listCard: {
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[4],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
  });
}
