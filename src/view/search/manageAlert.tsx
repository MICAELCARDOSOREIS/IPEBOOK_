import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Dialog } from "@/view/components/Dialog";
import { LoadingState } from "@/view/components/LoadingState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ALERT_MODALITY_SUMMARY, ALERT_CITY } from "@/view/search/alertLabels";
import { makeSearchAlertsViewModel } from "@/di/container";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

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
  const guardedBack = useGuardedPress(onBack);
  const guardedEdit = useGuardedPress(onEditAlert);
  const guardedAlertDeleted = useGuardedPress(onAlertDeleted);
  const [state, actions] = makeSearchAlertsViewModel(userId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const alert = state.alerts.find((item) => item.id === alertId);

  if (state.loading) {
    return (
      <ScreenContainer
        maxWidth={560}
        paddingHorizontal={tokens.spacing[24]}
        paddingTop={tokens.spacing[24]}
        header={<TopAppBar contentMaxWidth={560} title="Gerenciar alerta" onBack={guardedBack} />}
        contentStyle={styles.content}
      >
        <LoadingState label="Carregando alerta" variant="form" />
      </ScreenContainer>
    );
  }

  if (!alert) {
    return (
      <ScreenContainer
        maxWidth={560}
        paddingHorizontal={tokens.spacing[24]}
        paddingTop={tokens.spacing[24]}
        header={<TopAppBar contentMaxWidth={560} title="Gerenciar alerta" onBack={guardedBack} />}
        contentStyle={styles.content}
      >
        <Text accessibilityRole="header" style={styles.headline}>
          Alerta não encontrado
        </Text>
        <Text style={styles.body}>
          Ele pode ter sido excluído. Volte para a lista e confira seus alertas.
        </Text>
        <OutlinedButton label="Voltar aos alertas" onPress={guardedBack} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      maxWidth={560}
      paddingHorizontal={tokens.spacing[24]}
      paddingTop={tokens.spacing[24]}
      paddingBottom={scrollBottomPadding.withoutBottomBar}
      header={<TopAppBar contentMaxWidth={560} title="Gerenciar alerta" onBack={guardedBack} />}
      contentStyle={styles.content}
      overlay={
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
              if (removed) guardedAlertDeleted();
            });
          }}
        />
      }
    >
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
        onPress={() => guardedEdit(alert.id)}
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
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
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
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  body: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  statusCard: {
    backgroundColor: colors.badge.sale.background,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusCardPaused: {
    backgroundColor: colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusTitle: {
    ...tokens.typography.titleMedium,
    color: colors.text,
  },
  summary: { gap: tokens.spacing[4] },
  summaryTitle: {
    ...tokens.typography.titleMedium,
    color: colors.text,
  },
  metaText: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  error: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
