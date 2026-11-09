import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { makeAuthViewModel, makeHomeViewModel, makeNetworkStatus, makeNotificationsViewModel } from "@/di/container";
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
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { IpeMark } from "@/view/components/IpeMark";
import { IpeCelebrationOverlay } from "@/view/components/IpeCelebrationOverlay";
import {
  checkAndTriggerInitialPetals,
  resetAppLaunchCelebrationForTesting,
  triggerIpePetals,
} from "@/view/components/ipeCelebrationController";
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
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  /** "Ver mais" das seções destacadas; `modality` e `neighborhood` pré-aplicam filtros na Pesquisa. */
  onNavigateToSearch?: (filter?: { modality?: BookModality; neighborhood?: string }) => void;
  /** Mudar este valor força o catálogo a recarregar (ex.: ao voltar de cadastrar um anúncio). */
  focusKey?: unknown;
};

export { resetAppLaunchCelebrationForTesting };

export default function Home({
  currentNeighborhood,
  onSelectNeighborhood,
  onNavigateToSignIn,
  onNavigateToBookDetail,
  onNavigateToNotifications,
  onNavigateToTerms: _onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const neighborhoodHook = useActiveNeighborhood("Centro");
  const effectiveNeighborhood = currentNeighborhood ?? neighborhoodHook.activeNeighborhood;
  const handleSelectNeighborhood = onSelectNeighborhood ?? neighborhoodHook.openSelector;

  const [state, actions] = makeHomeViewModel();
  const [authState] = makeAuthViewModel();
  // Só o contador de não lidas: convite e resposta de encontro chegam por aqui, em tempo real (Spec 086).
  const [notificationsState, notificationsActions] = makeNotificationsViewModel(authState.user?.id ?? null);
  const unreadCount = notificationsState.unreadCount;
  const { isOnline } = makeNetworkStatus();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wideWeb = useIsWideWeb();
  const isWeb = Platform.OS === "web";
  const [selectedModality, setSelectedModality] = useState<BookModality | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const treeRotate = useRef(new Animated.Value(0)).current;

  const guardedNavigateToSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedNavigateToBookDetail = useGuardedPress(onNavigateToBookDetail);
  const guardedNavigateToNotifications = useGuardedPress(onNavigateToNotifications);
  const guardedNavigateToHelp = useGuardedPress(onNavigateToHelp);
  const guardedNavigateToSearch = useGuardedPress(onNavigateToSearch);

  // Florada inicial automática disparada apenas na primeira entrada do aplicativo na sessão
  useEffect(() => {
    checkAndTriggerInitialPetals();
  }, []);

  /**
   * Faz o Ipê balançar graciosamente com a brisa e soltar sua florada de pétalas
   * douradas pelo aplicativo.
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

  /** Ao puxar para atualizar (pull-to-refresh), recarrega o catálogo e desprende pétalas */
  const handleRefresh = async () => {
    setRefreshing(true);
    triggerPetals();
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
    effectiveNeighborhood !== "Todos os bairros (Piripiri)";

  const isCustomNeighborhood =
    isSpecificNeighborhood && effectiveNeighborhood !== "Centro";

  const filteredBooks = useMemo(() => {
    if (selectedModality === "all") return state.books;
    return state.books.filter((b) => b.modality === selectedModality);
  }, [state.books, selectedModality]);

  const neighborhoodBooks = useMemo(() => {
    if (!isSpecificNeighborhood) return filteredBooks;
    if (effectiveNeighborhood === "Centro") {
      return filteredBooks.filter((b) => !b.neighborhood || b.neighborhood === "Centro");
    }
    return filteredBooks.filter((b) => b.neighborhood === effectiveNeighborhood);
  }, [filteredBooks, isSpecificNeighborhood, effectiveNeighborhood]);

  const maxRecent = wideWeb ? 12 : CAROUSEL_MAX_ITEMS;
  const recentBooks = neighborhoodBooks.slice(0, maxRecent);
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
      ? "Piripiri (Todos)"
      : effectiveNeighborhood;

  const carouselDisplayTitle = isCustomNeighborhood
    ? `Perto de você no ${effectiveNeighborhood}`
    : "Perto de você";

  const listHeader = (
    <View style={[styles.headerContainer, wideWeb && styles.headerContainerWide]}>
      {/* 1. Barra de Topo: Bairro (Pill), Entrar (sem sessão) e Sino de Notificações */}
      {wideWeb ? null : (
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Selecionar bairro: ${displayNeighborhood}`}
            hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4] }}
            onPress={handleSelectNeighborhood}
            style={withPress(styles.neighborhoodPill)}
          >
            <AppIcon name="place" size={20} color={colors.m3.primary} />
            <Text numberOfLines={1} style={styles.neighborhoodText}>{displayNeighborhood}</Text>
            <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
          </Pressable>

          <View style={styles.topRightActions}>
            {authState.loading || authState.user ? null : (
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0
                  ? `Abrir notificações, ${unreadCount} ${unreadCount === 1 ? "não lida" : "não lidas"}`
                  : "Abrir notificações"
              }
              hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4], left: tokens.spacing[4], right: tokens.spacing[4] }}
              onPress={() => guardedNavigateToNotifications()}
              style={withPress(styles.notificationButton)}
            >
              <AppIcon name="bell" size={24} color={colors.m3.onSurfaceVariant} />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      )}

      {/* 2. Manchete Editorial com o Ipê de Piripiri (Figma 02.01 / Spec 078) */}
      <View style={[styles.heroSection, wideWeb && styles.heroSectionWide]}>
        <View style={[styles.heroRow, wideWeb && styles.heroRowWide]}>
          <View style={[styles.heroTextContainer, wideWeb && styles.heroTextContainerWide]}>
            {wideWeb ? (
              <View style={styles.heroLocationRowWide}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar bairro: ${displayNeighborhood}`}
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
            <View style={styles.heroAsideWide}>
              {/* Cartão interativo da Florada do Ipê */}
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
                    <IpeMark size={92} />
                  </Animated.View>
                  <View style={styles.heroCelebrationTextsWide}>
                    <Text style={styles.heroCelebrationTitleWide}>Florada do Ipê</Text>
                    <Text style={styles.heroCelebrationBodyWide}>
                      Toque na árvore para celebrar a leitura e espalhar pétalas douradas por Piripiri.
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* Destaques Comunitários: Doações e Trocas */}
              <View style={styles.heroHighlightsRowWide}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Doações da semana: ${donationSummary}`}
                  onPress={() => guardedNavigateToSearch({ modality: "donation" })}
                  style={({ pressed }) => [
                    styles.heroHighlightCardWide,
                    { backgroundColor: colors.m3.doacaoContainer },
                    isWeb && ({ cursor: "pointer" } as any),
                    pressed && expressivePressedStyle,
                  ]}
                >
                  <View style={styles.heroHighlightIconBoxWide}>
                    <AppIcon name="bookmark" size={18} color={colors.m3.onDoacaoContainer} />
                  </View>
                  <View style={styles.heroHighlightTextBoxWide}>
                    <Text numberOfLines={1} style={[styles.heroHighlightTitleWide, { color: colors.m3.onDoacaoContainer }]}>
                      Doações
                    </Text>
                    <Text numberOfLines={1} style={[styles.heroHighlightSubtitleWide, { color: colors.m3.onDoacaoContainer }]}>
                      {donationCount > 0 ? `${donationCount} ${donationCount === 1 ? "gratuito" : "gratuitos"}` : "Ver lista"}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Trocar livros com leitores de Piripiri"
                  onPress={() => guardedNavigateToSearch({ modality: "trade" })}
                  style={({ pressed }) => [
                    styles.heroHighlightCardWide,
                    { backgroundColor: colors.m3.tertiaryContainer },
                    isWeb && ({ cursor: "pointer" } as any),
                    pressed && expressivePressedStyle,
                  ]}
                >
                  <View style={styles.heroHighlightIconBoxWide}>
                    <AppIcon name="swap" size={18} color={colors.m3.onTertiaryContainer} />
                  </View>
                  <View style={styles.heroHighlightTextBoxWide}>
                    <Text numberOfLines={1} style={[styles.heroHighlightTitleWide, { color: colors.m3.onTertiaryContainer }]}>
                      Trocas
                    </Text>
                    <Text numberOfLines={1} style={[styles.heroHighlightSubtitleWide, { color: colors.m3.onTertiaryContainer }]}>
                      Sem custo
                    </Text>
                  </View>
                </Pressable>
              </View>
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
            const tone = mod === "all" ? undefined : colors.badge[mod];
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
            const tone = mod === "all" ? undefined : colors.badge[mod];
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
          viewMoreButtonText="Ver todos"
        />
      ) : (
        <HomeEmptyCatalogSection
          carouselDisplayTitle={carouselDisplayTitle}
          hasAnyBooks={state.books.length > 0}
          isSpecificNeighborhood={isSpecificNeighborhood}
          effectiveNeighborhood={effectiveNeighborhood}
          selectedModality={selectedModality}
          onExploreAllPiripiri={() => {
            neighborhoodHook.selectNeighborhood("Todos os bairros (Piripiri)");
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
      paddingBottom={wideWeb ? tokens.spacing[32] : scrollBottomPadding.withBottomBar}
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
        </>
      }
    >
      {listHeader}
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wideHomeContent: {
      width: "100%",
    },
    headerContainer: {
      marginBottom: tokens.spacing[16],
    },
    headerContainerWide: {
      marginBottom: tokens.spacing[24],
      width: "100%",
    },

    // 1. Top bar
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[12],
    },
    topBarWide: {
      marginBottom: tokens.spacing[16],
    },
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
    neighborhoodText: {
      flexShrink: 1,
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurface,
    },
    topRightActions: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    notificationButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      justifyContent: "center",
      alignItems: "center",
    },
    notificationBadge: {
      position: "absolute",
      top: 2,
      right: 2,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationBadgeText: { ...tokens.typography.badgeMicro, color: colors.badge.completed.text },
    sessionPill: {
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      minHeight: 36,
      justifyContent: "center",
    },
    sessionPillText: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.action,
    },

    // 2. Hero editorial
    heroSection: {
      marginBottom: tokens.spacing[12],
    },
    heroSectionWide: {
      padding: tokens.spacing[28],
      marginBottom: tokens.spacing[24],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.xxl,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      width: "100%",
    },
    heroTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    heroTitleWide: {
      ...tokens.typography.brandDisplayMd,
    },
    heroSubtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[8],
    },
    heroSubtitleWide: {
      ...tokens.typography.webLead,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
    },
    heroRowWide: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[32],
    },
    heroLocationRowWide: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: tokens.spacing[4],
    },
    heroTextContainer: {
      flex: 1,
    },
    heroTextContainerWide: {
      flex: 1.2,
      minWidth: 320,
      maxWidth: 640,
      gap: tokens.spacing[12],
      justifyContent: "center",
    },
    heroAsideWide: {
      flex: 1,
      maxWidth: 480,
      minWidth: 320,
      flexShrink: 0,
      justifyContent: "center",
      gap: tokens.spacing[12],
    },
    heroCelebrationCardWide: {
      backgroundColor: colors.ipe.petalSoft,
      borderRadius: tokens.radius.xl,
      borderWidth: 1.5,
      borderColor: colors.ipe.bloom,
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
      shadowColor: colors.ipe.bloomDeep,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    heroCelebrationRowWide: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
    },
    heroCelebrationTextsWide: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    heroCelebrationTitleWide: {
      ...tokens.typography.titleMedium,
      color: colors.brandBrown,
      fontWeight: tokens.fontWeight.bold,
    },
    heroCelebrationBodyWide: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 18,
    },
    heroHighlightsRowWide: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    heroHighlightCardWide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[14],
      borderRadius: tokens.radius.large,
    },
    heroHighlightIconBoxWide: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
    },
    heroHighlightTextBoxWide: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    heroHighlightTitleWide: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.bold,
    },
    heroHighlightSubtitleWide: {
      ...tokens.typography.captionSmall,
      opacity: 0.9,
    },
    chipsContainerWide: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[20],
    },
    heroMarkContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: tokens.spacing[4],
    },
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
    heroPetalsHintText: {
      ...tokens.typography.labelSmall,
      color: colors.ipe.bloomDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    statsBannerWide: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: tokens.spacing[28],
      rowGap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[20],
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.card,
      alignSelf: "flex-start",
    },
    statItemWide: {
      alignItems: "flex-start",
    },
    statNumberWide: {
      ...tokens.typography.brandTitle,
      color: colors.m3.primary,
    },
    statLabelWide: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[4],
    },
    statDividerWide: {
      width: 1,
      height: 32,
      backgroundColor: colors.m3.outlineVariant,
    },

    // 3. Chips de Filtro
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[20],
    },
    chipsScrollView: {
      marginBottom: tokens.spacing[20],
      marginHorizontal: -tokens.spacing[16],
    },
    chipsScroll: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
  });
}
