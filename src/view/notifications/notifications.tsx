import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppNotification } from "@/model/entities/notification";
import type { AppIconName } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge, type IconBadgeTone } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import {
  useNotificationsViewModel,
} from "@/viewmodel/useNotificationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { groupNotificationsByPeriod } from "@/viewmodel/notificationGrouping";

export type NotificationsProps = {
  sessionUserId: string | null;
  onBack?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToAction?: (actionUrl: string) => void;
  onExploreBooks?: () => void;
};

const TYPE_BADGES: Record<
  AppNotification["type"],
  { icon: AppIconName; tone: IconBadgeTone }
> = {
  request_received: { icon: "mail", tone: "action" },
  request_accepted: { icon: "swap", tone: "trade" },
  safety_tip: { icon: "info", tone: "neutral" },
  system: { icon: "info", tone: "neutral" },
  search_alert_match: { icon: "shelf", tone: "donation" },
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
  const { isOnline } = useNetworkStatus();
  const handleExplore = onExploreBooks ?? onBack;

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Notificações" onBack={() => onBack?.()} />
        <View style={styles.centered}>
          <IconBadge icon="bell" tone="action" />
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Sessão necessária
          </Text>
          <Text style={styles.emptyDescription}>
            Você precisa estar conectado à sua conta do Ipebook para acompanhar notificações e novidades de livros em Piripiri.
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
      <TopAppBar title="Notificações" onBack={() => onBack?.()} />
      <View style={styles.content}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Novidades dos seus livros.</Text>
          <Text style={styles.heroSubtitle}>
            Propostas, mensagens e avisos dos seus alertas.
          </Text>
          {state.unreadCount > 0 ? (
            <Text style={styles.unreadCounterBadge}>
              {state.unreadCount === 1
                ? "1 alerta pendente de leitura"
                : `${state.unreadCount} alertas pendentes de leitura`}
            </Text>
          ) : null}
        </View>
        <View style={styles.filterBar}>
          <View accessibilityRole="tablist" style={styles.filterTabs}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: state.filter === "all" }}
              onPress={() => actions.setFilter("all")}
              style={[styles.filterChip, state.filter === "all" && styles.filterChipActive]}
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
              style={[styles.filterChip, state.filter === "unread" && styles.filterChipActive]}
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

          {state.unreadCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void actions.markAllAsRead()}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Marcar lidas</Text>
            </Pressable>
          ) : null}
        </View>

        {state.loading ? (
          <LoadingState label="Carregando notificações" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : state.filteredNotifications.length === 0 ? (
          <View style={styles.centered}>
            <IconBadge icon="bell" tone="neutral" />
            <Text accessibilityRole="header" style={styles.emptyHeadline}>
              {state.filter === "unread" ? "Nenhuma notificação não lida" : "Você está em dia"}
            </Text>
            <Text style={styles.emptyDescription}>
              {state.filter === "unread"
                ? "Você já visualizou todas as suas novidades!"
                : "Suas mensagens, propostas e avisos de novos livros aparecerão aqui."}
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
            sections={groupNotificationsByPeriod(state.filteredNotifications).map((section) => ({
              ...section,
              data: [...section.data],
            }))}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <Text accessibilityRole="header" style={styles.sectionHeader}>
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => {
              const badge = TYPE_BADGES[item.type] ?? { icon: "info", tone: "neutral" as const };
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.message}`}
                  onPress={() => {
                    if (!item.read) {
                      void actions.markAsRead(item.id);
                    }
                    if (item.actionUrl) {
                      onNavigateToAction?.(item.actionUrl);
                    }
                  }}
                  style={[styles.card, !item.read && styles.cardUnread]}
                >
                  <View style={styles.cardHeader}>
                    <IconBadge icon={badge.icon} tone={badge.tone} />
                    <View style={styles.cardTitleContainer}>
                      <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                        {item.title}
                      </Text>
                    </View>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.cardMessage}>{item.message}</Text>
                  {item.actionUrl ? (
                    <Text style={styles.actionHint}>Toque para ver detalhes →</Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  sectionHeader: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
    paddingTop: tokens.spacing[16],
    paddingBottom: tokens.spacing[8],
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingTop: tokens.spacing[8],
  },
  heroHeader: {
    marginBottom: tokens.spacing[12],
    gap: tokens.spacing[4],
  },
  heroTitle: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  unreadCounterBadge: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.actionDeep,
    fontWeight: "600",
    marginTop: tokens.spacing[4],
  },
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
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.action,
    borderColor: tokens.colors.action,
  },
  filterChipText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.text,
  },
  filterChipTextActive: {
    color: tokens.colors.surface,
    fontWeight: "700",
  },
  markAllButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[8],
    paddingVertical: tokens.spacing[6],
  },
  markAllText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.action,
    fontWeight: "600",
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
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  emptyDescription: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: tokens.spacing[12],
    width: "100%",
    maxWidth: 240,
  },
  listContent: {
    paddingBottom: tokens.spacing[24],
    gap: tokens.spacing[12],
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  cardUnread: {
    borderColor: tokens.colors.action,
    borderLeftWidth: tokens.spacing[4],
    backgroundColor: tokens.colors.soft,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
  },
  cardTitleContainer: { flex: 1 },
  cardTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
  },
  cardTitleUnread: {
    fontWeight: "700",
    color: tokens.colors.actionDeep,
  },
  unreadDot: {
    width: tokens.spacing[8],
    height: tokens.spacing[8],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.action,
  },
  cardMessage: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  actionHint: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.action,
    fontWeight: "600",
    marginTop: tokens.spacing[4],
  },
});
