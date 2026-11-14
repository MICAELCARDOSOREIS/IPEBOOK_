import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, Image, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import {
  makeAuthViewModel,
  makeHomeViewModel,
  makeNavigationBadgesViewModel,
  makeNetworkStatus,
  makeNotificationsViewModel,
  makeProfileViewModel,
} from "@/di/container";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import {
  CAROUSEL_MAX_ITEMS,
  CatalogCarousel,
  HomeEmptyCatalogSection,
  HomeShortcutsSection,
  carouselOffsetFor,
} from "@/view/home/CatalogCarousel";
import { useHydratedWindowWidth, useIsWideWeb } from "@/view/useIsWideWeb";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { IpeMark } from "@/view/components/IpeMark";
import { IpeCelebrationOverlay } from "@/view/components/IpeCelebrationOverlay";
import {
  resetAppLaunchCelebrationForTesting,
  triggerIpePetals,
} from "@/view/components/ipeCelebrationController";
import { HomeFloatingChatButton } from "@/view/home/HomeFloatingChatButton";
import type { BookModality } from "@/model/entities/book";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { expressivePressedStyle, withPress } from "@/view/pressFeedback";

export { carouselOffsetFor };

export type HomeProps = {
  currentNeighborhood?: string;
  onSelectNeighborhood?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToNotifications?: () => void;
  onNavigateToConversations?: () => void;
  onNavigateToProfile?: () => void;
  /** Contador manual de conversas/mensagens não lidas (útil para testes determinísticos). */
  conversationsBadgeCount?: number;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  /** "Ver mais" das seções destacadas; `modality` e `neighborhood` pré-aplicam filtros na Pesquisa. */
  onNavigateToSearch?: (filter?: { modality?: BookModality; neighborhood?: string }) => void;
  /** Mudar este valor força o catálogo a recarregar (ex.: ao voltar de cadastrar um anúncio). */
  focusKey?: unknown;
};
export { resetAppLaunchCelebrationForTesting };

function getBookRecency(book: Book): number {
  if (book.createdAt) {
    const time = new Date(book.createdAt).getTime();
    if (!Number.isNaN(time)) return time;
  }
  const match = book.id.match(/^book-(\d+)/);
  if (match) {
    const time = Number(match[1]);
    if (!Number.isNaN(time)) return time;
  }
  return 0;
}

export default function Home({
  currentNeighborhood,
  onSelectNeighborhood,
  onNavigateToSignIn,
  onNavigateToBookDetail,
  onNavigateToNotifications,
  onNavigateToConversations,
  onNavigateToProfile,
  conversationsBadgeCount: explicitConversationsBadgeCount,
  onNavigateToTerms: _onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const neighborhoodHook = useActiveNeighborhood("all");
  const effectiveNeighborhood = currentNeighborhood ?? neighborhoodHook.activeNeighborhood;
  const handleSelectNeighborhood = onSelectNeighborhood ?? neighborhoodHook.openSelector;

  const [state, actions] = makeHomeViewModel();
  const [authState] = makeAuthViewModel();
  const [profileState] = makeProfileViewModel(authState.user?.id ?? null);
  // Mantém refresh em segundo plano para manter estado atualizado ao puxar para atualizar
  const [, notificationsActions] = makeNotificationsViewModel(authState.user?.id ?? null);
  const navBadges = makeNavigationBadgesViewModel(authState.user?.id ?? null, "home");
  const conversationsBadgeCount = explicitConversationsBadgeCount ?? navBadges.conversations;
  const { isOnline } = makeNetworkStatus();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wideWeb = useIsWideWeb();
  // Os dois blocos do hero pedem 320 px cada; com o padding do cartão, só cabem lado a lado daqui para cima.
  const stackHero = useHydratedWindowWidth() < 1100;
  const isWeb = Platform.OS === "web";
  const [selectedModality, setSelectedModality] = useState<BookModality | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const treeRotate = useRef(new Animated.Value(0)).current;

  const guardedNavigateToSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedNavigateToBookDetail = useGuardedPress(onNavigateToBookDetail);
  const handleProfilePress = useCallback(() => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else if (!authState.user && onNavigateToSignIn) {
      onNavigateToSignIn();
    }
  }, [onNavigateToProfile, authState.user, onNavigateToSignIn]);
  const guardedNavigateToProfile = useGuardedPress(handleProfilePress);
  const handleConversationsPress = useCallback(() => {
    if (onNavigateToConversations) {
      onNavigateToConversations();
    } else if (!authState.user && onNavigateToSignIn) {
      onNavigateToSignIn();
    }
  }, [onNavigateToConversations, authState.user, onNavigateToSignIn]);
  const guardedNavigateToConversations = useGuardedPress(handleConversationsPress);
  const guardedNavigateToHelp = useGuardedPress(onNavigateToHelp);
  const guardedNavigateToSearch = useGuardedPress(onNavigateToSearch);

  /**
   * Faz o Ipê balançar graciosamente com a brisa e soltar sua florada de pétalas
   * douradas pelo aplicativo ao clicar na árvore.
   */
  const triggerPetals = useCallback(() => {
    Animated.sequence([
      Animated.timing(treeRotate, { toValue: 1, duration: 130, useNativeDriver: !isWeb }),
      Animated.timing(treeRotate, { toValue: -1, duration: 130, useNativeDriver: !isWeb }),
      Animated.timing(treeRotate, { toValue: 0.5, duration: 110, useNativeDriver: !isWeb }),
      Animated.timing(treeRotate, { toValue: 0, duration: 100, useNativeDriver: !isWeb }),
    ]).start();

    triggerIpePetals();
  }, [isWeb, treeRotate]);

  /** Ao puxar para atualizar (pull-to-refresh), recarrega o catálogo sem soltar pétalas */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([actions.reload(), notificationsActions.refresh()]);
    } finally {
      setRefreshing(false);
    }
  };

  const isFirstFocus = useRef(true);
  useEffect(() => {
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      return;
    }
    void actions.reload();
    void notificationsActions.refresh();
  }, [focusKey]);

  // O tempo real pode não chegar com o app em segundo plano: ao voltar, confere os avisos de novo.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") void notificationsActions.refresh();
    });
    return () => subscription.remove();
  }, [notificationsActions]);

  const isSpecificNeighborhood =
    Boolean(effectiveNeighborhood) &&
    effectiveNeighborhood !== "all" &&
    effectiveNeighborhood !== "Todos os bairros (Piripiri)" &&
    effectiveNeighborhood !== "Piripiri (Todos os locais)" &&
    effectiveNeighborhood !== "Piripiri (Todos)" &&
    effectiveNeighborhood !== "Piripiri";

  const isCustomNeighborhood = isSpecificNeighborhood;

  const filteredBooks = useMemo(() => {
    if (selectedModality === "all") return state.books;
    return state.books.filter((b) => b.modality === selectedModality);
  }, [state.books, selectedModality]);

  const neighborhoodBooks = useMemo(() => {
    if (!isSpecificNeighborhood) return filteredBooks;
    const lowerEffective = effectiveNeighborhood.toLowerCase();
    return filteredBooks.filter((b) => {
      if (!b.neighborhood) return false;
      const lowerBook = b.neighborhood.toLowerCase();
      return lowerBook.includes(lowerEffective) || lowerEffective.includes(lowerBook);
    });
  }, [filteredBooks, isSpecificNeighborhood, effectiveNeighborhood]);

  const sortedNeighborhoodBooks = useMemo(() => {
    return [...neighborhoodBooks].sort((a, b) => {
      const recencyA = getBookRecency(a);
      const recencyB = getBookRecency(b);
      if (recencyA !== recencyB) return recencyB - recencyA;
      return 0;
    });
  }, [neighborhoodBooks]);

  const maxRecent = CAROUSEL_MAX_ITEMS;
  const recentBooks = sortedNeighborhoodBooks.slice(0, maxRecent);
  const donationCount = state.books.filter(
    (book) => book.modality === "donation" && book.status === "available",
  ).length;
  const totalBooksCount = state.books.length;
  const uniqueNeighborhoodsCount = useMemo(() => {
    const set = new Set(state.books.map((b) => b.neighborhood).filter(Boolean));
    return Math.max(1, set.size);
  }, [state.books]);
  const donationSummary =
    donationCount === 0
      ? "Veja as doações em Piripiri"
      : `${donationCount} ${donationCount === 1 ? "livro gratuito" : "livros gratuitos"} em Piripiri`;

  const displayNeighborhood =
    !isSpecificNeighborhood
      ? "Piripiri"
      : effectiveNeighborhood;

  const carouselDisplayTitle = isCustomNeighborhood
    ? `Em ${effectiveNeighborhood}`
    : "Perto de você";

  const listHeader = (
    <View style={[styles.headerContainer, wideWeb && styles.headerContainerWide]}>
      {/* 1. Barra de Topo: Bairro (Pill), Entrar (sem sessão) e Sino de Notificações */}
      {wideWeb ? null : (
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Selecionar local em Piripiri: ${displayNeighborhood}`}
            hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4] }}
            onPress={handleSelectNeighborhood}
            style={withPress(styles.neighborhoodPill)}
          >
            <AppIcon name="place" size={20} color={colors.m3.primary} />
            <Text numberOfLines={1} style={styles.neighborhoodText}>{displayNeighborhood}</Text>
            <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
          </Pressable>

          <View style={styles.topRightActions}>
            {authState.loading ? null : authState.user ? (
              <Pressable
                testID="home-top-profile-button"
                accessibilityRole="button"
                accessibilityLabel={
                  authState.user.name ? `Meu perfil, ${authState.user.name}` : "Meu perfil"
                }
                hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4], left: tokens.spacing[4], right: tokens.spacing[4] }}
                onPress={() => guardedNavigateToProfile()}
                style={({ pressed }) => [
                  styles.profileButton,
                  pressed && styles.profileButtonPressed,
                ]}
              >
                {profileState.profile?.photoUrl ? (
                  <Image
                    source={{ uri: profileState.profile.photoUrl }}
                    accessibilityLabel={authState.user.name ?? "Meu perfil"}
                    style={styles.profileAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <AppIcon name="person" size={22} color={colors.m3.onSurfaceVariant} />
                )}
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Entrar no aplicativo"
                hitSlop={{ top: tokens.spacing[6], bottom: tokens.spacing[6] }}
                onPress={() => guardedNavigateToSignIn()}
                style={withPress(styles.sessionPill)}
              >
                <Text style={styles.sessionPillText}>Entrar</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* 2. Manchete Editorial com o Ipê de Piripiri (Figma 02.01 / Spec 078) */}
      <View style={[styles.heroSection, wideWeb && styles.heroSectionWide]}>
        <View style={[styles.heroRow, wideWeb && styles.heroRowWide, wideWeb && stackHero && styles.heroRowStacked]}>
          <View style={[styles.heroTextContainer, wideWeb && styles.heroTextContainerWide, wideWeb && stackHero && styles.heroColStacked]}>
            {wideWeb ? (
              <View style={styles.heroLocationRowWide}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar local em Piripiri: ${displayNeighborhood}`}
                  onPress={handleSelectNeighborhood}
                  style={withPress(styles.neighborhoodPill)}
                >
                  <AppIcon name="place" size={18} color={colors.m3.primary} />
                  <Text numberOfLines={1} style={styles.neighborhoodText}>{displayNeighborhood}</Text>
                  <AppIcon name="chevronDown" size={18} color={colors.m3.onSurfaceVariant} />
                </Pressable>
              </View>
            ) : null}

            <Text accessibilityRole="header" style={[styles.heroTitle, wideWeb && styles.heroTitleWide]}>
              Encontre sua próxima história.
            </Text>
            <Text style={[styles.heroSubtitle, wideWeb && styles.heroSubtitleWide]}>
              Compre, troque ou receba livros sob a florada do Ipê de Piripiri.
            </Text>

            {wideWeb && totalBooksCount > 0 ? (
              <View style={styles.statsBannerWide} testID="home-community-stats">
                <View style={styles.statItemWide}>
                  <Text style={styles.statNumberWide}>{totalBooksCount}</Text>
                  <Text style={styles.statLabelWide}>
                    {totalBooksCount === 1 ? "livro anunciado" : "livros anunciados"}
                  </Text>
                </View>
                <View style={styles.statDividerWide} />
                <View style={styles.statItemWide}>
                  <Text style={styles.statNumberWide}>{uniqueNeighborhoodsCount}</Text>
                  <Text style={styles.statLabelWide}>
                    {uniqueNeighborhoodsCount === 1 ? "bairro com leitores" : "bairros com leitores"}
                  </Text>
                </View>
                <View style={styles.statDividerWide} />
                <View style={styles.statItemWide}>
                  <Text style={styles.statNumberWide}>{donationCount}</Text>
                  <Text style={styles.statLabelWide}>
                    {donationCount === 1 ? "doação disponível" : "doações disponíveis"}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {wideWeb ? (
            <View style={[styles.heroAsideWide, stackHero && styles.heroColStacked]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Celebrar florada do Ipê"
                onPress={triggerPetals}
                style={({ pressed }) => [
                  styles.heroCelebrationCardWide,
                  isWeb && ({ cursor: "pointer", userSelect: "none" } as any),
                  pressed && expressivePressedStyle,
                ]}
              >
                <View style={styles.heroCelebrationRowWide}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: treeRotate.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: ["-7deg", "0deg", "7deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <IpeMark size={88} />
                  </Animated.View>
                  <View style={styles.heroCelebrationTextsWide}>
                    <Text style={styles.heroCelebrationTitleWide}>Florada do Ipê</Text>
                    <Text style={styles.heroCelebrationBodyWide}>
                      Toque na árvore para celebrar a leitura e espalhar pétalas douradas por Piripiri.
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Celebrar florada do Ipê"
              onPress={triggerPetals}
              style={({ pressed }) => [
                styles.heroMarkContainer,
                isWeb && ({ cursor: "pointer", userSelect: "none" } as any),
                pressed && expressivePressedStyle,
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: treeRotate.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ["-7deg", "0deg", "7deg"],
                      }),
                    },
                  ],
                }}
              >
                <IpeMark size={76} />
              </Animated.View>
            </Pressable>
          )}
        </View>
      </View>

      {/* 3. Chips de Filtro Rápido (Todos, Venda, Troca, Doação) */}
      {wideWeb ? (
        <View style={styles.chipsContainerWide} testID="home-quick-filter-chips">
          {(["all", "sale", "trade", "donation"] as const).map((mod) => {
            const isSelected = selectedModality === mod;
            const label = mod === "all" ? "Todos" : mod === "sale" ? "Venda" : mod === "trade" ? "Troca" : "Doação";
            const tone = mod === "all" ? { background: colors.nature.foliage, text: colors.nature.onFoliage } : colors.badge[mod];
            return (
              <Chip
                key={mod}
                size="compact"
                label={label}
                accessibilityLabel={`Filtrar por ${label}`}
                selected={isSelected}
                tone={tone}
                onPress={() => setSelectedModality(mod)}
              />
            );
          })}
        </View>
      ) : (
        <ScrollView
          horizontal
          {...standardHorizontalScrollProps}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
          style={styles.chipsScrollView}
        >
          {(["all", "sale", "trade", "donation"] as const).map((mod) => {
            const isSelected = selectedModality === mod;
            const label = mod === "all" ? "Todos" : mod === "sale" ? "Venda" : mod === "trade" ? "Troca" : "Doação";
            const tone = mod === "all" ? { background: colors.nature.foliage, text: colors.nature.onFoliage } : colors.badge[mod];
            return (
              <Chip
                key={mod}
                size="compact"
                label={label}
                accessibilityLabel={`Filtrar por ${label}`}
                selected={isSelected}
                tone={tone}
                onPress={() => setSelectedModality(mod)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* 5. "Perto de você" (Figma 02.01): carrossel ou estado de carregamento, erro ou vazio */}
      {state.loading ? (
        <LoadingState label="Carregando livros" variant="homeCarousel" />
      ) : state.error ? (
        isOnline ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : (
          <OfflineState onRetry={() => void actions.reload()} />
        )
      ) : recentBooks.length > 0 ? (
        <CatalogCarousel
          title="Recém-adicionados"
          displayTitle={carouselDisplayTitle}
          badgeText={`${neighborhoodBooks.length} ${neighborhoodBooks.length === 1 ? "livro" : "livros"}`}
          books={recentBooks}
          onNavigateToBookDetail={guardedNavigateToBookDetail}
          onViewMore={() => {
            const filter: { modality?: BookModality; neighborhood?: string } = {};
            if (selectedModality !== "all") filter.modality = selectedModality;
            if (isCustomNeighborhood) filter.neighborhood = effectiveNeighborhood;
            if (Object.keys(filter).length > 0) {
              guardedNavigateToSearch(filter);
            } else {
              guardedNavigateToSearch();
            }
          }}
          viewMoreLabel="Ver mais livros recém-adicionados"
          viewMoreButtonText="Ver mais"
        />
      ) : (
        <HomeEmptyCatalogSection
          carouselDisplayTitle={carouselDisplayTitle}
          hasAnyBooks={state.books.length > 0}
          isSpecificNeighborhood={isSpecificNeighborhood}
          effectiveNeighborhood={effectiveNeighborhood}
          selectedModality={selectedModality}
          onExploreAllPiripiri={() => {
            neighborhoodHook.selectNeighborhood("Piripiri (Todos os locais)");
            guardedNavigateToSearch(
              selectedModality === "all"
                ? { neighborhood: "all" }
                : { modality: selectedModality, neighborhood: "all" },
            );
          }}
          onChangeNeighborhood={handleSelectNeighborhood}
        />
      )}

      <HomeShortcutsSection
        wideWeb={wideWeb}
        donationSummary={donationSummary}
        onNavigateToSearch={(filter) => guardedNavigateToSearch(filter)}
        onNavigateToHelp={onNavigateToHelp ? () => guardedNavigateToHelp() : undefined}
      />

    </View>
  );

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      maxWidth={wideWeb ? WEB_MAX_WIDTH : 720}
      paddingHorizontal={wideWeb ? WEB_GUTTER : undefined}
      paddingBottom={wideWeb ? tokens.spacing[32] : scrollBottomPadding.withBottomBarAndFab + tokens.spacing[24]}
      contentStyle={wideWeb ? styles.wideHomeContent : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          colors={[colors.action, colors.ipe.bloom]}
          tintColor={colors.ipe.bloom}
        />
      }
      overlay={
        <>
          <IpeCelebrationOverlay />
          <NeighborhoodSelectorModal
            visible={neighborhoodHook.isSelectorOpen}
            currentNeighborhood={effectiveNeighborhood}
            onSelect={neighborhoodHook.selectNeighborhood}
            onClose={neighborhoodHook.closeSelector}
          />
          {!wideWeb && (onNavigateToConversations || onNavigateToSignIn) ? (
            <HomeFloatingChatButton
              badgeCount={conversationsBadgeCount}
              onPress={() => guardedNavigateToConversations()}
            />
          ) : null}
        </>
      }
    >
      {listHeader}
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wideHomeContent: { width: "100%", },
    headerContainer: { marginBottom: tokens.spacing[16], },
    headerContainerWide: { marginBottom: tokens.spacing[24], width: "100%", },

    // 1. Top bar
    topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[8], marginBottom: tokens.spacing[12], },
    topBarWide: { marginBottom: tokens.spacing[16], },
    neighborhoodPill: {
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.surfaceContainerHigh,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[8],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
    },
    neighborhoodText: { flexShrink: 1, ...tokens.typography.labelLarge, color: colors.m3.onSurface, },
    topRightActions: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: tokens.spacing[8], },
    profileButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    profileButtonPressed: { transform: [{ scale: 0.94 }], backgroundColor: colors.m3.surfaceContainerHighest, },
    profileAvatarImage: { width: tokens.spacing[40], height: tokens.spacing[40], borderRadius: tokens.radius.full, },
    sessionPill: { paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6], borderRadius: tokens.radius.full, backgroundColor: colors.m3.surfaceContainerHigh, minHeight: 36, justifyContent: "center", },
    sessionPillText: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.action, },

    // 2. Hero editorial
    heroSection: { marginBottom: tokens.spacing[12], },
    heroSectionWide: {
      marginBottom: tokens.spacing[28],
      paddingVertical: tokens.spacing[8],
      width: "100%",
    },
    heroTitle: { ...tokens.typography.brandLargeTitle, color: colors.brandBrown, },
    heroTitleWide: { ...tokens.typography.brandDisplayMd, },
    heroSubtitle: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant, marginTop: tokens.spacing[6], },
    heroSubtitleWide: { ...tokens.typography.webLead, },
    heroRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[16], },
    heroRowWide: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[32], },
    heroRowStacked: { flexDirection: "column", alignItems: "stretch" },
    heroLocationRowWide: { flexDirection: "row", alignItems: "center", marginBottom: tokens.spacing[4], },
    heroTextContainer: { flex: 1, },
    heroTextContainerWide: { flexGrow: 1, flexShrink: 1, minWidth: 280, maxWidth: 560, gap: tokens.spacing[8], justifyContent: "center", },
    heroAsideWide: { width: 360, maxWidth: "38%", flexShrink: 0, justifyContent: "center" },
    heroColStacked: { minWidth: 0, maxWidth: "100%", width: "100%" },
    heroCelebrationCardWide: {
      backgroundColor: "#E6A817",
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing[16],
      gap: tokens.spacing[10],
    },
    heroCelebrationRowWide: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], },
    heroCelebrationTextsWide: { flex: 1, gap: tokens.spacing[2], },
    heroCelebrationTitleWide: { ...tokens.typography.titleMedium, fontSize: 20, color: "#451A03", fontWeight: tokens.fontWeight.bold, },
    heroCelebrationBodyWide: { ...tokens.typography.footnote, fontSize: 14, color: "#451A03", lineHeight: 20, },
    chipsContainerWide: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: tokens.spacing[8], marginBottom: tokens.spacing[20], },
    heroMarkContainer: { alignItems: "center", justifyContent: "center", padding: tokens.spacing[4], },
    heroMarkContainerWide: {
      alignItems: "center",
      justifyContent: "center",
      padding: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.xxl,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[8],
    },
    heroPetalsHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.ipe.container,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
    },
    heroPetalsHintText: { ...tokens.typography.labelSmall, color: colors.ipe.bloomDeep, fontWeight: tokens.fontWeight.semiBold, },
    statsBannerWide: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: tokens.spacing[28],
      rowGap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
      alignSelf: "flex-start",
    },
    statItemWide: { alignItems: "flex-start", },
    statNumberWide: { ...tokens.typography.brandTitle, color: colors.m3.primary, },
    statLabelWide: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant, marginTop: tokens.spacing[4], },
    statDividerWide: { width: 1, height: 32, backgroundColor: colors.m3.outlineVariant, },

    // 3. Chips de Filtro
    chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8], marginBottom: tokens.spacing[20], },
    chipsScrollView: { marginBottom: tokens.spacing[20], marginHorizontal: -tokens.spacing[16], },
    chipsScroll: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8], paddingLeft: tokens.spacing[16], paddingRight: tokens.spacing[28], },
  });
}
