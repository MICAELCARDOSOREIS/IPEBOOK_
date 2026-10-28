import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meeting } from "@/model/entities/meeting";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import { MeetingCard } from "@/view/requests/meetingCard";
import { BookCover } from "@/view/components/BookCover";
import { IconBadge } from "@/view/components/IconBadge";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { useNegotiationRatingViewModel } from "@/viewmodel/useNegotiationRatingViewModel";
import { useDeliveryStatus } from "@/viewmodel/useDeliveryViewModel";
import { NegotiationRatingModal } from "@/view/requests/NegotiationRatingModal";
import { FilledButton } from "@/view/components/FilledButton";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

export type RequestDetailProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  /** Abre `06.04`/`06.13` para combinar ou reagendar (Spec 052). */
  onScheduleMeeting?: () => void;
  /** Abre a conversa em tela cheia (`/conversa/[id]`, Spec 082). */
  onOpenChat?: (requestId: string) => void;
  /** Abre "Entrega do livro": o anunciante mostra o QR e o leitor o lê (Spec 095). */
  onOpenDelivery?: () => void;
  focusKey?: number;
};

/**
 * Figma `06.05 · Encontro combinado` (`27:921` / Web `163:2131`) e
 * `06.06 · Acompanhar encontro` (`149:3467` / Web `370:16621`).
 */
export function RequestDetail({
  requestId,
  sessionUserId,
  onBack,
  onNavigateToBookDetail,
  onScheduleMeeting,
  onOpenChat,
  onOpenDelivery,
  focusKey,
}: RequestDetailProps) {
  const [state, actions] = useRequestDetailViewModel(requestId, sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const detail = state.detail;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const handleMeetingChange = useCallback((value: Meeting | null) => setMeeting(value), []);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshCount((count) => count + 1);
    try {
      await actions.reload();
    } finally {
      setRefreshing(false);
    }
  }

  const counterpartId = detail?.counterpartId ?? "";
  const [ratingState, ratingActions] = useNegotiationRatingViewModel(
    requestId,
    sessionUserId,
    counterpartId,
  );

  const delivery = useDeliveryStatus(requestId, sessionUserId, (focusKey ?? 0) + refreshCount);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  // Web larga: coluna mais larga; livro e encontro de um lado, entrega e pessoa do outro.
  const wide = useIsWideWeb();
  // Concluída pela entrega por QR (Spec 095); a avaliação sozinha vale para negociações anteriores.
  const completed = Boolean(delivery.completed) || Boolean(ratingState.userRating);
  const meetingConfirmed = meeting?.status === "confirmed";
  const awaitingMyConfirmation =
    meeting?.status === "proposed" && meeting.proposedBy !== sessionUserId;
  const progress = [
    { label: "Aceita", done: true },
    { label: meetingConfirmed ? "Encontro combinado" : "Combinar encontro", done: meetingConfirmed || completed },
    { label: "Concluída", done: completed },
  ];
  const currentStep = progress.findIndex((item) => !item.done);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Acompanhar encontro" onBack={() => onBack?.()} contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} />
      <ScrollView
        testID="request-detail-scroll"
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            colors={[colors.action]}
            tintColor={colors.action}
          />
        }
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          {state.loading && !detail ? (
            <View style={styles.status}>
              <ActivityIndicator
                color={colors.action}
                accessibilityLabel="Carregando detalhes da negociação"
              />
              <Text style={styles.body}>Carregando detalhes…</Text>
            </View>
          ) : state.error ? (
            <View style={styles.status}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {state.error}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void actions.reload()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : detail ? (
            <View style={styles.container}>
              <Text style={styles.heroHeadline}>
                {completed ? "Livro entregue. Boa leitura!" : "Seu próximo capítulo está perto."}
              </Text>
              {/* Aceita: a etapa "Aceita" já informa (Spec 083); o aviso fica só para a conclusão. */}
              {completed ? (
                <View style={styles.successBanner}>
                  <IconBadge icon="check" tone="action" />
                  <View style={styles.bannerTextContainer}>
                    <Text style={styles.successTitle}>Negociação concluída</Text>
                    <Text style={styles.successSubtitle}>
                      {ratingState.userRating
                        ? "Obrigado por avaliar. Isso ajuda a comunidade a confiar."
                        : "As duas pessoas confirmaram a entrega. Avaliar ajuda a comunidade a confiar."}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Onde a negociação está: aceita → encontro combinado → concluída. */}
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`Andamento: ${progress.filter((item) => item.done).length} de ${progress.length} etapas. ${progress.find((item) => !item.done)?.label ?? "Tudo concluído"}`}
                style={styles.progressRow}
              >
                {progress.map((item, index) => {
                  const current = index === currentStep;
                  return (
                  <View
                    key={item.label}
                    accessibilityLabel={current ? `Etapa atual: ${item.label}` : undefined}
                    style={styles.progressItem}
                  >
                    <View style={[styles.progressDot, item.done && styles.progressDotDone, current && styles.progressDotCurrent]}>
                      {item.done ? (
                        <AppIcon name="check" size={14} color={colors.surface} />
                      ) : (
                        <Text style={[styles.progressNumber, current && styles.progressNumberCurrent]}>{index + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.progressLabel, item.done && styles.progressLabelDone, current && styles.progressLabelCurrent]}>
                      {item.label}
                    </Text>
                  </View>
                  );
                })}
              </View>
              {awaitingMyConfirmation && !completed ? (
                <View accessibilityRole="alert" style={styles.yourTurn}>
                  <AppIcon name="info" size={18} color={colors.actionDeep} />
                  <Text style={styles.yourTurnText}>
                    Sua vez: {detail.counterpartName ?? COMMUNITY_MEMBER} sugeriu um encontro. Confirme ou sugira outro horário.
                  </Text>
                </View>
              ) : null}

              <View style={[styles.columns, wide && styles.columnsWide]}>
              <View style={[styles.column, wide && styles.columnHalf]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver anúncio de ${detail.book.title}`}
                onPress={() => onNavigateToBookDetail?.(detail.book.id)}
                style={styles.bookCard}
              >
                <BookCover
                  id={detail.book.id}
                  title={detail.book.title}
                  photoUrl={detail.book.photoUrl}
                  variant="list"
                />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{detail.book.title}</Text>
                  {/* "Autor desconhecido" é o texto de preenchimento do cadastro; sem autor real, não ocupa linha. */}
                  {detail.book.author !== "Autor desconhecido" ? <Text style={styles.bookAuthor}>{detail.book.author}</Text> : null}
                  <View style={styles.tagRow}>
                    <Tag variant={detail.book.modality} />
                    {detail.book.modality === "sale" && detail.book.price ? (
                      <Text style={styles.price}>{formatPrice(detail.book.price)}</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>

              <MeetingCard
                requestId={requestId}
                sessionUserId={sessionUserId}
                counterpartName={detail.counterpartName ?? COMMUNITY_MEMBER}
                focusKey={(focusKey ?? 0) + refreshCount}
                onScheduleMeeting={onScheduleMeeting}
                onMeetingChange={handleMeetingChange}
                concluded={Boolean(delivery.completed)}
              />
              </View>
              <View style={[styles.column, wide && styles.columnHalf]}>

              {meetingConfirmed || delivery.completed ? (
                <View style={styles.card} testID="delivery-card">
                  <View style={styles.cardHeaderRow}>
                    <IconBadge icon="check" tone={delivery.completed ? "action" : "neutral"} />
                    <Text accessibilityRole="header" style={styles.sectionHeader}>
                      {delivery.completed ? "Entrega concluída" : "Entrega do livro"}
                    </Text>
                  </View>
                  {delivery.completed ? (
                    ratingState.userRating ? (
                      <Text style={styles.bodyText}>
                        Você avaliou esta negociação com {ratingState.userRating.score} estrelas.
                      </Text>
                    ) : (
                      <>
                        <Text style={styles.bodyText}>As duas pessoas confirmaram a entrega. Conte como foi.</Text>
                        <FilledButton label="Avaliar negociação" onPress={() => setRatingModalVisible(true)} />
                      </>
                    )
                  ) : (
                    <>
                      <Text style={styles.bodyText}>
                        {delivery.role === "giver"
                          ? "No encontro, mostre o QR para quem recebe o livro. A leitura conclui a negociação."
                          : "No encontro, leia o QR que a outra pessoa mostra para concluir a negociação."}
                      </Text>
                      <FilledButton
                        label={delivery.role === "giver" ? "Mostrar QR da entrega" : "Ler QR da entrega"}
                        disabled={delivery.loading || !delivery.role}
                        onPress={() => onOpenDelivery?.()}
                      />
                    </>
                  )}
                </View>
              ) : null}

              {/* Pessoa da negociação em uma linha (Spec 083), no lugar do cartão "Participantes" */}
              <View style={styles.personRow}>
                <Avatar
                  name={detail.counterpartName ?? COMMUNITY_MEMBER}
                  photoUrl={detail.counterpartPhotoUrl ?? undefined}
                  size={44}
                />
                <View style={styles.personText}>
                  <Text style={styles.personName} numberOfLines={2}>
                    {detail.counterpartName ?? COMMUNITY_MEMBER}
                  </Text>
                  <Text style={styles.personRole}>{detail.isOwner ? "Quer o livro" : "Anunciou o livro"}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Conversar com ${detail.counterpartName ?? COMMUNITY_MEMBER}`}
                  onPress={() => onOpenChat?.(requestId)}
                  style={styles.chatButton}
                >
                  <AppIcon name="chat" size={18} color={colors.m3.onSecondaryContainer} />
                  <Text style={styles.chatButtonText}>Conversar</Text>
                </Pressable>
              </View>
              </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {detail ? (
        <NegotiationRatingModal
          visible={ratingModalVisible}
          counterpartName={detail.counterpartName ?? COMMUNITY_MEMBER}
          selectedScore={ratingState.selectedScore}
          onSelectScore={ratingActions.setSelectedScore}
          onSubmit={async () => ratingActions.submitRating()}
          onClose={() => {
            setRatingModalVisible(false);
            ratingActions.resetFeedback();
          }}
          isSubmitting={ratingState.isSubmitting}
          submitError={ratingState.submitError}
          isSuccess={ratingState.isSuccess}
        />
      ) : null}
    </SafeAreaView>
  );
}

export type RequestDetailScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onScheduleMeeting?: () => void;
  onOpenChat?: (requestId: string) => void;
  /** Abre "Entrega do livro": o anunciante mostra o QR e o leitor o lê (Spec 095). */
  onOpenDelivery?: () => void;
  focusKey?: number;
};

export default function RequestDetailScreen({
  requestId,
  onBack,
  onRequireSignIn,
  onNavigateToBookDetail,
  onScheduleMeeting,
  onOpenChat,
  onOpenDelivery,
  focusKey,
}: RequestDetailScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <RequestDetail
      requestId={requestId}
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToBookDetail={onNavigateToBookDetail}
      onScheduleMeeting={onScheduleMeeting}
      onOpenChat={onOpenChat}
      onOpenDelivery={onOpenDelivery}
      focusKey={focusKey}
    />
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    progressRow: { flexDirection: "row", justifyContent: "space-between", gap: tokens.spacing[8] },
    progressItem: { flex: 1, alignItems: "center", gap: tokens.spacing[4] },
    progressDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.m3.outline,
    },
    progressDotDone: { backgroundColor: colors.action, borderColor: colors.action },
    progressNumber: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    progressLabel: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant, textAlign: "center" },
    progressLabelDone: { color: colors.text },
    // Etapa em andamento (Spec 083): contorno e número verdes, rótulo em negrito.
    progressDotCurrent: { borderColor: colors.action, borderWidth: 2 },
    progressNumberCurrent: { color: colors.action, fontWeight: "700" },
    progressLabelCurrent: { color: colors.action, fontWeight: "700" },
    yourTurn: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.soft,
    },
    yourTurnText: { flex: 1, ...tokens.typography.bodyMedium, color: colors.actionDeep },
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: tokens.spacing[48] },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[16],
  },
  status: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacing[16],
    paddingTop: tokens.spacing[48],
  },
  body: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.m3.outline,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: {
    ...tokens.typography.bodyMedium,
    color: colors.action,
    fontWeight: "600",
  },
  container: { gap: tokens.spacing[16] },
  contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
  columns: { gap: tokens.spacing[16] },
  columnsWide: { flexDirection: "row", alignItems: "flex-start" },
  column: { gap: tokens.spacing[16] },
  columnHalf: { flex: 1 },
  // Manchete menor (Spec 083) para a ação do momento caber acima da dobra.
  heroHeadline: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.badge.sale.background,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    gap: tokens.spacing[12],
  },
  bannerTextContainer: {
    flex: 1,
    gap: tokens.spacing[4],
  },
  successTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.action,
  },
  successSubtitle: {
    ...tokens.typography.bodyMedium,
    color: colors.text,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
    gap: tokens.spacing[12],
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
  },
  bookInfo: { flex: 1, gap: tokens.spacing[4] },
  bookTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  bookAuthor: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[4],
  },
  price: {
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
    color: colors.action,
  },
  card: {
    backgroundColor: colors.surface,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  sectionHeader: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  bodyText: {
    ...tokens.typography.bodyMedium,
    color: colors.text,
  },
  highlightText: {
    fontWeight: "700",
    color: colors.action,
  },
  // Linha da pessoa (Spec 083): avatar, nome, papel e botão tonal "Conversar".
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    padding: tokens.spacing[12],
    borderRadius: 16,
    backgroundColor: colors.m3.surfaceContainerLow,
  },
  personText: { flex: 1, gap: 2 },
  personName: { ...tokens.typography.bodyLarge, fontWeight: "600", color: colors.m3.onSurface },
  personRole: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[6],
    minHeight: tokens.accessibility.touchTarget,
    paddingHorizontal: tokens.spacing[16],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.m3.secondaryContainer,
  },
  chatButtonText: {
    ...tokens.typography.labelMedium,
    fontWeight: "600",
    color: colors.m3.onSecondaryContainer,
  },
  });
}
