import { useEffect, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useConversationsViewModel, type ConversationItem } from "@/viewmodel/useConversationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";

export type ConversationsProps = {
  sessionUserId: string;
  /** Negociação aceita: abre o chat (`06.02`). */
  onOpenNegotiation?: (requestId: string) => void;
  /** Proposta recebida pendente: abre os pedidos recebidos para aceitar ou recusar. */
  onOpenReceivedRequests?: () => void;
  /** Pedido enviado pendente: volta ao detalhe do livro. */
  onOpenListing?: (bookId: string) => void;
  /** Estado vazio (`06.09`): leva à busca de livros. */
  onExplore?: () => void;
};

/** Figma `06.01 · Conversas` (`27:519`) e `06.09 · Conversas · vazio` (`254:5566`), Spec 076. */
export function Conversations({
  sessionUserId,
  onOpenNegotiation,
  onOpenReceivedRequests,
  onOpenListing,
  onExplore,
}: ConversationsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useConversationsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();

  const open = (item: ConversationItem) => {
    if (item.kind === "accepted") onOpenNegotiation?.(item.requestId);
    else if (item.kind === "pendingReceived") onOpenReceivedRequests?.();
    else onOpenListing?.(item.listing.id);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>
        Conversas
      </Text>
      {state.loading ? (
        <LoadingState label="Carregando conversas" />
      ) : state.error ? (
        isOnline ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : (
          <OfflineState onRetry={() => void actions.reload()} />
        )
      ) : state.items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <AppIcon name="chat" size={32} color={colors.m3.onSecondaryContainer} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda.</Text>
          <Text style={styles.emptyBody}>
            Quando você pedir um livro ou alguém se interessar por um seu, a conversa aparece aqui.
          </Text>
          {onExplore ? (
            <View style={styles.emptyAction}>
              <FilledButton label="Explorar livros" onPress={onExplore} />
            </View>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={state.items}
          keyExtractor={(item) => item.requestId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Conversa com ${item.otherName} sobre ${item.listing.title}. ${item.preview}`}
              onPress={() => open(item)}
              style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            >
              <Avatar name={item.otherName} size={48} />
              <View style={styles.rowText}>
                <View style={styles.rowHeader}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.otherName}
                  </Text>
                  {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
                </View>
                <Text
                  style={[styles.preview, item.kind !== "accepted" ? styles.previewStatus : null]}
                  numberOfLines={1}
                >
                  {item.preview}
                </Text>
                <Text style={styles.about} numberOfLines={1}>
                  {`Sobre ${item.listing.title}`}
                </Text>
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            <Text style={styles.footer}>Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

export type ConversationsScreenProps = Omit<ConversationsProps, "sessionUserId"> & {
  onRequireSignIn?: () => void;
};

export default function ConversationsScreen({ onRequireSignIn, ...props }: ConversationsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <Conversations sessionUserId={authState.user.id} {...props} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    title: {
      fontFamily: fontFamily.brand,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700",
      color: colors.brandBrown,
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[16],
    },
    list: { paddingBottom: tokens.spacing[32], width: "100%", maxWidth: 720, alignSelf: "center" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: 88,
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[12],
    },
    rowPressed: { backgroundColor: colors.m3.surfaceContainer },
    rowText: { flex: 1, gap: 2 },
    rowHeader: { flexDirection: "row", alignItems: "baseline", gap: tokens.spacing[8] },
    name: { flex: 1, ...tokens.typography.bodyLarge, fontWeight: "500", color: colors.m3.onSurface },
    time: { fontSize: 12, lineHeight: 16, color: colors.m3.onSurfaceVariant },
    preview: { ...tokens.typography.bodyMedium, color: colors.m3.onSurface },
    previewStatus: { color: colors.m3.onSurfaceVariant, fontStyle: "italic" },
    about: { fontSize: 13, lineHeight: 18, color: colors.m3.primary },
    footer: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[16],
    },
    empty: { alignItems: "center", gap: tokens.spacing[8], paddingTop: tokens.spacing[48], paddingHorizontal: tokens.spacing[24] },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "700",
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 320 },
    emptyAction: { alignSelf: "stretch", marginTop: tokens.spacing[16] },
  });
}
