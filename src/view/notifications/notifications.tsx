import { useMemo, useState } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppNotification } from "@/model/entities/notification";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge, type IconBadgeTone } from "@/view/components/IconBadge";
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
} from "@/di/container";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useTheme } from "@/view/theme/ThemeProvider";
import { groupNotificationsByPeriod, notificationTimeLabel } from "@/viewmodel/notificationGrouping";
import { resolveNotificationRoute } from "@/viewmodel/notificationRoute";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { createNotificationsStyles, withWebInteractive } from "./notificationsStyles";

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
  request_accepted: { icon: "checkCircle", tone: "trade", label: "Aceita", actionHint: "Combinar entrega" },
  request_rejected: { icon: "close", tone: "neutral", label: "Atualização", actionHint: "Ver detalhes" },
  request_cancelled: { icon: "archive", tone: "neutral", label: "Cancelada", actionHint: "Ver pedidos" },
  favorite_update: { icon: "heart", tone: "donation", label: "Favorito", actionHint: "Ver exemplar" },
  new_message: { icon: "chat", tone: "action", label: "Mensagem", actionHint: "Abrir conversa" },
  rating_received: { icon: "star", tone: "donation", label: "Avaliação", actionHint: "Ver perfil" },
  safety_tip: { icon: "lock", tone: "neutral", label: "Segurança", actionHint: "Ler orientações" },
  system: { icon: "info", tone: "neutral", label: "Aviso", actionHint: "Saber mais" },
  search_alert_match: { icon: "search", tone: "donation", label: "Alerta", actionHint: "Explorar busca" },
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
  const guardedBack = useGuardedPress(onBack);
  const guardedLogin = useGuardedPress(onNavigateToLogin);
  const guardedAction = useGuardedPress(onNavigateToAction);
  const guardedExplore = useGuardedPress(onExploreBooks ?? onBack);
  const [state, actions] = makeNotificationsViewModel(sessionUserId);
  const [prompt, promptActions] = makeNotificationsPromptViewModel();
  const guardedAskPermission = useGuardedPress(promptActions.reopen);
  const { colors } = useTheme();
  const styles = useMemo(() => createNotificationsStyles(colors), [colors]);
  const wide = useIsWideWeb();
  const { isOnline } = makeNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmClearAllVisible, setConfirmClearAllVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
  const hasManagementActions =
    state.unreadCount > 0 || hasReadNotifications || state.notifications.length > 0;

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

  return (
    <SafeAreaView style={styles.page}>
      {renderHeader(true)}
      <View style={[styles.content, wide && styles.contentWide]}>
        {state.systemPermissionGranted === false && !prompt.granted ? (
          <View
            style={[styles.permissionBanner, wide && styles.permissionBannerWide]}
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
          <View style={[styles.filterBar, wide && styles.filterBarWide]}>
            {wide ? <Text style={styles.sidebarSectionLabel}>Filtrar</Text> : null}
            <View accessibilityRole="tablist" style={[styles.filterTabs, wide && styles.filterTabsWide]}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={`Todas (${state.notifications.length})`}
                accessibilityState={{ selected: state.filter === "all" }}
                onPress={() => actions.setFilter("all")}
                style={withWebInteractive(
                  [
                    styles.filterChip,
                    wide && styles.filterChipWide,
                    state.filter === "all" && styles.filterChipActive,
                  ],
                  state.filter === "all" ? styles.filterChipActiveHover : styles.filterChipHover,
                  colors.m3.focusRing,
                )}
              >
                {wide ? (
                  <>
                    <Text
                      style={[
                        styles.filterChipText,
                        state.filter === "all" && styles.filterChipTextActive,
                      ]}
                    >
                      Todas
                    </Text>
                    <View
                      style={[
                        styles.filterCountBadge,
                        state.filter === "all" && styles.filterCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountBadgeText,
                          state.filter === "all" && styles.filterCountBadgeTextActive,
                        ]}
                      >
                        {state.notifications.length}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.filterChipText,
                      state.filter === "all" && styles.filterChipTextActive,
                    ]}
                  >
                    Todas ({state.notifications.length})
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={`Não lidas (${state.unreadCount})`}
                accessibilityState={{ selected: state.filter === "unread" }}
                onPress={() => actions.setFilter("unread")}
                style={withWebInteractive(
                  [
                    styles.filterChip,
                    wide && styles.filterChipWide,
                    state.filter === "unread" && styles.filterChipActive,
                  ],
                  state.filter === "unread" ? styles.filterChipActiveHover : styles.filterChipHover,
                  colors.m3.focusRing,
                )}
              >
                {wide ? (
                  <>
                    <Text
                      style={[
                        styles.filterChipText,
                        state.filter === "unread" && styles.filterChipTextActive,
                      ]}
                    >
                      Não lidas
                    </Text>
                    <View
                      style={[
                        styles.filterCountBadge,
                        state.unreadCount > 0 && state.filter !== "unread" && styles.filterCountBadgeAlert,
                        state.filter === "unread" && styles.filterCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountBadgeText,
                          state.unreadCount > 0 &&
                            state.filter !== "unread" &&
                            styles.filterCountBadgeAlertText,
                          state.filter === "unread" && styles.filterCountBadgeTextActive,
                        ]}
                      >
                        {state.unreadCount}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.filterChipText,
                      state.filter === "unread" && styles.filterChipTextActive,
                    ]}
                  >
                    Não lidas ({state.unreadCount})
                  </Text>
                )}
              </Pressable>
            </View>

            {hasManagementActions ? (
              <>
                {wide ? (
                  <>
                    <View style={styles.sidebarDivider} />
                    <Text style={styles.sidebarSectionLabel}>Ações</Text>
                  </>
                ) : null}
                <View style={[styles.actionButtonsRow, wide && styles.actionButtonsRowWide]}>
                  {state.unreadCount > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Marcar todas como lidas"
                      onPress={() => {
                        void actions.markAllAsRead();
                        setFeedbackMessage("Todas as notificações foram marcadas como lidas.");
                      }}
                      style={withWebInteractive(
                        [styles.actionBtn, wide && styles.actionBtnWide, styles.actionBtnPrimary],
                        styles.actionBtnPrimaryHover,
                        colors.m3.focusRing,
                      )}
                    >
                      <AppIcon name="check" size={16} color={colors.action} />
                      <Text style={styles.actionBtnText}>Marcar todas como lidas</Text>
                    </Pressable>
                  ) : null}

                  {hasReadNotifications ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Limpar notificações lidas"
                      onPress={() => {
                        void actions.clearRead();
                        setFeedbackMessage("Notificações lidas foram removidas.");
                      }}
                      style={withWebInteractive(
                        [styles.actionBtn, wide && styles.actionBtnWide],
                        styles.actionBtnHover,
                        colors.m3.focusRing,
                      )}
                    >
                      <AppIcon name="checkCircle" size={15} color={colors.secondaryText} />
                      <Text style={styles.actionBtnSecondaryText}>Limpar lidas</Text>
                    </Pressable>
                  ) : null}

                  {state.notifications.length > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Limpar todas as notificações"
                      onPress={() => setConfirmClearAllVisible(true)}
                      style={withWebInteractive(
                        [styles.actionBtn, wide && styles.actionBtnWide],
                        styles.actionBtnDangerHover,
                        colors.m3.focusRing,
                      )}
                    >
                      <AppIcon name="delete" size={15} color={colors.error} />
                      <Text style={styles.actionBtnDangerText}>Limpar tudo</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        <View
          testID="notifications-main"
          style={wide ? (showListChrome ? styles.main : styles.mainSolo) : styles.flexOne}
        >
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
          ) : state.filteredNotifications.length === 0 ? (
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
            <SectionList
              testID="notifications-list"
              style={styles.flexOne}
              sections={groupNotificationsByPeriod(state.filteredNotifications).map((section) => ({
                ...section,
                data: [...section.data],
              }))}
              keyExtractor={(item) => item.id}
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
                  <Text style={styles.sectionCountBadge}>{section.data.length}</Text>
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
                  <View style={[styles.card, !item.read && styles.cardUnread]}>
                    {!item.read ? <View style={styles.unreadStripe} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title}. ${item.message}`}
                      onPress={() => {
                        if (!item.read) {
                          void actions.markAsRead(item.id);
                        }
                        if (destination) {
                          guardedAction(destination);
                        }
                      }}
                      style={withWebInteractive(
                        styles.cardBody,
                        styles.cardBodyHover,
                        colors.m3.focusRing,
                      )}
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
                            {!item.read ? (
                              <View style={styles.novaBadge}>
                                <View style={styles.unreadDot} />
                                <Text style={styles.novaBadgeText}>Nova</Text>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.metaRow}>
                            <View style={styles.typeBadge}>
                              <Text style={styles.typeBadgeText}>{config.label}</Text>
                            </View>
                            {time ? <Text style={styles.timeText}>{` ·\u00A0${time}`}</Text> : null}
                          </View>
                        </View>
                      </View>

                      <Text style={styles.cardMessage}>{item.message}</Text>

                      {/* Rodapé do card: ação contextual rápida */}
                      <View style={[styles.cardFooter, !item.read && styles.cardFooterUnread]}>
                        <Text style={[styles.actionHintText, !item.read && styles.actionHintTextUnread]}>
                          {config.actionHint}
                        </Text>
                        <AppIcon
                          name="chevronRight"
                          size={14}
                          color={item.read ? colors.action : colors.m3.onSecondaryContainer}
                        />
                      </View>
                    </Pressable>

                    <View style={styles.cardActions}>
                      {!item.read ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Marcar como lida"
                          testID={`mark-read-notif-${item.id}`}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => {
                            void actions.markAsRead(item.id);
                            setFeedbackMessage("Notificação marcada como lida.");
                          }}
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
                        onPress={() => {
                          void actions.deleteNotification(item.id);
                          setFeedbackMessage("Notificação excluída.");
                        }}
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
                );
              }}
            />
          )}
        </View>
      </View>

      <Snackbar
        visible={state.actionError !== null || feedbackMessage !== null}
        message={state.actionError ?? feedbackMessage ?? ""}
        onDismiss={() => {
          if (state.actionError) actions.clearActionError();
          if (feedbackMessage) setFeedbackMessage(null);
        }}
      />

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
          setFeedbackMessage("Todas as notificações foram limpas.");
        }}
        onCancel={() => setConfirmClearAllVisible(false)}
      />

      {/* Reabrir o aviso explicativo: a pessoa pediu no botão da banner, então o prompt nativo vem depois. */}
      <PermissionPromptDialog
        permission="notifications"
        status={prompt.status}
        onAllow={() => void promptActions.approve()}
        onLater={() => void promptActions.decline()}
        onDismiss={promptActions.dismiss}
      />
    </SafeAreaView>
  );
}
