import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppNotification } from "@/model/entities/notification";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import {
  type NotificationFilter,
  useNotificationsViewModel,
} from "@/viewmodel/useNotificationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

export type NotificationsProps = {
  sessionUserId: string | null;
  onBack?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToAction?: (actionUrl: string) => void;
};

const TYPE_ICONS: Record<AppNotification["type"], string> = {
  request_received: "📬",
  request_accepted: "🤝",
  safety_tip: "🛡️",
  system: "ℹ️",
  search_alert_match: "📚",
};

export default function Notifications({
  sessionUserId,
  onBack,
  onNavigateToLogin,
  onNavigateToAction,
}: NotificationsProps) {
  const [state, actions] = useNotificationsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();

  if (!sessionUserId) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Notificações" onBack={() => onBack?.()} />
        <View style={styles.centered}>
          <Text style={styles.iconLarge}>🔔</Text>
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
        {/* Barra de Filtros e Ações */}
        <View style={styles.filterBar}>
          <View style={styles.filterTabs}>
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

        {/* Estados de Carregamento e Erro */}
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
            <Text style={styles.iconLarge}>📭</Text>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              {state.filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
            </Text>
            <Text style={styles.emptyDescription}>
              {state.filter === "unread"
                ? "Você já visualizou todas as suas novidades!"
                : "Quando outros leitores solicitarem seus livros ou aceitarem suas trocas em Piripiri, você verá as atualizações aqui."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={state.filteredNotifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const icon = TYPE_ICONS[item.type] ?? "ℹ️";
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
                    <Text style={styles.cardTypeIcon}>{icon}</Text>
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
  content: { flex: 1, paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[8] },
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
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[24],
    gap: tokens.spacing[12],
  },
  iconLarge: { fontSize: 48 },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
    textAlign: "center",
  },
  emptyDescription: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
    lineHeight: 20,
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
    borderColor: tokens.colors.border,
    gap: tokens.spacing[8],
  },
  cardUnread: {
    borderColor: tokens.colors.action,
    borderLeftWidth: 4,
    backgroundColor: "#F7FAF8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
  },
  cardTypeIcon: { fontSize: 20 },
  cardTitleContainer: { flex: 1 },
  cardTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
    fontSize: 16,
  },
  cardTitleUnread: {
    fontWeight: "700",
    color: tokens.colors.actionDeep,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.action,
  },
  cardMessage: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    lineHeight: 20,
  },
  actionHint: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.action,
    fontWeight: "600",
    marginTop: tokens.spacing[4],
  },
});
