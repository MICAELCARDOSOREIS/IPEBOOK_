import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { makeReceivedRatingsViewModel } from "@/di/container";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";

const COMMUNITY_MEMBER = "Pessoa da comunidade";

function formatRatingDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(date);
}

/** Painel "Avaliações" do perfil público (Figma `03.04` / ADR 0038). As avaliações são públicas. */
export function UserRatingsPanel({ userId, wideWeb = false }: { userId: string; wideWeb?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  // O caso de uso lista as avaliações recebidas pelo id informado; aqui o id é o da pessoa do perfil.
  const [state] = makeReceivedRatingsViewModel(userId);

  if (state.loading || state.error || state.ratings.length === 0) return null;

  return (
    <View style={styles.panel} testID="user-ratings-panel">
      <View style={styles.headerRow}>
        <AppIcon name="star" size={18} color={colors.highlight} />
        <Text accessibilityRole="header" style={styles.title}>Avaliações</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{state.ratings.length}</Text>
        </View>
      </View>
      {state.ratings.slice(0, 6).map((rating, index) => {
        const name = rating.raterName ?? COMMUNITY_MEMBER;
        const dateStr = formatRatingDate(rating.createdAt);
        return (
          <View key={rating.id} style={[styles.row, index > 0 && styles.rowBorder]}>
            <Avatar name={name} size={36} />
            <View style={styles.rowText}>
              <View style={styles.rowTopLine}>
                <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
                {dateStr ? <Text style={styles.rowDate}>{dateStr}</Text> : null}
              </View>
              <View style={styles.starsRow}>
                <Text accessibilityLabel={`${rating.score} de 5 estrelas`} style={styles.stars}>
                  {"★".repeat(Math.round(rating.score)) + "☆".repeat(Math.max(0, 5 - Math.round(rating.score)))}
                </Text>
                <Text style={styles.scoreNumber}>{rating.score.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    panel: {
      width: "100%",
      maxWidth: wideWeb ? 340 : "100%",
      flexShrink: 0,
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      marginTop: tokens.spacing[8],
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[2],
    },
    title: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
    },
    badgeCount: {
      backgroundColor: colors.ipe.container,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
    },
    badgeCountText: {
      ...tokens.typography.labelSmall,
      color: colors.ipe.onContainer,
      fontWeight: tokens.fontWeight.bold,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
    },
    rowBorder: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    rowText: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    rowTopLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[6],
    },
    rowName: {
      ...tokens.typography.labelLarge,
      color: colors.text,
      fontFamily: fontFamily.medium,
      fontWeight: tokens.fontWeight.semiBold,
      flex: 1,
    },
    rowDate: {
      ...tokens.typography.captionSmall,
      color: colors.secondaryText,
    },
    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    stars: {
      fontSize: 15,
      lineHeight: 18,
      color: colors.highlight,
      letterSpacing: 2,
    },
    scoreNumber: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.medium,
    },
  });
}

export default UserRatingsPanel;
