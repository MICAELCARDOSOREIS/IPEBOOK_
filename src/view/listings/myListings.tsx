import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookModality } from "@/model/entities/book";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
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
    (item) => item.request.status === "rejected" || (item.request.status as string) === "completed",
  );

  const pendingProposals = proposals.filter((item) => item.request.status === "pending");
  const attention = pendingProposals[0];
  const countBy = (modality: BookModality) => state.books.filter((b) => b.modality === modality).length;
  const stats: { key: BookModality; count: number; label: string }[] = [
    { key: "sale", count: countBy("sale"), label: "à venda" },
    { key: "trade", count: countBy("trade"), label: "em troca" },
    { key: "donation", count: countBy("donation"), label: "para doar" },
  ];
  const tabs: { key: ShelfTab; label: string; badge?: number }[] = [
    { key: "listings", label: "Anúncios" },
    { key: "proposals", label: "Propostas", badge: proposals.length },
    { key: "concluded", label: "Concluídos" },
  ];
  const isIOS = Platform.OS === "ios";
  const hasBooks = !state.loading && !state.error && state.books.length > 0;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {/* Cabeçalho do Figma `05.04`–`05.08`: título em serifa, subtítulo e "+" para anunciar. */}
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack}
            style={styles.iconButton}
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
        {onNavigateToDrafts ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver rascunhos"
            hitSlop={12}
            onPress={onNavigateToDrafts}
            style={styles.draftsLink}
          >
            <Text style={styles.draftsLinkText}>Rascunhos</Text>
          </Pressable>
        ) : null}
        {hasBooks && onNavigateToCreateListing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Anunciar livro"
            onPress={onNavigateToCreateListing}
            style={styles.addButton}
          >
            <AppIcon name="add" size={24} color={colors.m3.onSecondaryContainer} />
          </Pressable>
        ) : null}
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
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Resumo por modalidade */}
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View
                  key={stat.key}
                  accessible
                  accessibilityLabel={`${stat.count} ${stat.label}`}
                  style={[styles.statCard, { backgroundColor: colors.badge[stat.key].background }]}
                >
                  <Text style={[styles.statCount, { color: colors.badge[stat.key].text }]}>{stat.count}</Text>
                  <Text style={[styles.statLabel, { color: colors.badge[stat.key].text }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Abas: segmented buttons M3 no Android; controle segmentado do Figma no iPhone. */}
            <View
              testID="my-listings-tablist"
              accessibilityRole="tablist"
              style={isIOS ? styles.segmentTrackIOS : styles.segmentRowAndroid}
            >
              {tabs.map((tab, index) => {
                const selected = activeTab === tab.key;
                const a11yLabel = tab.badge ? `${tab.label}, ${tab.badge} em aberto` : tab.label;
                return (
                  <Pressable
                    key={tab.key}
                    accessibilityRole="tab"
                    accessibilityLabel={a11yLabel}
                    accessibilityState={{ selected }}
                    onPress={() => setActiveTab(tab.key)}
                    style={[
                      isIOS ? styles.segmentIOS : styles.segmentAndroid,
                      !isIOS && index > 0 ? styles.segmentAndroidJoined : null,
                      !isIOS && index === 0 ? styles.segmentAndroidFirst : null,
                      !isIOS && index === tabs.length - 1 ? styles.segmentAndroidLast : null,
                      selected ? (isIOS ? styles.segmentIOSSelected : styles.segmentAndroidSelected) : null,
                    ]}
                  >
                    {!isIOS && selected ? (
                      <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={[styles.segmentText, selected ? styles.segmentTextSelected : null]}
                    >
                      {tab.label}
                    </Text>
                    {tab.badge ? (
                      <View style={styles.segmentBadge}>
                        <Text style={styles.segmentBadgeText}>{tab.badge}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

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
                      <FilledButton label="Ver proposta" onPress={() => onNavigateToReceivedRequests?.()} />
                    </View>
                  </View>
                ) : null}
                <MyListingsListingsTab
                  books={state.books}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onNavigateToManageListing={onNavigateToManageListing}
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
                  onNavigateToReceivedRequests={onNavigateToReceivedRequests}
                  onNavigateToNegotiationDetail={onNavigateToNegotiationDetail}
                />
              )
            ) : concludedProposals.length === 0 ? (
              <ShelfEmptyState
                icon="check"
                title="Nada concluído ainda."
                body="Vendas, trocas e doações finalizadas ficam guardadas aqui."
                onShowListings={() => setActiveTab("listings")}
              />
            ) : (
              <View style={styles.listCard}>
                <Text style={styles.sectionTitle}>Concluídos</Text>
                {concludedProposals.map((item) => (
                  <ShelfRow
                    key={item.request.id}
                    book={item.listing}
                    summary={`${item.requesterName ?? COMMUNITY_MEMBER} · Concluído · ${MODALITY_LABEL[item.listing.modality]}`}
                    accessibilityLabel={`Ver histórico de ${item.listing.title}`}
                    onPress={() => onNavigateToNegotiationDetail?.(item.request.id)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}


const MODALITY_LABEL: Record<BookModality, string> = { sale: "Venda", trade: "Troca", donation: "Doação" };

const REQUEST_VERB: Record<BookModality, string> = {
  sale: "quer comprar",
  trade: "quer trocar",
  donation: "quer receber",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Estado vazio das abas (Figma `05.05` e `05.06`): ícone em círculo, manchete em serifa e volta aos anúncios. */
function ShelfEmptyState({
  icon,
  title,
  body,
  onShowListings,
}: {
  icon: AppIconName;
  title: string;
  body: string;
  onShowListings: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <AppIcon name={icon} size={32} color={colors.m3.onSecondaryContainer} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <View style={styles.emptyAction}>
        <FilledButton label="Ver meus anúncios" onPress={onShowListings} />
      </View>
    </View>
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
      paddingHorizontal: tokens.spacing[20],
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
      fontFamily: fontFamily.brand,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700",
      color: colors.m3.onSurface,
    },
    heroSubtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    addButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    draftsLink: {
      marginLeft: "auto",
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[8],
    },
    draftsLinkText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[20],
    },
    scroll: { paddingBottom: tokens.spacing[32], gap: tokens.spacing[16] },
    statsRow: { flexDirection: "row", gap: tokens.spacing[8] },
    statCard: {
      flex: 1,
      borderRadius: 16,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
      gap: 2,
    },
    statCount: { fontFamily: fontFamily.brand, fontSize: 24, lineHeight: 30, fontWeight: "700" },
    statLabel: { fontSize: 13, lineHeight: 18 },
    // Android: segmented buttons M3 (40 dp, contorno, seleção em secondaryContainer com ✓).
    segmentRowAndroid: { flexDirection: "row" },
    segmentAndroid: {
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      borderWidth: 1,
      borderColor: colors.m3.outline,
    },
    segmentAndroidJoined: { marginLeft: -1 },
    segmentAndroidFirst: { borderTopLeftRadius: tokens.radius.full, borderBottomLeftRadius: tokens.radius.full },
    segmentAndroidLast: { borderTopRightRadius: tokens.radius.full, borderBottomRightRadius: tokens.radius.full },
    segmentAndroidSelected: { backgroundColor: colors.m3.secondaryContainer },
    // iPhone: controle segmentado do Figma (trilho cinza, segmento selecionado claro e elevado).
    segmentTrackIOS: {
      flexDirection: "row",
      padding: 2,
      borderRadius: 9,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    segmentIOS: {
      flex: 1,
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[4],
      borderRadius: 7,
    },
    segmentIOSSelected: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    segmentText: { ...tokens.typography.labelMedium, color: colors.m3.onSurface },
    segmentTextSelected: { fontWeight: "600", color: colors.m3.onSecondaryContainer },
    segmentBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    segmentBadgeText: { fontSize: 11, lineHeight: 14, fontWeight: "700", color: colors.m3.onPrimary },
    sectionTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    attentionCard: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: 16,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    attentionRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    attentionAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    attentionAvatarText: { ...tokens.typography.labelMedium, fontWeight: "600", color: colors.m3.onSecondaryContainer },
    attentionText: { flex: 1, gap: 2 },
    attentionTitle: { ...tokens.typography.bodyLarge, fontWeight: "600", color: colors.m3.onSurface },
    attentionSubtitle: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    attentionActions: { alignSelf: "flex-end", minWidth: 160 },
    listCard: {
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[4],
      borderRadius: 16,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    emptyState: {
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[40],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "700",
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 320 },
    emptyAction: { marginTop: tokens.spacing[16], alignSelf: "stretch" },
  });
}
