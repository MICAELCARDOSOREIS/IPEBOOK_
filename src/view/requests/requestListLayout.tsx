import type { ReactNode } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RequestStatus } from "@/model/entities/bookRequest";
import type { RequestWithListing } from "@/viewmodel/useSentRequestsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { tokens } from "@/view/tokens";

export const statusLabel: Record<RequestStatus, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Recusado",
};

type Props = {
  title: string;
  emptyText: string;
  items: readonly RequestWithListing[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBack?: () => void;
  renderExtra: (item: RequestWithListing) => ReactNode;
};

/** Estrutura visual comum às telas de pedidos recebidos e enviados. */
export function RequestListLayout({ title, emptyText, items, loading, error, onRetry, onBack, renderExtra }: Props) {
  const { isOnline } = useNetworkStatus();
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        {onBack ? (
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
            <Text style={styles.link}>Voltar</Text>
          </Pressable>
        ) : null}
        <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
        {loading ? (
          <LoadingState label="Carregando pedidos" />
        ) : error ? (
          isOnline ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : (
            <OfflineState onRetry={onRetry} />
          )
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.request.id}
            ListEmptyComponent={<Text style={styles.body}>{emptyText}</Text>}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.row}>
                  <Text style={styles.itemTitle}>{item.listing.title}</Text>
                  <Text style={[styles.badge, styles[item.request.status]]}>{statusLabel[item.request.status]}</Text>
                </View>
                <Text style={styles.body}>{item.listing.author}</Text>
                {renderExtra(item)}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export const requestStyles = StyleSheet.create({
  actions: { flexDirection: "row", gap: tokens.spacing[12], marginTop: tokens.spacing[6] },
  primary: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[20], borderRadius: tokens.radius.small, backgroundColor: tokens.colors.action },
  primaryText: { color: tokens.colors.surface, fontSize: 16, fontWeight: "600" },
  secondary: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[20], borderRadius: tokens.radius.small, borderWidth: 1, borderColor: tokens.colors.border },
  secondaryText: { color: tokens.colors.action, fontSize: 16, fontWeight: "600" },
  meta: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText },
  error: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.error },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], paddingTop: tokens.spacing[48] },
  back: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignSelf: "flex-start" },
  link: { color: tokens.colors.action, fontSize: 14, fontWeight: "600" },
  heading: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: tokens.colors.action, marginBottom: tokens.spacing[24] },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: tokens.colors.secondaryText },
  item: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: tokens.colors.border, gap: 6 },
  itemTitle: { flex: 1, fontSize: 19, fontWeight: "600", color: tokens.colors.action },
  badge: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6], fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight, overflow: "hidden" },
  pending: { backgroundColor: tokens.colors.badge.trade.background, color: tokens.colors.badge.trade.text },
  accepted: { backgroundColor: tokens.colors.badge.donation.background, color: tokens.colors.badge.donation.text },
  rejected: { backgroundColor: tokens.colors.border, color: tokens.colors.secondaryText },
  primary: requestStyles.primary,
  primaryText: requestStyles.primaryText,
});
