import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from "@/view/components/Checkbox";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useDeleteAccountViewModel } from "@/viewmodel/useDeleteAccountViewModel";

export type DeleteAccountProps = {
  sessionUserId: string | null;
  onBack: () => void;
  onAccountDeleted: () => void;
  onNavigateToLogin?: () => void;
};

/**
 * Figma `07.07 · Privacidade e dados` (`145:2809` / Web `370:16741`),
 * `07.08 · Dados solicitados` (`150:3484` / Web `370:16781`),
 * `07.09 · Excluir conta` (`149:3589` / Web `370:16821`) e
 * `07.17 · Conta excluída` (`370:6769` / Web `370:18021`).
 */
export default function DeleteAccount({
  sessionUserId,
  onBack,
  onAccountDeleted,
  onNavigateToLogin,
}: DeleteAccountProps) {
  const [state, actions] = useDeleteAccountViewModel();

  if (state.success) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Exclusão de Conta" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.card}>
              <IconBadge icon="check" tone="action" />
              <Text accessibilityRole="header" style={styles.successTitle}>
                Conta excluída
              </Text>
              <Text style={styles.successHeadline}>Sua conta foi excluída.</Text>
              <Text style={styles.bodyCenter}>
                Seu perfil e seus anúncios ficaram indisponíveis. Sua conta e seus dados pessoais foram removidos da nossa base em conformidade com a LGPD.
              </Text>
              <View style={styles.fullWidthButton}>
                <FilledButton label="Voltar à tela inicial" onPress={onAccountDeleted} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Exclusão de Conta" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.card}>
              <IconBadge icon="lock" tone="neutral" />
              <Text accessibilityRole="header" style={styles.title}>
                Sessão necessária
              </Text>
              <Text style={styles.bodyCenter}>
                Você precisa entrar na sua conta para solicitar a exclusão dos seus dados.
              </Text>
              {onNavigateToLogin ? (
                <View style={styles.fullWidthButton}>
                  <FilledButton label="Entrar na conta" onPress={onNavigateToLogin} />
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Excluir conta" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>Você no controle.</Text>
            <Text style={styles.heroSubtitle}>
              Entenda quais informações ficam visíveis.
            </Text>
          </View>

          <View style={styles.privacyInfoCard}>
            <Text style={styles.privacyInfoTitle}>Seu perfil público</Text>
            <Text style={styles.exportText}>
              Nome, cidade, anúncios e avaliações ajudam a comunidade a conhecer você.
            </Text>
            <Text style={styles.privacyInfoTitle}>Dados de acesso privados</Text>
            <Text style={styles.exportText}>
              Seu telefone e e-mail não aparecem no perfil público nem nos anúncios.
            </Text>
          </View>

          <View style={styles.exportCard}>
            <View style={styles.cardHeaderRow}>
              <IconBadge icon="document" tone="action" />
              <Text accessibilityRole="header" style={styles.exportTitle}>
                Portabilidade de Dados (LGPD)
              </Text>
            </View>
            <Text style={styles.exportText}>
              Antes de excluir sua conta, você pode baixar uma cópia completa de todos os seus anúncios, pedidos e dados cadastrais em formato JSON.
            </Text>
            {state.exportSuccess ? (
              <Text accessibilityRole="alert" style={styles.exportSuccessText}>
                ✓ Arquivo de dados gerado e baixado com sucesso!
              </Text>
            ) : null}
            {state.exportError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {state.exportError}
              </Text>
            ) : null}
            <OutlinedButton
              label={state.exporting ? "Gerando arquivo..." : "Baixar meus dados (JSON)"}
              accessibilityLabel="Baixar meus dados pessoais em formato JSON"
              loading={state.exporting}
              disabled={state.exporting}
              onPress={() => void actions.downloadUserData(sessionUserId)}
            />
          </View>

          <View style={styles.warningCard}>
            <View style={styles.cardHeaderRow}>
              <IconBadge icon="error" tone="error" />
              <Text accessibilityRole="header" style={styles.warningTitle}>
                Atenção: Ação irreversível
              </Text>
            </View>
            <Text style={styles.warningText}>
              Ao excluir sua conta no Ipebook:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Todos os seus anúncios ativos serão cancelados e removidos do catálogo.</Text>
              <Text style={styles.bulletItem}>• Suas negociações e pedidos pendentes serão cancelados.</Text>
              <Text style={styles.bulletItem}>• Seus dados cadastrais serão definitivamente eliminados da nossa base (LGPD).</Text>
            </View>
          </View>

          <Checkbox
            label="Estou ciente de que a exclusão da minha conta é definitiva e não pode ser desfeita."
            accessibilityLabel="Estou ciente de que a exclusão da minha conta é definitiva e não pode ser desfeita"
            checked={state.confirmed}
            onChange={actions.setConfirmed}
          />

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {state.error}
            </Text>
          ) : null}

          <FilledButton
            label="Confirmar e excluir minha conta"
            loading={state.loading}
            loadingLabel="Excluindo conta..."
            onPress={() => void actions.deleteAccount(sessionUserId)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: tokens.spacing[48],
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[20],
  },
  heroHeader: {
    gap: tokens.spacing[4],
  },
  heroTitle: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.secondaryText,
  },
  privacyInfoCard: {
    padding: tokens.spacing[16],
    backgroundColor: tokens.colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  privacyInfoTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  successHeadline: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  card: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  fullWidthButton: {
    width: "100%",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  title: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  successTitle: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.action,
    textAlign: "center",
  },
  bodyCenter: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  exportCard: {
    padding: tokens.spacing[16],
    backgroundColor: tokens.colors.soft,
    borderRadius: tokens.radius.medium,
    gap: tokens.spacing[12],
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
  },
  exportTitle: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.action,
  },
  exportText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.text,
  },
  exportSuccessText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.action,
    fontWeight: "600",
  },
  warningCard: {
    padding: tokens.spacing[16],
    backgroundColor: tokens.colors.errorContainer,
    borderRadius: tokens.radius.medium,
    gap: tokens.spacing[12],
    borderWidth: 1,
    borderColor: tokens.colors.error,
  },
  warningTitle: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.error,
  },
  warningText: {
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  bulletList: {
    gap: tokens.spacing[8],
  },
  bulletItem: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
  },
});
