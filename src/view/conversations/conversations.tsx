import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import {
  makeAuthViewModel,
  makeConversationsViewModel,
  makeDeliveryStatus,
  makeNetworkStatus,
} from "@/di/container";
import { Chat } from "@/view/conversations/chat";
import { createConversationsStyles } from "@/view/conversations/conversationsStyles";
import {
  formatConversationTime,
  type ConversationItem,
} from "@/viewmodel/useConversationsViewModel";
import { formatPrice } from "@/view/formatPrice";
import { tokens } from "@/view/tokens";
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
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { withPress } from "@/view/pressFeedback";

/** "Combinar encontro" do painel largo; some quando a entrega já foi concluída por QR (Spec 095). */
function CombineAction({ requestId, sessionUserId, onOpen }: { requestId: string; sessionUserId: string; onOpen?: (requestId: string) => void }) {
  const delivery = makeDeliveryStatus(requestId, sessionUserId);
  if (delivery.completed) return null;
  return <FilledButton label="Combinar encontro" onPress={() => onOpen?.(requestId)} />;
}

export type ConversationsProps = {
  sessionUserId: string;
  /** Volta à tela anterior (ex.: Início no celular). */
  onBack?: () => void;
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
  /** Muda quando a tela volta ao foco; recarrega a lista (ex.: depois de aceitar um pedido). */
  focusKey?: number;
};

/** Figma `06.01 · Conversas` (`27:519`) e `06.09 · Conversas · vazio` (`254:5566`), Spec 076. */
export function Conversations({
  sessionUserId,
  onBack,
  onOpenChat,
  onOpenNegotiation,
  onReportListing,
  onOpenReceivedRequests,
  onOpenListing,
  onExplore,
  focusKey,
}: ConversationsProps) {
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createConversationsStyles(colors), [colors]);
  const [state, actions] = makeConversationsViewModel(sessionUserId);
  const { isOnline } = makeNetworkStatus();

  // A primeira carga já vem do ViewModel; recarrega só quando a tela volta ao foco depois.
  const { reload } = actions;
  const lastFocusKey = useRef(focusKey);
  useEffect(() => {
    if (focusKey === lastFocusKey.current) return;
    lastFocusKey.current = focusKey;
    void reload();
  }, [focusKey, reload]);

  const guardedBack = useGuardedPress(onBack);
  const guardedOpenChat = useGuardedPress((id: string) => onOpenChat?.(id));
  const guardedOpenNegotiation = useGuardedPress((id: string) => onOpenNegotiation?.(id));
  const guardedReportListing = useGuardedPress((id: string) => onReportListing?.(id));
  const guardedOpenReceivedRequests = useGuardedPress(onOpenReceivedRequests);
  const guardedOpenListing = useGuardedPress((id: string) => onOpenListing?.(id));
  const guardedExplore = useGuardedPress(onExplore);
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

  const pendingReceivedCount = useMemo(
    () => state.items.filter((item) => item.kind === "pendingReceived").length,
    [state.items],
  );

  const open = (item: ConversationItem) => {
    if (item.kind === "accepted" && wideWeb) {
      setSelectedId(item.requestId);
      return;
    }
    if (item.kind === "accepted" || item.kind === "pendingReceived") {
      if (onOpenChat) {
        guardedOpenChat(item.requestId);
        return;
      }
      if (item.kind === "pendingReceived") {
        guardedOpenReceivedRequests();
        return;
      }
    }
    guardedOpenListing(item.listing.id);
  };

  const listFooter = (
    <View style={wideWeb ? styles.wideListFooter : styles.footerContainer}>
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
      <View style={styles.footerCard}>
        <View style={styles.footerIconBox}>
          <AppIcon name="info" size={16} color={colors.m3.primary} />
        </View>
        <View style={styles.footerTextCol}>
          <Text style={styles.footer}>Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos.</Text>
          {wideWeb ? null : <Text style={styles.footerSub}>Para apagar uma conversa, mantenha o dedo sobre ela.</Text>}
        </View>
      </View>
    </View>
  );

  const renderAboutBook = (item: ConversationItem) => {
    const content = (
      <View style={styles.aboutBook}>
        <BookCover id={item.listing.id} title={item.listing.title} photoUrl={item.listing.photoUrl} variant="list" />
        <View style={styles.aboutBookText}>
          <Text style={styles.aboutBookTitle} numberOfLines={2}>{item.listing.title}</Text>
          {item.listing.author ? (
            <Text style={styles.aboutBookAuthor} numberOfLines={1}>{item.listing.author}</Text>
          ) : null}
          <View style={styles.aboutBookMeta}>
            <Tag variant={item.listing.modality} />
            {item.listing.modality === "sale" && item.listing.price != null ? (
              <Text style={styles.aboutBookPrice}>{formatPrice(item.listing.price)}</Text>
            ) : null}
          </View>
        </View>
        {onOpenListing ? <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} /> : null}
      </View>
    );

    if (!onOpenListing) {
      return <View style={styles.aboutBookCard}>{content}</View>;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver anúncio de ${item.listing.title}`}
        onPress={() => guardedOpenListing(item.listing.id)}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          styles.aboutBookCard,
          hovered ? styles.aboutBookCardHovered : null,
          pressed ? styles.rowPressed : null,
        ]}
      >
        {content}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <View style={wideWeb ? styles.wideContainer : styles.flexOne}>
        {/* Cabeçalho da tela (alinhado a 80px no desktop com o WebHeader) */}
        <View style={wideWeb ? styles.wideHeader : [styles.mobileHeader, Boolean(onBack) && styles.mobileHeaderWithBack]}>
          {!wideWeb && onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={{ top: tokens.spacing[4], bottom: tokens.spacing[4], left: tokens.spacing[4], right: tokens.spacing[4] }}
              onPress={guardedBack}
              style={withPress(styles.backButton)}
            >
              <AppIcon name="back" size={24} color={colors.m3.onSurface} />
            </Pressable>
          ) : null}
          <Text
            accessibilityRole="header"
            style={[styles.title, wideWeb && styles.titleWide, !wideWeb && Boolean(onBack) && styles.titleWithBack]}
          >
            Conversas
          </Text>
          {wideWeb ? (
            <Text style={styles.subtitleWide}>
              Acompanhe propostas de troca, compra e doação direto com leitores de Piripiri.
            </Text>
          ) : null}
        </View>

        {state.loading && state.items.length === 0 ? (
          wideWeb ? (
            <View style={styles.wideWorkspace}>
              <View style={styles.wideListPane}>
                <View style={styles.wideListHeader}>
                  <View style={styles.skeletonLineSub} />
                </View>
                <View style={styles.wideLoadingListBody}>
                  <LoadingState label="Carregando conversas" variant="conversations" />
                </View>
              </View>
              <View style={styles.widePane} importantForAccessibility="no-hide-descendants">
                <View style={styles.wideLoadingHeaderBar}>
                  <View style={styles.skeletonAvatar40} />
                  <View style={styles.rowText}>
                    <View style={styles.skeletonLineTitle} />
                    <View style={styles.skeletonLineSub} />
                  </View>
                </View>
                <View style={styles.wideLoadingChatBody}>
                  <View style={styles.skeletonBubbleOther} />
                  <View style={styles.skeletonBubbleMine} />
                  <View style={styles.skeletonBubbleOther} />
                </View>
                <View style={styles.wideLoadingComposerBar}>
                  <View style={styles.skeletonInput} />
                  <View style={styles.skeletonSendBtn} />
                </View>
              </View>
              <View style={styles.aboutPane} importantForAccessibility="no-hide-descendants">
                <View style={styles.skeletonLineTitle} />
                <View style={styles.aboutBookCard}>
                  <View style={styles.aboutBook}>
                    <View style={styles.skeletonBookCover} />
                    <View style={styles.aboutBookText}>
                      <View style={styles.skeletonLineTitle} />
                      <View style={styles.skeletonLineSub} />
                    </View>
                  </View>
                </View>
                <View style={styles.skeletonAboutButton} />
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <LoadingState label="Carregando conversas" variant="conversations" />
            </View>
          )
        ) : state.error ? (
          <View style={wideWeb ? styles.emptyContainerWide : styles.loadingContainer}>
            {isOnline ? (
              <ErrorState message={state.error} onRetry={() => void actions.reload()} />
            ) : (
              <OfflineState onRetry={() => void actions.reload()} />
            )}
          </View>
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
                  <FilledButton label="Encontrar um livro" onPress={guardedExplore} />
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
                style={styles.flexOne}
                {...standardVerticalScrollProps}
                data={state.items}
                keyExtractor={(item) => item.requestId}
                contentContainerStyle={wideWeb ? styles.wideList : [styles.list, { paddingBottom: scrollBottomPadding.withBottomBar }]}
                ListHeaderComponent={
                  pendingReceivedCount > 0 && onOpenReceivedRequests ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Você tem ${pendingReceivedCount} ${pendingReceivedCount === 1 ? "nova proposta recebida" : "novas propostas recebidas"}. Toque para abrir pedidos recebidos.`}
                      onPress={guardedOpenReceivedRequests}
                      style={withPress([styles.pendingBanner, wideWeb && styles.pendingBannerWide])}
                    >
                      <View style={styles.pendingBannerIcon}>
                        <AppIcon name="swap" size={18} color={colors.nature.foliage} />
                      </View>
                      <View style={styles.pendingBannerContent}>
                        <Text style={styles.pendingBannerTitle}>
                          {`${pendingReceivedCount} ${pendingReceivedCount === 1 ? "nova proposta recebida" : "novas propostas recebidas"}`}
                        </Text>
                        <Text style={styles.pendingBannerSubtitle}>
                          Toque para gerenciar e aceitar na lista de pedidos
                        </Text>
                      </View>
                      <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} />
                    </Pressable>
                  ) : undefined
                }
                renderItem={({ item }) => {
                  const isSelected = wideWeb && item.requestId === selectedId;
                  return (
                    <View style={[styles.rowWrap, !wideWeb && styles.rowCardMobile]}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Conversa com ${item.otherName} sobre ${item.listing.title}. ${item.preview}`}
                        accessibilityHint={item.kind === "accepted" ? "Mantenha pressionado para apagar a conversa" : undefined}
                        onPress={() => open(item)}
                        onLongPress={item.kind === "accepted" ? () => setToDelete(item) : undefined}
                        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                          styles.row,
                          wideWeb && styles.rowWideItem,
                          wideWeb && hovered && !isSelected ? styles.rowHovered : null,
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
                            ) : item.kind === "pendingSent" ? (
                              <View style={styles.pendingSentPill}>
                                <Text style={styles.pendingSentPillText}>Enviado</Text>
                              </View>
                            ) : null}
                          </View>
                          {item.kind === "pendingReceived" ? (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>Nova proposta</Text>
                            </View>
                          ) : null}
                          <Text
                            style={[styles.preview, item.kind !== "accepted" ? styles.previewStatus : null]}
                            numberOfLines={2}
                          >
                            {item.preview}
                          </Text>
                          <View style={styles.aboutRow}>
                            <Tag variant={item.listing.modality} />
                            <Text style={styles.about} numberOfLines={1}>
                              {`Sobre ${item.listing.title}`}
                            </Text>
                          </View>
                        </View>
                        {!wideWeb ? (
                          <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} />
                        ) : null}
                      </Pressable>
                      {/* Na web larga não há toque longo: o apagar fica visível na própria linha. */}
                      {wideWeb && item.kind === "accepted" ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Apagar conversa com ${item.otherName}`}
                          onPress={() => setToDelete(item)}
                          style={({ hovered }: { hovered?: boolean }) => [styles.deleteButton, hovered ? styles.deleteButtonHovered : null]}
                        >
                          <AppIcon name="delete" size={18} color={colors.m3.onSurfaceVariant} />
                        </Pressable>
                      ) : null}
                      {item.kind === "pendingSent" ? (
                        <View style={styles.cancelRequestBar}>
                          <Text style={styles.cancelRequestHint}>Solicitação aguardando o anunciante</Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Cancelar pedido de ${item.listing.title}`}
                            onPress={() => setToCancel(item)}
                            hitSlop={8}
                            style={withPress(styles.cancelRequest)}
                          >
                            <Text style={styles.cancelRequestText}>Cancelar pedido</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
                ListFooterComponent={wideWeb ? undefined : listFooter}
              />
              {wideWeb ? listFooter : null}
            </View>

            {/* Painel Central: Chat da negociação selecionada ou placeholder */}
            {wideWeb && selectedId ? (
              <View style={styles.widePane} testID="conversation-pane">
                <Chat embedded requestId={selectedId} sessionUserId={sessionUserId} onOpenNegotiation={guardedOpenNegotiation} />
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
                <Text accessibilityRole="header" style={styles.aboutTitle}>
                  {`Sobre ${selectedItem.listing.modality === "trade" ? "a troca" : selectedItem.listing.modality === "donation" ? "a doação" : "a compra"}`}
                </Text>
                {renderAboutBook(selectedItem)}
                <CombineAction requestId={selectedItem.requestId} sessionUserId={sessionUserId} onOpen={guardedOpenNegotiation} />
                <View style={styles.aboutSafe}>
                  <View style={styles.aboutSafeHeader}>
                    <View style={styles.aboutSafeIcon}>
                      <AppIcon name="place" size={14} color={colors.nature.foliageDeep} />
                    </View>
                    <Text style={styles.aboutSafeTitle}>Encontro seguro</Text>
                  </View>
                  <Text style={styles.aboutSafeBody}>Locais públicos e horário de movimento em Piripiri.</Text>
                </View>
                {onReportListing ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Denunciar anúncio"
                    onPress={() => guardedReportListing(selectedItem.listing.id)}
                    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                      styles.aboutReportButton,
                      hovered ? styles.aboutReportButtonHovered : null,
                      pressed ? styles.rowPressed : null,
                    ]}
                  >
                    <AppIcon name="flag" size={16} color={colors.error} />
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
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <Conversations sessionUserId={authState.user.id} {...props} />;
}
