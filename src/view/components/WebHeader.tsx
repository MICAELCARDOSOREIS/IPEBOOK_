import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import type { NavigationDestination } from "@/view/components/NavigationBar";

export type WebHeaderProps = {
  active?: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  onAnnounce: () => void;
  /** Iniciais para o avatar; sem sessão o avatar leva ao perfil (que oferece entrar). */
  initials?: string;
  badgeCount?: number;
};

const LINKS: ReadonlyArray<{ key: NavigationDestination; label: string }> = [
  { key: "home", label: "Início" },
  { key: "search", label: "Pesquisa" },
  { key: "shelf", label: "Estante" },
];

/** Cabeçalho Web do Figma `34:70` (desktop e tablet): marca, busca, atalhos, Anunciar, conversas e avatar. */
export function WebHeader({ active, onNavigate, onAnnounce, initials = "", badgeCount = 0 }: WebHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View accessibilityRole="header" testID="web-header" style={styles.bar}>
      <Pressable accessibilityRole="link" accessibilityLabel="IpêBook, ir para o início" onPress={() => onNavigate("home")}>
        <Text style={styles.brand}>IpêBook</Text>
      </Pressable>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Buscar título, autor ou categoria"
        onPress={() => onNavigate("search")}
        style={styles.search}
      >
        <Text style={styles.searchText}>Buscar título, autor ou categoria</Text>
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
              style={styles.link}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{link.label}</Text>
              {isActive ? <View style={styles.linkUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Anunciar um livro" onPress={onAnnounce} style={styles.announce}>
        <AppIcon name="add" size={20} color={colors.m3.onPrimary} />
        <Text style={styles.announceText}>Anunciar</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={badgeCount > 0 ? `Conversas, ${badgeCount} com proposta` : "Conversas"}
        onPress={() => onNavigate("conversations")}
        style={styles.iconButton}
      >
        <AppIcon name="chat" size={24} color={colors.m3.onSurface} />
        {badgeCount > 0 ? <View style={styles.dot} /> : null}
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel="Meu perfil" onPress={() => onNavigate("profile")} style={styles.avatar}>
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
      gap: 28,
      height: 72,
      paddingHorizontal: 80,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    brand: { fontFamily: fontFamily.brand, fontSize: 24, letterSpacing: -0.48, color: colors.brandBrown },
    search: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      width: 520,
      maxWidth: "40%",
      height: 48,
      paddingHorizontal: 16,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    searchText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
    spacer: { flex: 1 },
    links: { flexDirection: "row", alignItems: "center", gap: 24, height: "100%" },
    link: { height: "100%", justifyContent: "center" },
    linkText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    linkTextActive: { color: colors.m3.onSurface },
    linkUnderline: { position: "absolute", left: 0, right: 0, bottom: 0, height: 3, backgroundColor: colors.m3.primary },
    announce: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 40,
      paddingLeft: 16,
      paddingRight: 20,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
    },
    announceText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary },
    iconButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    dot: { position: "absolute", top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
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
