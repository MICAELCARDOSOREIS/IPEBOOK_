import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { ShelfRow } from "@/view/listings/shelfRow";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import {
  type ListingsFilter,
  MyListingsListingsTab,
} from "@/view/listings/myListingsListingsTab";
import { MyListingsProposalsTab } from "@/view/listings/myListingsProposalsTab";

export { ShelfRow } from "@/view/listings/shelfRow";

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

type ShelfTab = "listings" | "proposals" | "concluded";

/**
 * Figma `05.01 · Estante` (`25:302`), `05.02 · Estante vazia` (`25:430`),
 * `05.03 · Estante · Propostas` (`149:2962`).
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
  const [activeTab, setActiveTab] = useState<ShelfTab>("listings");
  const [statusFilter, setStatusFilter] = useState<ListingsFilter>("all");

  // Spec 043 RN-03: a aba conta as propostas recebidas em aberto, não os livros reservados.
  const proposals = received.items.filter(
    (item) => item.request.status === "pending" || item.request.status === "accepted",
  );
  const concludedProposals = received.items.filter(
    (item) => item.request.status === "completed",
  );

  const showFab = state.books.length > 0 && onNavigateToCreateListing;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack}
            style={styles.backButton}
          >
            <AppIcon name="back" size={24} color={colors.text} />
          </Pressable>
        ) : null}
        <Text accessibilityRole="header" style={styles.heroTitle}>
          Minha estante
        </Text>
      </View>

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
          <MyListingsEmpty
            onNavigateToCreateListing={onNavigateToCreateListing}
            onNavigateToHelp={onNavigateToHelp}
          />
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, showFab ? styles.scrollWithFab : null]}
            showsVerticalScrollIndicator={false}
          >
            {/* Abas Material 3 com indicador ativo e divisória (Figma 05.01 nó 25:392) */}
            <View testID="my-listings-tablist" accessibilityRole="tablist" style={styles.tabsContainer}>
              <View style={styles.tabsRow}>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "listings" }}
                  onPress={() => setActiveTab("listings")}
                  style={styles.tab}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "listings" ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    {`Anúncios (${state.books.length})`}
                  </Text>
                  {activeTab === "listings" && <View style={styles.activeIndicator} />}
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "proposals" }}
                  onPress={() => setActiveTab("proposals")}
                  style={styles.tab}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "proposals" ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    {`Propostas (${proposals.length})`}
                  </Text>
                  {activeTab === "proposals" && <View style={styles.activeIndicator} />}
                </Pressable>

                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "concluded" }}
                  onPress={() => setActiveTab("concluded")}
                  style={styles.tab}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "concluded" ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    Concluídos
                  </Text>
                  {activeTab === "concluded" && <View style={styles.activeIndicator} />}
                </Pressable>
              </View>
              <View style={styles.tabsDivider} />
            </View>

            {activeTab === "listings" ? (
              <MyListingsListingsTab
                books={state.books}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onNavigateToManageListing={onNavigateToManageListing}
              />
            ) : activeTab === "proposals" ? (
              <MyListingsProposalsTab
                proposals={proposals}
                onNavigateToReceivedRequests={onNavigateToReceivedRequests}
                onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
              />
            ) : (
              <View style={styles.concludedTab}>
                {concludedProposals.length === 0 ? (
                  <View style={styles.concludedEmpty}>
                    <View style={styles.concludedIconCircle}>
                      <AppIcon name="shelf" size={36} color={colors.m3.onSecondaryContainer} />
                    </View>
                    <Text style={styles.concludedEmptyTitle}>Nenhum anúncio concluído ainda</Text>
                    <Text style={styles.concludedEmptySubtitle}>
                      Quando uma troca, venda ou doação for finalizada, o histórico do livro aparecerá aqui.
                    </Text>
                  </View>
                ) : (
                  concludedProposals.map((item) => (
                    <ShelfRow
                      key={item.request.id}
                      book={item.listing}
                      summary={`${item.requesterName ?? COMMUNITY_MEMBER} · Concluído · ${item.listing.modality === "sale" ? "Venda" : item.listing.modality === "trade" ? "Troca" : "Doação"}`}
                      accessibilityLabel={`Ver histórico de ${item.listing.title}`}
                      onPress={() => onNavigateToNegotiationDetail?.(item.request.id)}
                    />
                  ))
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Extended FAB Material 3 (Figma 05.01 nó 25:425) */}
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
    page: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[8],
      gap: tokens.spacing[8],
    },
    backButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    heroTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.brandBrown,
    },
    content: {
      flex: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[20],
    },
    tabsContainer: {
      marginBottom: tokens.spacing[16],
    },
    tabsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tab: {
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: tokens.spacing[12],
      position: "relative",
    },
    tabText: {
      ...tokens.typography.labelLarge,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: "600",
    },
    inactiveTabText: {
      color: colors.m3.onSurfaceVariant,
      fontWeight: "400",
    },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      left: tokens.spacing[12],
      right: tokens.spacing[12],
      height: 3,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    tabsDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      width: "100%",
    },
    scroll: {
      paddingBottom: tokens.spacing[24],
    },
    scrollWithFab: {
      paddingBottom: tokens.spacing[64] + tokens.spacing[32],
    },
    fab: {
      position: "absolute",
      right: tokens.spacing[20],
      bottom: tokens.spacing[24],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      minHeight: 48,
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.secondaryContainer,
      ...tokens.elevation.level3,
    },
    fabText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSecondaryContainer,
      fontWeight: "600",
    },
    concludedTab: {
      paddingVertical: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    concludedEmpty: {
      paddingTop: tokens.spacing[40],
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    concludedIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.m3.secondaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: tokens.spacing[8],
    },
    concludedEmptyTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      textAlign: "center",
    },
    concludedEmptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 320,
    },
  });
}
