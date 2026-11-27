import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import type { NavigationDestination } from "@/view/components/NavigationBar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { withPress } from "@/view/pressFeedback";
import { useHydratedWindowWidth } from "@/view/useIsWideWeb";
export type WebHeaderProps = {
  active?: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  onAnnounce: () => void;
  /** Iniciais para o avatar; sem sessão o avatar leva ao perfil (que oferece entrar). */
  initials?: string;
  /** Foto do perfil público; quando há, substitui as iniciais. */
  photoUrl?: string;
  badgeCount?: number;
  /** Abre as notificações; sem ele o sino não aparece. */
  onOpenNotifications?: () => void;
  /** Notificações não lidas, mostradas como selo no sino. */
  notificationCount?: number;
  /** Busca de verdade: recebe o termo digitado e abre a Pesquisa já filtrada por ele. */
  onSearch?: (term: string) => void;
};

const LINKS: ReadonlyArray<{ key: NavigationDestination; label: string }> = [
  { key: "home", label: "Início" },
  { key: "search", label: "Pesquisa" },
  { key: "shelf", label: "Estante" },
];

/** Cabeçalho Web do Figma `34:70` (desktop e tablet): marca, busca, atalhos, Anunciar, conversas e avatar. */
export function WebHeader({
  active,
  onNavigate,
  onAnnounce,
  initials = "",
  photoUrl,
  badgeCount = 0,
  onOpenNotifications,
  notificationCount = 0,
  onSearch,
}: WebHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Alinha ao recuo lateral padronizado das telas na web larga (WEB_GUTTER = 64 px, como em Boas-vindas e Beta).
  const width = useHydratedWindowWidth();
  const sideInset = width >= 960 ? WEB_GUTTER : tokens.spacing[16];
  // Janelas médias (tablet, notebook pequeno): vãos menores para tudo caber sem cortar o avatar.
  const compact = width < 1280;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const guardedNavigate = useGuardedPress(onNavigate);
  const submitSearch = () => {
    const term = searchTerm.trim();
    if (onSearch && term) onSearch(term);
    else guardedNavigate("search");
  };
  const guardedAnnounce = useGuardedPress(onAnnounce);
  const guardedOpenNotifications = useGuardedPress(onOpenNotifications);

  return (
    <View role="banner" testID="web-header" style={[styles.bar, { paddingHorizontal: sideInset }]}>
      <View style={[styles.inner, compact && styles.innerCompact]}>
        <Link href="/" replace asChild>
          <Pressable accessibilityLabel="IpêBook, ir para o início" style={withPress(styles.brandLink)}>
            <Text style={styles.brand}>IpêBook</Text>
          </Pressable>
        </Link>

        {active !== "search" ? (
          <View style={[styles.search, searchFocused && styles.searchFocused]} testID="web-header-search">
            <AppIcon name="search" size={20} color={searchFocused ? colors.m3.primary : colors.m3.onSurfaceVariant} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={submitSearch}
              placeholder="Buscar título, autor ou categoria"
              placeholderTextColor={colors.m3.onSurfaceVariant}
              accessibilityLabel="Buscar título, autor ou categoria"
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>
        ) : null}

        <View style={styles.spacer} />

        <View accessibilityRole="tablist" style={styles.links}>
          {LINKS.map((link) => {
            const isActive = link.key === active;
            return (
              <Pressable
                key={link.key}
                accessibilityRole="tab"
                accessibilityLabel={link.label}
                accessibilityState={{ selected: isActive }}
                onPress={() => guardedNavigate(link.key)}
                style={withPress([styles.link, isActive && styles.linkActive])}
              >
                <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{link.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Anunciar um livro" onPress={guardedAnnounce} style={withPress(styles.announce)}>
          <AppIcon name="add" size={18} color={colors.m3.onPrimary} />
          <Text style={styles.announceText}>Anunciar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={badgeCount > 0 ? `Conversas, ${badgeCount} com proposta` : "Conversas"}
          onPress={() => guardedNavigate("conversations")}
          style={withPress(styles.iconButton)}
        >
          <AppIcon name="chat" size={22} color={colors.m3.onSurface} />
          {badgeCount > 0 ? <View style={styles.dot} /> : null}
        </Pressable>

        {onOpenNotifications ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              notificationCount > 0
                ? `Abrir notificações, ${notificationCount} ${notificationCount === 1 ? "não lida" : "não lidas"}`
                : "Abrir notificações"
            }
            onPress={guardedOpenNotifications}
            style={withPress(styles.iconButton)}
          >
            <AppIcon name="bell" size={22} color={colors.m3.onSurface} />
            {notificationCount > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}

        <Pressable accessibilityRole="button" accessibilityLabel="Meu perfil" onPress={() => guardedNavigate("profile")} style={withPress(styles.avatar)}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} accessibilityElementsHidden style={styles.avatarPhoto} />
          ) : initials ? (
            <Text style={styles.avatarText}>{initials}</Text>
          ) : (
            <AppIcon name="person" size={20} color={colors.brandBrown} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  const webPointer =
    Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as object) : {};
  return StyleSheet.create({
    bar: {
      height: 72,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.book.paperEdge,
      justifyContent: "center",
      width: "100%",
    },
    inner: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[20],
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
    },
    innerCompact: {
      gap: tokens.spacing[12],
    },
    brandLink: {
      paddingVertical: tokens.spacing[4],
      ...webPointer,
    },
    brand: { ...tokens.typography.brandTitle, letterSpacing: tokens.letterSpacing.brandTight, color: colors.brandBrown },
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      flexShrink: 1,
      minWidth: 220,
      width: 520,
      maxWidth: "38%",
      height: 44,
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outline,
    },
    searchFocused: {
      borderColor: colors.m3.primary,
      borderWidth: 1.5,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    searchInput: {
      ...tokens.typography.bodyMedium,
      flex: 1,
      minWidth: 0,
      height: "100%",
      color: colors.m3.onSurface,
      // 16 px evita o zoom involuntário do Safari ao focar o campo (Spec 136).
      fontSize: 16,
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : {}),
    },
    spacer: { flex: 1 },
    countBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    countBadgeText: { ...tokens.typography.badgeMicro, color: colors.badge.completed.text },
    links: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    link: {
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      ...webPointer,
    },
    linkActive: {
      backgroundColor: colors.soft,
    },
    linkText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    linkTextActive: { color: colors.actionDeep, fontWeight: tokens.fontWeight.bold },
    announce: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      height: 40,
      paddingLeft: tokens.spacing[14],
      paddingRight: tokens.spacing[18],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
      ...webPointer,
    },
    announceText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary, fontWeight: tokens.fontWeight.semiBold },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      ...webPointer,
    },
    dot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: tokens.radius.dot, backgroundColor: colors.error },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.ipe.petalSoft,
      borderWidth: 1.5,
      borderColor: colors.ipe.bloom,
      ...webPointer,
    },
    avatarText: { ...tokens.typography.labelLarge, color: colors.brandBrown, fontWeight: tokens.fontWeight.bold },
    avatarPhoto: { width: 40, height: 40, borderRadius: tokens.radius.full },
  });
}

export default WebHeader;
