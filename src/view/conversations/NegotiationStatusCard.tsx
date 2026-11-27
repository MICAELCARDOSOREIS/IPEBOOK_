import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Meeting } from "@/model/entities/meeting";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import type { RequestStatus } from "@/model/entities/bookRequest";
import { formatMeetingWhen } from "@/view/meetingFormat";
import { tokens, type ColorPalette, fontFamily } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { withPress } from "@/view/pressFeedback";

export type NegotiationStatusCardProps = {
  meeting: Meeting | null;
  requestStatus: RequestStatus;
  counterpartName: string;
  sessionUserId: string;
  deliveryCompleted: boolean;
  embedded?: boolean;
  busy?: boolean;
  combineAccessibilityLabel?: string;
  combineButtonLabel?: string;
  onCombineMeeting?: () => void;
  onConfirmMeeting?: () => void;
  onSuggestOtherTime?: () => void;
  onRescheduleMeeting?: () => void;
  onOpenDelivery?: () => void;
  onOpenRating?: () => void;
  onOpenDirections?: () => void;
  onAddToCalendar?: () => void;
};

export function NegotiationStatusCard({
  meeting,
  requestStatus,
  counterpartName,
  sessionUserId,
  deliveryCompleted,
  embedded,
  busy,
  combineAccessibilityLabel,
  combineButtonLabel,
  onCombineMeeting,
  onConfirmMeeting,
  onSuggestOtherTime,
  onRescheduleMeeting,
  onOpenDelivery,
  onOpenRating,
  onOpenDirections,
  onAddToCalendar,
}: NegotiationStatusCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [now, setNow] = useState(Date.now);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const proposalTime = meeting?.status === "proposed" ? Date.parse(meeting.scheduledAt) : null;
  const expired = proposalTime !== null && proposalTime <= now;

  useEffect(() => {
    if (proposalTime === null || !Number.isFinite(proposalTime)) return;
    const current = Date.now();
    setNow(current);
    const delay = Math.min(proposalTime - current, 2_147_483_647);
    if (delay <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [proposalTime]);

  if (requestStatus !== "accepted") {
    return null;
  }

  // 1. Entrega já concluída com sucesso
  if (deliveryCompleted) {
    return (
      <View style={[styles.card, styles.cardSuccess, embedded && styles.cardEmbedded]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.nature.foliage}20` }]}>
            <AppIcon name="checkCircle" size={20} color={colors.nature.foliage} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Entrega realizada com sucesso</Text>
            <Text style={styles.subtitle}>Livro recebido presencialmente em Piripiri.</Text>
          </View>
        </View>
        {onOpenRating ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Avaliar negociação"
            onPress={onOpenRating}
            style={withPress(styles.actionButtonPrimary)}
          >
            <Text style={styles.actionButtonPrimaryText}>Avaliar negociação</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // 2. Encontro confirmado
  if (meeting && meeting.status === "confirmed") {
    const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meeting.pointName);
    const pointName = meeting.pointName || point?.name || "Ponto público de Piripiri";
    const whenFormatted = formatMeetingWhen(meeting.scheduledAt);

    return (
      <View style={[styles.card, styles.cardConfirmed, embedded && styles.cardEmbedded]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.action}20` }]}>
            <AppIcon name="place" size={20} color={colors.action} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Encontro confirmado</Text>
            <Text style={styles.highlight}>{whenFormatted}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {pointName}
            </Text>
          </View>
        </View>

        <View style={[styles.actionsGrid, embedded && styles.actionsGridCompact]}>
          {onOpenDelivery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrega do livro"
              hitSlop={embedded ? 4 : undefined}
              onPress={onOpenDelivery}
              style={withPress([styles.actionButtonPrimary, embedded && styles.actionButtonCompact, embedded && styles.actionButtonPrimaryCompact])}
            >
              <AppIcon name="checkCircle" size={embedded ? 15 : 16} color={colors.nature.onFoliage} />
              <Text numberOfLines={1} style={[styles.actionButtonPrimaryText, embedded && styles.actionButtonCompactText]}>
                Confirmar entrega
              </Text>
            </Pressable>
          ) : null}

          {onOpenDirections ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Como chegar"
              hitSlop={embedded ? 4 : undefined}
              onPress={onOpenDirections}
              style={withPress([styles.actionButtonSecondary, embedded && styles.actionButtonCompact])}
            >
              <AppIcon name="place" size={embedded ? 15 : 16} color={colors.m3.onSurface} />
              <Text numberOfLines={1} style={[styles.actionButtonSecondaryText, embedded && styles.actionButtonCompactText]}>
                Como chegar
              </Text>
            </Pressable>
          ) : null}

          {embedded && (onAddToCalendar || onRescheduleMeeting) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mais opções do encontro"
              accessibilityState={{ expanded: showMoreOptions }}
              hitSlop={4}
              onPress={() => setShowMoreOptions((prev) => !prev)}
              style={withPress(styles.moreOptionsButton)}
            >
              <AppIcon name="more" size={18} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          ) : null}

          {(!embedded || showMoreOptions) && onAddToCalendar ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar à agenda"
              hitSlop={embedded ? 4 : undefined}
              onPress={onAddToCalendar}
              style={withPress([styles.actionButtonSecondary, embedded && styles.actionButtonCompact])}
            >
              <AppIcon name="calendar" size={16} color={colors.m3.onSurface} />
              <Text style={styles.actionButtonSecondaryText}>
                {embedded ? "Agenda" : "Adicionar à agenda"}
              </Text>
            </Pressable>
          ) : null}

          {(!embedded || showMoreOptions) && onRescheduleMeeting ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reagendar encontro"
              hitSlop={embedded ? 4 : undefined}
              onPress={onRescheduleMeeting}
              style={withPress([styles.actionButtonSecondary, embedded && styles.actionButtonCompact])}
            >
              <AppIcon name="swap" size={16} color={colors.m3.onSurface} />
              <Text style={styles.actionButtonSecondaryText}>Reagendar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  // 3. Encontro proposto aguardando resposta
  if (meeting && meeting.status === "proposed") {
    const isProposer = meeting.proposedBy === sessionUserId;
    const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meeting.pointName);
    const whenFormatted = formatMeetingWhen(meeting.scheduledAt);

    return (
      <View style={[styles.card, styles.cardProposed, embedded && styles.cardEmbedded]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.ipe.container }]}>
            <AppIcon name="calendar" size={20} color={colors.action} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {expired ? "Horário expirado" : isProposer ? `Aguardando resposta de ${counterpartName}` : `Encontro sugerido por ${counterpartName}`}
            </Text>
            <Text style={styles.subtitle}>
              {whenFormatted} em {meeting.pointName || point?.name || "Ponto recomendado"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          {!expired && !isProposer && onConfirmMeeting ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirmar encontro"
              disabled={busy}
              onPress={onConfirmMeeting}
              style={withPress(styles.actionButtonPrimary)}
            >
              <Text style={styles.actionButtonPrimaryText}>Confirmar encontro</Text>
            </Pressable>
          ) : null}

          {(onSuggestOtherTime ?? onCombineMeeting) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={expired ? "Sugerir novo horário" : isProposer ? "Alterar sugestão" : "Sugerir outro horário"}
              onPress={onSuggestOtherTime ?? onCombineMeeting}
              style={withPress(styles.actionButtonSecondary)}
            >
              <AppIcon name="calendar" size={16} color={colors.m3.onSurface} />
              <Text style={styles.actionButtonSecondaryText}>
                {expired ? "Sugerir novo horário" : isProposer ? "Alterar sugestão" : "Sugerir outro horário"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  // 4. Nenhum encontro agendado ainda
  return (
    <View style={[styles.card, styles.cardEmpty, embedded && styles.cardEmbedded]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.nature.sprout }]}>
          <AppIcon name="place" size={20} color={colors.nature.foliage} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{meeting?.status === "cancelled" ? "Encontro cancelado" : "Nenhum encontro marcado"}</Text>
          <Text style={styles.subtitle}>Escolha um ponto público e horário em Piripiri.</Text>
        </View>
      </View>

      {onCombineMeeting ? (
        <View style={styles.actionsGrid}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={combineAccessibilityLabel ?? "Combinar encontro"}
            onPress={onCombineMeeting}
            style={withPress([styles.actionButtonPrimary, styles.actionButtonPrimaryFull])}
          >
            <AppIcon name="place" size={18} color={colors.nature.onFoliage} />
            <Text style={styles.actionButtonPrimaryText}>{combineButtonLabel ?? "Combinar"}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[16],
      marginHorizontal: tokens.spacing[16],
      marginBottom: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.border,
      gap: tokens.spacing[12],
    },
    cardSuccess: {
      backgroundColor: `${colors.nature.foliage}10`,
      borderColor: `${colors.nature.foliage}30`,
    },
    cardConfirmed: {
      backgroundColor: colors.surface,
      borderColor: `${colors.action}30`,
    },
    cardProposed: {
      backgroundColor: colors.surface,
      borderColor: `${colors.highlight}40`,
    },
    cardEmpty: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    cardEmbedded: {
      marginHorizontal: 0,
      marginBottom: 0,
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: "transparent",
      padding: 0,
      paddingTop: tokens.spacing[8],
      gap: tokens.spacing[8],
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    highlight: {
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.action,
      marginTop: 2,
    },
    subtitle: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      marginTop: 2,
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[6],
    },
    actionsGridCompact: {
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[2],
    },
    actionButtonCompact: {
      flexGrow: 1,
      justifyContent: "center",
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[10],
      minHeight: Platform.OS === "ios" ? 44 : 40,
    },
    actionButtonPrimaryCompact: {
      paddingHorizontal: tokens.spacing[12],
    },
    actionButtonCompactText: {
      fontSize: 13,
    },
    moreOptionsButton: {
      width: Platform.OS === "ios" ? 44 : 38,
      height: Platform.OS === "ios" ? 44 : 38,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonPrimary: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      backgroundColor: colors.action,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      minHeight: tokens.accessibility.touchTarget,
    },
    actionButtonPrimaryFull: {
      width: "100%",
    },
    actionButtonPrimaryText: {
      color: colors.nature.onFoliage,
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
    },
    actionButtonSecondary: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[14],
      borderRadius: tokens.radius.full,
      minHeight: tokens.accessibility.touchTarget,
    },
    actionButtonSecondaryText: {
      color: colors.m3.onSurface,
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.medium,
    },
  });
}
