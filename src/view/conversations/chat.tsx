import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useDeliveryStatus } from "@/viewmodel/useDeliveryViewModel";
import { buildChatTimeline, formatBubbleTime, type ChatTimelineItem } from "@/viewmodel/chatTimeline";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { Tag } from "@/view/components/Tag";
import { Avatar } from "@/view/components/Avatar";

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
  /** Painel da web larga: a lista e o "Combinar encontro" já estão nas colunas vizinhas. */
  embedded?: boolean;
};

/** Conversa em tela cheia, Figma `06.02 · Conversa com Ana Paula` (Spec 082). */
export function Chat({ requestId, sessionUserId, onBack, onOpenNegotiation, embedded = false }: ChatProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [detailState] = useRequestDetailViewModel(requestId, sessionUserId);
  const [state, actions] = useNegotiationChatViewModel(requestId, sessionUserId);
  // Entrega concluída por QR (Spec 095): não há mais o que combinar.
  const delivery = useDeliveryStatus(requestId, sessionUserId);
  const listRef = useRef<FlatList<ChatTimelineItem>>(null);

  const detail = detailState.detail;
  const name = detail?.counterpartName ?? COMMUNITY_MEMBER;
  const timeline = useMemo(() => buildChatTimeline(state.messages), [state.messages]);
  const canSend = state.inputText.trim().length > 0 && !state.isSending;

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
    const mine = item.message.senderId === sessionUserId;
    const time = formatBubbleTime(item.message.createdAt);
    return (
      <View
        accessible
        accessibilityLabel={`${mine ? "Você" : name} às ${time}: ${item.message.content}`}
        style={[
          styles.bubble,
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
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.page}>
      {/* Cabeçalho com a foto da pessoa (Spec 089); sem foto o avatar mostra o ipê. */}
      <View style={styles.header}>
        {embedded ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            onPress={onBack ?? (() => {})}
            style={styles.backButton}
          >
            <AppIcon name="back" size={24} color={colors.m3.onSurface} />
          </Pressable>
        )}
        <Avatar name={name} photoUrl={detail?.counterpartPhotoUrl ?? undefined} size={40} />
        <Text accessibilityRole="header" style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {/* O desvio do teclado é da raiz única (KeyboardAwareRoot, Spec 088); aqui só o layout do chat. */}
      <View style={styles.flex}>
        {detail ? (
          <View style={styles.bookCard}>
            <BookCover id={detail.book.id} title={detail.book.title} photoUrl={detail.book.photoUrl} variant="list" />
            <View style={styles.bookText}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {detail.book.title}
              </Text>
              <Tag variant={detail.book.modality} />
            </View>
            {embedded || delivery.completed ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Combinar encontro na negociação"
                onPress={() => onOpenNegotiation?.(requestId)}
                style={styles.combine}
              >
                <Text style={styles.combineText}>Combinar</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {state.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando mensagens" />
          </View>
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
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
            data={timeline}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            // Renderiza todas as mensagens: com itens ainda não medidos o fim calculado ficava curto e a
            // última mensagem aparecia cortada sob o campo de digitação.
            initialNumToRender={timeline.length}
            onContentSizeChange={scrollToLatest}
            onLayout={scrollToLatest}
          />
        )}

        {state.sendError ? (
          <View accessibilityRole="alert" style={styles.sendError}>
            <Text style={styles.sendErrorText}>{state.sendError}</Text>
            <Pressable accessibilityRole="button" onPress={() => void actions.retryLastMessage()} hitSlop={8}>
              <Text style={styles.retryText}>Reenviar</Text>
            </Pressable>
          </View>
        ) : null}

        {delivery.completed ? (
          <View style={styles.closedNotice} accessibilityLiveRegion="polite">
            <Text style={styles.closedNoticeText}>Negociação concluída. A conversa ficou só para consulta.</Text>
          </View>
        ) : (
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Campo de mensagem"
            value={state.inputText}
            onChangeText={actions.setInputText}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.m3.onSurfaceVariant}
            multiline
            maxLength={1000}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={() => void actions.sendMessage()}
            style={[styles.send, canSend ? styles.sendActive : null]}
          >
            {state.isSending ? (
              <ActivityIndicator color={colors.m3.onPrimary} />
            ) : (
              <AppIcon name="send" size={22} color={canSend ? colors.m3.onPrimary : colors.m3.onSurfaceVariant} />
            )}
          </Pressable>
        </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export type ChatScreenProps = Omit<ChatProps, "sessionUserId"> & { onRequireSignIn?: () => void };

export default function ChatScreen({ onRequireSignIn, ...props }: ChatScreenProps) {
  const [authState] = useAuthViewModel();
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
    page: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: 64,
      paddingHorizontal: tokens.spacing[8],
    },
    backButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { flex: 1, ...tokens.typography.titleMedium, fontWeight: "600", color: colors.m3.onSurface },
    bookCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginHorizontal: tokens.spacing[16],
      marginBottom: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: 16,
      backgroundColor: colors.m3.surfaceContainer,
    },
    bookText: { flex: 1, gap: tokens.spacing[6], alignItems: "flex-start" },
    bookTitle: { ...tokens.typography.bodyLarge, fontWeight: "500", color: colors.m3.onSurface },
    // "Combinar" como botão tonal (Spec 089): antes era só um texto verde, sem cara de botão.
    combine: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    combineText: { ...tokens.typography.labelMedium, fontWeight: "600", color: colors.m3.onSecondaryContainer },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    // Espaço no fim para a última mensagem não colar no campo de digitar (Spec 089).
    list: { paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[8], paddingBottom: tokens.spacing[24] },
    dayRow: { alignItems: "center", paddingVertical: tokens.spacing[4], marginTop: tokens.spacing[8] },
    dayLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      color: colors.m3.onSurfaceVariant,
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainer,
      overflow: "hidden",
    },
    bubble: {
      marginTop: tokens.spacing[12],
      maxWidth: "78%",
      paddingHorizontal: tokens.spacing[12],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[6],
      borderRadius: 18,
      gap: 2,
    },
    bubbleGrouped: { marginTop: tokens.spacing[4] },
    bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.m3.secondaryContainer, borderBottomRightRadius: 6 },
    bubbleOther: { alignSelf: "flex-start", backgroundColor: colors.m3.surfaceContainerHigh, borderBottomLeftRadius: 6 },
    bubbleText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    bubbleTime: { fontSize: 11, lineHeight: 14, color: colors.m3.onSurfaceVariant },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: tokens.spacing[8], padding: tokens.spacing[24] },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    emptyTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    emptyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, textAlign: "center", maxWidth: 300 },
    suggestions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: tokens.spacing[8], marginTop: tokens.spacing[8] },
    sendError: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      marginHorizontal: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: 12,
      backgroundColor: colors.errorContainer,
    },
    sendErrorText: { flex: 1, ...tokens.typography.bodyMedium, color: colors.error },
    retryText: { ...tokens.typography.labelMedium, fontWeight: "600", color: colors.error },
    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainer,
    },
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 120,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      backgroundColor: colors.background,
      color: colors.m3.onSurface,
      ...tokens.typography.bodyLarge,
    },
    send: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    sendActive: { backgroundColor: colors.m3.primary },
  });
}
