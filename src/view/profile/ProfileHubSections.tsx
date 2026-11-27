import * as Linking from "expo-linking";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { triggerHaptic } from "@/view/haptics";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, fontFamily, tokens } from "@/view/tokens";

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
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useOpaqueIosSurfaces();
  const iosGlass = isIos && !reduceTransparency;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.heroBlock,
        isIos && styles.iosNeutralSurface,
        wideWeb && styles.heroBlockWide,
      ]}
    >
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
                style={{ minHeight: Platform.OS === "ios" ? 44 : undefined, justifyContent: "center" }}
                onPress={() => void Linking.openURL(`https://instagram.com/${instagramHandle}`)}
              >
                <Text style={styles.identityHandle}>{`@${instagramHandle}`}</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar Instagram ao perfil"
                hitSlop={8}
                style={{ minHeight: Platform.OS === "ios" ? 44 : undefined, justifyContent: "center" }}
                onPress={onEditProfile}
              >
                <Text style={styles.identityHandleMuted}>Adicionar Instagram</Text>
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
          <Avatar name={name} photoUrl={photoUrl ?? undefined} size={104} />
        </View>
      </View>

      <View
        style={[
          styles.statsContainer,
          isIos && styles.iosStatsSurface,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Minhas publicações: ${totalPublications} ${totalPublications === 1 ? "publicação" : "publicações"}`}
          onPress={onMyListings}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.statNumber}>
            {totalPublications}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.statLabel}>
            {totalPublications === 1 ? "publicação" : "publicações"}
          </Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Trocas concluídas: ${completedTrocas} ${completedTrocas === 1 ? "troca" : "trocas"}`}
          onPress={onMeetingHistory}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.statNumber}>
            {completedTrocas}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.statLabel}>
            {completedTrocas === 1 ? "troca" : "trocas"}
          </Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Avaliações recebidas: ${ratingText}`}
          onPress={onRatings}
          style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.statNumber}>
            {ratingText === "—" ? ratingText : <><Text style={styles.ratingStar}>★</Text> {ratingText}</>}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.statLabel}>
            nota média
          </Text>
        </Pressable>
      </View>

      <View style={styles.primaryActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={() => {
            if (isIos) triggerHaptic("light");
            onEditProfile();
          }}
          style={({ pressed }) => [
            styles.editProfileButton,
            isIos && (iosGlass ? styles.iosGlassButton : styles.iosOpaqueButton),
            pressed && styles.editProfileButtonPressed,
          ]}
        >
          {iosGlass ? <IosGlassBackdrop isInteractive style={{ borderRadius: tokens.radius.full }} /> : null}
          <AppIcon name="edit" size={18} color={colors.m3.primary} />
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.editProfileButtonText}>
            Editar perfil
          </Text>
        </Pressable>

        {onCreateListing && !wideWeb ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Publicar um livro"
            onPress={() => {
              if (isIos) triggerHaptic("light");
              onCreateListing();
            }}
            style={({ pressed }) => [
              styles.publishButton,
              isIos && styles.iosPublishButton,
              iosGlass && styles.iosGlassPublishButton,
              pressed && styles.publishButtonPressed,
            ]}
          >
            {iosGlass ? (
              <IosGlassBackdrop
                tintColor={colors.m3.primary}
                isInteractive
                style={{ borderRadius: tokens.radius.full }}
              />
            ) : null}
            <AppIcon name="add" size={20} color={colors.m3.onPrimary} />
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.publishButtonText}>
              Publicar um livro
            </Text>
          </Pressable>
        ) : null}
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
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useOpaqueIosSurfaces();
  const iosGlass = isIos && !reduceTransparency;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.section, wideWeb && styles.sectionWide]}>
      <View
        style={[
          styles.cardGroup,
          isIos && styles.iosNeutralSurface,
          wideWeb && styles.cardGroupWide,
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionBloom} />
          <Text style={styles.sectionHeader}>{title}</Text>
        </View>
        <View style={styles.menuItemsList}>
          {items.map((item, index) => (
            <View key={item.key}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityHint={item.description}
                onPress={() => {
                  if (isIos) triggerHaptic("light");
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  isIos && styles.iosMenuRow,
                  pressed && styles.menuRowPressed,
                ]}
              >
                <View style={[styles.menuIconContainer, isIos && styles.iosMenuIconContainer]}>
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
        </View>

        {onSignOut ? (
          <View style={styles.signOutContainer}>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={onSignOut}
              style={({ pressed }) => [styles.menuRow, isIos && styles.iosMenuRow, pressed && styles.menuRowPressed]}
            >
              <View style={[styles.menuIconContainer, styles.signOutIconContainer]}>
                <AppIcon name="logout" size={20} color={colors.error} />
              </View>
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, styles.signOutText]}>Sair da conta</Text>
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  const isIos = Platform.OS === "ios";
  return StyleSheet.create({
    heroBlock: {
      width: "100%",
      position: "relative",
      overflow: "hidden",
      gap: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      padding: tokens.spacing[20],
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    heroBlockWide: {
      width: "100%",
      flex: 1,
      padding: tokens.spacing[24],
      justifyContent: "space-between",
    },
    iosNeutralSurface: {
      borderRadius: tokens.radius.xxl,
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderColor: colors.m3.outlineVariant,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09,
      shadowRadius: 12,
    },
    iosStatsSurface: {
      borderRadius: tokens.radius.large,
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderColor: colors.m3.outlineVariant,
    },
    iosGlassButton: {
      minHeight: 49,
      borderCurve: "continuous",
      backgroundColor: "transparent",
      borderColor: "transparent",
      shadowColor: "#2e2b21",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    iosPublishButton: {
      minHeight: 49,
      borderRadius: tokens.radius.full,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: tokens.ios.separator,
      shadowColor: "#2e2b21",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.17,
      shadowRadius: 7,
    },
    iosGlassShape: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.xxl,
      overflow: "hidden",
    },
    iosOpaqueButton: {
      backgroundColor: colors.m3.surfaceContainer,
      borderColor: tokens.ios.separator,
    },
    iosGlassStats: {
      borderCurve: "continuous",
      backgroundColor: "transparent",
      borderColor: tokens.ios.separator,
      overflow: "hidden",
    },
    iosGlassPublishButton: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      overflow: "hidden",
    },
    iosMenuRow: {
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    iosGlassMenuRow: {
      backgroundColor: "transparent",
    },
    iosGlassMenuRowPressed: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    iosMenuIconContainer: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.primaryContainer,
    },
    sectionWide: { flex: 1, minWidth: 300 },
    identityRow: {
      minHeight: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
    },
    identityText: { flex: 1, minWidth: 0, gap: tokens.spacing[6] },
    identityMetaRow: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: tokens.spacing[6],
    },
    profileName: {
      color: colors.brandBrown,
      fontFamily: fontFamily.brand,
      fontSize: 28,
      lineHeight: 34,
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
    identityHandleMuted: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.medium,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    locationText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    avatarFrame: {
      width: 112,
      height: 112,
      padding: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      borderWidth: 3,
      borderColor: colors.ipe.bloom,
      backgroundColor: colors.ipe.container,
      alignItems: "center",
      justifyContent: "center",
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      width: "100%",
      minHeight: 50,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[20],
    },
    editProfileButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.98 }],
    },
    editProfileButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    primaryActions: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: tokens.spacing[10],
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 84,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[8],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    statBox: {
      flex: 1,
      minWidth: 0,
      minHeight: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[2],
      paddingHorizontal: tokens.spacing[2],
      borderRadius: tokens.radius.small,
    },
    statBoxPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    statDivider: {
      width: 1,
      height: tokens.spacing[32],
      backgroundColor: colors.ipe.bloom,
      opacity: isIos ? 1 : 0.65,
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
      width: "100%",
      minHeight: 50,
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
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[18],
      paddingBottom: tokens.spacing[12],
      borderBottomWidth: 1,
      borderBottomColor: colors.book.paperEdge,
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
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      overflow: "hidden",
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    cardGroupWide: {
      flex: 1,
    },
    menuItemsList: {
      flexGrow: 0,
    },
    signOutContainer: {
      marginTop: "auto",
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      opacity: isIos ? 0.7 : 0.35,
      marginLeft: isIos ? 68 : 76,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
      paddingHorizontal: tokens.spacing[20],
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
