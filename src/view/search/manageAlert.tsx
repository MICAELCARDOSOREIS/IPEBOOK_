import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog } from "@/view/components/Dialog";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { ALERT_MODALITY_SUMMARY, ALERT_CITY } from "@/view/search/alertLabels";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type ManageAlertProps = {
  alertId: string;
  userId: string | null;
  onBack: () => void;
  onEditAlert: (alertId: string) => void;
  /** Volta para a lista depois que o alerta deixa de existir. */
  onAlertDeleted: () => void;
};

/** Figma `02.09 · Gerenciar alerta`, `02.11 · Alerta pausado` e `02.12 · Excluir alerta?`. */
export default function ManageAlert({
  alertId,
  userId,
  onBack,
  onEditAlert,
  onAlertDeleted,
}: ManageAlertProps) {
  const [state, actions] = useSearchAlertsViewModel(userId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const alert = state.alerts.find((item) => item.id === alertId);

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Gerenciar alerta" onBack={onBack} />
        <View style={styles.status}>
          <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando alerta" />
        </View>
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Gerenciar alerta" onBack={onBack} />
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.headline}>
            Alerta não encontrado
          </Text>
          <Text style={styles.body}>
            Ele pode ter sido excluído. Volte para a lista e confira seus alertas.
          </Text>
          <OutlinedButton label="Voltar aos alertas" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Gerenciar alerta" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.headline}>
            {`${alert.query}, do seu jeito.`}
          </Text>
          <Text style={styles.body}>Acompanhe e ajuste o que você quer encontrar.</Text>

          <View style={alert.active ? styles.statusCard : styles.statusCardPaused}>
            <Text style={styles.statusTitle}>
              {alert.active ? "Alerta ativo" : "Alerta pausado"}
            </Text>
            <Text style={styles.body}>
              {alert.active
                ? "Você será avisado quando um livro combinar com esta busca."
                : "Retome o alerta quando quiser voltar a receber novidades."}
            </Text>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>{alert.query}</Text>
            <Text style={styles.metaText}>
              {`${ALERT_MODALITY_SUMMARY(alert.modalities)} · ${ALERT_CITY}`}
            </Text>
          </View>

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {state.error}
            </Text>
          ) : null}

          <OutlinedButton
            label="Editar alerta"
            accessibilityLabel={`Editar alerta ${alert.query}`}
            onPress={() => onEditAlert(alert.id)}
          />
          <OutlinedButton
            label={alert.active ? "Pausar alerta" : "Retomar alerta"}
            accessibilityLabel={
              alert.active ? `Pausar alerta ${alert.query}` : `Retomar alerta ${alert.query}`
            }
            onPress={() => void actions.setActive(alert.id, !alert.active)}
          />
          <TextButton
            label="Excluir alerta"
            accessibilityLabel={`Excluir alerta ${alert.query}`}
            onPress={() => setConfirmingDelete(true)}
          />
        </View>
      </ScrollView>

      <Dialog
        visible={confirmingDelete}
        title="Excluir este alerta?"
        message={`Você deixa de receber avisos sobre “${alert.query}”. Esta ação não pode ser desfeita.`}
        confirmLabel="Confirmar exclusão"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          void actions.remove(alert.id).then((removed) => {
            if (removed) onAlertDeleted();
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
  status: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: tokens.spacing[24],
    paddingTop: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  headline: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  body: { ...tokens.typography.bodyMedium, color: tokens.colors.secondaryText },
  statusCard: {
    backgroundColor: tokens.colors.badge.sale.background,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusCardPaused: {
    backgroundColor: tokens.colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
  },
  summary: { gap: tokens.spacing[4] },
  summaryTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
  },
  metaText: { ...tokens.typography.bodyMedium, color: tokens.colors.secondaryText },
  error: { ...tokens.typography.bodyMedium, color: tokens.colors.error },
});
