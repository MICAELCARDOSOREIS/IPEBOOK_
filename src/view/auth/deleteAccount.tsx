import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilledButton } from "@/view/components/FilledButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useDeleteAccountViewModel } from "@/viewmodel/useDeleteAccountViewModel";

export type DeleteAccountProps = {
  sessionUserId: string | null;
  onBack: () => void;
  onAccountDeleted: () => void;
  onNavigateToLogin?: () => void;
};

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
        <View style={styles.content}>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.successTitle}>
              Conta excluída
            </Text>
            <Text style={styles.bodyCenter}>
              Sua conta e seus dados pessoais foram removidos da nossa base em conformidade com a LGPD e as políticas de privacidade do Ipebook.
            </Text>
            <FilledButton label="Voltar à tela inicial" onPress={onAccountDeleted} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Exclusão de Conta" onBack={onBack} />
        <View style={styles.content}>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.title}>
              Sessão necessária
            </Text>
            <Text style={styles.bodyCenter}>
              Você precisa entrar na sua conta para solicitar a exclusão dos seus dados.
            </Text>
            {onNavigateToLogin ? (
              <FilledButton label="Entrar na conta" onPress={onNavigateToLogin} />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Excluir conta" onBack={onBack} />
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Text accessibilityRole="header" style={styles.warningTitle}>
            Atenção: Ação irreversível
          </Text>
          <Text style={styles.warningText}>
            Ao excluir sua conta no Ipebook:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Todos os seus anúncios ativos serão cancelados e removidos do catálogo.</Text>
            <Text style={styles.bulletItem}>• Suas negociações e pedidos pendentes serão cancelados.</Text>
            <Text style={styles.bulletItem}>• Seus dados cadastrais serão definitivamente eliminados da nossa base (LGPD).</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: state.confirmed }}
          accessibilityLabel="Estou ciente de que a exclusão da minha conta é definitiva e não pode ser desfeita"
          onPress={() => actions.setConfirmed(!state.confirmed)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkboxBox, state.confirmed && styles.checkboxBoxChecked]}>
            {state.confirmed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxLabel}>
            Estou ciente de que a exclusão da minha conta é definitiva e não pode ser desfeita.
          </Text>
        </Pressable>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[20],
  },
  card: {
    padding: tokens.spacing[24],
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[16],
    alignItems: "center",
    marginTop: tokens.spacing[24],
  },
  title: {
    fontSize: tokens.typography.titleLarge.fontSize,
    fontWeight: "700",
    color: tokens.colors.text,
    textAlign: "center",
  },
  successTitle: {
    fontSize: tokens.typography.titleLarge.fontSize,
    fontWeight: "700",
    color: tokens.colors.action,
    textAlign: "center",
  },
  bodyCenter: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    textAlign: "center",
    lineHeight: 22,
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
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "700",
    color: tokens.colors.error,
  },
  warningText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  bulletList: {
    gap: tokens.spacing[8],
  },
  bulletItem: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    minHeight: tokens.accessibility.touchTarget,
    paddingVertical: tokens.spacing[8],
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.small,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
  },
  checkboxBoxChecked: {
    borderColor: tokens.colors.error,
    backgroundColor: tokens.colors.error,
  },
  checkmark: {
    color: tokens.colors.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
    lineHeight: 20,
  },
  errorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.error,
  },
});
