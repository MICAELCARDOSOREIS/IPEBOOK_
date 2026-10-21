import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";

export type ReceivedRatingsProps = {
  sessionUserId: string | null;
  onBack: () => void;
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function stars(score: number): string {
  const rounded = Math.round(score);
  return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
}

/** Figma `07.03 · Avaliações recebidas` (`145:2486` / Web `370:16701`). */
export function ReceivedRatings({ sessionUserId, onBack }: ReceivedRatingsProps) {
  const [state, actions] = useReceivedRatingsViewModel(sessionUserId);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Avaliações recebidas" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando avaliações" />
            </View>
          ) : state.error ? (
            <View style={styles.status}>
              <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tentar novamente"
                onPress={() => void actions.reload()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : state.ratings.length === 0 ? (
            <View style={styles.status}>
              <Text style={styles.emptyText}>Você ainda não recebeu avaliações.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {state.ratings.map((rating) => (
                <View key={rating.id} style={styles.card}>
                  <Text
                    accessibilityLabel={`Nota ${rating.score} de 5`}
                    style={styles.stars}
                  >
                    {stars(rating.score)}
                  </Text>
                  <Text style={styles.raterName}>{rating.raterName ?? "Pessoa da comunidade"}</Text>
                  <Text style={styles.date}>{formatDate(rating.createdAt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export type ReceivedRatingsScreenProps = {
  onBack: () => void;
  onNavigateToSignIn?: () => void;
};

export default function ReceivedRatingsScreen({ onBack, onNavigateToSignIn }: ReceivedRatingsScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onNavigateToSignIn?.();
  }, [authState.loading, authState.user, onNavigateToSignIn]);

  if (authState.loading || !authState.user) return null;

  return <ReceivedRatings sessionUserId={authState.user.id} onBack={onBack} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scroll: { flexGrow: 1 },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  status: { alignItems: "center", gap: tokens.spacing[16], paddingTop: tokens.spacing[48] },
  errorText: { ...tokens.typography.bodyMedium, color: tokens.colors.error, textAlign: "center" },
  emptyText: { ...tokens.typography.bodyMedium, color: tokens.colors.secondaryText, textAlign: "center" },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outline,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: { ...tokens.typography.bodyMedium, color: tokens.colors.action, fontWeight: "600" },
  list: { gap: tokens.spacing[12] },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  stars: { fontSize: 20, color: tokens.colors.highlight },
  raterName: { ...tokens.typography.titleMedium, fontFamily: tokens.typography.displayLarge.fontFamily, color: tokens.colors.text },
  date: { ...tokens.typography.labelMedium, color: tokens.colors.secondaryText },
});
