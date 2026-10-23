import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { ShelfRow } from "@/view/listings/shelfRow";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";
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
  const [statusFilter, setStatusFilter] = useState<ListingsFilter>("all");

  // Spec 043 RN-03: a aba conta as propostas recebidas em aberto, não os livros reservados.
  const proposals = received.items.filter(
    (item) => item.request.status === "pending" || item.request.status === "accepted",
  );

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
          <MyListingsEmpty
            onNavigateToCreateListing={onNavigateToCreateListing}
            onNavigateToHelp={onNavigateToHelp}
          />
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
              <MyListingsListingsTab
                books={state.books}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onNavigateToManageListing={onNavigateToManageListing}
              />
            ) : (
              <MyListingsProposalsTab
                proposals={proposals}
                onNavigateToReceivedRequests={onNavigateToReceivedRequests}
                onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
              />
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
    scroll: { paddingBottom: tokens.spacing[24] },
    /** Espaço para o botão flutuante não cobrir a dica nem a última linha (Spec 043, RN-05). */
    scrollWithFab: { paddingBottom: tokens.spacing[64] + tokens.spacing[32] },
  });
}
