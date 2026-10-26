import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";

function formatJoinedAt(joinedAt: string): string {
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export type PublicProfileProps = {
  userId: string;
  onBack?: () => void;
  onStartChat?: (userId: string) => void;
  onReportOrBlock?: (userId: string) => void;
};

/**
 * Perfil público do membro da comunidade (Figma `03.04 · Perfil de Ana Paula`, nó `19:21`).
 */
export function PublicProfile({ userId, onBack, onStartChat, onReportOrBlock }: PublicProfileProps) {
  const [state, actions] = usePublicProfileViewModel(userId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const profile = state.profile;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {/* 1. Barra Superior M3: Voltar + "Perfil" */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          onPress={() => onBack?.()}
          style={styles.backButton}
        >
          <AppIcon name="back" size={24} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.topBarTitle}>Perfil</Text>
      </View>

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
              {profile.socialHandle ? (
                <Text style={styles.socialHandle}>{profile.socialHandle}</Text>
              ) : null}
            </View>

            {/* 3. Cards Informativos do Figma */}
            {/* Card 1: Avaliações (Destaque em container secundário) */}
            <View style={styles.highlightCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statLargeValue}>
                  {profile.ratingCount > 0 ? profile.averageRating?.toFixed(1) : "—"}
                </Text>
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
            </View>

            {/* Card 2: Negociações Concluídas */}
            <View style={styles.surfaceCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.statLargeValue}>{profile.completedNegotiations}</Text>
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardTitle}>
                    {profile.completedNegotiations === 1 ? "Negociação concluída" : "Negociações concluídas"}
                  </Text>
                  <Text style={styles.cardSubtitle}>Livros trocados, vendidos ou doados com sucesso</Text>
                </View>
              </View>
            </View>

            {/* Card 3: Tempo de Comunidade */}
            <View style={styles.surfaceCard}>
              <View style={styles.cardHeaderRow}>
                <AppIcon name="calendar" size={24} color={colors.m3.primary} />
                <View style={styles.cardHeaderTextCol}>
                  <Text style={styles.cardTitle}>
                    {`Na comunidade desde ${formatJoinedAt(profile.joinedAt)}`}
                  </Text>
                  <Text style={styles.cardSubtitle}>Piripiri, Piauí</Text>
                </View>
              </View>
            </View>

            {/* 4. Ações Principais do Figma */}
            <View style={styles.actionsSection}>
              <FilledButton
                label={`Conversar com ${profile.name}`}
                onPress={() => onStartChat?.(profile.userId)}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Denunciar ou bloquear"
                onPress={() => onReportOrBlock?.(profile.userId)}
                style={styles.destructiveButton}
              >
                <Text style={styles.destructiveText}>Denunciar ou bloquear</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default PublicProfile;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    topBar: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.background,
      gap: tokens.spacing[12],
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.full,
    },
    topBarTitle: {
      fontSize: 20,
      fontWeight: "500",
      color: colors.text,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[32],
      maxWidth: 720,
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
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.secondaryText,
      textAlign: "center",
    },
    socialHandle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.action,
    },
    highlightCard: {
      backgroundColor: colors.m3.secondaryContainer,
      borderRadius: 16,
      padding: tokens.spacing[16],
    },
    surfaceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    statLargeValue: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      minWidth: 44,
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
    },
    actionsSection: {
      gap: tokens.spacing[12],
      paddingTop: tokens.spacing[16],
    },
    destructiveButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.error,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[24],
    },
    destructiveText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
  });
}
