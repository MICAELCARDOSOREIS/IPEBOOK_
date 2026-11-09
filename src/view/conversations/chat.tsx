import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
import { buildChatTimeline, formatBubbleTime, type ChatEvent, type ChatTimelineItem } from "@/viewmodel/chatTimeline";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { addMeetingToCalendar } from "@/view/calendarIntegration";
import { NegotiationStatusCard } from "./NegotiationStatusCard";
import { BuyerPendingProposalBanner, OwnerPendingProposalCard } from "./ChatProposalCards";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { Tag } from "@/view/components/Tag";
import { Avatar } from "@/view/components/Avatar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";
const COMMUNITY_MEMBER = "Pessoa da comunidade";
const SUGGESTIONS = [
  "O livro ainda está disponível?",
  "Podemos combinar num ponto seguro?",
  "Qual horário fica bom para você?",
];

export type ChatProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  /** "Combinar": abre a negociação para marcar o encontro (`/negociacao/[id]`). */
  onOpenNegotiation?: (requestId: string) => void;
  /** Atalho direto para a tela de entrega do livro (`/negociacao/[id]/entrega`). */
  onOpenDelivery?: (requestId: string) => void;
  /** Atalho direto para agendar o encontro (`/negociacao/[id]/encontro`). */
  onScheduleMeeting?: (requestId: string) => void;
  /** Painel da web larga: a lista e o "Combinar encontro" já estão nas colunas vizinhas. */
  embedded?: boolean;
  /** Provedor de status de rede (Spec 130 / ADR 0101). */
  networkStatusDataSource?: INetworkStatusDataSource;
};

/** Conversa em tela cheia, Figma `06.02 · Conversa com Ana Paula` (Spec 082). */
export function Chat({
  requestId,
  sessionUserId,
  onBack,
  onOpenNegotiation,
  onOpenDelivery,
  onScheduleMeeting,
  embedded = false,
  networkStatusDataSource = defaultNetworkStatusDataSource,
}: ChatProps) {
  const { isOnline } = useNetworkStatus(networkStatusDataSource);
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [detailState, detailActions] = makeRequestDetailViewModel(requestId, sessionUserId);
  const [state, actions] = makeNegotiationChatViewModel(requestId, sessionUserId);
  const [meetingState, meetingActions] = makeMeetingViewModel(requestId, sessionUserId);
  const [respondingProposal, setRespondingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const guardedBack = useGuardedPress(onBack);
  const guardedOpenNegotiation = useGuardedPress((id: string) => onOpenNegotiation?.(id));
  const guardedOpenDelivery = useGuardedPress((id: string) => onOpenDelivery?.(id));
  const guardedScheduleMeeting = useGuardedPress((id: string) => onScheduleMeeting?.(id));

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
  // Entrega concluída por QR (Spec 095): não há mais o que combinar.
  const delivery = makeDeliveryStatus(requestId, sessionUserId);
  const listRef = useRef<FlatList<ChatTimelineItem>>(null);

  const detail = detailState.detail;
  const name = detail?.counterpartName ?? COMMUNITY_MEMBER;

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

  const handleOpenDirections = () => {
    if (!meetingState.meeting) return;
    const point = PIRIPIRI_MEETING_POINTS.find((p) => p.name === meetingState.meeting?.pointName);
    const query = point ? `${point.name}, ${point.address}` : `${meetingState.meeting.pointName}, Piripiri - PI`;
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
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
          isWebStandalone && styles.bubbleWide,
          mine ? styles.bubbleMine : styles.bubbleOther,
          item.grouped ? styles.bubbleGrouped : null,
        ]}
      >
        <Text style={styles.bubbleText}>{item.message.content}</Text>
        <Text style={styles.bubbleTime}>{time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={[styles.page, isWebStandalone && styles.pageWeb]}>
      <View style={isWebStandalone ? styles.webWrapper : styles.flex}>
        <View style={isWebStandalone ? styles.webCard : styles.flex}>
          {/* Cabeçalho com a foto da pessoa (Spec 089); sem foto o avatar mostra o ipê. */}
          <View style={[styles.header, isWebStandalone && styles.headerWide]}>
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
            <Avatar name={name} photoUrl={detail?.counterpartPhotoUrl ?? undefined} size={isWebStandalone ? 44 : 40} />
            <View style={styles.headerInfo}>
              <Text accessibilityRole="header" style={[styles.headerTitle, isWebStandalone && styles.headerTitleWide]} numberOfLines={1}>
                {name}
              </Text>
              {isWebStandalone && detail ? (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {`Negociação de "${detail.book.title}" · ${detail.book.modality === "trade" ? "Troca" : detail.book.modality === "sale" ? "Venda" : "Doação"}`}
                </Text>
              ) : null}
            </View>
            {isWebStandalone && detail && detail.request.status === "accepted" && !delivery.completed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Combinar encontro na negociação"
                onPress={() => guardedOpenNegotiation(requestId)}
                style={withPress(styles.webCombineButton)}
              >
                <AppIcon name="place" size={16} color={colors.m3.onPrimary} />
                <Text style={styles.webCombineButtonText}>Combinar encontro</Text>
              </Pressable>
            ) : null}
          </View>
          {/* O desvio do teclado é da raiz única (KeyboardAwareRoot, Spec 088); aqui só o layout do chat. */}
          <View style={styles.flex}>
            {/* Embutido na web larga, o livro já aparece no painel "Sobre a negociação" ao lado. */}
            {detail && !embedded ? (
              <View style={[styles.bookCard, isWebStandalone && styles.bookCardWide]}>
                <BookCover id={detail.book.id} title={detail.book.title} photoUrl={detail.book.photoUrl} variant="list" />
                <View style={styles.bookText}>
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {detail.book.title}
                  </Text>
                  <Tag variant={detail.book.modality} />
                </View>
                {embedded || delivery.completed || detail.request.status !== "accepted" ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Combinar encontro na negociação"
                    onPress={() => guardedOpenNegotiation(requestId)}
                    style={withPress(styles.combine)}
                  >
                    <Text style={styles.combineText}>Combinar</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {detail && detail.request.status === "accepted" ? (
              <NegotiationStatusCard
                meeting={meetingState.meeting}
                requestStatus={detail.request.status}
                counterpartName={name}
                sessionUserId={sessionUserId}
                deliveryCompleted={Boolean(delivery.completed)}
                onCombineMeeting={() => (onScheduleMeeting ? guardedScheduleMeeting(requestId) : guardedOpenNegotiation(requestId))}
                onConfirmMeeting={() => void meetingActions.confirm()}
                onSuggestOtherTime={() => (onScheduleMeeting ? guardedScheduleMeeting(requestId) : guardedOpenNegotiation(requestId))}
                onRescheduleMeeting={() => (onScheduleMeeting ? guardedScheduleMeeting(requestId) : guardedOpenNegotiation(requestId))}
                onOpenDelivery={() => (onOpenDelivery ? guardedOpenDelivery(requestId) : guardedOpenNegotiation(requestId))}
                onOpenDirections={handleOpenDirections}
                onAddToCalendar={() => void handleAddToCalendar()}
              />
            ) : null}

            {detail && detail.isOwner && detail.request.status === "pending" ? (
              <OwnerPendingProposalCard
                counterpartName={name}
                initialMessage={detail.request.initialMessage}
                offeredBook={detail.offeredBook}
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
              <View style={styles.loadingContainer}>
                <LoadingState label="Carregando mensagens" />
              </View>
            ) : detail?.request.status === "pending" ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <AppIcon name="swap" size={28} color={colors.nature.foliage} />
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
                <Text style={styles.emptyBody}>Combine pelo chat e encontre em um ponto seguro de Piripiri.</Text>
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((text) => (
                    <Chip key={text} label={text} size="compact" selected={false} onPress={() => actions.setInputText(text)} />
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                {...standardVerticalScrollProps}
                data={timeline}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                contentContainerStyle={[styles.list, isWebStandalone && styles.listWide]}
                initialNumToRender={timeline.length}
                onContentSizeChange={scrollToLatest}
                onLayout={scrollToLatest}
              />
            )}

            {state.sendError ? (
              <View accessibilityRole="alert" style={styles.sendErrorCard}>
                <AppIcon name="error" size={18} color={colors.error} />
                <Text style={styles.sendErrorText}>{state.sendError}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Reenviar mensagem" onPress={() => void actions.retryLastMessage()} hitSlop={8}>
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
              <View style={[styles.composer, isWebStandalone && styles.composerWide]}>
                <TextInput
                  accessibilityLabel="Campo de mensagem"
                  value={state.inputText}
                  onChangeText={actions.setInputText}
                  onKeyPress={(e: any) => {
                    if (Platform.OS === "web" && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
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
                  style={withPress([styles.send, canSend ? styles.sendActive : null])}
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
      </View>
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    closedNotice: { padding: tokens.spacing[16], backgroundColor: colors.m3.surfaceContainer },
    closedNoticeText: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center" },
    page: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    flex: { flex: 1, minHeight: 0 },
    loadingContainer: { flex: 1, paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[12] },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: 64,
      paddingHorizontal: tokens.spacing[8],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    backButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
      ...(typeof Platform !== "undefined" && Platform.OS === "web"
        ? ({ cursor: "pointer", userSelect: "none" } as never)
        : {}),
    },
    headerTitle: { flex: 1, ...tokens.typography.titleMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSurface },
    bookCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginHorizontal: tokens.spacing[16],
      marginTop: tokens.spacing[10],
      marginBottom: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    bookText: { flex: 1, gap: tokens.spacing[6], alignItems: "flex-start" },
    bookTitle: { ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.medium, color: colors.m3.onSurface },
    // "Combinar" como botão tonal (Spec 089): antes era só um texto verde, sem cara de botão.
    combine: {
      minHeight: tokens.spacing[40],
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    combineText: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    // Espaço no fim para a última mensagem não colar no campo de digitar (Spec 089).
    list: { paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[8], paddingBottom: tokens.spacing[24] },
    dayRow: { alignItems: "center", paddingVertical: tokens.spacing[4], marginTop: tokens.spacing[8] },
    dayLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
    },
    bubble: {
      marginTop: tokens.spacing[12],
      maxWidth: "78%",
      paddingHorizontal: tokens.spacing[14],
      paddingTop: tokens.spacing[10],
      paddingBottom: tokens.spacing[8],
      borderRadius: tokens.radius.large,
      gap: tokens.spacing[4],
    },
    bubbleGrouped: { marginTop: tokens.spacing[4] },
    bubbleMine: {
      alignSelf: "flex-end",
      backgroundColor: colors.m3.secondaryContainer,
      borderBottomRightRadius: tokens.radius.bubbleCorner,
    },
    bubbleOther: {
      alignSelf: "flex-start",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderBottomLeftRadius: tokens.radius.bubbleCorner,
    },
    bubbleText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    bubbleTime: { ...tokens.typography.labelSmall, color: colors.m3.onSurfaceVariant, alignSelf: "flex-end" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: tokens.spacing[8], padding: tokens.spacing[24] },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: tokens.radius.circle64,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    emptyTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 300 },
    suggestions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: tokens.spacing[8], marginTop: tokens.spacing[8] },
    sendErrorCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      marginHorizontal: tokens.spacing[16],
      marginVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.errorContainer,
      borderWidth: 1,
      borderColor: colors.error,
    },
    sendErrorText: { flex: 1, ...tokens.typography.bodyMedium, color: colors.text, fontWeight: "500" },
    retryText: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.bold, color: colors.error },
    charCountRow: {
      alignItems: "flex-end",
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[4],
      backgroundColor: colors.surface,
    },
    charCountText: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    charCountWarn: {
      color: colors.error,
      fontWeight: tokens.fontWeight.bold,
    },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 120,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderRadius: tokens.radius.extraLarge,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
      color: colors.m3.onSurface,
      ...tokens.typography.bodyLarge,
    },
    send: {
      width: 48,
      height: 48,
      borderRadius: tokens.radius.extraLarge,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    sendActive: { backgroundColor: colors.m3.primary },
    eventRow: {
      alignItems: "center",
      marginVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    eventBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.nature.sprout,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: `${colors.nature.foliage}40`,
    },
    eventText: {
      ...tokens.typography.labelSmall,
      color: colors.nature.foliageDeep,
      fontWeight: tokens.fontWeight.medium,
    },
    pageWeb: {
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    webWrapper: {
      flex: 1,
      width: "100%",
      maxWidth: 960,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[24],
      paddingVertical: tokens.spacing[16],
    },
    webCard: {
      flex: 1,
      minHeight: 0,
      backgroundColor: colors.background,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
    },
    headerWide: {
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    headerInfo: {
      flex: 1,
      gap: 2,
    },
    headerTitleWide: {
      ...tokens.typography.titleMedium,
      fontWeight: tokens.fontWeight.bold,
    },
    headerSubtitle: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    webCombineButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.primary,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
    },
    webCombineButtonText: {
      ...tokens.typography.labelMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onPrimary,
    },
    bookCardWide: {
      marginHorizontal: tokens.spacing[20],
      marginTop: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    listWide: {
      paddingHorizontal: tokens.spacing[24],
    },
    bubbleWide: {
      maxWidth: 540,
    },
    composerWide: {
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    offlineNotice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    offlineNoticeText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
  });
}
