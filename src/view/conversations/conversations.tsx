import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { Chat } from "@/view/conversations/chat";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import {
  formatConversationTime,
  useConversationsViewModel,
  type ConversationItem,
} from "@/viewmodel/useConversationsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { BookCover } from "@/view/components/BookCover";
import { Tag } from "@/view/components/Tag";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";

export type ConversationsProps = {
  sessionUserId: string;
  /** Negociação aceita: abre a conversa em tela cheia (`06.02`, Spec 082). */
  onOpenChat?: (requestId: string) => void;
  /** "Combinar" dentro do chat embutido da web larga. */
  onOpenNegotiation?: (requestId: string) => void;
  /** "Denunciar" do painel "Sobre a troca" (web larga). */
  onReportListing?: (listingId: string) => void;
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
  onOpenChat,
  onOpenNegotiation,
  onReportListing,
  onOpenReceivedRequests,
  onOpenListing,
  onExplore,
}: ConversationsProps) {
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useConversationsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();
  // O rótulo "agora" / "10 min" envelhece sozinho: a tela recalcula a cada minuto sem recarregar a lista (Spec 089).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Apagar some só para quem apagou (Spec 090); só conversas aceitas, pedidos pendentes têm seus próprios botões.
  const [toDelete, setToDelete] = useState<ConversationItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const ok = await actions.deleteConversation(toDelete.requestId);
    setDeleting(false);
    setDeleteFailed(!ok);
    setToDelete(null);
  };

  // Web larga (Figma `06.01`): a conversa abre ao lado da lista, sem trocar de rota.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = state.items.find((item) => item.requestId === selectedId) ?? null;

  const open = (item: ConversationItem) => {
    if (item.kind === "accepted" && wideWeb) setSelectedId(item.requestId);
    else if (item.kind === "accepted") onOpenChat?.(item.requestId);
    else if (item.kind === "pendingReceived") onOpenReceivedRequests?.();
    else onOpenListing?.(item.listing.id);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <View style={wideWeb ? styles.widePanes : styles.flexOne}>
      <View style={wideWeb ? (state.items.length > 0 ? styles.wideListPane : styles.wideColumn) : styles.flexOne}>
      <Text accessibilityRole="header" style={styles.title}>
        Conversas
      </Text>
      {state.loading && state.items.length === 0 ? (
        <LoadingState label="Carregando conversas" />
      ) : state.error ? (
        isOnline ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : (
          <OfflineState onRetry={() => void actions.reload()} />
        )
      ) : state.items.length === 0 ? (
        <View style={[styles.empty, wideWeb && styles.emptyWide]}>
          <View style={styles.emptyIcon}>
            <AppIcon name="chat" size={32} color={colors.m3.onSecondaryContainer} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptyBody}>
            Encontre um livro e converse com a pessoa para combinar os detalhes.
          </Text>
          {onExplore ? (
            <View style={styles.emptyAction}>
              <FilledButton label="Encontrar um livro" onPress={onExplore} />
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
              accessibilityHint={item.kind === "accepted" ? "Mantenha pressionado para apagar a conversa" : undefined}
              onPress={() => open(item)}
              onLongPress={item.kind === "accepted" ? () => setToDelete(item) : undefined}
              style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
            >
              <Avatar name={item.otherName} photoUrl={item.otherPhotoUrl ?? undefined} size={48} />
              <View style={styles.rowText}>
                <View style={styles.rowHeader}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.otherName}
                  </Text>
                  {item.lastMessageAt ? (
                    <Text style={styles.time}>{formatConversationTime(item.lastMessageAt, now)}</Text>
                  ) : null}
                </View>
                {item.kind === "pendingReceived" ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Nova proposta</Text>
                  </View>
                ) : null}
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
            <View>
              {deleteFailed ? (
                <Text accessibilityRole="alert" style={styles.footerError}>
                  Não foi possível apagar a conversa. Tente novamente.
                </Text>
              ) : null}
              <Text style={styles.footer}>Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos.</Text>
              <Text style={styles.footer}>Para apagar uma conversa, mantenha o dedo sobre ela.</Text>
            </View>
          }
        />
      )}
      <Dialog
        visible={toDelete !== null}
        title="Apagar conversa?"
        message={`A conversa com ${toDelete?.otherName ?? ""} some só para você. Se ela mandar outra mensagem, a conversa volta.`}
        confirmLabel="Apagar"
        cancelLabel="Manter"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
      </View>
      {wideWeb && selectedId ? (
        <View style={styles.widePane} testID="conversation-pane">
          <Chat requestId={selectedId} sessionUserId={sessionUserId} onOpenNegotiation={onOpenNegotiation} />
        </View>
      ) : null}
      {wideWeb && selectedItem ? (
        <View style={styles.aboutPane} testID="conversation-about">
          <Text accessibilityRole="header" style={styles.aboutTitle}>{`Sobre ${selectedItem.listing.modality === "trade" ? "a troca" : selectedItem.listing.modality === "donation" ? "a doação" : "a compra"}`}</Text>
          <View style={styles.aboutBook}>
            <BookCover id={selectedItem.listing.id} title={selectedItem.listing.title} photoUrl={selectedItem.listing.photoUrl} variant="list" />
            <View style={styles.aboutBookText}>
              <Text style={styles.aboutBookTitle} numberOfLines={2}>{selectedItem.listing.title}</Text>
              <Tag variant={selectedItem.listing.modality} />
            </View>
          </View>
          <FilledButton label="Combinar encontro" onPress={() => onOpenNegotiation?.(selectedItem.requestId)} />
          <View style={styles.aboutSafe}>
            <Text style={styles.aboutSafeTitle}>Encontro seguro</Text>
            <Text style={styles.aboutSafeBody}>Locais públicos e horário de movimento.</Text>
          </View>
          {onReportListing ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Denunciar anúncio" onPress={() => onReportListing(selectedItem.listing.id)}>
              <Text style={styles.aboutReport}>Denunciar anúncio</Text>
            </Pressable>
          ) : null}
        </View>
      ) : wideWeb && state.items.length > 0 ? (
        <View style={[styles.widePane, styles.widePaneEmpty]}>
          <Text style={styles.emptyBody}>Escolha uma conversa para ver as mensagens.</Text>
        </View>
      ) : null}
      </View>
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
    flexOne: { flex: 1 },
    // Web larga: coluna de 960 px alinhada ao cabeçalho; o estado vazio não estica o botão pela tela toda.
    wideColumn: { flex: 1, width: "100%", maxWidth: 960, alignSelf: "center", paddingHorizontal: 24 },
    widePanes: { flex: 1, flexDirection: "row", width: "100%", maxWidth: 1440, alignSelf: "center" },
    wideListPane: { width: 360, borderRightWidth: 1, borderRightColor: colors.m3.outlineVariant, backgroundColor: colors.m3.surfaceContainerLow },
    widePane: { flex: 1, minWidth: 0 },
    aboutPane: { width: 320, gap: 16, padding: 20, borderLeftWidth: 1, borderLeftColor: colors.m3.outlineVariant, backgroundColor: colors.m3.surfaceContainerLow },
    aboutTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    aboutBook: { flexDirection: "row", alignItems: "center", gap: 12 },
    aboutBookText: { flex: 1, gap: 6, alignItems: "flex-start" },
    aboutBookTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    aboutSafe: { gap: 2, padding: 16, borderRadius: tokens.radius.medium, backgroundColor: colors.m3.surfaceContainer },
    aboutSafeTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    aboutSafeBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    aboutReport: { ...tokens.typography.labelLarge, color: colors.error },
    widePaneEmpty: { alignItems: "center", justifyContent: "center" },
    emptyWide: { width: "100%", maxWidth: 420, alignSelf: "center" },
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
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      marginVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
    },
    badgeText: { fontSize: 11, lineHeight: 16, fontWeight: "700", color: colors.m3.onPrimary },
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
    footerError: { ...tokens.typography.bodyMedium, color: colors.error, paddingHorizontal: tokens.spacing[20], paddingTop: tokens.spacing[16] },
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
