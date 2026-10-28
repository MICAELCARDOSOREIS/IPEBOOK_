import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import type { Meeting } from "@/model/entities/meeting";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useUserMeetingsViewModel } from "@/viewmodel/useUserMeetingsViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatMeetingWhen } from "@/view/meetingFormat";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

export type MeetingHistoryProps = {
  onBack?: () => void;
  onNavigateToNegotiation?: (requestId: string) => void;
};

export default function MeetingHistory({ onBack, onNavigateToNegotiation }: MeetingHistoryProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState] = useAuthViewModel();
  // Web larga: coluna mais ampla e dois cartões por linha.
  const wide = useIsWideWeb();
  const userId = authState.user?.id ?? null;
  const [state, actions] = useUserMeetingsViewModel(userId);

  function getStatusLabel(meeting: Meeting): { text: string; isPast: boolean } {
    if (meeting.status === "cancelled") {
      return { text: "Cancelado", isPast: true };
    }
    const isPast = new Date(meeting.scheduledAt).getTime() < Date.now();
    if (meeting.status === "confirmed") {
      return { text: isPast ? "Realizado" : "Confirmado", isPast };
    }
    return { text: isPast ? "Expirado" : "Aguardando confirmação", isPast };
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} title="Histórico de encontros" onBack={onBack ?? (() => {})} />
      <ScrollView contentContainerStyle={[styles.content, wide && styles.contentWide]}>
        {state.loading ? (
          <LoadingState label="Carregando encontros…" />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : state.meetings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="calendar" size={48} color={colors.m3.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>Nenhum encontro registrado</Text>
            <Text style={styles.emptyText}>
              Quando você aceitar ou propor trocas, os encontros nos 4 pontos seguros de Piripiri aparecerão aqui.
            </Text>
          </View>
        ) : (
          <View style={[styles.list, wide && styles.listWide]}>
            <Text style={[styles.summaryText, wide && styles.fullRow]}>
              {state.meetings.length} {state.meetings.length === 1 ? "encontro registrado" : "encontros registrados"} nos pontos públicos de Piripiri
            </Text>
            {state.meetings.map((meeting) => {
              const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meeting.pointName);
              const statusInfo = getStatusLabel(meeting);
              return (
                <Pressable
                  key={meeting.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Encontro em ${meeting.pointName}, ${formatMeetingWhen(meeting.scheduledAt)}. Situação: ${statusInfo.text}`}
                  onPress={() => onNavigateToNegotiation?.(meeting.requestId)}
                  style={[styles.meetingCard, wide && styles.cardWide]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.pointHeader}>
                      <AppIcon name="place" size={20} color={colors.m3.primary} />
                      <Text style={styles.pointTitle}>{meeting.pointName}</Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        meeting.status === "cancelled"
                          ? styles.badgeCancelled
                          : statusInfo.text === "Realizado"
                            ? styles.badgeCompleted
                            : styles.badgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          meeting.status === "cancelled"
                            ? styles.badgeTextCancelled
                            : statusInfo.text === "Realizado"
                              ? styles.badgeTextCompleted
                              : styles.badgeTextActive,
                        ]}
                      >
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>

                  {point ? <Text style={styles.pointAddress}>{point.address}</Text> : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.footerRow}>
                      <AppIcon name="calendar" size={16} color={colors.m3.onSurfaceVariant} />
                      <Text style={styles.footerText}>{formatMeetingWhen(meeting.scheduledAt)}</Text>
                    </View>
                    <View style={styles.detailLink}>
                      <Text style={styles.detailLinkText}>Ver negociação</Text>
                      <AppIcon name="chevronRight" size={16} color={colors.m3.primary} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      padding: tokens.spacing[16],
      flexGrow: 1,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[48],
      paddingHorizontal: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
      textAlign: "center",
    },
    emptyText: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 400,
    },
    list: {
      gap: tokens.spacing[12],
    },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    listWide: { flexDirection: "row", flexWrap: "wrap" },
    fullRow: { width: "100%" },
    cardWide: { flexBasis: "48%", flexGrow: 0 },
    summaryText: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      marginBottom: tokens.spacing[4],
    },
    meetingCard: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
      gap: tokens.spacing[8],
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: tokens.spacing[8],
    },
    pointHeader: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    pointTitle: {
      flex: 1,
      ...tokens.typography.titleMedium,
      fontSize: 15,
      lineHeight: 20,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
    },
    pointAddress: {
      ...tokens.typography.bodyMedium,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      marginLeft: 26,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: tokens.spacing[6],
      paddingTop: tokens.spacing[8],
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    footerText: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurface,
    },
    detailLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    detailLinkText: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.primary,
    },
    badge: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 3,
      borderRadius: tokens.radius.small,
      overflow: "hidden",
    },
    badgeActive: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    badgeCompleted: {
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    badgeCancelled: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    badgeText: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.medium,
    },
    badgeTextActive: {
      color: colors.m3.onSecondaryContainer,
    },
    badgeTextCompleted: {
      color: colors.m3.onSurfaceVariant,
    },
    badgeTextCancelled: {
      color: colors.error,
    },
  });
}
