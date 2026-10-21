import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { tokens } from "@/view/tokens";
import { Avatar } from "@/view/components/Avatar";
import { TopAppBar } from "@/view/components/TopAppBar";

function formatJoinedAt(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export type PublicProfileProps = {
  userId: string;
  onBack?: () => void;
};

export function PublicProfile({ userId, onBack }: PublicProfileProps) {
  const [state, actions] = usePublicProfileViewModel(userId);
  const profile = state.profile;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Perfil" onBack={() => onBack?.()} />
      <View style={styles.content}>
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando perfil" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void actions.reload()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View style={styles.card}>
            <Avatar name={profile.name} photoUrl={profile.photoUrl} size={64} />
            <Text accessibilityRole="header" style={styles.name}>{profile.name}</Text>
            {profile.socialHandle ? <Text style={styles.joined}>{profile.socialHandle}</Text> : null}
            <Text style={styles.joined}>
              {`Na comunidade desde ${formatJoinedAt(profile.joinedAt)}`}
            </Text>

            <View style={styles.statRow}>
              <Text style={styles.statValue}>
                {profile.ratingCount > 0 ? profile.averageRating?.toFixed(1) : "—"}
              </Text>
              <Text style={styles.statLabel}>
                {profile.ratingCount > 0
                  ? `Avaliação média (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                  : "Sem avaliações ainda"}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statValue}>{profile.completedNegotiations}</Text>
              <Text style={styles.statLabel}>
                {profile.completedNegotiations === 1 ? "Negociação concluída" : "Negociações concluídas"}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default PublicProfile;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  status: { alignItems: "center", gap: tokens.spacing[16], paddingTop: tokens.spacing[48] },
  errorText: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.error, textAlign: "center" },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.action, fontWeight: "bold" },
  card: {
    gap: tokens.spacing[16],
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing[24],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  name: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: tokens.colors.action },
  joined: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText },
  statRow: { gap: 2, borderTopWidth: 1, borderTopColor: tokens.colors.border, paddingTop: tokens.spacing[12] },
  statValue: { fontSize: tokens.typography.titleMedium.fontSize, fontWeight: "bold", color: tokens.colors.text },
  statLabel: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText },
});
