import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";

const COMMUNITY_MEMBER = "Pessoa da comunidade";

/** Painel "Avaliações" do perfil público na web larga (Figma `03.04`). As avaliações são públicas (ADR 0038). */
export function UserRatingsPanel({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // O caso de uso lista as avaliações recebidas pelo id informado; aqui o id é o da pessoa do perfil.
  const [state] = useReceivedRatingsViewModel(userId);

  if (state.loading || state.error || state.ratings.length === 0) return null;

  return (
    <View style={styles.panel} testID="user-ratings-panel" accessibilityLabel="Avaliações">
      <Text accessibilityRole="header" style={styles.title}>Avaliações</Text>
      {state.ratings.slice(0, 6).map((rating) => {
        const name = rating.raterName ?? COMMUNITY_MEMBER;
        return (
          <View key={rating.id} style={styles.row}>
            <Avatar name={name} size={32} />
            <View style={styles.rowText}>
              <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
              <Text accessibilityLabel={`${rating.score} de 5 estrelas`} style={styles.stars}>
                {"★".repeat(Math.round(rating.score)) + "☆".repeat(Math.max(0, 5 - Math.round(rating.score)))}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    panel: { width: 320, gap: tokens.spacing[12], padding: tokens.spacing[20], borderRadius: tokens.radius.large, backgroundColor: colors.m3.surfaceContainerLow },
    title: { ...tokens.typography.titleBar, color: colors.m3.onSurface },
    row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    rowText: { flex: 1, gap: tokens.spacing[2] },
    rowName: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    stars: { ...tokens.typography.bodyMedium, color: colors.highlight },
  });
}

export default UserRatingsPanel;
