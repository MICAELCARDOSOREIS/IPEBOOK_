import * as Linking from "expo-linking";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ipeFrame from "@/view/assets/moldura-ipe-perfil.png";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";

export type ProfileMenuItem = {
  key: string;
  icon: AppIconName;
  iconColor?: string;
  label: string;
  description?: string;
  badgeCount?: number;
  onPress: () => void;
  showChevron?: boolean;
};

export type ProfileIdentityCardProps = {
  name: string;
  photoUrl?: string | null;
  neighborhood?: string | null;
  instagramHandle: string | null;
  totalPublications: number;
  completedTrocas: number;
  ratingText: string;
  wideWeb?: boolean;
  onEditProfile: () => void;
  onCreateListing?: () => void;
  onMyListings: () => void;
  onMeetingHistory: () => void;
  onRatings: () => void;
};

/**
 * Cartão de identidade, métricas e ações principais do hub Meu Perfil.
 */
export function ProfileIdentityCard({
  name,
  photoUrl,
  neighborhood,
  instagramHandle,
  totalPublications,
  completedTrocas,
  ratingText,
  wideWeb = false,
  onEditProfile,
  onCreateListing,
  onMyListings,
  onMeetingHistory,
  onRatings,
}: ProfileIdentityCardProps) {
  const { colors, resolvedScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.heroBlock, wideWeb && styles.heroBlockWide]}>
      <View style={styles.identityRow}>
        <View style={styles.identityText}>
          <Text accessibilityRole="header" style={styles.profileName} numberOfLines={2}>
            {name}
          </Text>
          <View style={styles.identityMetaRow}>
            {instagramHandle ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Abrir Instagram @${instagramHandle}`}
                hitSlop={8}
                onPress={() => void Linking.openURL(`https://instagram.com/${instagramHandle}`)}
              >
                <Text style={styles.identityHandle}>{`@${instagramHandle}`}</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar Instagram ao perfil"
                hitSlop={8}
                onPress={onEditProfile}
              >
                <Text style={styles.identityHandleAction}>Adicionar Instagram</Text>
              </Pressable>
            )}
            <View style={styles.locationRow}>
              <AppIcon name="place" size={16} color={colors.m3.onSurfaceVariant} />
              <Text style={styles.locationText}>
                {neighborhood ? `${neighborhood}, Piripiri` : "Piripiri, PI"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.avatarFrame}>
          <Avatar name={name} photoUrl={photoUrl ?? undefined} size={92} />
          <Image
            source={ipeFrame}
            accessibilityElementsHidden
            pointerEvents="none"
            resizeMode="contain"
            style={styles.avatarIpeFrame}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Minhas publicações: ${totalPublications} ${totalPublications === 1 ? "publicação" : "publicações"}`}
          onPress={onMyListings}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text style={styles.statNumber}>{totalPublications}</Text>
          <Text style={styles.statLabel}>{totalPublications === 1 ? "publicação" : "publicações"}</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Trocas concluídas: ${completedTrocas} ${completedTrocas === 1 ? "troca" : "trocas"}`}
          onPress={onMeetingHistory}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text style={styles.statNumber}>{completedTrocas}</Text>
          <Text style={styles.statLabel}>{completedTrocas === 1 ? "troca" : "trocas"}</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Avaliações recebidas: ${ratingText}`}
          onPress={onRatings}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text style={styles.statNumber}>
            {ratingText === "—" ? ratingText : <><Text style={styles.ratingStar}>★</Text> {ratingText}</>}
          </Text>
          <Text style={styles.statLabel}>nota média</Text>
        </Pressable>
      </View>

      <View style={styles.primaryActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={onEditProfile}
          style={({ pressed }) => [
            styles.editProfileButton,
            resolvedScheme === "dark" && styles.editProfileButtonDark,
            pressed && styles.editProfileButtonPressed,
          ]}
        >
          <AppIcon name="edit" size={18} color={colors.m3.primary} />
          <Text style={styles.editProfileButtonText}>Editar perfil</Text>
        </Pressable>

        {onCreateListing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Publicar um livro"
            onPress={onCreateListing}
            style={({ pressed }) => [styles.publishButton, pressed && styles.publishButtonPressed]}
          >
            <AppIcon name="add" size={20} color={colors.m3.onPrimary} />
            <Text style={styles.publishButtonText}>Publicar um livro</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export type ProfileCommunityBadgesProps = {
  neighborhood?: string | null;
  completedTrocas: number;
  totalPublications: number;
  wideWeb?: boolean;
};

/**
 * Selos Comunitários de Piripiri (Spec 122).
 */
export function ProfileCommunityBadges({
  neighborhood,
  completedTrocas,
  totalPublications,
  wideWeb = false,
}: ProfileCommunityBadgesProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.badgesSection, wideWeb && styles.badgesSectionWide]} testID="profile-badges-section">
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionBloom} />
        <Text accessibilityRole="header" style={styles.sectionHeader}>Selos Comunitários de Piripiri</Text>
      </View>
      <View style={styles.badgesRow}>
        <View
          style={styles.badgeItem}
          accessibilityRole="text"
          accessibilityLabel={`Selo Leitor de Piripiri: ${neighborhood || "Comunidade"}`}
        >
          <View style={[styles.badgeIconBox, { backgroundColor: colors.nature.sprout }]}>
            <AppIcon name="place" size={20} color={colors.nature.foliage} />
          </View>
          <Text style={styles.badgeTitle} numberOfLines={2}>Leitor de Piripiri</Text>
          <Text style={styles.badgeDesc} numberOfLines={2}>{neighborhood || "Comunidade"}</Text>
        </View>

        <View
          style={styles.badgeItem}
          accessibilityRole="text"
          accessibilityLabel={`Selo Ponto Seguro: ${completedTrocas} ${completedTrocas === 1 ? "encontro realizado" : "encontros realizados"}`}
        >
          <View style={[styles.badgeIconBox, { backgroundColor: colors.m3.secondaryContainer }]}>
            <AppIcon name="checkCircle" size={20} color={colors.action} />
          </View>
          <Text style={styles.badgeTitle} numberOfLines={2}>Ponto Seguro</Text>
          <Text style={styles.badgeDesc} numberOfLines={2}>
            {completedTrocas > 0 ? `${completedTrocas} ${completedTrocas === 1 ? "concluído" : "concluídos"}` : "Locais públicos"}
          </Text>
        </View>

        <View
          style={styles.badgeItem}
          accessibilityRole="text"
          accessibilityLabel={`Selo Estante Ativa: ${totalPublications} ${totalPublications === 1 ? "livro publicado" : "livros publicados"}`}
        >
          <View style={[styles.badgeIconBox, { backgroundColor: colors.ipe.container }]}>
            <AppIcon name="shelf" size={20} color={colors.ipe.onContainer} />
          </View>
          <Text style={styles.badgeTitle} numberOfLines={2}>Estante Ativa</Text>
          <Text style={styles.badgeDesc} numberOfLines={2}>
            {totalPublications > 0 ? `${totalPublications} ${totalPublications === 1 ? "obra" : "obras"}` : "Compartilhe"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export type ProfileMenuSectionProps = {
  title: string;
  items: readonly ProfileMenuItem[];
  wideWeb?: boolean;
  defaultIconColor?: string;
  onSignOut?: () => void;
};

/**
 * Seção de atalhos do Meu Perfil ("Atividade" / "Conta").
 */
export function ProfileMenuSection({
  title,
  items,
  wideWeb = false,
  defaultIconColor,
  onSignOut,
}: ProfileMenuSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.section, wideWeb && styles.sectionWide]}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionBloom} />
        <Text style={styles.sectionHeader}>{title}</Text>
      </View>
      <View style={styles.cardGroup}>
        {items.map((item, index) => (
          <View key={item.key}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityHint={item.description}
              onPress={item.onPress}
              style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            >
              <View style={styles.menuIconContainer}>
                <AppIcon name={item.icon} size={20} color={item.iconColor ?? defaultIconColor ?? colors.m3.onSurface} />
              </View>
              <View style={styles.menuRowText}>
                <Text style={styles.menuRowTitle}>{item.label}</Text>
                {item.description ? (
                  <Text style={styles.menuRowDescription}>{item.description}</Text>
                ) : null}
              </View>
              {item.badgeCount && item.badgeCount > 0 ? (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </Text>
                </View>
              ) : null}
              {item.showChevron ? (
                <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
              ) : null}
            </Pressable>
            {index < items.length - 1 ? <View style={styles.menuDivider} /> : null}
          </View>
        ))}

        {onSignOut ? (
          <>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={onSignOut}
              style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            >
              <View style={[styles.menuIconContainer, styles.signOutIconContainer]}>
                <AppIcon name="logout" size={20} color={colors.error} />
              </View>
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, styles.signOutText]}>Sair da conta</Text>
              </View>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    heroBlock: {
      width: "100%",
      position: "relative",
      overflow: "hidden",
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      padding: tokens.spacing[16],
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    heroBlockWide: { width: "100%" },
    badgesSectionWide: { width: "100%", marginTop: 0 },
    sectionWide: { flex: 1, minWidth: 260 },
    identityRow: {
      minHeight: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
    },
    identityText: { flex: 1, minWidth: 0, gap: tokens.spacing[4] },
    identityMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      columnGap: tokens.spacing[12],
      rowGap: tokens.spacing[4],
    },
    profileName: {
      color: colors.brandBrown,
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      fontWeight: tokens.fontWeight.bold,
    },
    identityHandle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
    },
    identityHandleAction: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.primary,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[2],
    },
    locationText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    avatarFrame: {
      width: 116,
      height: 116,
      position: "relative",
      padding: tokens.spacing[3],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarIpeFrame: {
      position: "absolute",
      top: -10,
      left: -10,
      width: 136,
      height: 136,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
    },
    editProfileButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.98 }],
    },
    editProfileButtonDark: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    editProfileButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    primaryActions: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: tokens.spacing[8],
    },
    badgesSection: {
      width: "100%",
      marginTop: tokens.spacing[8],
    },
    badgesRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[8],
    },
    badgeItem: {
      flex: 1,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      paddingVertical: tokens.spacing[14],
      paddingHorizontal: tokens.spacing[6],
      minHeight: 110,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[4],
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    badgeIconBox: {
      width: 42,
      height: 42,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[4],
    },
    badgeTitle: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    badgeDesc: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 84,
      marginTop: 0,
      paddingVertical: tokens.spacing[4],
    },
    statBox: {
      flex: 1,
      minWidth: 0,
      minHeight: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[2],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.small,
    },
    statBoxPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    statDivider: {
      width: 1,
      height: tokens.spacing[32],
      backgroundColor: colors.ipe.bloom,
      opacity: 0.65,
    },
    statNumber: {
      fontFamily: fontFamily.brand,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: tokens.fontWeight.bold,
      color: colors.brandBrown,
    },
    ratingStar: {
      color: colors.ipe.bloomDeep,
    },
    statLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    publishButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.shapeMorph.buttonRest,
      backgroundColor: colors.m3.primary,
      paddingHorizontal: tokens.spacing[20],
    },
    publishButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      opacity: 0.88,
    },
    publishButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onPrimary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    section: {
      gap: tokens.spacing[4],
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
    },
    sectionBloom: {
      width: 4,
      height: 16,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.bloom,
    },
    sectionHeader: {
      ...tokens.typography.labelLarge,
      fontSize: 15,
      lineHeight: 20,
      color: colors.brandBrown,
      fontWeight: tokens.fontWeight.bold,
    },
    cardGroup: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      overflow: "hidden",
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      opacity: 0.35,
      marginLeft: 72,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
    },
    menuRowPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    signOutIconContainer: {
      backgroundColor: colors.errorContainer,
    },
    menuRowText: { flex: 1, gap: tokens.spacing[2] },
    menuRowTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.medium,
      color: colors.m3.onSurface,
    },
    menuRowDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    signOutText: {
      color: colors.error,
      fontWeight: tokens.fontWeight.semiBold,
    },
    menuBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[6],
      marginRight: tokens.spacing[4],
    },
    menuBadgeText: {
      ...tokens.typography.badgeMicro,
      color: colors.surface,
      fontWeight: "700",
    },
  });
}
