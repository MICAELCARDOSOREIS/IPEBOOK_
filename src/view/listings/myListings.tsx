import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { type ReceivedRequestsState, useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import type { Book, BookModality, BookStatus } from "@/model/entities/book";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";

export type MyListingsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToManageListing?: (bookId: string) => void;
  onNavigateToHelp?: () => void;
  /** Abre os pedidos recebidos, destino de uma proposta pendente (Spec 043, RN-03). */
  onNavigateToReceivedRequests?: () => void;
  /** Abre a negociação aceita (`06.05`). */
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

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

/** Resumo da linha de `05.01`: preço ou modalidade, bairro e situação. */
function listingSummary(book: Book): string {
  const offer = book.modality === "sale" && book.price ? formatPrice(book.price) : MODALITY_LABELS[book.modality];
  return [offer, book.neighborhood, STATUS_LABELS[book.status]].filter(Boolean).join(" · ");
}

/** Resumo da linha de `05.03`: quem propôs, em que pé está e a modalidade. */
function proposalSummary(item: ReceivedRequestsState["items"][number]): string {
  const stage = item.request.status === "accepted" ? "negociação aceita" : "proposta recebida";
  return [item.requesterName ?? COMMUNITY_MEMBER, stage, MODALITY_LABELS[item.listing.modality]].join(" · ");
}

/**
 * Figma `05.01 · Estante` (`25:302` / Web `159:1728`), `05.02 · Estante vazia` (`25:430` /
 * Web `159:1857`), `05.03 · Estante · Propostas` (`149:2962`) e
 * `05.07 · Estante após exclusão` (`403:7319` / Web `403:22271`).
 */
export function MyListings({
  sessionUserId,
  onBack,
  onNavigateToCreateListing,
  onNavigateToManageListing,
  onNavigateToHelp,
  onNavigateToReceivedRequests,
  onNavigateToNegotiationDetail,
}: MyListingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useMyListingsViewModel(sessionUserId);
  const [received] = useReceivedRequestsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<"listings" | "proposals">("listings");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "reserved">("all");

  // Spec 043 RN-03: a aba conta as propostas recebidas em aberto, não os livros reservados.
  const proposals = received.items.filter(
    (item) => item.request.status === "pending" || item.request.status === "accepted",
  );
  const activeCount = state.books.filter((b) => b.status === "available").length;
  const pausedCount = state.books.filter((b) => b.status === "paused").length;
  const reservedCount = state.books.filter((b) => b.status === "reserved").length;

  const filteredBooks = state.books.filter((b) => {
    if (statusFilter === "active") return b.status === "available";
    if (statusFilter === "paused") return b.status === "paused";
    if (statusFilter === "reserved") return b.status === "reserved";
    return true;
  });
  const showFab = state.books.length > 0 && onNavigateToCreateListing;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Minha estante" onBack={() => onBack?.()} />
      <View style={styles.content}>
        {state.loading ? (
          <LoadingState label="Carregando seus anúncios" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : state.books.length === 0 ? (
          <View style={styles.empty}>
            <IconBadge icon="shelf" tone="neutral" size="large" />
            <Text style={styles.emptyHeadline}>Sua estante começa com um livro</Text>
            <Text style={styles.emptyTitle}>
              Anuncie um livro para vender, trocar ou doar na sua região.
            </Text>
            <View style={styles.emptyAction}>
              <FilledButton
                label="Anunciar livro"
                accessibilityLabel="Cadastrar anúncio"
                onPress={() => onNavigateToCreateListing?.()}
              />
            </View>
            {onNavigateToHelp ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Como funciona"
                onPress={onNavigateToHelp}
                style={styles.howItWorksButton}
              >
                <Text style={styles.howItWorksText}>Como funciona</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, showFab ? styles.scrollWithFab : null]}>
            <View testID="my-listings-tablist" accessibilityRole="tablist" style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === "listings" }}
                onPress={() => setActiveTab("listings")}
                style={[styles.tab, activeTab === "listings" && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === "listings" && styles.activeTabText]}>
                  {`Anúncios (${state.books.length})`}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === "proposals" }}
                onPress={() => setActiveTab("proposals")}
                style={[styles.tab, activeTab === "proposals" && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === "proposals" && styles.activeTabText]}>
                  {`Propostas (${proposals.length})`}
                </Text>
              </Pressable>
            </View>
            {activeTab === "listings" ? (
              <>
                <View style={styles.filterRow}>
                  {(
                    [
                      { key: "all", label: `Todos (${state.books.length})`, a11y: "Filtrar por Todos" },
                      { key: "active", label: `Ativos (${activeCount})`, a11y: "Filtrar por Ativos" },
                      { key: "paused", label: `Pausados (${pausedCount})`, a11y: "Filtrar por Pausados" },
                      { key: "reserved", label: `Reservados (${reservedCount})`, a11y: "Filtrar por Reservados" },
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
                {filteredBooks.length === 0 ? (
                  <View style={styles.empty}>
                    <IconBadge icon="shelf" tone="neutral" />
                    <Text style={styles.emptyTitle}>Nenhum anúncio encontrado neste filtro.</Text>
                    <View style={styles.emptyAction}>
                      <FilledButton label="Ver todos os anúncios" onPress={() => setStatusFilter("all")} />
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
            ) : (
              <>
                {proposals.length === 0 ? (
                  <Text style={styles.proposalsEmpty}>
                    Nenhuma proposta em aberto. Quando alguém se interessar por um livro seu, ela aparece aqui.
                  </Text>
                ) : (
                  proposals.map((item) => (
                    <ShelfRow
                      key={item.request.id}
                      book={item.listing}
                      summary={proposalSummary(item)}
                      accessibilityLabel={`Abrir proposta para ${item.listing.title}`}
                      onPress={() =>
                        item.request.status === "accepted"
                          ? onNavigateToNegotiationDetail?.(item.request.id)
                          : onNavigateToReceivedRequests?.()
                      }
                    />
                  ))
                )}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Tudo pela conversa</Text>
                  <Text style={styles.orientationHint}>
                    Confira a proposta e combine os detalhes antes de reservar seu livro.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
      {showFab ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Anunciar livro"
          onPress={onNavigateToCreateListing}
          style={styles.fab}
        >
          <AppIcon name="add" size={20} color={colors.m3.onSecondaryContainer} />
          <Text style={styles.fabText}>Anunciar livro</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

type ShelfRowProps = {
  book: Book;
  summary: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** Linha da estante: capa, título, resumo e seta de avanço, como em `05.01` e `05.03`. */
function ShelfRow({ book, summary, accessibilityLabel, onPress }: ShelfRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.row}>
      <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{book.title}</Text>
        <Text style={styles.rowSummary}>{summary}</Text>
      </View>
      <AppIcon name="chevronRight" size={24} color={colors.secondaryText} />
    </Pressable>
  );
}

export type MyListingsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToCreateListing?: () => void;
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
  onNavigateToHelp,
  onNavigateToManageListing,
  onNavigateToReceivedRequests,
  onNavigateToNegotiationDetail,
}: MyListingsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <MyListings
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToCreateListing={onNavigateToCreateListing}
      onNavigateToHelp={onNavigateToHelp}
      onNavigateToManageListing={onNavigateToManageListing}
      onNavigateToReceivedRequests={onNavigateToReceivedRequests}
      onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
    />
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.m3.outlineVariant,
    marginBottom: tokens.spacing[16],
  },
  tab: {
    flex: 1,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: colors.action },
  tabText: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  activeTabText: { color: colors.action, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: tokens.spacing[16],
    bottom: tokens.spacing[24],
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
    minHeight: tokens.accessibility.touchTarget,
    paddingHorizontal: tokens.spacing[20],
    borderRadius: tokens.radius.large,
    backgroundColor: colors.m3.secondaryContainer,
  },
  fabText: {
    ...tokens.typography.labelMedium,
    color: colors.m3.onSecondaryContainer,
  },
  page: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: tokens.spacing[16] },
  orientationHint: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    marginTop: tokens.spacing[8],
  },
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
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    textAlign: "center",
  },
  emptyTitle: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  howItWorksButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    marginTop: tokens.spacing[8],
  },
  howItWorksText: {
    ...tokens.typography.labelMedium,
    color: colors.action,
    fontWeight: "600",
  },
  emptyAction: { marginTop: tokens.spacing[16], width: "100%" },
  scroll: { paddingBottom: tokens.spacing[24] },
  /** Espaço para o botão flutuante não cobrir a dica nem a última linha (Spec 043, RN-05). */
  scrollWithFab: { paddingBottom: tokens.spacing[64] + tokens.spacing[32] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[16],
    minHeight: tokens.accessibility.touchTarget,
    paddingVertical: tokens.spacing[12],
  },
  rowText: { flex: 1, gap: tokens.spacing[4] },
  rowTitle: {
    ...tokens.typography.titleMedium,
    color: colors.text,
  },
  rowSummary: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  proposalsEmpty: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    paddingVertical: tokens.spacing[16],
  },
  infoCard: {
    marginTop: tokens.spacing[16],
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
    borderRadius: tokens.radius.medium,
    backgroundColor: colors.m3.surfaceContainer,
  },
  infoCardTitle: {
    ...tokens.typography.bodyLarge,
    fontWeight: "600",
    color: colors.text,
  },
  });
}
