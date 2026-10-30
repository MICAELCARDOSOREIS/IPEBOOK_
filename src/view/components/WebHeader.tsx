import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import type { NavigationDestination } from "@/view/components/NavigationBar";

import { withPress } from "@/view/pressFeedback";
export type WebHeaderProps = {
  active?: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  onAnnounce: () => void;
  /** Iniciais para o avatar; sem sessão o avatar leva ao perfil (que oferece entrar). */
  initials?: string;
  badgeCount?: number;
  /** Abre as notificações; sem ele o sino não aparece. */
  onOpenNotifications?: () => void;
  /** Notificações não lidas, mostradas como selo no sino. */
  notificationCount?: number;
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
  badgeCount = 0,
  onOpenNotifications,
  notificationCount = 0,
}: WebHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Acompanha a coluna de conteúdo das telas: margem fixa, e centralizado em janelas muito largas.
  const { width } = useWindowDimensions();
  const sideInset = Math.round(Math.max(0, width - WEB_MAX_WIDTH) / 2) + WEB_GUTTER;
  // Janelas médias (tablet, notebook pequeno): vãos menores para tudo caber sem cortar o avatar.
  const compact = width < 1280;

  return (
    <View accessibilityRole="header" testID="web-header" style={[styles.bar, { paddingHorizontal: sideInset }, compact && styles.barCompact]}>
      <Pressable accessibilityRole="link" accessibilityLabel="IpêBook, ir para o início" onPress={() => onNavigate("home")}>
        <Text style={styles.brand}>IpêBook</Text>
      </Pressable>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Buscar título, autor ou categoria"
        onPress={() => onNavigate("search")}
        style={withPress(styles.search)}
      >
        <Text numberOfLines={1} style={styles.searchText}>Buscar título, autor ou categoria</Text>
        <AppIcon name="search" size={20} color={colors.m3.onSurfaceVariant} />
      </Pressable>

      <View style={styles.spacer} />

      <View accessibilityRole="tablist" style={styles.links}>
        {LINKS.map((link) => {
          const isActive = link.key === active;
          return (
            <Pressable
              key={link.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onNavigate(link.key)}
              style={withPress(styles.link)}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{link.label}</Text>
              {isActive ? <View style={styles.linkUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Anunciar um livro" onPress={onAnnounce} style={withPress(styles.announce)}>
        <AppIcon name="add" size={20} color={colors.m3.onPrimary} />
        <Text style={styles.announceText}>Anunciar</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={badgeCount > 0 ? `Conversas, ${badgeCount} com proposta` : "Conversas"}
        onPress={() => onNavigate("conversations")}
        style={withPress(styles.iconButton)}
      >
        <AppIcon name="chat" size={24} color={colors.m3.onSurface} />
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
          onPress={onOpenNotifications}
          style={withPress(styles.iconButton)}
        >
          <AppIcon name="bell" size={24} color={colors.m3.onSurface} />
          {notificationCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Meu perfil" onPress={() => onNavigate("profile")} style={withPress(styles.avatar)}>
        {initials ? <Text style={styles.avatarText}>{initials}</Text> : <AppIcon name="person" size={20} color={colors.m3.onPrimaryContainer} />}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[28],
      height: 72,
      paddingHorizontal: tokens.spacing[80],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    brand: { ...tokens.typography.brandTitle, letterSpacing: tokens.letterSpacing.brandTight, color: colors.brandBrown },
    search: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[10],
      flexShrink: 1,
      minWidth: 160,
      width: 520,
      maxWidth: "40%",
      height: 48,
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    searchText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
    spacer: { flex: 1 },
    barCompact: { gap: tokens.spacing[16] },
    countBadge: {
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
    countBadgeText: { ...tokens.typography.badgeMicro, color: colors.badge.completed.text },
    links: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[24], height: "100%" },
    link: { height: "100%", justifyContent: "center" },
    linkText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    linkTextActive: { color: colors.m3.onSurface },
    linkUnderline: { position: "absolute", left: 0, right: 0, bottom: 0, height: 3, backgroundColor: colors.m3.primary },
    announce: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      height: 40,
      paddingLeft: tokens.spacing[16],
      paddingRight: tokens.spacing[20],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
    },
    announceText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary },
    iconButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    dot: { position: "absolute", top: 10, right: 10, width: 10, height: 10, borderRadius: tokens.radius.dot, backgroundColor: colors.error },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.primaryContainer,
    },
    avatarText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimaryContainer },
  });
}

export default WebHeader;
