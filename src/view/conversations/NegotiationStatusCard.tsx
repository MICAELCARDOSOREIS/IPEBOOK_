import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Meeting } from "@/model/entities/meeting";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import type { RequestStatus } from "@/model/entities/bookRequest";
import { formatMeetingWhen } from "@/view/meetingFormat";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { withPress } from "@/view/pressFeedback";

export type NegotiationStatusCardProps = {
  meeting: Meeting | null;
  requestStatus: RequestStatus;
  counterpartName: string;
  sessionUserId: string;
  deliveryCompleted: boolean;
  onCombineMeeting?: () => void;
  onConfirmMeeting?: () => void;
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
  onCombineMeeting,
  onConfirmMeeting,
  onOpenDelivery,
  onOpenRating,
  onOpenDirections,
  onAddToCalendar,
}: NegotiationStatusCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (requestStatus !== "accepted") {
    return null;
  }

  // 1. Entrega já concluída com sucesso
  if (deliveryCompleted) {
    return (
      <View style={[styles.card, styles.cardSuccess]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.nature.foliage + "20" }]}>
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
      <View style={[styles.card, styles.cardConfirmed]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.action + "20" }]}>
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

        <View style={styles.actionsGrid}>
          {onOpenDelivery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrega do livro"
              onPress={onOpenDelivery}
              style={withPress(styles.actionButtonPrimary)}
            >
              <Text style={styles.actionButtonPrimaryText}>Entrega do livro</Text>
            </Pressable>
          ) : null}

          {onOpenDirections ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Como chegar"
              onPress={onOpenDirections}
              style={withPress(styles.actionButtonSecondary)}
            >
              <AppIcon name="place" size={16} color={colors.m3.onSurface} />
              <Text style={styles.actionButtonSecondaryText}>Como chegar</Text>
            </Pressable>
          ) : null}

          {onAddToCalendar ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar à agenda"
              onPress={onAddToCalendar}
              style={withPress(styles.actionButtonSecondary)}
            >
              <AppIcon name="calendar" size={16} color={colors.m3.onSurface} />
              <Text style={styles.actionButtonSecondaryText}>Adicionar à agenda</Text>
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
      <View style={[styles.card, styles.cardProposed]}>
        <View style={styles.contentRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.ipe.container }]}>
            <AppIcon name="calendar" size={20} color={colors.action} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isProposer ? `Aguardando resposta de ${counterpartName}` : `Encontro sugerido por ${counterpartName}`}
            </Text>
            <Text style={styles.subtitle}>
              {whenFormatted} em {meeting.pointName || point?.name || "Ponto seguro"}
            </Text>
          </View>
        </View>

        {!isProposer && onConfirmMeeting ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirmar encontro"
            onPress={onConfirmMeeting}
            style={withPress(styles.actionButtonPrimary)}
          >
            <Text style={styles.actionButtonPrimaryText}>Confirmar encontro</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // 4. Nenhum encontro agendado ainda
  return (
    <View style={[styles.card, styles.cardEmpty]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.soft }]}>
          <AppIcon name="place" size={20} color={colors.action} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Nenhum encontro marcado</Text>
          <Text style={styles.subtitle}>Escolha um ponto público e horário em Piripiri.</Text>
        </View>
      </View>

      {onCombineMeeting ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Combinar encontro"
          onPress={onCombineMeeting}
          style={withPress(styles.actionButtonPrimary)}
        >
          <Text style={styles.actionButtonPrimaryText}>Combinar encontro</Text>
        </Pressable>
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
      backgroundColor: colors.nature.foliage + "10",
      borderColor: colors.nature.foliage + "30",
    },
    cardConfirmed: {
      backgroundColor: colors.surface,
      borderColor: colors.action + "30",
    },
    cardProposed: {
      backgroundColor: colors.surface,
      borderColor: colors.highlight + "40",
    },
    cardEmpty: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
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
      fontSize: tokens.fontSize[14],
      fontWeight: "700",
      color: colors.m3.onSurface,
    },
    highlight: {
      fontSize: tokens.fontSize[14],
      fontWeight: "600",
      color: colors.action,
      marginTop: 2,
    },
    subtitle: {
      fontSize: tokens.fontSize[12],
      color: colors.m3.onSurfaceVariant,
      marginTop: 2,
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[4],
    },
    actionButtonPrimary: {
      backgroundColor: colors.action,
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      minHeight: tokens.accessibility.touchTarget,
    },
    actionButtonPrimaryText: {
      color: colors.nature.onFoliage,
      fontSize: tokens.fontSize[12],
      fontWeight: "700",
    },
    actionButtonSecondary: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      minHeight: tokens.accessibility.touchTarget,
    },
    actionButtonSecondaryText: {
      color: colors.m3.onSurface,
      fontSize: tokens.fontSize[12],
      fontWeight: "600",
    },
  });
}
