import { useMemo, useState } from "react";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
            {/* 2. Identidade (Avatar 84px + Moldura Ipê + Nome em Serifa + Badges) */}
            <View style={styles.identitySection}>
              <View style={styles.avatarWrapper}>
                <Avatar name={profile.name} photoUrl={profile.photoUrl} size={84} />
              </View>
              <Text accessibilityRole="header" style={styles.name}>{profile.name}</Text>
              <Text style={styles.subtitle}>Conheça a pessoa antes de combinar.</Text>
              <View style={styles.identityBadgesRow}>
                <View style={styles.locationBadge}>
                  <AppIcon name="place" size={13} color={colors.nature.foliage} />
                  <Text style={styles.locationBadgeText}>Piripiri, PI</Text>
                </View>
                {instagramHandle ? (
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir Instagram @${instagramHandle}`}
                    hitSlop={8}
                    onPress={() => void Linking.openURL(`https://instagram.com/${instagramHandle}`).catch(() => {})}
                    style={({ pressed }) => [styles.socialBadge, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.socialHandle}>{`@${instagramHandle}`}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* 3. Cards Informativos Padronizados com Superfície M3 e Identidade Ipê */}
            {/* Na web larga os três cartões ficam lado a lado, sem esticar pela largura toda. */}
            <View style={styles.statsRow}>
              {/* Card 1: Avaliações */}
              <View style={styles.infoCard}>
                <View style={[styles.cardLeadingBox, styles.cardLeadingBoxRating]}>
                  {profile.ratingCount > 0 ? (
                    <View style={styles.ratingNumberRow}>
                      <Text style={[styles.statLargeValue, styles.statValueRating]}>
                        {profile.averageRating?.toFixed(1)}
                      </Text>
                      <AppIcon name="star" size={12} color={colors.highlight} />
                    </View>
                  ) : (
                    <AppIcon name="star" size={22} color={colors.ipe.bloomDeep} />
                  )}
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardTitle}>
                    {profile.ratingCount > 0
                      ? `Avaliação média (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                      : "Sem avaliações ainda"}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {profile.ratingCount > 0 ? "Avaliação da comunidade em Piripiri" : "Novo membro no IpêBook"}
                  </Text>
                </View>
              </View>

              {/* Card 2: Negociações Concluídas */}
              <View style={styles.infoCard}>
                <View style={[styles.cardLeadingBox, styles.cardLeadingBoxTrades]}>
                  <Text style={[styles.statLargeValue, styles.statValueTrades]}>{profile.completedNegotiations}</Text>
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardTitle}>
                    {profile.completedNegotiations === 1 ? "Negociação concluída" : "Negociações concluídas"}
                  </Text>
                  <Text style={styles.cardSubtitle}>Livros trocados, vendidos ou doados com sucesso</Text>
                </View>
              </View>

              {/* Card 3: Tempo de Comunidade */}
              <View style={styles.infoCard}>
                <View style={[styles.cardLeadingBox, styles.cardLeadingBoxCalendar]}>
                  <AppIcon name="calendar" size={22} color={colors.book.leather} />
                </View>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardTitle}>
                    {`Na comunidade desde ${formatJoinedAt(profile.joinedAt)}`}
                  </Text>
                  <Text style={styles.cardSubtitle}>Piripiri, Piauí</Text>
                </View>
              </View>
            </View>

            {/* Aviso acolhedor quando for o próprio perfil */}
            {isOwnProfile ? (
              <View style={styles.ownProfileNoticeCard}>
                <View style={styles.ownProfileNoticeIcon}>
                  <AppIcon name="info" size={18} color={colors.nature.foliage} />
                </View>
                <View style={styles.ownProfileNoticeText}>
                  <Text style={styles.ownProfileNoticeTitle}>Seu perfil público</Text>
                  <Text style={styles.ownProfileNoticeSubtitle}>
                    É assim que outros leitores de Piripiri visualizam você na comunidade.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* 4. Ações Principais com Hierarquia M3 e Contraste Acessível */}
            {!isOwnProfile ? (
              <View style={styles.actionsSection}>
                <FilledButton
                  label={chatButtonLabel}
                  accessibilityLabel={`Conversar com ${profile.name}`}
                  loading={chat.busy}
                  onPress={() => void chat.start()}
                />
                {chat.notice ? (
                  <Text accessibilityRole="alert" style={styles.cardSubtitle}>
                    {chat.notice}
                  </Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Denunciar ou bloquear"
                  onPress={() => setSafetyOpen(true)}
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
                  <OwnerListings ownerId={userId} ownerName={profile.name} onOpenBook={guardedOpenBook} />
                </View>
                <UserRatingsPanel userId={userId} wideWeb={wideWeb} />
              </View>
            ) : (
              <View style={styles.mobileBelow}>
                <OwnerListings ownerId={userId} ownerName={profile.name} onOpenBook={guardedOpenBook} />
                <UserRatingsPanel userId={userId} wideWeb={wideWeb} />
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
      gap: tokens.spacing[16],
    },
    breadcrumb: {
      marginBottom: tokens.spacing[4],
    },
    wideBelow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    wideBelowMain: { flex: 1 },
    mobileBelow: {
      gap: tokens.spacing[16],
      marginTop: tokens.spacing[8],
    },
    identitySection: {
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[12],
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
      borderColor: colors.m3.outlineVariant,
    },
    socialHandle: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.semiBold,
      color: colors.action,
    },
    statsRow: wideWeb ? { flexDirection: "row", gap: tokens.spacing[16] } : { gap: tokens.spacing[10] },
    infoCard: {
      flex: wideWeb ? 1 : undefined,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[14],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    cardLeadingBox: {
      width: 48,
      height: 48,
      borderRadius: tokens.radius.medium,
      justifyContent: "center",
      alignItems: "center",
    },
    cardLeadingBoxRating: {
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
      borderColor: colors.m3.outlineVariant,
    },
    ratingNumberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[2],
    },
    statLargeValue: {
      ...tokens.typography.titleLarge,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.bold,
      color: colors.text,
      textAlign: "center",
    },
    statValueRating: {
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
      borderColor: colors.m3.outlineVariant,
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
