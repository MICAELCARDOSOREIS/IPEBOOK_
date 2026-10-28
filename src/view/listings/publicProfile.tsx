import { useMemo, useState } from "react";
import * as Linking from "expo-linking";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useChatWithUser } from "@/viewmodel/useChatWithUser";
import { useProfileSafetyViewModel } from "@/viewmodel/useProfileSafetyViewModel";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { ProfileSafetySheet } from "@/view/listings/profileSafetySheet";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { OwnerListings } from "@/view/listings/ownerListings";
import { UserRatingsPanel } from "@/view/listings/userRatingsPanel";
import { useIsWideWeb } from "@/view/useIsWideWeb";

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
  const wideWeb = useIsWideWeb();
  const [state, actions] = usePublicProfileViewModel(userId);
  const [auth] = useAuthViewModel();
  // No próprio perfil não faz sentido conversar consigo nem se denunciar
  const isOwnProfile = Boolean(auth.user?.id) && auth.user?.id === userId;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safety, safetyActions] = useProfileSafetyViewModel(auth.user?.id ?? null, userId);
  const chat = useChatWithUser(auth.user?.id ?? null, userId, (requestId) => onOpenChat?.(requestId));
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
      <TopAppBar contentMaxWidth={wideWeb ? 1000 : undefined} title="Perfil" onBack={() => onBack?.()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando perfil" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void actions.reload()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View style={styles.container}>
            {/* 2. Identidade (Avatar 80px + Nome em Serifa + Subtítulo) */}
            <View style={styles.identitySection}>
              <Avatar name={profile.name} photoUrl={profile.photoUrl} size={80} />
              <Text accessibilityRole="header" style={styles.name}>{profile.name}</Text>
              <Text style={styles.subtitle}>Conheça a pessoa antes de combinar.</Text>
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

            {/* 3. Cards Informativos Padronizados com Superfície M3 */}
            {/* Card 1: Avaliações */}
            <View style={styles.infoCard}>
              <View style={styles.cardLeadingBox}>
                {profile.ratingCount > 0 ? (
                  <View style={styles.ratingNumberRow}>
                    <Text style={styles.statLargeValue}>
                      {profile.averageRating?.toFixed(1)}
                    </Text>
                    <AppIcon name="star" size={12} color={colors.highlight} />
                  </View>
                ) : (
                  <AppIcon name="star" size={24} color={colors.secondaryText} />
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
              <View style={styles.cardLeadingBox}>
                <Text style={styles.statLargeValue}>{profile.completedNegotiations}</Text>
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
              <View style={styles.cardLeadingBox}>
                <AppIcon name="calendar" size={24} color={colors.m3.primary} />
              </View>
              <View style={styles.cardHeaderTextCol}>
                <Text style={styles.cardTitle}>
                  {`Na comunidade desde ${formatJoinedAt(profile.joinedAt)}`}
                </Text>
                <Text style={styles.cardSubtitle}>Piripiri, Piauí</Text>
              </View>
            </View>

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
                style={styles.safetyButton}
              >
                <AppIcon name="flag" size={18} color={colors.error} />
                <Text style={styles.safetyButtonText}>Denunciar ou bloquear</Text>
              </Pressable>
            </View>
            ) : null}
            {wideWeb ? (
              <View style={styles.wideBelow}>
                <View style={styles.wideBelowMain}>
                  <OwnerListings ownerId={userId} ownerName={profile.name} onOpenBook={onOpenBook} />
                </View>
                <UserRatingsPanel userId={userId} />
              </View>
            ) : null}
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
          onReportListing={(listingId) => onReportListing?.(listingId)}
          onReportUser={() => onReportUser?.(userId, profile.name)}
          onConfirmBlock={() => {
            void safetyActions.block().then((ok) => {
              if (ok) {
                setSafetyOpen(false);
                onBack?.();
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
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[32],
      maxWidth: wideWeb ? 1000 : 720,
      width: "100%",
      alignSelf: "center",
    },
    status: {
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingTop: tokens.spacing[48],
    },
    errorText: {
      fontSize: tokens.typography.bodyMedium.fontSize,
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
      fontSize: tokens.typography.bodyMedium.fontSize,
      color: colors.action,
      fontWeight: "bold",
    },
    container: {
      gap: tokens.spacing[16],
    },
    wideBelow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    wideBelowMain: { flex: 1 },
    identitySection: {
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[16],
    },
    name: {
      fontFamily: fontFamily.brand,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[8],
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.secondaryText,
      textAlign: "center",
    },
    socialBadge: {
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      marginTop: tokens.spacing[4],
    },
    socialHandle: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.action,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    cardLeadingBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.m3.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    ratingNumberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    statLargeValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    cardHeaderTextCol: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    actionsSection: {
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
      fontWeight: "600",
    },
  });
}
