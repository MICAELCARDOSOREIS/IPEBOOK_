import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { ScrollEdgeFlatList, ScrollEdgeScreen } from "@/view/components/ScrollEdgeScreen";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import {
  makeAuthViewModel,
  makeConversationsViewModel,
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
import { BottomSheet } from "@/view/components/BottomSheet";
import { SegmentedControl } from "@/view/components/SegmentedControl";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { triggerHaptic } from "@/view/haptics";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { withPress } from "@/view/pressFeedback";

export type ConversationsProps = {
  sessionUserId: string;
  /** Volta à tela anterior (ex.: Início no celular). */
  onBack?: () => void;
  /** Negociação aceita: abre a conversa em tela cheia (`06.02`, Spec 082). */
  onOpenChat?: (requestId: string) => void;
  /** "Combinar" dentro do chat embutido da web larga. */
  onOpenNegotiation?: (requestId: string) => void;
  onScheduleMeeting?: (requestId: string) => void;
  onOpenDelivery?: (requestId: string) => void;
  /** "Denunciar" nos detalhes do livro (web larga). */
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
  onScheduleMeeting,
  onOpenDelivery,
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
  const hasIosHeader = Platform.OS === "ios" && Boolean(onBack);
  const isIos = Platform.OS === "ios";
  // Liquid Glass nativo (ADR 0123) com alternativa opaca quando o material não está disponível.
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const hasList = state.items.length > 0 && !state.error;
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
    if (ok) setSelectedId((id) => id === toDelete.requestId ? null : id);
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
  const [bookDetailsOpen, setBookDetailsOpen] = useState(false);
  const [filter, setFilter] = useState<"active" | "completed">("active");

  const activeItems = useMemo(
    () => state.items.filter((item) => item.listing.status !== "delivered"),
    [state.items],
  );
  const completedItems = useMemo(
    () => state.items.filter((item) => item.listing.status === "delivered"),
    [state.items],
  );
  const visibleItems = filter === "completed" ? completedItems : activeItems;

  const selectedItem = visibleItems.find((item) => item.requestId === selectedId) ?? null;
  useEffect(() => {
    if (!wideWeb || !selectedItem) setBookDetailsOpen(false);
  }, [wideWeb, selectedItem]);

  const pendingReceivedCount = useMemo(
    () => activeItems.filter((item) => item.kind === "pendingReceived").length,
    [activeItems],
  );

  const showPendingBanner = filter === "active" && pendingReceivedCount > 0 && Boolean(onOpenReceivedRequests);
  const segmentedFilters = (
    <View style={[styles.filterBar, wideWeb && styles.filterBarWide]}>
      <SegmentedControl
        accessibilityLabel="Filtrar conversas"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: `Ativas (${activeItems.length})` },
          { value: "completed", label: `Concluídas (${completedItems.length})` },
        ]}
      />
    </View>
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
    <View
      style={wideWeb ? styles.wideListFooter : styles.footerContainer}
      testID={wideWeb ? "conversation-list-footer" : undefined}
    >
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
      <View style={[styles.footerCard, wideWeb && styles.wideFooterCard]}>
        <View style={styles.footerIconBox}>
          <AppIcon name="info" size={16} color={colors.m3.primary} />
        </View>
        <View style={styles.footerTextCol}>
          <Text style={styles.footer}>
            {wideWeb
              ? "Combine pelo chat. Não compartilhe senhas ou códigos."
              : "Combine sempre pelo chat do IpêBook. Não compartilhe senhas ou códigos."}
          </Text>
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
        onPress={() => {
          setBookDetailsOpen(false);
          guardedOpenListing(item.listing.id);
        }}
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
    <ScrollEdgeScreen
      style={styles.page}
      header={hasIosHeader ? <TopAppBar title="Conversas" onBack={guardedBack} /> : null}
      scrolling={hasList}
    >
      <View style={wideWeb ? styles.wideContainer : styles.flexOne}>
        {hasIosHeader ? null : (
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
            {wideWeb && !hasList ? (
              <Text style={styles.subtitleWide}>
                Acompanhe propostas de troca, compra e doação direto com leitores de Piripiri.
              </Text>
            ) : null}
          </View>
        )}

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
                  <Text style={styles.featureTitleWide}>Pontos de encontro recomendados</Text>
                  <Text style={styles.featureBodyWide}>
                    Locais públicos em Piripiri para combinar a entrega presencial dos livros.
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
                <View style={styles.wideListHeader} testID="conversation-list-header">
                  <Text style={styles.wideListCount}>
                    {`${visibleItems.length} ${visibleItems.length === 1 ? "conversa" : "conversas"}`}
                  </Text>
                </View>
              ) : null}
              {wideWeb ? segmentedFilters : null}
              <ScrollEdgeFlatList
                testID="conversation-list"
                style={styles.flexOne}
                {...standardVerticalScrollProps}
                data={visibleItems}
                keyExtractor={(item) => item.requestId}
                contentContainerStyle={wideWeb ? styles.wideList : [
                  styles.list,
                  { paddingBottom: scrollBottomPadding.withoutBottomBar },
                ]}
                ListHeaderComponent={!wideWeb || showPendingBanner ? (
                  <>
                    {!wideWeb ? segmentedFilters : null}
                    {showPendingBanner ? (
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
                    ) : null}
                  </>
                ) : undefined}
                ListEmptyComponent={
                  <View style={styles.filteredEmpty}>
                    <Text style={styles.filteredEmptyTitle}>
                      {filter === "completed"
                        ? "Nenhuma negociação concluída ainda"
                        : "Nenhuma conversa ativa no momento"}
                    </Text>
                    <Text style={styles.filteredEmptyBody}>
                      {filter === "completed"
                        ? "Quando uma entrega for finalizada, a conversa aparecerá separada aqui."
                        : "Suas negociações em andamento foram concluídas."}
                    </Text>
                    {filter === "active" && completedItems.length > 0 ? (
                      <FilledButton label="Ver concluídas" onPress={() => setFilter("completed")} />
                    ) : null}
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = wideWeb && item.requestId === selectedId;
                  const isCompleted = item.listing.status === "delivered";
                  return (
                    <View
                      style={[
                        styles.rowWrap,
                        !wideWeb && styles.rowCardMobile,
                        !wideWeb && !isCompleted && item.kind === "pendingReceived" && styles.rowCardPendingReceived,
                        !wideWeb && !isCompleted && item.kind === "pendingSent" && styles.rowCardPendingSent,
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Conversa com ${item.otherName} sobre ${item.listing.title}. ${item.preview}`}
                        accessibilityState={wideWeb ? { selected: isSelected } : undefined}
                        accessibilityHint={!wideWeb && item.kind === "accepted" ? "Mantenha pressionado para apagar a conversa" : undefined}
                        onPress={() => open(item)}
                        onLongPress={!wideWeb && item.kind === "accepted" ? () => setToDelete(item) : undefined}
                        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                          styles.row,
                          wideWeb && styles.rowWideItem,
                          wideWeb && hovered && !isSelected ? styles.rowHovered : null,
                          pressed ? styles.rowPressed : null,
                          isSelected ? styles.rowSelected : null,
                        ]}
                      >
                        <BookCover
                          id={item.listing.id}
                          title={item.listing.title}
                          photoUrl={item.listing.photoUrl}
                          variant="list"
                          width={wideWeb ? 44 : undefined}
                        />
                        <View style={styles.rowText}>
                          <View style={styles.rowHeader}>
                            <Text style={[styles.about, isSelected && styles.nameSelected]} numberOfLines={2}>
                              {item.listing.title}
                            </Text>
                            {isCompleted ? (
                              <View style={styles.completedPill}>
                                <Text style={styles.completedPillText}>Concluído</Text>
                              </View>
                            ) : item.lastMessageAt ? (
                              <Text style={styles.time}>{formatConversationTime(item.lastMessageAt, now)}</Text>
                            ) : item.kind === "pendingSent" ? (
                              <View style={styles.pendingSentPill}>
                                <Text style={styles.pendingSentPillText}>Enviado</Text>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.aboutRow}>
                            <View style={styles.rowAuthorGroup}>
                              <Avatar name={item.otherName} photoUrl={item.otherPhotoUrl ?? undefined} size={20} />
                              <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
                                {item.otherName}
                              </Text>
                            </View>
                            <Tag variant={item.listing.modality} />
                          </View>
                          {item.kind === "pendingReceived" && !isCompleted ? (
                            <View style={styles.previewBadgeRow}>
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>Nova proposta</Text>
                              </View>
                              <Text style={[styles.preview, styles.previewStatus, styles.previewFlex]} numberOfLines={1}>
                                {item.preview}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[styles.preview, item.kind !== "accepted" ? styles.previewStatus : null]}
                              numberOfLines={wideWeb ? 1 : 2}
                            >
                              {item.preview}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                      {item.kind === "pendingSent" ? (
                        <View style={styles.cancelRequestBar}>
                          <Text style={styles.cancelRequestHint}>Solicitação aguardando o anunciante</Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Cancelar pedido de ${item.listing.title}`}
                            onPress={() => {
                              if (isIos) triggerHaptic("light");
                              setToCancel(item);
                            }}
                            hitSlop={8}
                            style={({ pressed }) => [
                              styles.cancelRequest,
                              isIos && (iosGlass ? styles.iosCancelRequestGlass : styles.iosCancelRequestOpaque),
                              pressed && (isIos ? styles.iosCancelRequestPressed : styles.cancelRequestPressed),
                            ]}
                          >
                            {iosGlass ? (
                              <IosGlassBackdrop
                                testID="conversations-cancel-request-glass"
                                tintColor={colors.errorContainer}
                                style={styles.iosGlassPillShape}
                              />
                            ) : null}
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
            {wideWeb && selectedItem ? (
              <View style={styles.widePane} testID="conversation-pane">
                <Chat
                  embedded
                  key={selectedItem.requestId}
                  requestId={selectedItem.requestId}
                  focusKey={focusKey}
                  sessionUserId={sessionUserId}
                  initialCounterpartName={selectedItem?.otherName}
                  initialCounterpartPhotoUrl={selectedItem?.otherPhotoUrl}
                  initialModality={selectedItem?.listing.modality}
                  bookTitle={selectedItem.listing.title}
                  bookDetailsOpen={bookDetailsOpen}
                  onOpenBookDetails={() => setBookDetailsOpen(true)}
                  onOpenNegotiation={guardedOpenNegotiation}
                  onScheduleMeeting={onScheduleMeeting}
                  onOpenDelivery={onOpenDelivery}
                  onDeleteConversation={() => setToDelete(selectedItem)}
                />
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

            {wideWeb && selectedItem ? (
              <BottomSheet
                placement="right"
                showCloseButton
                testID="conversation-about"
                title={`Sobre ${selectedItem.listing.modality === "trade" ? "a troca" : selectedItem.listing.modality === "donation" ? "a doação" : "a compra"}`}
                visible={bookDetailsOpen}
                onClose={() => setBookDetailsOpen(false)}
              >
                <ScrollView contentContainerStyle={styles.aboutBody}>
                  {renderAboutBook(selectedItem)}
                  <View style={styles.aboutSafe}>
                    <View style={styles.aboutSafeHeader}>
                      <View style={styles.aboutSafeIcon}>
                        <AppIcon name="place" size={14} color={colors.nature.foliageDeep} />
                      </View>
                      <Text style={styles.aboutSafeTitle}>Encontro recomendado</Text>
                    </View>
                    <Text style={styles.aboutSafeBody}>Locais públicos e horário de movimento em Piripiri.</Text>
                  </View>
                  {onReportListing ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Denunciar anúncio"
                      onPress={() => {
                        setBookDetailsOpen(false);
                        guardedReportListing(selectedItem.listing.id);
                      }}
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
                </ScrollView>
              </BottomSheet>
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
    </ScrollEdgeScreen>
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
