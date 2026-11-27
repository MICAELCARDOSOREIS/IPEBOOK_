import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  makeAuthViewModel,
  makeDeliveryStatus,
  makeMeetingViewModel,
  makeNegotiationChatViewModel,
  makeRequestDetailViewModel,
  networkStatusDataSource as defaultNetworkStatusDataSource,
} from "@/di/container";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useReloadOnReconnect } from "@/viewmodel/useReloadOnReconnect";
import { buildChatTimeline, formatBubbleTime, type ChatEvent, type ChatTimelineItem } from "@/viewmodel/chatTimeline";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { addMeetingToCalendar } from "@/view/calendarIntegration";
import { buildDirectionsUrl } from "@/view/directionsUrl";
import { NegotiationStatusCard } from "./NegotiationStatusCard";
import { BuyerPendingProposalBanner, OwnerPendingProposalCard } from "./ChatProposalCards";
import { createChatStyles } from "./chatStyles";
import { formatPrice } from "@/view/formatPrice";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { Tag } from "@/view/components/Tag";
import { Avatar } from "@/view/components/Avatar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useOnRefocus } from "@/view/useRefocusKey";
import { standardVerticalScrollProps } from "@/view/scrollProps";
import { withPress } from "@/view/pressFeedback";

const COMMUNITY_MEMBER = "Pessoa da comunidade";
const SUGGESTIONS = [
  "O livro ainda está disponível?",
  "Podemos combinar em um ponto recomendado?",
  "Qual horário fica bom para você?",
];

export type ChatProps = {
  requestId: string;
  sessionUserId: string;
  focusKey?: number;
  onBack?: () => void;
  /** "Combinar" marca o encontro; o cartão do livro abre o acompanhamento (`/negociacao/[id]`). */
  onOpenNegotiation?: (requestId: string) => void;
  /** Atalho direto para a tela de entrega do livro (`/negociacao/[id]/entrega`). */
  onOpenDelivery?: (requestId: string) => void;
  /** Atalho direto para agendar o encontro (`/negociacao/[id]/encontro`). */
  onScheduleMeeting?: (requestId: string) => void;
  onDeleteConversation?: () => void;
  /** Painel da web larga entre a lista e os detalhes do livro. */
  embedded?: boolean;
  /** Dados já conhecidos pela lista para evitar flash genérico enquanto o detalhe carrega. */
  initialCounterpartName?: string;
  initialCounterpartPhotoUrl?: string | null;
  initialModality?: "sale" | "trade" | "donation";
  /** Provedor de status de rede (Spec 130 / ADR 0101). */
  networkStatusDataSource?: INetworkStatusDataSource;
};

/** Conversa em tela cheia, Figma `06.02 · Conversa com Ana Paula` (Spec 082). */
export function Chat({
  requestId,
  sessionUserId,
  focusKey,
  onBack,
  onOpenNegotiation,
  onOpenDelivery,
  onScheduleMeeting,
  onDeleteConversation,
  embedded = false,
  initialCounterpartName,
  initialCounterpartPhotoUrl,
  initialModality,
  networkStatusDataSource = defaultNetworkStatusDataSource,
}: ChatProps) {
  const { isOnline } = useNetworkStatus(networkStatusDataSource);
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const isKeyboardVisible = useKeyboardVisible();
  const styles = useMemo(() => createChatStyles(colors), [colors]);
  const [detailState, detailActions] = makeRequestDetailViewModel(requestId, sessionUserId);
  const [state, actions] = makeNegotiationChatViewModel(requestId, sessionUserId);
  const [meetingState, meetingActions] = makeMeetingViewModel(requestId, sessionUserId);

  const syncAllSilently = () => {
    void (detailActions.refresh ?? detailActions.reload)();
    void (actions.refresh ?? actions.reload)();
    void (meetingActions.refresh ?? meetingActions.reload)();
  };

  useOnRefocus(focusKey, syncAllSilently);
  useReloadOnReconnect(isOnline, syncAllSilently);

  // Quando o anunciante aceita a proposta enquanto o leitor está na tela, libera mensagens e encontro ao vivo.
  const prevRequestStatusRef = useRef(detailState.detail?.request.status);
  useEffect(() => {
    const nextStatus = detailState.detail?.request.status;
    if (prevRequestStatusRef.current === "pending" && nextStatus === "accepted") {
      void (actions.refresh ?? actions.reload)();
      void (meetingActions.refresh ?? meetingActions.reload)();
    }
    prevRequestStatusRef.current = nextStatus;
  }, [detailState.detail?.request.status, actions, meetingActions]);
  const [conversationOptionsOpen, setConversationOptionsOpen] = useState(false);
  const [respondingProposal, setRespondingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const guardedBack = useGuardedPress(onBack);
  const guardedOpenNegotiation = useGuardedPress((id: string) => onOpenNegotiation?.(id));
  const guardedOpenDelivery = useGuardedPress((id: string) => onOpenDelivery?.(id));
  const guardedScheduleMeeting = useGuardedPress((id: string) => onScheduleMeeting?.(id));

  const openScheduling = onScheduleMeeting
    ? () => guardedScheduleMeeting(requestId)
    : onOpenNegotiation ? () => guardedOpenNegotiation(requestId) : undefined;

  const handleAcceptProposal = async () => {
    setRespondingProposal(true);
    setProposalError(null);
    try {
      await detailActions.respond?.("accept");
      await actions.reload();
      await meetingActions.reload();
    } catch {
      setProposalError("Não foi possível aceitar a proposta. Tente novamente.");
    } finally {
      setRespondingProposal(false);
    }
  };

  const handleRejectProposal = async () => {
    setRespondingProposal(true);
    setProposalError(null);
    try {
      await detailActions.respond?.("reject");
    } catch {
      setProposalError("Não foi possível recusar a proposta.");
    } finally {
      setRespondingProposal(false);
    }
  };

  // Entrega concluída por QR (Spec 095): passa focusKey e assina tempo real para atualizar sem sair da conversa.
  const delivery = makeDeliveryStatus(requestId, sessionUserId, focusKey ?? 0);
  const listRef = useRef<FlatList<ChatTimelineItem>>(null);

  const detail = detailState.detail;
  const name = detail?.counterpartName ?? initialCounterpartName ?? COMMUNITY_MEMBER;
  const counterpartPhotoUrl = detail?.counterpartPhotoUrl ?? initialCounterpartPhotoUrl ?? undefined;

  const events = useMemo<ChatEvent[]>(() => {
    const list: ChatEvent[] = [];
    if (meetingState.meeting) {
      if (meetingState.meeting.status === "proposed") {
        list.push({
          id: "ev-meeting-proposed",
          type: "meeting_proposed",
          description: `Encontro sugerido em ${meetingState.meeting.pointName}`,
          timestamp: meetingState.meeting.scheduledAt,
          icon: "calendar",
        });
      } else if (meetingState.meeting.status === "confirmed") {
        list.push({
          id: "ev-meeting-confirmed",
          type: "meeting_confirmed",
          description: `Encontro confirmado em ${meetingState.meeting.pointName}`,
          timestamp: meetingState.meeting.scheduledAt,
          icon: "checkCircle",
        });
      }
    }
    if (delivery.completed) {
      list.push({
        id: "ev-delivery-completed",
        type: "delivery_confirmed",
        description: "Livro entregue presencialmente com sucesso!",
        timestamp: new Date().toISOString(),
        icon: "checkCircle",
      });
    }
    return list;
  }, [meetingState.meeting, delivery.completed]);

  const timeline = useMemo(
    () => buildChatTimeline(state.messages, new Date(), events),
    [state.messages, events],
  );
  const canSend = state.inputText.trim().length > 0 && !state.isSending && isOnline;
  const isWebStandalone = wideWeb && !embedded;
  const effectiveModality = detail?.book.modality ?? initialModality;
  const pendingProposalIcon: AppIconName =
    effectiveModality === "sale" ? "category" : effectiveModality === "donation" ? "heart" : "swap";
  const modalityLabel = effectiveModality
    ? effectiveModality === "trade"
      ? "Troca"
      : effectiveModality === "sale"
        ? "Venda"
        : "Doação"
    : "";

  const handleOpenDirections = () => {
    if (!meetingState.meeting) return;
    const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meetingState.meeting?.pointName);
    const query = point ? `${point.name}, ${point.address}` : `${meetingState.meeting.pointName}, Piripiri - PI`;
    void Linking.openURL(buildDirectionsUrl(query));
  };

  const handleAddToCalendar = async () => {
    if (!meetingState.meeting || !detail) return;
    const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meetingState.meeting?.pointName);
    await addMeetingToCalendar({
      title: `Entrega do livro: ${detail.book.title} (IpêBook)`,
      details: `Encontro com ${name} em Piripiri.`,
      location: point ? `${point.name} (${point.address})` : meetingState.meeting.pointName,
      scheduledAt: meetingState.meeting.scheduledAt,
    });
  };

  // Ao abrir e a cada mensagem nova, a última fica visível (Spec 082).
  useEffect(() => {
    if (timeline.length > 0) listRef.current?.scrollToEnd?.({ animated: true });
  }, [timeline.length]);

  const scrollToLatest = () => {
    listRef.current?.scrollToEnd?.({ animated: false });
    // Segunda passada depois da medição dos balões.
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: false }), 120);
  };

  const renderItem = ({ item }: { item: ChatTimelineItem }) => {
    if (item.kind === "day") {
      return (
        <View style={styles.dayRow}>
          <Text style={styles.dayLabel}>{item.label}</Text>
        </View>
      );
    }
    if (item.kind === "event") {
      const iconName: AppIconName = item.event.icon ?? "info";
      return (
        <View style={styles.eventRow}>
          <View style={styles.eventBadge}>
            <AppIcon name={iconName} size={14} color={colors.nature.foliage} />
            <Text style={styles.eventText}>{item.event.description}</Text>
          </View>
        </View>
      );
    }
    const mine = item.message.senderId === sessionUserId;
    const time = formatBubbleTime(item.message.createdAt);
    return (
      <View
        accessible
        accessibilityLabel={`${mine ? "Você" : name} às ${time}: ${item.message.content}`}
        style={[
          styles.bubble,
          wideWeb && styles.bubbleWide,
          mine ? styles.bubbleMine : styles.bubbleOther,
          item.grouped ? styles.bubbleGrouped : null,
        ]}
      >
        <Text style={[styles.bubbleText, mine && styles.bubbleMineText]}>{item.message.content}</Text>
        <Text style={styles.bubbleTime}>{time}</Text>
      </View>
    );
  };

  const chatBody = (
    <View style={isWebStandalone ? styles.webWrapper : styles.flex}>
      <View style={isWebStandalone ? styles.webCard : styles.flex}>
        {/* Cabeçalho com a foto da pessoa (Spec 089); sem foto o avatar mostra o ipê. */}
        <View
          style={[styles.header, wideWeb && styles.headerWide, wideWeb && embedded && styles.headerEmbeddedWide]}
          testID={wideWeb && embedded ? "conversation-chat-header" : undefined}
        >
          {embedded ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={8}
              onPress={guardedBack}
              style={withPress(styles.backButton)}
            >
              <AppIcon name="back" size={24} color={colors.m3.onSurface} />
            </Pressable>
          )}
          <Avatar name={name} photoUrl={counterpartPhotoUrl} size={wideWeb ? 44 : 40} />
          <View style={styles.headerInfo}>
            <Text accessibilityRole="header" style={[styles.headerTitle, wideWeb && styles.headerTitleWide]} numberOfLines={1}>
              {name}
            </Text>
            {isWebStandalone && detail ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {`Negociação de "${detail.book.title}" · ${modalityLabel}`}
              </Text>
            ) : detail && !embedded ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir negociação de ${detail.book.title}`}
                onPress={() => guardedOpenNegotiation(requestId)}
                style={withPress(styles.headerBookLink, colors.m3.focusRing)}
              >
                <Text style={[styles.headerSubtitle, styles.linkBookTitle]} numberOfLines={1}>{detail.book.title}</Text>
                {modalityLabel ? (
                  <>
                    <Text style={styles.headerSubtitle}>·</Text>
                    <Text style={styles.headerSubtitle}>{modalityLabel}</Text>
                  </>
                ) : null}
                <AppIcon name="chevronRight" size={14} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : embedded && modalityLabel ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {`Bate-papo da negociação · ${modalityLabel}`}
              </Text>
            ) : null}
          </View>
          {onDeleteConversation ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Opções da conversa"
              accessibilityState={{ expanded: conversationOptionsOpen }}
              onPress={() => setConversationOptionsOpen((open) => !open)}
              style={withPress(styles.backButton, colors.m3.focusRing)}
            >
              <AppIcon name="more" size={22} color={colors.m3.onSurface} />
            </Pressable>
          ) : null}
        </View>
        {conversationOptionsOpen && onDeleteConversation ? (
          <View style={styles.conversationOptions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setConversationOptionsOpen(false);
                onDeleteConversation();
              }}
              style={withPress(styles.conversationDelete, colors.m3.focusRing)}
            >
              <Text style={styles.conversationDeleteLabel}>Apagar conversa</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.flex}>
          {detail?.request.status === "accepted" &&
            (meetingState.loading || meetingState.error || meetingState.meeting || delivery.completed || openScheduling) &&
            (wideWeb || !isKeyboardVisible) ? (
            <View style={[styles.embeddedStatusStrip, !wideWeb && styles.narrowStatusStrip]}>
              {meetingState.loading && !delivery.completed ? (
                <Text style={styles.headerSubtitle}>Carregando encontro…</Text>
              ) : meetingState.error && !delivery.completed ? (
                <Pressable accessibilityRole="button" onPress={() => void meetingActions.reload()} style={withPress(styles.headerBookLink)}>
                  <Text style={styles.headerSubtitle}>Não foi possível carregar o encontro. Tentar novamente</Text>
                </Pressable>
              ) : (
                <NegotiationStatusCard
                  embedded
                  meeting={meetingState.meeting}
                  requestStatus={detail.request.status}
                  counterpartName={name}
                  sessionUserId={sessionUserId}
                  deliveryCompleted={Boolean(delivery.completed)}
                  busy={meetingState.busy}
                  combineAccessibilityLabel="Combinar encontro na negociação"
                  combineButtonLabel={wideWeb ? "Combinar encontro" : "Combinar"}
                  onCombineMeeting={openScheduling}
                  onConfirmMeeting={() => void meetingActions.confirm()}
                  onSuggestOtherTime={openScheduling}
                  onRescheduleMeeting={openScheduling}
                  onOpenDelivery={() => (onOpenDelivery ? guardedOpenDelivery(requestId) : guardedOpenNegotiation(requestId))}
                  onOpenDirections={handleOpenDirections}
                  onAddToCalendar={() => void handleAddToCalendar()}
                />
              )}
              {meetingState.actionError ? (
                <Text accessibilityRole="alert" style={styles.conversationDeleteLabel}>{meetingState.actionError}</Text>
              ) : null}
            </View>
          ) : null}

          {detail?.isOwner && detail.request.status === "pending" ? (
            <OwnerPendingProposalCard
              counterpartName={name}
              initialMessage={detail.request.initialMessage}
              offeredBook={detail.offeredBook}
              modality={effectiveModality}
              isWebStandalone={isWebStandalone}
              responding={respondingProposal}
              error={proposalError}
              onAccept={() => void handleAcceptProposal()}
              onReject={() => void handleRejectProposal()}
            />
          ) : null}

          {detail && !detail.isOwner && detail.request.status === "pending" ? (
            <BuyerPendingProposalBanner
              initialMessage={detail.request.initialMessage}
              offeredBook={detail.offeredBook}
              isWebStandalone={isWebStandalone}
            />
          ) : null}

          {state.isLoading ? (
            <View style={styles.loadingContainer} accessibilityLabel="Carregando mensagens">
              <View style={styles.skeletonBubbleOther} />
              <View style={styles.skeletonBubbleMine} />
              <View style={styles.skeletonBubbleOtherShort} />
            </View>
          ) : detail?.request.status === "pending" ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <AppIcon name={pendingProposalIcon} size={28} color={colors.nature.foliage} />
              </View>
              <Text style={styles.emptyTitle}>Proposta em análise</Text>
              <Text style={styles.emptyBody}>
                {detail.isOwner
                  ? "Avalie a proposta acima. Ao aceitar, o livro será reservado e o canal de mensagens será ativado para combinar a entrega em Piripiri."
                  : "Sua solicitação foi enviada. Assim que o anunciante aceitar, o canal de mensagens será liberado para vocês combinarem o encontro."}
              </Text>
            </View>
          ) : state.error ? (
            <View style={styles.loadingContainer}>
              <ErrorState message={state.error} onRetry={() => void actions.reload()} />
            </View>
          ) : timeline.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <AppIcon name="chat" size={28} color={colors.m3.onSecondaryContainer} />
              </View>
              <Text style={styles.emptyTitle}>Comece a conversa</Text>
              <Text style={styles.emptyBody}>Combine pelo chat um encontro em um dos pontos recomendados de Piripiri.</Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((text) => (
                  <Chip key={text} label={text} size="compact" selected={false} onPress={() => actions.setInputText(text)} />
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              style={styles.flex}
              {...standardVerticalScrollProps}
              data={timeline}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              contentContainerStyle={[styles.list, wideWeb && styles.listWide]}
              initialNumToRender={timeline.length}
              onContentSizeChange={scrollToLatest}
              onLayout={scrollToLatest}
            />
          )}

          {state.sendError ? (
            <View accessibilityRole="alert" style={styles.sendErrorCard}>
              <AppIcon name="error" size={18} color={colors.error} />
              <Text style={styles.sendErrorText}>{state.sendError}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reenviar mensagem"
                onPress={() => void actions.retryLastMessage()}
                hitSlop={8}
                style={{ minHeight: Platform.OS === "ios" ? 44 : undefined, justifyContent: "center" }}
              >
                <Text style={styles.retryText}>Reenviar</Text>
              </Pressable>
            </View>
          ) : null}

          {delivery.completed ? (
            <View style={styles.closedNotice} accessibilityLiveRegion="polite">
              <Text style={styles.closedNoticeText}>Negociação concluída. A conversa ficou só para consulta.</Text>
            </View>
          ) : detail?.request.status === "pending" ? (
            <View style={styles.closedNotice} accessibilityLiveRegion="polite">
              <Text style={styles.closedNoticeText}>
                {detail.isOwner
                  ? "Aceite a proposta acima para liberar o bate-papo e combinar o encontro."
                  : "Aguardando o anunciante aceitar a proposta para liberar o bate-papo."}
              </Text>
            </View>
          ) : (
            <>
              {state.inputText.length >= 800 ? (
                <View style={styles.charCountRow}>
                  <Text
                    style={[
                      styles.charCountText,
                      state.inputText.length >= 980 && styles.charCountWarn,
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {`${state.inputText.length}/1000`}
                  </Text>
                </View>
              ) : null}
              {!isOnline ? (
                <View accessibilityRole="alert" style={styles.offlineNotice}>
                  <AppIcon name="wifiOff" size={14} color={colors.secondaryText} />
                  <Text style={styles.offlineNoticeText}>Sem conexão para enviar mensagens</Text>
                </View>
              ) : null}
              {detail?.request.status === "accepted" &&
              meetingState.meeting &&
              meetingState.meeting.status !== "cancelled" &&
              state.messages.length === 0 &&
              !state.inputText.trim() &&
              isOnline &&
              !state.isSending ? (
                <View style={styles.quickRepliesRow}>
                  {["Estou chegando", "Já estou aqui", "Qual ponto?"].map((reply) => (
                    <Pressable
                      key={reply}
                      accessibilityRole="button"
                      accessibilityLabel={`Sugestão de mensagem: ${reply}`}
                      onPress={() => actions.setInputText(reply)}
                      style={withPress(styles.quickReplyChip)}
                    >
                      <Text style={styles.quickReplyText}>{reply}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View
                style={[styles.composer, wideWeb && styles.composerWide, wideWeb && embedded && styles.composerEmbeddedWide]}
                testID={wideWeb && embedded ? "conversation-chat-footer" : undefined}
              >
                <TextInput
                  accessibilityLabel="Campo de mensagem"
                  value={state.inputText}
                  onChangeText={actions.setInputText}
                  onKeyPress={(e: Parameters<NonNullable<TextInputProps["onKeyPress"]>>[0] & { preventDefault?: () => void }) => {
                    const nativeEvent = e.nativeEvent as { key: string; shiftKey?: boolean };
                    if (Platform.OS === "web" && nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
                      e.preventDefault?.();
                      if (canSend) {
                        void actions.sendMessage();
                      }
                    }
                  }}
                  placeholder="Escreva uma mensagem"
                  placeholderTextColor={colors.m3.onSurfaceVariant}
                  multiline
                  maxLength={1000}
                  {...(Platform.OS === "web" ? ({ rows: 1 } as never) : {})}
                  style={styles.input}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={!isOnline ? "Envio indisponível sem conexão" : "Enviar mensagem"}
                  accessibilityState={{ disabled: !canSend }}
                  disabled={!canSend}
                  onPress={() => {
                    if (!canSend) return;
                    void actions.sendMessage();
                  }}
                  style={withPress([styles.send, canSend ? styles.sendActive : styles.sendDisabled])}
                >
                  {state.isSending ? (
                    <ActivityIndicator color={colors.m3.onPrimary} />
                  ) : (
                    <AppIcon name="send" size={22} color={canSend ? colors.m3.onPrimary : colors.m3.onSurfaceVariant} />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
      {isWebStandalone && detail ? (
        <View style={styles.webSidePane}>
          <View style={styles.webSideHeader}>
            <Text style={styles.webSideHeaderTitle}>Sobre a negociação</Text>
          </View>
          <View style={styles.webSideBody}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir negociação de ${detail.book.title}`}
              onPress={() => guardedOpenNegotiation(requestId)}
              style={withPress([styles.bookCard, styles.bookCardWide])}
            >
              <View style={styles.bookRow}>
                <BookCover
                  id={detail.book.id}
                  title={detail.book.title}
                  photoUrl={detail.book.photoUrl}
                  variant="list"
                  width={44}
                />
                <View style={styles.bookText}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {detail.book.title}
                  </Text>
                  <View style={styles.bookMetaRow}>
                    <Tag variant={detail.book.modality} />
                    {detail.book.modality === "sale" && detail.book.price != null ? (
                      <Text style={styles.bookPrice}>{formatPrice(detail.book.price)}</Text>
                    ) : null}
                  </View>
                </View>
                <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} />
              </View>
            </Pressable>

            <View style={styles.webSafeCard}>
              <View style={styles.webSafeHeader}>
                <AppIcon name="place" size={16} color={colors.nature.foliage} />
                <Text style={styles.webSafeTitle}>Encontro recomendado</Text>
              </View>
              <Text style={styles.webSafeText}>
                Locais públicos e horário de movimento em Piripiri.
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );

  if (embedded) {
    return <View style={styles.embeddedPage}>{chatBody}</View>;
  }

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" && isKeyboardVisible ? ["top", "left", "right"] : ["top", "left", "right", "bottom"]}
      style={[styles.page, isWebStandalone && styles.pageWeb]}
    >
      {chatBody}
    </SafeAreaView>
  );
}

export type ChatScreenProps = Omit<ChatProps, "sessionUserId"> & { onRequireSignIn?: () => void };

export default function ChatScreen({ onRequireSignIn, ...props }: ChatScreenProps) {
  const [authState] = makeAuthViewModel();
  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);
  if (authState.loading || !authState.user) return null;
  return <Chat sessionUserId={authState.user.id} {...props} />;
}
