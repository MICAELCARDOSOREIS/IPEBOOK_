import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { ScrollEdgeScreen, ScrollEdgeSectionList } from "@/view/components/ScrollEdgeScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppNotification } from "@/model/entities/notification";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge, type IconBadgeTone } from "@/view/components/IconBadge";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { PermissionPromptDialog } from "@/view/components/PermissionPromptDialog";
import { Snackbar } from "@/view/components/Snackbar";
import { TopAppBar } from "@/view/components/TopAppBar";
import {
  makeNetworkStatus,
  makeNotificationsPromptViewModel,
  makeNotificationsViewModel,
  makeWebPushViewModel,
} from "@/di/container";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useTheme } from "@/view/theme/ThemeProvider";
import { notificationTimeLabel } from "@/viewmodel/notificationGrouping";
import { meetingNotificationDisplay, notificationDateSections, notificationRows } from "@/viewmodel/meetingNotifications";
import { formatMeetingWhen } from "@/view/meetingFormat";
import { resolveNotificationRoute } from "@/viewmodel/notificationRoute";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useOnRefocus } from "@/view/useRefocusKey";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { createNotificationsStyles, withWebInteractive } from "./notificationsStyles";

export type NotificationsProps = {
  sessionUserId: string | null;
  sessionLoading?: boolean;
  focusKey?: number;
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
  request_accepted: { icon: "checkCircle", tone: "trade", label: "Aceita", actionHint: "Combinar entrega" },
  request_rejected: { icon: "close", tone: "neutral", label: "Atualização", actionHint: "Ver detalhes" },
  request_cancelled: { icon: "archive", tone: "neutral", label: "Cancelada", actionHint: "Ver pedidos" },
  favorite_update: { icon: "heart", tone: "donation", label: "Favorito", actionHint: "Ver exemplar" },
  new_message: { icon: "chat", tone: "action", label: "Mensagem", actionHint: "Abrir conversa" },
  rating_received: { icon: "star", tone: "donation", label: "Avaliação", actionHint: "Ver perfil" },
  safety_tip: { icon: "lock", tone: "neutral", label: "Segurança", actionHint: "Ler orientações" },
  system: { icon: "info", tone: "neutral", label: "Aviso", actionHint: "Saber mais" },
  search_alert_match: { icon: "search", tone: "donation", label: "Alerta", actionHint: "Explorar busca" },
  meeting_update: { icon: "calendar", tone: "action", label: "Encontro", actionHint: "Ver negociação" },
};

/**
 * Figma `07.04 · Notificações` (`25:812` / Web `148:1020`) e
 * `07.13 · Notificações · vazio` (`254:6456` / Web `370:17181`).
 */
export default function Notifications({
  sessionUserId,
  sessionLoading = false,
  focusKey,
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
  onExploreBooks,
}: NotificationsProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedLogin = useGuardedPress(onNavigateToLogin);
  const guardedAction = useGuardedPress(onNavigateToAction);
  const guardedExplore = useGuardedPress(onExploreBooks ?? onBack);
  const [state, actions] = makeNotificationsViewModel(sessionUserId, true);
  useOnRefocus(focusKey, () => {
    void actions.refresh();
  });
  const [prompt, promptActions] = makeNotificationsPromptViewModel();
  const webPush = makeWebPushViewModel(sessionUserId);
  const guardedAskPermission = useGuardedPress(promptActions.reopen);
  const { colors } = useTheme();
  const styles = useMemo(() => createNotificationsStyles(colors), [colors]);
  const wide = useIsWideWeb();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const { isOnline } = makeNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<"read" | "all" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<ReadonlySet<string>>(() => new Set());
  const sections = useMemo(
    () => notificationDateSections(notificationRows(state.notifications, state.filter), expandedHistory),
    [state.notifications, state.filter, expandedHistory],
  );

  const toggleHistory = (requestId: string) => {
    setExpandedHistory((previous) => {
      const next = new Set(previous);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  };

  const deleteBatch = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await (confirmDelete === "read" ? actions.clearRead() : actions.clearAll());
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
      setManageOpen(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const showListChrome = !state.loading && !state.error && state.notifications.length > 0;
  const hasReadNotifications = state.notifications.some((n) => n.read);

  const renderHeader = (showRefreshAction: boolean) => {
    if (!wide) {
      return <TopAppBar title="Notificações" onBack={guardedBack} />;
    }

    return (
      <View style={styles.wideHeader}>
        <View style={styles.wideHeaderLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            onPress={guardedBack}
            style={withWebInteractive(
              styles.wideBackButton,
              styles.wideBackButtonHover,
              colors.m3.focusRing,
            )}
          >
            <AppIcon name="back" size={20} color={colors.m3.onSurface} />
          </Pressable>
          <View style={styles.wideHeaderTextGroup}>
            <Text accessibilityRole="header" style={styles.wideTitle}>
              Notificações
            </Text>
            <Text style={styles.wideSubtitle}>
              Avisos de propostas, mensagens e atualizações em Piripiri
            </Text>
          </View>
        </View>

        {showRefreshAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar notificações"
            accessibilityState={{ busy: refreshing, disabled: refreshing }}
            disabled={refreshing}
            onPress={() => void handleRefresh()}
            style={withWebInteractive(
              [styles.refreshButton, refreshing && styles.refreshButtonDisabled],
              styles.refreshButtonHover,
              colors.m3.focusRing,
            )}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  if (sessionLoading) {
    return (
      <SafeAreaView style={styles.page}>
        {renderHeader(false)}
        <View style={[styles.content, wide && styles.contentWide]}>
          <LoadingState label="Carregando notificações" />
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        {renderHeader(false)}
        <View style={[styles.centered, wide && styles.centeredWide]}>
          <View style={[styles.emptyCard, wide && styles.emptyCardWide]}>
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
                onPress={guardedLogin}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const hasScrollableNotifications = !state.loading && !state.error && sections.length > 0;
  const scrollControls = isIos && hasScrollableNotifications;
  const controls = (
    <>
        {Platform.OS === "web" ? (
          webPush.status === "active" || webPush.status === "inactive" || webPush.status === "requires-install" || webPush.error ? (
            <View style={[styles.permissionBannerAction, wide && styles.permissionBannerActionWide]}>
              {webPush.status === "active" || webPush.status === "inactive" ? (
                <OutlinedButton
                  label={webPush.status === "active" ? "Desativar avisos neste iPhone" : "Ativar avisos neste iPhone"}
                  loading={webPush.busy}
                  onPress={() => void webPush.toggle()}
                />
              ) : webPush.status === "requires-install" ? (
                <Text style={styles.permissionBannerDescription}>
                  Para receber avisos neste iPhone, adicione o IpêBook à Tela de Início e abra a central pelo ícone.
                </Text>
              ) : null}
              {webPush.error ? <Text accessibilityRole="alert" style={styles.permissionBannerDescription}>{webPush.error}</Text> : null}
            </View>
          ) : null
        ) : state.systemPermissionGranted === false && !prompt.granted ? (
          <View
            style={[styles.permissionBanner, wide && styles.permissionBannerWide]}
            testID="permission-alert"
          >
            <View style={styles.permissionIconCircle}>
              <AppIcon name="info" size={20} color={colors.highlight} />
            </View>
            <View style={styles.permissionTextContainer}>
              <Text accessibilityRole="alert" style={styles.permissionBannerTitle}>Notificações desativadas</Text>
              <Text style={styles.permissionBannerDescription}>
                Ative as notificações do IpêBook nas configurações do aparelho para não perder propostas nem lembretes de encontros presenciais.
              </Text>
              <View style={styles.permissionBannerAction}>
                <OutlinedButton
                  label="Pedir permissão de novo"
                  accessibilityLabel="Pedir permissão de avisos novamente ao aparelho"
                  onPress={guardedAskPermission}
                />
              </View>
            </View>
          </View>
        ) : null}

        {showListChrome ? (
          <View>
            <View style={styles.filterBar}>
              <View style={styles.filterTabs}>
                {(["all", "unread"] as const).map((filter) => {
                  const selected = state.filter === filter;
                  const label = filter === "all" ? "Todas" : `Não lidas (${state.unreadCount})`;
                  const accessibleLabel = filter === "all" ? `Todas (${state.notifications.length})` : label;
                  return (
                    <Pressable
                      key={filter}
                      accessibilityRole="button"
                      accessibilityLabel={accessibleLabel}
                      accessibilityState={{ selected }}
                      aria-pressed={selected}
                      onPress={() => actions.setFilter(filter)}
                      style={withWebInteractive(
                        [
                          styles.filterChip,
                          selected && styles.filterChipActive,
                          isIos && !selected && (iosGlass
                            ? { backgroundColor: "transparent", borderColor: "transparent", overflow: "hidden" }
                            : { backgroundColor: colors.m3.surfaceContainer }),
                        ],
                        selected ? styles.filterChipActiveHover : styles.filterChipHover,
                        colors.m3.focusRing,
                      )}
                    >
                      {isIos && iosGlass && !selected ? (
                        <IosGlassBackdrop style={{ borderRadius: 999 }} />
                      ) : null}
                      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={[styles.actionButtonsRow, !wide && styles.actionButtonsRowNarrow]}>
                {state.unreadCount > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Marcar todas como lidas"
                    onPress={() => void actions.markAllAsRead()}
                    style={withWebInteractive(
                      [styles.actionBtn, styles.actionBtnPrimary], styles.actionBtnPrimaryHover, colors.m3.focusRing,
                    )}
                  >
                    <AppIcon name="check" size={16} color={colors.action} />
                    <Text style={styles.actionBtnText}>Marcar todas como lidas</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: manageOpen }}
                  onPress={() => setManageOpen((open) => !open)}
                  style={withWebInteractive(
                    [
                      styles.actionBtn,
                      isIos && (iosGlass
                        ? { backgroundColor: "transparent", borderColor: "transparent", overflow: "hidden" }
                        : { backgroundColor: colors.m3.surfaceContainer }),
                    ],
                    styles.actionBtnHover,
                    colors.m3.focusRing,
                  )}
                >
                  {isIos && iosGlass ? <IosGlassBackdrop style={{ borderRadius: 999 }} /> : null}
                  <AppIcon name="more" size={18} color={colors.secondaryText} />
                  <Text style={styles.actionBtnSecondaryText}>Gerenciar notificações</Text>
                </Pressable>
              </View>
            </View>
            {manageOpen ? (
              <View style={[styles.managementActions, wide && styles.managementActionsWide]}>
                {hasReadNotifications ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmDelete("read")}
                    style={withWebInteractive(styles.actionBtn, styles.actionBtnDangerHover, colors.m3.focusRing)}
                  >
                    <AppIcon name="delete" size={15} color={colors.error} />
                    <Text style={styles.actionBtnDangerText}>Excluir notificações lidas</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirmDelete("all")}
                  style={withWebInteractive(styles.actionBtn, styles.actionBtnDangerHover, colors.m3.focusRing)}
                >
                  <AppIcon name="delete" size={15} color={colors.error} />
                  <Text style={styles.actionBtnDangerText}>Excluir todas as notificações</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

    </>
  );

  const wideSidePane = wide && showListChrome ? (
    <View style={styles.wideSidePane} testID="notifications-side-pane">
      <View style={styles.wideSideCard}>
        <Text accessibilityRole="header" style={styles.wideSideTitle}>
          Atalhos rápidos
        </Text>
        <Text style={styles.wideSideDescription}>
          Acesse diretamente suas conversas, alertas de busca ou preferências de avisos.
        </Text>
        <View style={styles.wideSideActions}>
          {onNavigateToAction ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir para Conversas"
                onPress={() => guardedAction("/conversas")}
                style={withWebInteractive(styles.wideSideLink, styles.wideSideLinkHover, colors.m3.focusRing)}
              >
                <View style={styles.wideSideLinkIcon}>
                  <AppIcon name="chat" size={16} color={colors.action} />
                </View>
                <Text style={styles.wideSideLinkText}>Conversas</Text>
                <AppIcon name="chevronRight" size={16} color={colors.m3.onSurfaceVariant} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir para Meus alertas"
                onPress={() => guardedAction("/alertas")}
                style={withWebInteractive(styles.wideSideLink, styles.wideSideLinkHover, colors.m3.focusRing)}
              >
                <View style={styles.wideSideLinkIcon}>
                  <AppIcon name="search" size={16} color={colors.action} />
                </View>
                <Text style={styles.wideSideLinkText}>Meus alertas de livros</Text>
                <AppIcon name="chevronRight" size={16} color={colors.m3.onSurfaceVariant} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir para Preferências de notificações"
                onPress={() => guardedAction("/perfil/configuracoes")}
                style={withWebInteractive(styles.wideSideLink, styles.wideSideLinkHover, colors.m3.focusRing)}
              >
                <View style={styles.wideSideLinkIcon}>
                  <AppIcon name="bell" size={16} color={colors.action} />
                </View>
                <Text style={styles.wideSideLinkText}>Preferências de avisos</Text>
                <AppIcon name="chevronRight" size={16} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.wideTipCard}>
        <View style={styles.wideTipHeader}>
          <AppIcon name="place" size={16} color={colors.nature.foliage} />
          <Text style={styles.wideTipTitle}>Dica de segurança</Text>
        </View>
        <Text style={styles.wideTipText}>
          Combine trocas e entregas sempre pelo chat e dê preferência aos pontos seguros de Piripiri.
        </Text>
      </View>
    </View>
  ) : null;

  return (
    <ScrollEdgeScreen style={styles.page} header={renderHeader(true)} scrolling={hasScrollableNotifications}>
      <View style={[styles.content, wide && styles.contentWide]}>
        {scrollControls ? null : controls}

        <View
          testID="notifications-main"
          style={wide ? (showListChrome ? [styles.main, styles.mainWideColumns] : styles.mainSolo) : styles.flexOne}
        >
          <View style={wide && showListChrome ? styles.wideListColumn : styles.flexOne}>
          {state.loading ? (
            <LoadingState
              label="Carregando notificações"
              variant="conversations"
              style={wide && !showListChrome ? styles.loadingSolo : undefined}
            />
          ) : state.error ? (
            isOnline ? (
              <ErrorState message={state.error} onRetry={() => void actions.reload()} />
            ) : (
              <OfflineState onRetry={() => void actions.reload()} />
            )
          ) : sections.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                wide && styles.emptyStateWide,
                wide && !showListChrome && styles.emptyStateSolo,
              ]}
            >
              <View style={[styles.emptyCard, wide && styles.emptyCardWide]}>
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
                ) : guardedExplore ? (
                  <View style={styles.buttonWrapper}>
                    <FilledButton
                      label="Explorar livros"
                      onPress={guardedExplore}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <ScrollEdgeSectionList
              testID="notifications-list"
              style={styles.flexOne}
              sections={sections}
              ListHeaderComponent={scrollControls ? controls : undefined}
              keyExtractor={({ item }) => item.id}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: scrollBottomPadding.withoutBottomBar },
              ]}
              stickySectionHeadersEnabled={false}
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              {...standardVerticalScrollProps}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    {section.title}
                  </Text>
                  <View style={styles.sectionHeaderLine} />
                </View>
              )}
              renderItem={({ item: { item, requestId, history, historical } }) => {
                const config = TYPE_CONFIG[item.type] ?? {
                  icon: "info",
                  tone: "neutral" as const,
                  label: "Aviso",
                  actionHint: "Ver detalhes",
                };
                const meeting = requestId ? state.meetingsByRequest?.get(requestId) : undefined;
                const current = historical ? undefined : meetingNotificationDisplay(meeting, sessionUserId);
                const title = current?.title ?? item.title;
                const message = current && meeting
                  ? `${formatMeetingWhen(meeting.scheduledAt)} · ${meeting.pointName}`
                  : historical ? item.message.replace(/\. Confirme na negociação\.$/, ".") : item.message;
                const actionHint = historical ? "Ver negociação atual" : (current?.action ?? config.actionHint);
                const time = historical ? new Date(item.createdAt).toLocaleDateString("pt-BR") : notificationTimeLabel(item.createdAt);
                const destination = requestId ? `/conversa/${requestId}` : resolveNotificationRoute(item);
                const historyOpen = Boolean(requestId && expandedHistory.has(requestId));
                const historyUnread = history?.filter((notice) => !notice.read).length ?? 0;

                return (
                  <View style={historical ? styles.historicalRow : undefined}>
                    <View style={[styles.card, !item.read && styles.cardUnread]}>
                      {!item.read ? <View style={styles.unreadStripe} /> : null}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${title}. ${message}`}
                        accessibilityHint={actionHint}
                        onPress={() => {
                          if (!item.read) {
                            void actions.markAsRead(item.id);
                          }
                          if (destination) {
                            guardedAction(destination);
                          }
                        }}
                        style={withWebInteractive(
                          [styles.cardBody, wide && styles.cardBodyWide],
                          styles.cardBodyHover,
                          colors.m3.focusRing,
                        )}
                      >
                        <View style={[styles.cardHeader, wide && styles.cardHeaderWide]}>
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
                                {title}
                              </Text>
                              {!item.read ? (
                                <View style={styles.novaBadge}>
                                  <View style={styles.unreadDot} />
                                  <Text style={styles.novaBadgeText}>Nova</Text>
                                </View>
                              ) : null}
                              {wide ? (
                                <>
                                  <View style={styles.typeBadge}>
                                    <Text style={styles.typeBadgeText}>{historical ? "Histórico" : config.label}</Text>
                                  </View>
                                  {time ? <Text style={styles.timeText}>{` ·\u00A0${time}`}</Text> : null}
                                </>
                              ) : null}
                            </View>
                            {!wide ? (
                              <View style={styles.metaRow}>
                                <View style={styles.typeBadge}>
                                  <Text style={styles.typeBadgeText}>{historical ? "Histórico" : config.label}</Text>
                                </View>
                                {time ? <Text style={styles.timeText}>{` ·\u00A0${time}`}</Text> : null}
                              </View>
                            ) : null}
                            <Text style={styles.cardMessage}>{message}</Text>
                            {!wide ? (
                              <View style={[styles.cardFooter, !item.read && styles.cardFooterUnread]}>
                                <Text style={[styles.actionHintText, !item.read && styles.actionHintTextUnread]}>
                                  {actionHint}
                                </Text>
                                <AppIcon
                                  name="chevronRight"
                                  size={14}
                                  color={item.read ? colors.action : colors.m3.onSecondaryContainer}
                                />
                              </View>
                            ) : null}
                          </View>
                        </View>

                        {/* Rodapé do card: ação contextual rápida */}
                        {wide ? (
                          <View
                            style={[
                              styles.cardFooter,
                              styles.cardFooterWide,
                              !item.read && styles.cardFooterUnread,
                            ]}
                          >
                            <Text style={[styles.actionHintText, !item.read && styles.actionHintTextUnread]}>
                              {actionHint}
                            </Text>
                            <AppIcon
                              name="chevronRight"
                              size={14}
                              color={item.read ? colors.action : colors.m3.onSecondaryContainer}
                            />
                          </View>
                        ) : null}
                      </Pressable>

                      <View style={styles.cardActions}>
                        {!item.read ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Marcar como lida"
                            testID={`mark-read-notif-${item.id}`}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={() => void actions.markAsRead(item.id)}
                            style={withWebInteractive(
                              styles.cardIconButton,
                              styles.cardIconButtonPrimaryHover,
                              colors.m3.focusRing,
                            )}
                          >
                            <AppIcon name="check" size={16} color={colors.action} />
                          </Pressable>
                        ) : null}

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Excluir notificação"
                          testID={`delete-notif-${item.id}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => void actions.deleteNotification(item.id)}
                          style={withWebInteractive(
                            styles.cardIconButton,
                            styles.cardIconButtonDangerHover,
                            colors.m3.focusRing,
                          )}
                        >
                          <AppIcon
                            name="delete"
                            size={16}
                            color={colors.secondaryText}
                          />
                        </Pressable>
                      </View>
                    </View>
                    {requestId && history && history.length > 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded: historyOpen }}
                        onPress={() => toggleHistory(requestId)}
                        style={withWebInteractive(styles.historyToggle, styles.actionBtnHover, colors.m3.focusRing)}
                      >
                        <AppIcon name={historyOpen ? "chevronUp" : "chevronDown"} size={16} color={colors.action} />
                        <Text style={styles.actionBtnText}>
                          {`${historyOpen ? "Ocultar histórico" : "Ver histórico"} (${history.length})${historyUnread ? ` · ${historyUnread} ${historyUnread === 1 ? "não lida" : "não lidas"}` : ""}`}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              }}
            />
          )}
          </View>
          {wideSidePane}
        </View>
      </View>

      <Snackbar
        visible={state.actionError !== null}
        message={state.actionError ?? ""}
        onDismiss={actions.clearActionError}
      />

      <Dialog
        visible={confirmDelete !== null}
        title={confirmDelete === "read" ? "Excluir notificações lidas?" : "Excluir todas as notificações?"}
        message={confirmDelete === "read"
          ? "As notificações lidas serão removidas permanentemente."
          : "Todas as notificações da sua conta serão removidas permanentemente."}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive
        loading={deleting}
        onConfirm={() => void deleteBatch()}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Reabrir o aviso explicativo: a pessoa pediu no botão da banner, então o prompt nativo vem depois. */}
      {Platform.OS !== "web" ? <PermissionPromptDialog
        permission="notifications"
        status={prompt.status}
        onAllow={() => void promptActions.approve()}
        onLater={() => void promptActions.decline()}
        onDismiss={promptActions.dismiss}
      /> : null}
    </ScrollEdgeScreen>
  );
}
