import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { tokens } from "@/view/tokens";
import { formatMeetingWhen } from "@/view/meetingFormat";
import { AppIcon } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";

export type MeetingCardProps = {
  requestId: string;
  sessionUserId: string;
  /** Nome da outra pessoa da negociação, para "Ana Paula confirmou". */
  counterpartName: string;
  /** Muda quando a tela volta ao foco, para recarregar depois de combinar ou reagendar. */
  focusKey?: number;
  onScheduleMeeting?: () => void;
};

/**
 * Encontro da negociação aceita (Spec 052): convite pendente, encontro combinado (`06.05`),
 * cancelamento com confirmação (`06.11`/`06.12`) e reagendamento (`06.13`).
 */
export function MeetingCard({ requestId, sessionUserId, counterpartName, focusKey, onScheduleMeeting }: MeetingCardProps) {
  const [state, actions] = useMeetingViewModel(requestId, sessionUserId);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { reload } = actions;

  // A primeira carga já vem do ViewModel; recarrega só quando a tela volta ao foco depois.
  const lastFocusKey = useRef(focusKey);
  useEffect(() => {
    if (focusKey === lastFocusKey.current) return;
    lastFocusKey.current = focusKey;
    void reload();
  }, [focusKey, reload]);

  if (state.loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.body}>Carregando o encontro…</Text>
      </View>
    );
  }
  if (state.error) {
    return (
      <View style={styles.card}>
        <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
        <TextButton label="Tentar novamente" onPress={() => void actions.reload()} />
      </View>
    );
  }

  const meeting = state.meeting;
  const actionError = state.actionError ? (
    <Text accessibilityRole="alert" style={styles.error}>{state.actionError}</Text>
  ) : null;

  if (!meeting || meeting.status === "cancelled") {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <IconBadge icon="calendar" tone="action" />
          <Text accessibilityRole="header" style={styles.title}>
            {meeting ? "Encontro cancelado" : "Combine o encontro"}
          </Text>
        </View>
        <Text style={styles.body}>
          {meeting
            ? "Vocês podem combinar outro dia, horário ou local."
            : "Escolham juntos o ponto, o dia e o horário em um local público de Piripiri."}
        </Text>
        {actionError}
        <FilledButton
          label={meeting ? "Combinar novo encontro" : "Combinar encontro"}
          onPress={() => onScheduleMeeting?.()}
        />
      </View>
    );
  }

  const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === meeting.pointName);
  const mine = meeting.proposedBy === sessionUserId;
  const confirmed = meeting.status === "confirmed";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <IconBadge icon={confirmed ? "check" : "calendar"} tone="action" />
        <Text accessibilityRole="header" style={styles.title}>
          {confirmed ? "Encontro combinado" : mine ? "Aguardando confirmação" : "Convite para encontro"}
        </Text>
      </View>
      <Text style={styles.body}>
        {confirmed
          ? "Os dois confirmaram. Vocês recebem um aviso se algo mudar."
          : mine
            ? `${counterpartName} ainda precisa confirmar este encontro.`
            : `${counterpartName} sugeriu este encontro.`}
      </Text>

      {/* Linhas de `06.05`: quando, onde e o que fazer. */}
      <View style={styles.detailRow}>
        <AppIcon name="calendar" size={24} color={tokens.colors.text} />
        <View style={styles.detailText}>
          <Text style={styles.detailTitle}>{formatMeetingWhen(meeting.scheduledAt)}</Text>
          <Text style={styles.body}>Chegue alguns minutos antes</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <AppIcon name="place" size={24} color={tokens.colors.text} />
        <View style={styles.detailText}>
          <Text style={styles.detailTitle}>{meeting.pointName}</Text>
          {point ? <Text style={styles.body}>{point.address}</Text> : null}
        </View>
      </View>

      {actionError}
      {!confirmed && !mine ? (
        <FilledButton
          label="Confirmar encontro"
          loading={state.busy}
          loadingLabel="Confirmando"
          onPress={() => void actions.confirm()}
        />
      ) : null}
      <OutlinedButton
        label={confirmed || mine ? "Reagendar" : "Sugerir outro horário"}
        disabled={state.busy}
        onPress={() => onScheduleMeeting?.()}
      />
      <TextButton label="Cancelar encontro" tone="danger" disabled={state.busy} onPress={() => setConfirmingCancel(true)} />

      <Dialog
        visible={confirmingCancel}
        title="Cancelar este encontro?"
        message={`${counterpartName} receberá um aviso. Vocês poderão combinar outro dia.`}
        confirmLabel="Cancelar encontro"
        cancelLabel="Manter encontro"
        destructive
        loading={state.busy}
        onCancel={() => setConfirmingCancel(false)}
        onConfirm={async () => {
          await actions.cancel();
          setConfirmingCancel(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[12],
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
  title: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  body: { ...tokens.typography.bodyMedium, color: tokens.colors.secondaryText },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[16] },
  detailText: { flex: 1, gap: tokens.spacing[4] },
  detailTitle: { ...tokens.typography.bodyLarge, color: tokens.colors.text },
  error: { ...tokens.typography.bodyMedium, color: tokens.colors.error },
});
