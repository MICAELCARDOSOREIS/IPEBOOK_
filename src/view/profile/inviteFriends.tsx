import { useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { TopAppBar } from "@/view/components/TopAppBar";
import { IconBadge } from "@/view/components/IconBadge";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { captureRef } from "react-native-view-shot";
import { InviteCard } from "@/view/components/InviteCard";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";

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
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);

  // A imagem do convite é este cartão: captura em PNG e abre a folha de compartilhamento do sistema.
  const captureInvite = () => captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Convidar amigos" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <IconBadge icon="shelf" tone="action" size="large" />
            <Text accessibilityRole="header" style={styles.title}>
              Livros ganham vida quando são lidos.
            </Text>
            <Text style={styles.subtitle}>
              Convide pessoas queridas de Piripiri para participar do IpêBook. Quanto mais leitores na comunidade, mais histórias em circulação.
            </Text>
          </View>

          <InviteCard ref={cardRef} url={state.inviteUrl} />

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Mensagem de convite</Text>
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

          <View style={styles.actions}>
            <FilledButton
              label="Compartilhar imagem do convite"
              accessibilityLabel="Compartilhar a imagem do convite"
              loading={state.sharing}
              onPress={() => void actions.shareImage(captureInvite)}
            />
            <OutlinedButton
              label="Enviar texto pelo WhatsApp"
              accessibilityLabel="Enviar convite pelo WhatsApp"
              disabled={state.sharing}
              onPress={() => void actions.shareToWhatsApp()}
            />
            <TextButton
              label="Outras opções de envio"
              accessibilityLabel="Mais opções de compartilhamento"
              disabled={state.sharing}
              onPress={() => void actions.shareNative()}
            />
            <TextButton
              label={state.linkCopied ? "Link copiado!" : "Copiar link de convite"}
              accessibilityLabel="Copiar link do aplicativo"
              onPress={() => void actions.copyLink()}
            />
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
