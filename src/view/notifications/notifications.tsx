import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppNotification } from "@/model/entities/notification";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge, type IconBadgeTone } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import {
  useNotificationsViewModel,
} from "@/viewmodel/useNotificationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { groupNotificationsByPeriod, notificationTimeLabel } from "@/viewmodel/notificationGrouping";
import { resolveNotificationRoute } from "@/viewmodel/notificationRoute";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";

export type NotificationsProps = {
  sessionUserId: string | null;
  onBack?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToAction?: (actionUrl: string) => void;
  onExploreBooks?: () => void;
};

const TYPE_CONFIG: Record<
  AppNotification["type"],
  { icon: AppIconName; tone: IconBadgeTone; label: string; actionHint: string }
> = {
  request_received: { icon: "mail", tone: "action", label: "Proposta", actionHint: "Ver pedido recebido" },
  request_accepted: { icon: "swap", tone: "trade", label: "Aceita", actionHint: "Combinar entrega" },
  request_rejected: { icon: "mail", tone: "neutral", label: "Atualização", actionHint: "Ver detalhes" },
  request_cancelled: { icon: "mail", tone: "neutral", label: "Cancelada", actionHint: "Ver pedidos" },
  favorite_update: { icon: "heart", tone: "donation", label: "Favorito", actionHint: "Ver exemplar" },
  new_message: { icon: "chat", tone: "action", label: "Mensagem", actionHint: "Abrir conversa" },
  rating_received: { icon: "star", tone: "donation", label: "Avaliação", actionHint: "Ver perfil" },
  safety_tip: { icon: "info", tone: "neutral", label: "Segurança", actionHint: "Ler orientações" },
  system: { icon: "info", tone: "neutral", label: "Aviso", actionHint: "Saber mais" },
  search_alert_match: { icon: "shelf", tone: "donation", label: "Alerta", actionHint: "Explorar busca" },
  meeting_update: { icon: "calendar", tone: "action", label: "Encontro", actionHint: "Ver ponto de troca" },
};

/**
 * Figma `07.04 · Notificações` (`25:812` / Web `148:1020`) e
 * `07.13 · Notificações · vazio` (`254:6456` / Web `370:17181`).
 */
export default function Notifications({
  sessionUserId,
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
  onExploreBooks,
}: NotificationsProps) {
  const [state, actions] = useNotificationsViewModel(sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wide = useIsWideWeb();
  const { isOnline } = useNetworkStatus();
  const handleExplore = onExploreBooks ?? onBack;
  const [refreshing, setRefreshing] = useState(false);
  const [confirmClearAllVisible, setConfirmClearAllVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const showListChrome = state.loading || Boolean(state.error) || state.notifications.length > 0;
  const hasReadNotifications = state.notifications.some((n) => n.read);

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Notificações" onBack={() => onBack?.()} />
        <View style={styles.centered}>
          <View style={styles.emptyIconCircle}>
            <AppIcon name="bell" size={32} color={colors.action} />
          </View>
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Sessão necessária
          </Text>
          <Text style={[styles.emptyDescription, styles.textCentered]}>
            Você precisa estar conectado à sua conta do IpêBook para acompanhar notificações e novidades de livros em Piripiri.
          </Text>
          <View style={styles.buttonWrapper}>
            <FilledButton
              label="Entrar na conta"
              onPress={() => onNavigateToLogin?.()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar
        title="Notificações"
        onBack={() => onBack?.()}
        contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined}
      />
      <View style={[styles.content, wide && styles.contentWide]}>
        {state.systemPermissionGranted === false ? (
          <View
            style={styles.permissionBanner}
            accessible={true}
            accessibilityRole="alert"
            testID="permission-alert"
          >
            <View style={styles.permissionIconCircle}>
              <AppIcon name="info" size={20} color={colors.highlight} />
            </View>
            <View style={styles.permissionTextContainer}>
              <Text style={styles.permissionBannerTitle}>Notificações desativadas</Text>
              <Text style={styles.permissionBannerDescription}>
                Ative as notificações do IpêBook nas configurações do aparelho para não perder propostas nem lembretes de encontros presenciais.
              </Text>
            </View>
          </View>
        ) : null}

        {showListChrome ? (
          <View style={[styles.filterBar, wide && styles.filterBarWide]}>
            <View accessibilityRole="tablist" style={[styles.filterTabs, wide && styles.filterTabsWide]}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: state.filter === "all" }}
                onPress={() => actions.setFilter("all")}
                style={withPress([
                  styles.filterChip,
                  wide && styles.filterChipWide,
                  state.filter === "all" && styles.filterChipActive,
                ])}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    state.filter === "all" && styles.filterChipTextActive,
                  ]}
                >
                  Todas ({state.notifications.length})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: state.filter === "unread" }}
                onPress={() => actions.setFilter("unread")}
                style={withPress([
                  styles.filterChip,
                  wide && styles.filterChipWide,
                  state.filter === "unread" && styles.filterChipActive,
                ])}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    state.filter === "unread" && styles.filterChipTextActive,
                  ]}
                >
                  Não lidas ({state.unreadCount})
                </Text>
              </Pressable>
            </View>

            <View style={[styles.actionButtonsRow, wide && styles.actionButtonsRowWide]}>
              {state.unreadCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Marcar todas como lidas"
                  onPress={() => void actions.markAllAsRead()}
                  style={withPress(styles.actionBtn)}
                >
                  <AppIcon name="check" size={16} color={colors.action} />
                  <Text style={styles.actionBtnText}>Marcar todas como lidas</Text>
                </Pressable>
              ) : null}

              {hasReadNotifications ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar notificações lidas"
                  onPress={() => void actions.clearRead()}
                  style={withPress(styles.actionBtn)}
                >
                  <Text style={styles.actionBtnSecondaryText}>Limpar lidas</Text>
                </Pressable>
              ) : null}

              {state.notifications.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar todas as notificações"
                  onPress={() => setConfirmClearAllVisible(true)}
                  style={withPress(styles.actionBtn)}
                >
                  <Text style={styles.actionBtnDangerText}>Limpar tudo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={wide ? styles.main : styles.flexOne}>
          {state.loading ? (
            <LoadingState label="Carregando notificações" />
          ) : state.error ? (
            isOnline ? (
              <ErrorState message={state.error} onRetry={() => void actions.reload()} />
            ) : (
              <OfflineState onRetry={() => void actions.reload()} />
            )
          ) : state.filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="bell" size={36} color={colors.action} />
              </View>
              <Text accessibilityRole="header" style={styles.emptyHeadline}>
                {state.filter === "unread" ? "Nenhuma notificação não lida" : "Você está em dia"}
              </Text>
              <Text style={styles.emptyDescription}>
                {state.filter === "unread"
                  ? "Você já visualizou todas as suas novidades recentes!"
                  : "Suas mensagens, propostas e avisos de novos livros em Piripiri aparecerão aqui."}
              </Text>
              {state.filter === "unread" && state.notifications.length > 0 ? (
                <View style={styles.buttonWrapper}>
                  <FilledButton
                    label="Ver todas as notificações"
                    onPress={() => actions.setFilter("all")}
                  />
                </View>
              ) : handleExplore ? (
                <View style={styles.buttonWrapper}>
                  <FilledButton
                    label="Explorar livros"
                    onPress={handleExplore}
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SectionList
              testID="notifications-list"
              keyboardShouldPersistTaps="handled"
              sections={groupNotificationsByPeriod(state.filteredNotifications).map((section) => ({
                ...section,
                data: [...section.data],
              }))}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={false}
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    {section.title}
                  </Text>
                  <View style={styles.sectionHeaderLine} />
                </View>
              )}
              renderItem={({ item }) => {
                const config = TYPE_CONFIG[item.type] ?? {
                  icon: "info",
                  tone: "neutral" as const,
                  label: "Aviso",
                  actionHint: "Ver detalhes",
                };
                const time = notificationTimeLabel(item.createdAt);
                const destination = resolveNotificationRoute(item);

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}. ${item.message}`}
                    onPress={() => {
                      if (!item.read) {
                        void actions.markAsRead(item.id);
                      }
                      if (destination) {
                        onNavigateToAction?.(destination);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.card,
                      !item.read && styles.cardUnread,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <IconBadge icon={config.icon} tone={config.tone} />
                      <View style={styles.cardTitleContainer}>
                        <View style={styles.titleRow}>
                          <Text
                            style={[
                              styles.cardTitle,
                              !item.read && styles.cardTitleUnread,
                            ]}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>
                          {!item.read ? <View style={styles.unreadDot} /> : null}
                        </View>
                        <View style={styles.metaRow}>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{config.label}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Botão de exclusão da notificação individual */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Excluir notificação"
                        testID={`delete-notif-${item.id}`}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={(e) => {
                          e?.stopPropagation?.();
                          void actions.deleteNotification(item.id);
                        }}
                        style={styles.deleteIconButton}
                      >
                        <AppIcon
                          name="delete"
                          size={18}
                          color={colors.secondaryText}
                        />
                      </Pressable>

                      {/* Seta indicando ação de toque */}
                      <AppIcon
                        name="chevronRight"
                        size={20}
                        color={colors.secondaryText}
                      />
                    </View>

                    {/* Mensagem e horário curto na mesma linha (Spec 043 RN-12 / Figma 07.04) */}
                    <Text style={styles.cardMessage}>
                      {item.message}
                      {time ? <Text>{` ·\u00A0${time}`}</Text> : null}
                    </Text>

                    {/* Rodapé do card: ação contextual rápida */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.actionHintText}>{config.actionHint}</Text>
                      <AppIcon name="chevronRight" size={14} color={colors.action} />
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </View>

      <Dialog
        visible={confirmClearAllVisible}
        title="Limpar todas as notificações?"
        message="Todas as notificações da sua conta serão removidas permanentemente."
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          setConfirmClearAllVisible(false);
          void actions.clearAll();
        }}
        onCancel={() => setConfirmClearAllVisible(false)}
      />
    </SafeAreaView>
  );
}

const WIDE_CONTENT_MAX_WIDTH = 1200;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    sectionHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[8],
    },
    sectionHeader: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.semiBold,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    sectionHeaderLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      opacity: 0.6,
    },
    content: {
      flex: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
    },
    permissionBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderLeftWidth: 4,
      borderLeftColor: colors.highlight,
      borderRadius: tokens.radius.cardSmall,
      padding: tokens.spacing[14],
      marginBottom: tokens.spacing[12],
      gap: tokens.spacing[10],
    },
    permissionIconCircle: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
    },
    permissionTextContainer: {
      flex: 1,
    },
    permissionBannerTitle: {
      ...tokens.typography.labelLarge,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
      marginBottom: 2,
    },
    permissionBannerDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    flexOne: { flex: 1, minHeight: 0 },
    contentWide: {
      maxWidth: WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[16],
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[48],
    },
    main: { flex: 1, minWidth: 0, maxWidth: 880, alignSelf: "stretch", minHeight: 0 },
    filterBarWide: {
      width: 260,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
      gap: tokens.spacing[16],
      marginBottom: 0,
    },
    filterTabsWide: { flexDirection: "column", gap: tokens.spacing[6] },
    filterChipWide: { minHeight: 44, paddingHorizontal: tokens.spacing[16], borderWidth: 0, backgroundColor: "transparent" },
    filterBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[12],
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    filterTabs: {
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    filterChip: {
      minHeight: tokens.spacing[32],
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.shapeMorph.chipUnselected,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    filterChipActive: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
      borderWidth: 0,
    },
    filterChipText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurfaceVariant,
    },
    filterChipTextActive: {
      color: colors.m3.onSecondaryContainer,
      fontWeight: tokens.fontWeight.semiBold,
    },
    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      flexWrap: "wrap",
    },
    actionButtonsRowWide: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: tokens.spacing[8],
    },
    actionBtn: {
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.small,
    },
    actionBtnText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
    actionBtnSecondaryText: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.medium,
    },
    actionBtnDangerText: {
      ...tokens.typography.labelMedium,
      color: colors.error,
      fontWeight: tokens.fontWeight.medium,
    },
    centered: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    emptyState: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      paddingVertical: tokens.spacing[48],
      gap: tokens.spacing[12],
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.container,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[8],
    },
    emptyHeadline: {
      ...tokens.typography.titleLarge,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 20,
    },
    textCentered: {
      textAlign: "center",
    },
    buttonWrapper: {
      marginTop: tokens.spacing[12],
      width: "100%",
      maxWidth: 320,
    },
    listContent: {
      paddingBottom: tokens.spacing[32],
      gap: tokens.spacing[12],
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.cardSmall,
      padding: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[10],
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    cardPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
      transform: [{ scale: 0.99 }],
    },
    cardUnread: {
      borderColor: colors.action,
      borderLeftWidth: 4,
      backgroundColor: colors.soft,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[10],
    },
    cardTitleContainer: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    cardTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      flex: 1,
    },
    cardTitleUnread: {
      fontWeight: tokens.fontWeight.bold,
      color: colors.actionDeep,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    typeBadge: {
      paddingHorizontal: tokens.spacing[6],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    typeBadgeText: {
      ...tokens.typography.labelSmall,
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.medium,
    },
    timeText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontSize: 12,
    },
    unreadDot: {
      width: 9,
      height: 9,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
    deleteIconButton: {
      minWidth: 32,
      minHeight: 32,
      justifyContent: "center",
      alignItems: "center",
      padding: tokens.spacing[4],
      borderRadius: tokens.radius.full,
    },
    cardMessage: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingTop: tokens.spacing[4],
    },
    actionHintText: {
      ...tokens.typography.labelSmall,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
  });
}
