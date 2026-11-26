import { useCallback, useMemo, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { triggerHaptic } from "@/view/haptics";
import {
  makeAuthViewModel,
  makeChatWithUser,
  makeProfileSafetyViewModel,
  makePublicProfileViewModel,
} from "@/di/container";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { ProfileSafetySheet } from "@/view/listings/profileSafetySheet";
import { tokens, type ColorPalette, fontFamily } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { OwnerListings } from "@/view/listings/ownerListings";
import { UserRatingsPanel } from "@/view/listings/userRatingsPanel";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
function formatJoinedAt(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export type PublicProfileProps = {
  userId: string;
  onBack?: () => void;
  /** Abre o chat de uma negociação aceita com esta pessoa (Spec 091). */
  onOpenChat?: (requestId: string) => void;
  /** Abre a denúncia de um anúncio desta pessoa (Spec 091). */
  onReportListing?: (listingId: string) => void;
  /** Abre a denúncia da própria pessoa (Spec 091). */
  onReportUser?: (userId: string, name: string) => void;
  /** Abre um anúncio da pessoa na grade da web larga. */
  onOpenBook?: (bookId: string) => void;
};

/**
 * Perfil público do membro da comunidade (Figma `03.04 · Perfil de Ana Paula`, nó `19:21`).
 */
export function PublicProfile({ userId, onBack, onOpenChat, onReportListing, onReportUser, onOpenBook }: PublicProfileProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedOpenChat = useGuardedPress(onOpenChat);
  const guardedReportListing = useGuardedPress(onReportListing);
  const guardedReportUser = useGuardedPress(onReportUser);
  const guardedOpenBook = useGuardedPress(onOpenBook);
  const wideWeb = useIsWideWeb();
  const [state, actions] = makePublicProfileViewModel(userId);
  const [auth] = makeAuthViewModel();
  // No próprio perfil não faz sentido conversar consigo nem se denunciar
  const isOwnProfile = Boolean(auth.user?.id) && auth.user?.id === userId;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safety, safetyActions] = makeProfileSafetyViewModel(auth.user?.id ?? null, userId);
  const chat = makeChatWithUser(auth.user?.id ?? null, userId, (requestId) => guardedOpenChat(requestId));
  const profile = state.profile;
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const ratingsPosY = useRef<number>(0);
  const scrollToRatings = useCallback(() => {
    if (ratingsPosY.current > 0) {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, ratingsPosY.current - 24), animated: true });
    }
  }, []);
  // Só exibe o link quando o valor gravado respeita o padrão do Instagram (regra do domínio).
  const instagramHandle = normalizeInstagramHandle(profile?.socialHandle)?.slice(1) ?? null;

  const chatButtonLabel = useMemo(() => {
    if (!profile?.name) return "Conversar";
    const trimmed = profile.name.trim();
    if (trimmed.length > 22) {
      const first = trimmed.split(" ")[0];
      if (first && first.length <= 15) {
        return `Conversar com ${first}`;
      }
      return "Conversar";
    }
    return `Conversar com ${trimmed}`;
  }, [profile?.name]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {/* 1. Barra Superior M3 Oficial com botão voltar e título padronizado */}
      <TopAppBar contentMaxWidth={wideWeb ? WEB_MAX_WIDTH : undefined} title="Perfil" onBack={guardedBack} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        {...standardVerticalScrollProps}
      >
        {state.loading ? (
          <LoadingState label="Carregando perfil" variant="publicProfile" />
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Tentar novamente" onPress={() => void actions.reload()} style={withPress(styles.retryButton)}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View style={styles.container}>
            {wideWeb ? (
              <Breadcrumb
                items={[
                  { label: "Início", onPress: guardedBack, accessibilityLabel: "Voltar para o início" },
                  { label: "Comunidade" },
                  { label: profile.name, isCurrent: true },
                ]}
                style={styles.breadcrumb}
              />
            ) : null}
            {/* 2. Identidade (Avatar 72px + Moldura Ipê + Nome em Serifa + Badges) */}
            <View style={styles.identitySection}>
              <View style={styles.avatarWrapper}>
                <Avatar name={profile.name} photoUrl={profile.photoUrl} size={72} />
              </View>
              <Text accessibilityRole="header" style={styles.name}>{profile.name}</Text>
              {isOwnProfile ? (
                <View style={styles.ownProfilePill}>
                  <AppIcon name="info" size={14} color={colors.nature.foliageDeep} />
                  <Text style={styles.ownProfilePillText}>Seu perfil público · visível em Piripiri</Text>
                </View>
              ) : null}
              <View style={styles.identityBadgesRow}>
                <View style={styles.locationBadge}>
                  <AppIcon name="place" size={13} color={colors.nature.foliage} />
                  <Text style={styles.locationBadgeText}>Piripiri, PI</Text>
                </View>
                {instagramHandle ? (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir Instagram @${instagramHandle}`}
                    accessibilityHint="Abre o Instagram desta pessoa no aplicativo ou navegador"
                    hitSlop={8}
                    onPress={() => void Linking.openURL(`https://instagram.com/${instagramHandle}`).catch(() => {})}
                    style={({ pressed }) => [styles.socialBadge, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.socialHandle}>{`@${instagramHandle}`}</Text>
                    <AppIcon name="chevronRight" size={12} color={colors.nature.foliage} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* 3. Métricas Compactas: Avaliação + Negociações lado a lado e Data de entrada em faixa única */}
            <View style={styles.statsRow}>
              <View style={styles.metricsPair}>
                {profile.ratingCount > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Avaliação média ${profile.averageRating?.toFixed(1)}. Ver avaliações da comunidade`}
                    accessibilityHint="Rola a tela até as avaliações recebidas por esta pessoa"
                    onPress={scrollToRatings}
                    style={withPress(styles.metricCard)}
                  >
                    <View style={styles.metricTopRow}>
                      <View style={[styles.cardLeadingBox, styles.cardLeadingBoxRating]}>
                        <View style={styles.ratingNumberRow}>
                          <Text style={[styles.statLargeValue, styles.statValueRating]}>
                            {profile.averageRating?.toFixed(1)}
                          </Text>
                          <AppIcon name="star" size={12} color={colors.highlight} />
                        </View>
                      </View>
                      <AppIcon name="chevronDown" size={16} color={colors.secondaryText} />
                    </View>
                    <Text style={styles.metricTitle}>
                      {`Avaliação média (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.metricCard}>
                    <View style={[styles.cardLeadingBox, styles.cardLeadingBoxRating]}>
                      <AppIcon name="star" size={20} color={colors.ipe.bloomDeep} />
                    </View>
                    <Text style={styles.metricTitle}>Sem avaliações ainda</Text>
                  </View>
                )}

                <View style={styles.metricCard}>
                  <View style={[styles.cardLeadingBox, styles.cardLeadingBoxTrades]}>
                    <Text style={[styles.statLargeValue, styles.statValueTrades]}>
                      {profile.completedNegotiations}
                    </Text>
                  </View>
                  <Text style={styles.metricTitle}>
                    {profile.completedNegotiations === 1 ? "Negociação concluída" : "Negociações concluídas"}
                  </Text>
                </View>
              </View>

              <View style={styles.joinedStrip}>
                <AppIcon name="calendar" size={16} color={colors.book.leather} />
                <Text style={styles.joinedStripText}>
                  {`Na comunidade desde ${formatJoinedAt(profile.joinedAt)}`}
                </Text>
              </View>
            </View>

            {/* 4. Ações Principais com Hierarquia M3 e Contraste Acessível */}
            {!isOwnProfile ? (
              <View style={styles.actionsSection}>
                <FilledButton
                  label={chatButtonLabel}
                  accessibilityLabel={`Conversar com ${profile.name}`}
                  loading={chat.busy}
                  onPress={() => {
                    if (Platform.OS === "ios") triggerHaptic("light");
                    void chat.start();
                  }}
                />
                {chat.notice ? (
                  <Text accessibilityRole="alert" style={styles.cardSubtitle}>
                    {chat.notice}
                  </Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Denunciar ou bloquear"
                  onPress={() => {
                    if (Platform.OS === "ios") triggerHaptic("light");
                    setSafetyOpen(true);
                  }}
                  style={withPress(styles.safetyButton)}
                >
                  <AppIcon name="flag" size={18} color={colors.error} />
                  <Text style={styles.safetyButtonText}>Denunciar ou bloquear</Text>
                </Pressable>
              </View>
            ) : null}

            {wideWeb ? (
              <View style={styles.wideBelow}>
                <View style={styles.wideBelowMain}>
                  <OwnerListings ownerId={userId} ownerName={profile.name} onOpenBook={guardedOpenBook} wideWeb={wideWeb} />
                </View>
                <View onLayout={(e) => { ratingsPosY.current = e.nativeEvent.layout.y; }}>
                  <UserRatingsPanel userId={userId} wideWeb={wideWeb} />
                </View>
              </View>
            ) : (
              <View style={styles.mobileBelow}>
                <OwnerListings ownerId={userId} ownerName={profile.name} onOpenBook={guardedOpenBook} wideWeb={wideWeb} />
                <View onLayout={(e) => { ratingsPosY.current = e.nativeEvent.layout.y; }}>
                  <UserRatingsPanel userId={userId} wideWeb={wideWeb} />
                </View>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
      {profile ? (
        <ProfileSafetySheet
          visible={safetyOpen}
          personName={profile.name}
          listings={safety.listings}
          loadingListings={safety.loadingListings}
          blocking={safety.blocking}
          error={safety.error}
          onLoadListings={() => void safetyActions.loadListings()}
          onReportListing={(listingId) => guardedReportListing(listingId)}
          onReportUser={() => guardedReportUser(userId, profile.name)}
          onConfirmBlock={() => {
            void safetyActions.block().then((ok) => {
              if (ok) {
                setSafetyOpen(false);
                guardedBack();
              }
            });
          }}
          onClose={() => {
            setSafetyOpen(false);
            safetyActions.clearError();
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

export default PublicProfile;

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    page: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: wideWeb ? WEB_GUTTER : tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[32],
      width: "100%",
      maxWidth: wideWeb ? WEB_MAX_WIDTH : 640,
      alignSelf: "center",
    },
    status: {
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingTop: tokens.spacing[48],
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
      textAlign: "center",
    },
    retryButton: {
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[24],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    retryText: {
      ...tokens.typography.bodyMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.bold,
    },
    container: {
      gap: tokens.spacing[12],
    },
    breadcrumb: {
      marginBottom: tokens.spacing[4],
    },
    wideBelow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    wideBelowMain: { flex: 1 },
    mobileBelow: {
      gap: tokens.spacing[16],
      marginTop: tokens.spacing[4],
    },
    identitySection: {
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[6],
    },
    avatarWrapper: {
      padding: 3,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.petalSoft,
      borderWidth: 1.5,
      borderColor: colors.ipe.bloom,
    },
    name: {
      ...tokens.typography.brandTitle,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[8],
      fontSize: 26,
      lineHeight: 32,
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    identityBadgesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[4],
      flexWrap: "wrap",
      justifyContent: "center",
    },
    locationBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.sprout,
      borderWidth: 1,
      borderColor: `${colors.nature.foliage}30`,
    },
    locationBadgeText: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.medium,
      color: colors.nature.foliageDeep,
    },
    socialBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    socialHandle: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.semiBold,
      color: colors.action,
    },
    statsRow: wideWeb ? { flexDirection: "row", alignItems: "stretch", gap: tokens.spacing[12] } : { gap: tokens.spacing[8] },
    metricsPair: {
      flex: wideWeb ? 2 : undefined,
      flexDirection: "row",
      gap: tokens.spacing[10],
    },
    metricCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      padding: tokens.spacing[12],
      gap: tokens.spacing[8],
      justifyContent: "space-between",
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    metricTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    metricTitle: {
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
      lineHeight: 18,
    },
    joinedStrip: {
      flex: wideWeb ? 1 : undefined,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[10],
    },
    joinedStripText: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.medium,
      color: colors.secondaryText,
      flexShrink: 1,
    },
    ownProfilePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.nature.sprout,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[4],
    },
    ownProfilePillText: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.medium,
      color: colors.nature.foliageDeep,
    },
    cardLeadingBox: {
      alignSelf: "flex-start",
      minWidth: 44,
      height: 36,
      paddingHorizontal: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      justifyContent: "center",
      alignItems: "center",
    },
    cardLeadingBoxRating: {
      minWidth: 54,
      backgroundColor: colors.ipe.container,
      borderWidth: 1,
      borderColor: colors.ipe.bloom,
    },
    cardLeadingBoxTrades: {
      backgroundColor: colors.nature.sprout,
      borderWidth: 1,
      borderColor: `${colors.nature.foliage}30`,
    },
    cardLeadingBoxCalendar: {
      backgroundColor: colors.book.pageCard,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    ratingNumberRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    statLargeValue: {
      fontSize: 20,
      lineHeight: 24,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      textAlign: "center",
    },
    statValueRating: {
      fontSize: 15,
      lineHeight: 18,
      color: colors.ipe.onContainer,
    },
    statValueTrades: {
      color: colors.nature.foliageDeep,
    },
    cardHeaderTextCol: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
    },
    cardSubtitle: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    ownProfileNoticeCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.nature.sprout,
      borderWidth: 1,
      borderColor: `${colors.nature.foliage}30`,
      marginTop: tokens.spacing[4],
    },
    ownProfileNoticeIcon: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    ownProfileNoticeText: {
      flex: 1,
      gap: 2,
    },
    ownProfileNoticeTitle: {
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.nature.foliageDeep,
    },
    ownProfileNoticeSubtitle: {
      ...tokens.typography.footnote,
      color: colors.nature.foliageDeep,
      lineHeight: 16,
    },
    // Web larga: botões lado a lado com largura do conteúdo, centralizados.
    actionsSection: {
      ...(wideWeb ? { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" } : null),
      gap: tokens.spacing[12],
      paddingTop: tokens.spacing[12],
    },
    safetyButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      backgroundColor: "transparent",
      paddingHorizontal: tokens.spacing[24],
    },
    safetyButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.error,
      fontWeight: tokens.fontWeight.semiBold,
    },
  });
}
