import { useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { TopAppBar } from "@/view/components/TopAppBar";
import { IconBadge } from "@/view/components/IconBadge";
import { FilledButton } from "@/view/components/FilledButton";
import { captureRef } from "react-native-view-shot";
import { InviteCard } from "@/view/components/InviteCard";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

export type InviteFriendsProps = {
  onBack?: () => void;
};

/**
 * Tela de convite de amigos e compartilhamento da comunidade (Figma `08.02 · Convidar amigos`).
 */
export function InviteFriends({ onBack }: InviteFriendsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useInviteFriendsViewModel();
  // Web larga: o cartão do convite de um lado, texto e ação do outro.
  const wide = useIsWideWeb();
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);

  // A imagem do convite é este cartão: captura em PNG e abre a folha de compartilhamento do sistema.
  const captureInvite = () => captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Convidar amigos" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={styles.header}>
            <IconBadge icon="shelf" tone="action" size="large" />
            <Text accessibilityRole="header" style={styles.title}>
              Livros ganham vida quando são lidos.
            </Text>
            <Text style={styles.subtitle}>
              Convide pessoas queridas de Piripiri para participar do IpêBook. Quanto mais leitores na comunidade, mais histórias em circulação.
            </Text>
          </View>

          <View style={[styles.columns, wide && styles.columnsWide]}>
          <View style={[styles.column, wide && styles.columnHalf, wide && styles.cardColumn]}>
          <InviteCard ref={cardRef} url={state.inviteUrl} />
          </View>
          <View style={[styles.column, wide && styles.columnHalf]}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Texto que vai junto com a imagem</Text>
            <Text style={styles.previewText}>{state.inviteMessage}</Text>
          </View>

          {state.linkCopied ? (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.feedbackBanner}
            >
              <Text style={styles.feedbackText}>Link copiado para a área de transferência!</Text>
            </View>
          ) : null}

          {state.error ? (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={styles.errorBanner}
            >
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          ) : null}

          {/* Um botão só: manda a imagem e o texto com o link juntos (Spec 092). */}
          <View style={styles.actions}>
            <FilledButton
              label="Compartilhar convite"
              accessibilityLabel="Compartilhar o convite com imagem e texto"
              loading={state.sharing}
              onPress={() => void actions.shareImage(captureInvite)}
            />
          </View>
          </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default InviteFriends;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[24],
    },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    columns: { gap: tokens.spacing[24] },
    columnsWide: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[48] },
    column: { gap: tokens.spacing[24] },
    columnHalf: { flex: 1 },
    cardColumn: { alignItems: "center" },
    header: {
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingTop: tokens.spacing[16],
    },
    title: {
      ...tokens.typography.titleLarge,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    previewCard: {
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[8],
    },
    previewLabel: {
      ...tokens.typography.labelMedium,
      color: colors.actionDeep,
      fontWeight: "600",
    },
    previewText: {
      ...tokens.typography.bodyMedium,
      color: colors.text,
      lineHeight: 20,
    },
    feedbackBanner: {
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.action,
      alignItems: "center",
    },
    feedbackText: {
      ...tokens.typography.bodyMedium,
      color: colors.actionDeep,
      fontWeight: "600",
    },
    errorBanner: {
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.errorContainer,
      alignItems: "center",
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
    actions: {
      gap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
    },
  });
}
