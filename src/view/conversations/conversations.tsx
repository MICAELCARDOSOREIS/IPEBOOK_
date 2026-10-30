import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { Chat } from "@/view/conversations/chat";
import { useDeliveryStatus } from "@/viewmodel/useDeliveryViewModel";
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
import { WEB_MAX_WIDTH } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
/** "Combinar encontro" do painel largo; some quando a entrega já foi concluída por QR (Spec 095). */
function CombineAction({ requestId, sessionUserId, onOpen }: { requestId: string; sessionUserId: string; onOpen?: (requestId: string) => void }) {
  const delivery = useDeliveryStatus(requestId, sessionUserId);
  if (delivery.completed) return null;
  return <FilledButton label="Combinar encontro" onPress={() => onOpen?.(requestId)} />;
}

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

  // Desistir de um pedido enviado ainda sem resposta (Spec 101); quem anunciou é avisado.
  const [toCancel, setToCancel] = useState<ConversationItem | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelFailed, setCancelFailed] = useState(false);
  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    const ok = await actions.cancelRequest(toCancel.requestId);
    setCancelling(false);
    setCancelFailed(!ok);
    setToCancel(null);
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
      <View style={wideWeb ? styles.wideContainer : styles.flexOne}>
        {/* Cabeçalho da tela (alinhado a 80px no desktop com o WebHeader) */}
        <View style={wideWeb ? styles.wideHeader : styles.mobileHeader}>
          <Text accessibilityRole="header" style={[styles.title, wideWeb && styles.titleWide]}>
            Conversas
          </Text>
          {wideWeb && state.items.length === 0 ? (
            <Text style={styles.subtitleWide}>
              Acompanhe propostas de troca, compra e doação direto com leitores de Piripiri.
            </Text>
          ) : null}
        </View>

        {state.loading && state.items.length === 0 ? (
          <LoadingState label="Carregando conversas" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : state.items.length === 0 ? (
          /* Estado Vazio (Figma 06.09 com refinamento para desktop largo) */
          <View style={wideWeb ? styles.emptyContainerWide : styles.flexOne}>
            <View style={[styles.empty, wideWeb && styles.emptyWide]}>
              <View style={[styles.emptyIcon, wideWeb && styles.emptyIconWide]}>
                <AppIcon name="chat" size={wideWeb ? 36 : 32} color={colors.m3.onSecondaryContainer} />
              </View>
              <Text style={[styles.emptyTitle, wideWeb && styles.emptyTitleWide]}>
                Nenhuma conversa ainda
              </Text>
              <Text style={[styles.emptyBody, wideWeb && styles.emptyBodyWide]}>
                Encontre um livro e converse com a pessoa para combinar os detalhes.
              </Text>
              {onExplore ? (
                <View style={[styles.emptyAction, wideWeb && styles.emptyActionWide]}>
                  <FilledButton label="Encontrar um livro" onPress={onExplore} />
                </View>
              ) : null}
            </View>

            {/* Destaques informativos de segurança e circulação na web larga */}
            {wideWeb ? (
              <View style={styles.featuresRowWide}>
                <View style={styles.featureCardWide}>
                  <View style={styles.featureIconBoxWide}>
                    <AppIcon name="swap" size={24} color={colors.m3.primary} />
                  </View>
                  <Text style={styles.featureTitleWide}>Negociação direta</Text>
                  <Text style={styles.featureBodyWide}>
                    Converse em tempo real e combine troca, compra ou doação direto pelo aplicativo.
                  </Text>
                </View>

                <View style={styles.featureCardWide}>
                  <View style={styles.featureIconBoxWide}>
                    <AppIcon name="place" size={24} color={colors.m3.primary} />
                  </View>
                  <Text style={styles.featureTitleWide}>Pontos de encontro seguros</Text>
                  <Text style={styles.featureBodyWide}>
                    Locais públicos sugeridos em Piripiri (Praça da Bandeira, IFPI, Memorial) para entrega segura.
                  </Text>
                </View>

                <View style={styles.featureCardWide}>
                  <View style={styles.featureIconBoxWide}>
                    <AppIcon name="star" size={24} color={colors.m3.primary} />
                  </View>
                  <Text style={styles.featureTitleWide}>Avaliações mútuas</Text>
                  <Text style={styles.featureBodyWide}>
                    Ao concluir o encontro, ambos os leitores avaliam a entrega para manter a rede comunitária confiável.
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          /* Quando há conversas: painel integrado na web larga */
          <View style={wideWeb ? styles.wideWorkspace : styles.flexOne}>
            <View style={wideWeb ? styles.wideListPane : styles.flexOne}>
              {wideWeb ? (
                <View style={styles.wideListHeader}>
                  <Text style={styles.wideListCount}>
                    {`${state.items.length} ${state.items.length === 1 ? "conversa" : "conversas"}`}
                  </Text>
                </View>
              ) : null}
              <FlatList
                data={state.items}
                keyExtractor={(item) => item.requestId}
                contentContainerStyle={wideWeb ? styles.wideList : styles.list}
                renderItem={({ item }) => {
                  const isSelected = wideWeb && item.requestId === selectedId;
                  return (
                    <View style={styles.rowWrap}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Conversa com ${item.otherName} sobre ${item.listing.title}. ${item.preview}`}
                      accessibilityHint={item.kind === "accepted" ? "Mantenha pressionado para apagar a conversa" : undefined}
                      onPress={() => open(item)}
                      onLongPress={item.kind === "accepted" ? () => setToDelete(item) : undefined}
                      style={({ pressed }) => [
                        styles.row,
                        pressed ? styles.rowPressed : null,
                        isSelected ? styles.rowSelected : null,
                        wideWeb && item.kind === "accepted" ? styles.rowWithDelete : null,
                      ]}
                    >
                      <Avatar name={item.otherName} photoUrl={item.otherPhotoUrl ?? undefined} size={48} />
                      <View style={styles.rowText}>
                        <View style={styles.rowHeader}>
                          <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
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
                      {/* Na web larga não há toque longo: o apagar fica visível na própria linha. */}
                      {wideWeb && item.kind === "accepted" ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Apagar conversa com ${item.otherName}`}
                          onPress={() => setToDelete(item)}
                          style={({ hovered }: { hovered?: boolean }) => [styles.deleteButton, hovered ? styles.deleteButtonHovered : null]}
                        >
                          <AppIcon name="delete" size={20} color={colors.m3.onSurfaceVariant} />
                        </Pressable>
                      ) : null}
                      {item.kind === "pendingSent" ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Cancelar pedido de ${item.listing.title}`}
                          onPress={() => setToCancel(item)}
                          hitSlop={8}
                          style={withPress(styles.cancelRequest)}
                        >
                          <Text style={styles.cancelRequestText}>Cancelar pedido</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                }}
                ListFooterComponent={
                  <View>
                    {cancelFailed ? (
                      <Text accessibilityRole="alert" style={styles.footerError}>
                        Não foi possível cancelar o pedido. Tente novamente.
                      </Text>
                    ) : null}
                    {deleteFailed ? (
                      <Text accessibilityRole="alert" style={styles.footerError}>
                        Não foi possível apagar a conversa. Tente novamente.
                      </Text>
                    ) : null}
                    <Text style={styles.footer}>Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos.</Text>
                    {wideWeb ? null : <Text style={styles.footer}>Para apagar uma conversa, mantenha o dedo sobre ela.</Text>}
                  </View>
                }
              />
            </View>

            {/* Painel Central: Chat da negociação selecionada ou placeholder */}
            {wideWeb && selectedId ? (
              <View style={styles.widePane} testID="conversation-pane">
                <Chat embedded requestId={selectedId} sessionUserId={sessionUserId} onOpenNegotiation={onOpenNegotiation} />
              </View>
            ) : wideWeb ? (
              <View style={[styles.widePane, styles.widePaneEmpty]}>
                <View style={styles.emptyCenterIconBox}>
                  <AppIcon name="chat" size={44} color={colors.m3.primary} />
                </View>
                <Text style={styles.emptyCenterTitle}>Escolha uma conversa</Text>
                <Text style={styles.emptyCenterBody}>
                  Selecione uma conversa na lista ao lado para ver o histórico e enviar mensagens.
                </Text>
              </View>
            ) : null}

            {/* Painel Direito: Detalhes da negociação e encontro seguro */}
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
                <CombineAction requestId={selectedItem.requestId} sessionUserId={sessionUserId} onOpen={onOpenNegotiation} />
                <View style={styles.aboutSafe}>
                  <Text style={styles.aboutSafeTitle}>Encontro seguro</Text>
                  <Text style={styles.aboutSafeBody}>Locais públicos e horário de movimento em Piripiri.</Text>
                </View>
                {onReportListing ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Denunciar anúncio" onPress={() => onReportListing(selectedItem.listing.id)}>
                    <Text style={styles.aboutReport}>Denunciar anúncio</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
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
        <Dialog
          visible={toCancel !== null}
          title="Cancelar pedido?"
          message={`Você desiste do pedido de "${toCancel?.listing.title ?? ""}". Quem anunciou será avisado.`}
          confirmLabel="Sim, cancelar"
          cancelLabel="Manter pedido"
          destructive
          loading={cancelling}
          onConfirm={() => void confirmCancel()}
          onCancel={() => setToCancel(null)}
        />
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
    // Container web largo padronizado em 1440 px com 80 px de margem lateral (alinhado ao WebHeader).
    wideContainer: {
      flex: 1,
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[80],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[24],
      // O painel ocupa a janela e cada coluna rola por conta própria, como nos mensageiros.
      minHeight: 0,
    },
    mobileHeader: {
      paddingBottom: tokens.spacing[8],
    },
    wideHeader: {
      marginBottom: tokens.spacing[16],
      gap: tokens.spacing[6],
    },
    title: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[8],
    },
    titleWide: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
    subtitleWide: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurfaceVariant,
    },
    // Estado Vazio Web Largo
    emptyContainerWide: {
      width: "100%",
      alignItems: "center",
    },
    emptyWide: {
      width: "100%",
      maxWidth: 620,
      alignSelf: "center",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.extraLarge,
      paddingVertical: tokens.spacing[40],
      paddingHorizontal: tokens.spacing[48],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      marginTop: tokens.spacing[12],
      gap: tokens.spacing[12],
    },
    emptyIconWide: {
      width: 80,
      height: 80,
      borderRadius: tokens.radius.circle80,
      marginBottom: tokens.spacing[4],
    },
    emptyTitleWide: {
      ...tokens.typography.headlineMedium,
      color: colors.m3.onSurface,
    },
    emptyBodyWide: {
      ...tokens.typography.subheadline,
      maxWidth: 440,
      lineHeight: tokens.lineHeight[22],
      color: colors.m3.onSurfaceVariant,
    },
    emptyActionWide: {
      width: "100%",
      maxWidth: 280,
      alignSelf: "center",
      marginTop: tokens.spacing[12],
    },
    featuresRowWide: {
      flexDirection: "row",
      gap: tokens.spacing[20],
      marginTop: tokens.spacing[32],
      width: "100%",
      maxWidth: 1100,
      justifyContent: "center",
    },
    featureCardWide: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[20],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[6],
    },
    featureIconBoxWide: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.cardSmall,
      backgroundColor: colors.m3.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[4],
    },
    featureTitleWide: {
      ...tokens.typography.subheadline,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.bold,
    },
    featureBodyWide: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
    },
    // Espaço multi-painel para conversas ativas
    wideWorkspace: {
      flex: 1,
      flexDirection: "row",
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
      overflow: "hidden",
      minHeight: 0,
    },
    wideListPane: {
      width: 380,
      minHeight: 0,
      borderRightWidth: 1,
      borderRightColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    wideListHeader: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    wideListCount: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.semiBold,
    },
    wideList: {
      paddingBottom: tokens.spacing[24],
    },
    widePane: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      backgroundColor: colors.background,
    },
    widePaneEmpty: {
      alignItems: "center",
      justifyContent: "center",
      padding: tokens.spacing[32],
      gap: tokens.spacing[12],
    },
    emptyCenterIconBox: {
      width: 80,
      height: 80,
      borderRadius: tokens.radius.circle80,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[8],
    },
    emptyCenterTitle: {
      ...tokens.typography.brandCardTitle,
      color: colors.m3.onSurface,
    },
    emptyCenterBody: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 320,
    },
    aboutPane: {
      width: 320,
      minHeight: 0,
      gap: tokens.spacing[16],
      padding: tokens.spacing[20],
      borderLeftWidth: 1,
      borderLeftColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    aboutTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    aboutBook: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    aboutBookText: { flex: 1, gap: tokens.spacing[6], alignItems: "flex-start" },
    aboutBookTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    aboutSafe: { gap: tokens.spacing[2], padding: tokens.spacing[16], borderRadius: tokens.radius.medium, backgroundColor: colors.m3.surfaceContainer },
    aboutSafeTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    aboutSafeBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    aboutReport: { ...tokens.typography.labelLarge, color: colors.error },
    list: { paddingBottom: tokens.spacing[32], width: "100%", maxWidth: 720, alignSelf: "center" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: 88,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    rowPressed: {
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.985 }],
    },
    rowSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderLeftWidth: 4,
      borderLeftColor: colors.m3.primary,
    },
    rowText: { flex: 1, gap: tokens.spacing[2] },
    rowHeader: { flexDirection: "row", alignItems: "baseline", gap: tokens.spacing[8] },
    name: { flex: 1, ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.medium, color: colors.m3.onSurface },
    nameSelected: { fontWeight: tokens.fontWeight.bold, color: colors.m3.onSecondaryContainer },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      marginVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primary,
    },
    badgeText: { ...tokens.typography.labelSmall, fontWeight: tokens.fontWeight.bold, color: colors.m3.onPrimary },
    time: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    preview: { ...tokens.typography.bodyMedium, color: colors.m3.onSurface },
    previewStatus: { color: colors.m3.onSurfaceVariant, fontStyle: "italic" },
    about: { ...tokens.typography.labelMedium, color: colors.m3.primary },
    footer: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
    },
    footerError: { ...tokens.typography.bodyMedium, color: colors.error, paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[16] },
    empty: { alignItems: "center", gap: tokens.spacing[8], paddingTop: tokens.spacing[48], paddingHorizontal: tokens.spacing[24] },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.circle72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: {
      ...tokens.typography.brandTitle,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 320 },
    emptyAction: { alignSelf: "stretch", marginTop: tokens.spacing[16] },
    deleteButton: { width: tokens.spacing[40], height: tokens.spacing[40], borderRadius: tokens.radius.xl, alignItems: "center", justifyContent: "center", position: "absolute", right: tokens.spacing[12], top: "50%", marginTop: -tokens.spacing[20] },
    // A linha e o apagar são botões irmãos: o navegador não aceita botão dentro de botão.
    rowWrap: { position: "relative" },
    cancelRequest: { alignSelf: "flex-end", paddingHorizontal: tokens.spacing[16], paddingBottom: tokens.spacing[8], minHeight: tokens.spacing[32], justifyContent: "center" },
    cancelRequestText: { ...tokens.typography.labelLarge, color: colors.error },
    rowWithDelete: { paddingRight: tokens.spacing[56] },
    deleteButtonHovered: { backgroundColor: colors.m3.surfaceContainerHigh },
  });
}
