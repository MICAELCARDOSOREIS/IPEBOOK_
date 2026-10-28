import { useEffect, useMemo, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { StyleSheet, Text, View } from "react-native";
import type { Meeting } from "@/model/entities/meeting";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { describeMeetingCountdown, formatMeetingWhen } from "@/view/meetingFormat";
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
  /** Avisa a tela do encontro atual, para o progresso e o cartão de conclusão. */
  onMeetingChange?: (meeting: Meeting | null) => void;
  /** Entrega já concluída (Spec 095): o encontro vira um resumo, sem reagendar, cancelar nem contagem regressiva. */
  concluded?: boolean;
};

/**
 * Encontro da negociação aceita (Spec 052 / Spec 069): convite pendente, encontro combinado (`06.05`),
 * cancelamento com confirmação (`06.11`/`06.12`) e reagendamento (`06.13`).
 */
export function MeetingCard({
  requestId,
  sessionUserId,
  counterpartName,
  focusKey,
  onScheduleMeeting,
  onMeetingChange,
  concluded = false,
}: MeetingCardProps) {
  const [state, actions] = useMeetingViewModel(requestId, sessionUserId);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.loading) onMeetingChange?.(state.meeting ?? null);
  }, [state.loading, state.meeting, onMeetingChange]);
  const { reload } = actions;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          label={meeting ? "Combinar novo encontro" : "Escolher local e horário"}
          onPress={() => onScheduleMeeting?.()}
        />

        {(state.history ?? []).length > 0 ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Histórico de encontros</Text>
            {(state.history ?? []).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <AppIcon
                  name={item.status === "confirmed" ? "check" : "calendar"}
                  size={18}
                  color={item.status === "confirmed" ? colors.m3.primary : colors.m3.onSurfaceVariant}
                />
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyItemText}>
                    {formatMeetingWhen(item.scheduledAt)} · {item.pointName}
                  </Text>
                  <Text style={styles.historyStatusBadge}>
                    {item.status === "cancelled" ? "Cancelado" : item.status === "confirmed" ? "Confirmado" : "Proposto"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === meeting.pointName);
  const mine = meeting.proposedBy === sessionUserId;
  const confirmed = meeting.status === "confirmed";
  const pastMeetings = (state.history ?? []).filter((m) => m.id !== meeting.id);
  const countdown = describeMeetingCountdown(meeting.scheduledAt);

  async function openDirections() {
    setMapError(null);
    const query = point ? point.address : `${meeting!.pointName}, Piripiri`;
    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
    } catch {
      setMapError("Não foi possível abrir o mapa. Tente novamente.");
    }
  }

  if (concluded) {
    return (
      <View style={styles.card} testID="meeting-concluded">
        <View style={styles.headerRow}>
          <IconBadge icon="check" tone="action" />
          <Text accessibilityRole="header" style={styles.title}>Encontro realizado</Text>
        </View>
        <View style={styles.detailRow}>
          <AppIcon name="calendar" size={24} color={colors.m3.onSurface} />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>{formatMeetingWhen(meeting.scheduledAt)}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <AppIcon name="place" size={24} color={colors.m3.onSurface} />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>{meeting.pointName}</Text>
            {point ? <Text style={styles.body}>{point.address}</Text> : null}
          </View>
        </View>
      </View>
    );
  }

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
            ? `${counterpartName} vai confirmar este horário ou sugerir outro. Você recebe um aviso quando responder.`
            : `${counterpartName} sugeriu este encontro. Confirme se esse horário funciona ou sugira outro.`}
      </Text>

      {/* Linhas de `06.05`: quando, onde e o que fazer. */}
      <View style={styles.detailRow}>
        <AppIcon name="calendar" size={24} color={colors.m3.onSurface} />
        <View style={styles.detailText}>
          <Text style={styles.detailTitle}>{formatMeetingWhen(meeting.scheduledAt)}</Text>
          <Text style={[styles.body, !countdown.past && styles.countdown]}>
            {countdown.past ? "O horário combinado já passou" : `${countdown.label} · chegue alguns minutos antes`}
          </Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <AppIcon name="place" size={24} color={colors.m3.onSurface} />
        <View style={styles.detailText}>
          <Text style={styles.detailTitle}>{meeting.pointName}</Text>
          {point ? <Text style={styles.body}>{point.address}</Text> : null}
        </View>
      </View>
      <TextButton
        label="Como chegar"
        accessibilityLabel={`Como chegar a ${meeting.pointName}`}
        onPress={() => void openDirections()}
      />
      {mapError ? <Text accessibilityRole="alert" style={styles.error}>{mapError}</Text> : null}

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

      {pastMeetings.length > 0 ? (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Tentativas anteriores</Text>
          {pastMeetings.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <AppIcon
                name={item.status === "confirmed" ? "check" : "calendar"}
                size={18}
                color={item.status === "confirmed" ? colors.m3.primary : colors.m3.onSurfaceVariant}
              />
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemText}>
                  {formatMeetingWhen(item.scheduledAt)} · {item.pointName}
                </Text>
                <Text style={styles.historyStatusBadge}>
                  {item.status === "cancelled" ? "Cancelado" : item.status === "confirmed" ? "Confirmado" : "Proposto"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.m3.surfaceContainerLow,
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[12],
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    title: {
      flex: 1,
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    body: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    detailRow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[16] },
    detailText: { flex: 1, gap: tokens.spacing[4] },
    countdown: { color: colors.action, fontFamily: fontFamily.medium },
    detailTitle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    error: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.medium,
      color: colors.error,
    },
    historyContainer: {
      marginTop: tokens.spacing[8],
      paddingTop: tokens.spacing[12],
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      gap: tokens.spacing[8],
    },
    historyTitle: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurfaceVariant,
    },
    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    historyItemContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    historyItemText: {
      flex: 1,
      ...tokens.typography.bodyMedium,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurface,
    },
    historyStatusBadge: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      backgroundColor: colors.m3.surfaceContainerHighest,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.small,
      overflow: "hidden",
    },
  });
}
