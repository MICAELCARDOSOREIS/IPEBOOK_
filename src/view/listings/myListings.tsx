import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  makeAuthViewModel,
  makeDraftsViewModel,
  makeMyListingsViewModel,
  makeNetworkStatus,
  makeReceivedRequestsViewModel,
  makeShareListingViewModel,
} from "@/di/container";
import type { BookModality } from "@/model/entities/book";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Snackbar } from "@/view/components/Snackbar";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";
import {
  type ListingsFilter,
  MyListingsListingsTab,
} from "@/view/listings/myListingsListingsTab";
import { MyListingsProposalsTab } from "@/view/listings/myListingsProposalsTab";
import { initials, MODALITY_LABEL, REQUEST_VERB, ShelfEmptyState } from "@/view/listings/ShelfEmptyState";
import { ShelfRow } from "@/view/listings/shelfRow";
import { createMyListingsStyles } from "@/view/listings/myListingsStyles";
import { withPress } from "@/view/pressFeedback";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import { scrollBottomPadding, standardVerticalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useIsWideWeb } from "@/view/useIsWideWeb";

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
  const { colors } = useTheme();
  const styles = useMemo(() => createMyListingsStyles(colors), [colors]);
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
  const stats: { key: BookModality; count: number; label: string; icon: AppIconName }[] = [
    { key: "sale", count: countBy("sale"), label: "à venda", icon: "category" },
    { key: "trade", count: countBy("trade"), label: "em troca", icon: "swap" },
    { key: "donation", count: countBy("donation"), label: "para doar", icon: "heart" },
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
  const navBarDockHeight = 80; // Altura real da cápsula da NavigationBar (dock M3 Expressive)
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
      label: `Concluídos (${concludedProposals.length + deliveredBooks.length})`,
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
            {/* Filtros interativos por modalidade (cores canônicas da ADR 0104 / tokens.colors.badge) */}
            <View style={[styles.statsRow, wideWeb && styles.statsRowWide]}>
              {stats.map((stat) => {
                const isSelected = modalityFilter === stat.key;
                const isDimmed = modalityFilter !== "all" && !isSelected;
                const badgeTone = colors.badge[stat.key];
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
                      wideWeb ? styles.statCardWide : styles.statCardMobile,
                      !wideWeb && { backgroundColor: badgeTone.background },
                      isSelected &&
                        (wideWeb
                          ? {
                              borderWidth: 2,
                              borderColor:
                                badgeTone.background === "#F5B718"
                                  ? colors.ipe.bloomDeep
                                  : badgeTone.background,
                              backgroundColor: colors.m3.surfaceContainerLow,
                              ...styles.statCardSelected,
                            }
                          : {
                              borderWidth: 2,
                              borderColor: badgeTone.text,
                              ...styles.statCardSelected,
                            }),
                      isDimmed && styles.statCardDimmed,
                      pressed && styles.statCardPressed,
                    ]}
                  >
                    {wideWeb ? (
                      <>
                        <View style={[styles.statIconBadge, { backgroundColor: badgeTone.background }]}>
                          <AppIcon name={stat.icon} size={18} color={badgeTone.text} />
                        </View>
                        <View style={styles.statTextGroup}>
                          <View style={styles.statContentRow}>
                            <Text style={styles.statCount}>{stat.count}</Text>
                            {isSelected ? (
                              <View style={[styles.statCheckBadge, { backgroundColor: badgeTone.background }]}>
                                <AppIcon name="check" size={12} color={badgeTone.text} />
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.statContentRow}>
                          <Text style={[styles.statCountMobile, { color: badgeTone.text }]}>
                            {stat.count}
                          </Text>
                          {isSelected ? (
                            <View style={[styles.statCheckBadge, { backgroundColor: badgeTone.text }]}>
                              <AppIcon name="check" size={12} color={badgeTone.background} />
                            </View>
                          ) : null}
                        </View>
                        <Text
                          style={[styles.statLabelMobile, { color: badgeTone.text }]}
                          numberOfLines={1}
                        >
                          {stat.label}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* No celular os chips quebram em linhas para caberem inteiros, sem corte nem rolagem. */}
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
                <Text style={[styles.sectionTitle, styles.concludedSectionTitle]}>Concluídos</Text>
                {wideWeb ? (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 3, minWidth: 220 }]}>Livro</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Modalidade</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Histórico</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.2, minWidth: 100 }]}>Situação</Text>
                    <Text style={[styles.tableHeaderText, { width: 148, textAlign: "right" }]}>Ação</Text>
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

            {/* Banner convidativo à circulação posicionado após a tabela para manter os livros em primeiro plano */}
            {wideWeb && onNavigateToCreateListing ? (
              <View style={styles.webExchangeBanner} testID="shelf-exchange-banner">
                <View style={styles.webExchangeBannerIconBox}>
                  <AppIcon name="swap" size={24} color={colors.ipe.onContainer} />
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
                  <AppIcon name="add" size={18} color={colors.m3.onPrimary} />
                  <Text style={styles.webExchangeBannerButtonText}>Anunciar livro</Text>
                </Pressable>
              </View>
            ) : null}
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
  const styles = useMemo(() => createMyListingsStyles(colors), [colors]);
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
