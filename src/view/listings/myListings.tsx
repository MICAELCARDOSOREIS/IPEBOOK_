import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import type { BookModality } from "@/model/entities/book";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, type ColorPalette } from "@/view/tokens";
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
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useMyListingsViewModel(sessionUserId);
  const [received] = useReceivedRequestsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<ShelfTab>("listings");
  const [statusFilter, setStatusFilter] = useState<ListingsFilter>("all");

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
  const tabs: { key: ShelfTab; label: string; badge?: number }[] = [
    { key: "listings", label: "Anúncios" },
    { key: "proposals", label: "Propostas", badge: proposals.length },
    { key: "concluded", label: "Concluídos" },
  ];
  const isIOS = Platform.OS === "ios";
  const wideWeb = useIsWideWeb();
  const hasBooks = !state.loading && !state.error && state.books.length > 0;

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
        {onNavigateToDrafts ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver rascunhos"
            hitSlop={12}
            onPress={onNavigateToDrafts}
            style={({ pressed }) => [styles.draftsLink, pressed && styles.draftsLinkPressed]}
          >
            <AppIcon name="document" size={20} color={colors.m3.onSecondaryContainer} />
            <Text style={styles.draftsLinkText}>Rascunhos</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.content, wideWeb && styles.contentWide]}>
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
                  onPress={onNavigateToCreateListing}
                  style={withPress(styles.webExchangeBannerButton)}
                >
                  <Text style={styles.webExchangeBannerButtonText}>Anunciar livro</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Resumo por modalidade */}
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View
                  key={stat.key}
                  accessible
                  accessibilityLabel={`${stat.count} ${stat.label}`}
                  style={[styles.statCard, wideWeb && styles.statCardWide, { backgroundColor: colors.badge[stat.key].background }]}
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
                    style={({ pressed }) => [
                      isIOS ? styles.segmentIOS : styles.segmentAndroid,
                      !isIOS && index > 0 ? styles.segmentAndroidJoined : null,
                      !isIOS && index === 0 ? styles.segmentAndroidFirst : null,
                      !isIOS && index === tabs.length - 1 ? styles.segmentAndroidLast : null,
                      selected ? (isIOS ? styles.segmentIOSSelected : styles.segmentAndroidSelected) : null,
                      pressed ? styles.segmentPressed : null,
                    ]}
                  >
                    {!isIOS && selected ? (
                      <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.segmentText,
                        wideWeb && styles.segmentTextWide,
                        selected ? (isIOS ? styles.segmentTextSelectedIOS : styles.segmentTextSelected) : null,
                      ]}
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
                  books={activeBooks}
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
                {concludedProposals.map((item) => (
                  <ShelfRow
                    key={item.request.id}
                    book={item.listing}
                    summary={`${item.requesterName ?? COMMUNITY_MEMBER} · Concluído · ${MODALITY_LABEL[item.listing.modality]}`}
                    accessibilityLabel={`Ver histórico de ${item.listing.title}`}
                    onPress={() => onNavigateToNegotiationDetail?.(item.request.id)}
                  />
                ))}
                {deliveredBooks.map((book) => (
                  <ShelfRow
                    key={book.id}
                    book={book}
                    summary={`Entregue · ${MODALITY_LABEL[book.modality]}`}
                    accessibilityLabel={`Ver ${book.title}`}
                    onPress={() => onNavigateToManageListing?.(book.id)}
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
          onPress={onNavigateToCreateListing}
          android_ripple={{ color: colors.m3.onPrimaryContainer, borderless: false }}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <AppIcon name="add" size={24} color={colors.m3.onPrimaryContainer} />
        </Pressable>
      ) : null}
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
      bottom: tokens.spacing[16],
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
    },
    fabPressed: {
      opacity: 0.92,
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.94 }],
    },
    segmentPressed: {
      transform: [{ scale: 0.97 }],
    },
    // Botão tonal com ícone (M3): maior e com cara de botão, em vez de um texto pequeno solto.
    draftsLink: {
      marginLeft: "auto",
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    draftsLinkPressed: { opacity: 0.85 },
    draftsLinkText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSecondaryContainer,
    },
    content: {
      flex: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
    },
    // Web larga (Figma `05.01`): coluna de 1280 px com 80 px de margem e botão "Anunciar livro" em texto.
    headerWide: { width: "100%", maxWidth: WEB_MAX_WIDTH, alignSelf: "center", paddingHorizontal: tokens.spacing[80], paddingTop: tokens.spacing[32] },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    webExchangeBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      backgroundColor: colors.m3.tertiaryContainer,
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[20],
      marginBottom: tokens.spacing[8],
    },
    webExchangeBannerIconBox: {
      width: tokens.spacing[48],
      height: tokens.spacing[48],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      justifyContent: "center",
      alignItems: "center",
    },
    webExchangeBannerTextBox: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    webExchangeBannerTitle: {
      ...tokens.typography.brandCardTitle,
      color: colors.m3.onTertiaryContainer,
    },
    webExchangeBannerSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onTertiaryContainer,
    },
    webExchangeBannerButton: {
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[20],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    webExchangeBannerButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onPrimary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    // Folga para o último cartão não ficar escondido atrás do FAB.
    scroll: { paddingBottom: tokens.spacing[96], gap: tokens.spacing[16] },
    statsRow: { flexDirection: "row", gap: tokens.spacing[8] },
    // Web larga: número e rótulo lado a lado em cartões compactos, sem esticar pela largura toda.
    statCardWide: { flex: 0, minWidth: 160, flexDirection: "row", alignItems: "baseline", gap: tokens.spacing[8], paddingHorizontal: tokens.spacing[16] },
    statCard: {
      flex: 1,
      borderRadius: tokens.radius.card,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
      gap: tokens.spacing[2],
    },
    statCount: { ...tokens.typography.brandTitle },
    statLabel: { ...tokens.typography.footnote },
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
      padding: tokens.spacing[2],
      borderRadius: tokens.radius.segmentOuter,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    segmentIOS: {
      flex: 1,
      minHeight: tokens.spacing[32],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[4],
      borderRadius: tokens.radius.segmentInner,
    },
    segmentIOSSelected: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    segmentTextWide: { ...tokens.typography.labelLarge },
    segmentText: { ...tokens.typography.labelMedium, color: colors.m3.onSurface },
    segmentTextSelected: { fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    segmentTextSelectedIOS: { fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSurface },
    segmentBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: tokens.radius.segmentOuter,
      paddingHorizontal: tokens.spacing[4],
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    segmentBadgeText: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.bold, color: colors.m3.onPrimary },
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
    emptyState: {
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[40],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.circle72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: {
      ...tokens.typography.brandTitle,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 320 },
    emptyAction: { marginTop: tokens.spacing[16], alignSelf: "stretch" },
  });
}
