import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meeting } from "@/model/entities/meeting";
import * as Linking from "expo-linking";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { describeMeetingCountdown } from "@/view/meetingFormat";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import { MeetingCard } from "@/view/requests/meetingCard";
import { BookCover } from "@/view/components/BookCover";
import { IconBadge } from "@/view/components/IconBadge";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon } from "@/view/components/AppIcon";
import { NegotiationRatingModal } from "@/view/requests/NegotiationRatingModal";
import { useNegotiationRatingViewModel } from "@/viewmodel/useNegotiationRatingViewModel";

export type RequestDetailProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  /** Abre `06.04`/`06.13` para combinar ou reagendar (Spec 052). */
  onScheduleMeeting?: () => void;
  /** Abre a conversa em tela cheia (`/conversa/[id]`, Spec 082). */
  onOpenChat?: (requestId: string) => void;
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
  focusKey,
}: RequestDetailProps) {
  const [state, actions] = useRequestDetailViewModel(requestId, sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const detail = state.detail;
  const [mapErrors, setMapErrors] = useState<Record<string, string>>({});
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const handleMeetingChange = useCallback((value: Meeting | null) => setMeeting(value), []);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllPoints, setShowAllPoints] = useState(false);

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

  const completed = Boolean(ratingState.userRating);
  const meetingConfirmed = meeting?.status === "confirmed";
  const awaitingMyConfirmation =
    meeting?.status === "proposed" && meeting.proposedBy !== sessionUserId;
  const meetingHappened = meetingConfirmed && describeMeetingCountdown(meeting!.scheduledAt).past;
  const progress = [
    { label: "Aceita", done: true },
    { label: meetingConfirmed ? "Encontro combinado" : "Combinar encontro", done: meetingConfirmed || completed },
    { label: "Concluída", done: completed },
  ];
  const currentStep = progress.findIndex((item) => !item.done);

  async function handleOpenMap(point: { name: string; address: string }) {
    setMapErrors((previous) => {
      const { [point.name]: _removed, ...rest } = previous;
      return rest;
    });
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.address)}`;
    try {
      await Linking.openURL(url);
    } catch {
      setMapErrors((previous) => ({
        ...previous,
        [point.name]: `Não foi possível abrir o mapa para "${point.name}". Tente novamente.`,
      }));
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Acompanhar encontro" onBack={() => onBack?.()} />
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
        <View style={styles.content}>
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
                      Obrigado por avaliar. Isso ajuda a comunidade a confiar.
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
                  <Text style={styles.bookAuthor}>{detail.book.author}</Text>
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
              />

              {/* Pessoa da negociação em uma linha (Spec 083), no lugar do cartão "Participantes" */}
              <View style={styles.personRow}>
                <Avatar
                  name={detail.counterpartName ?? COMMUNITY_MEMBER}
                  photoUrl={detail.counterpartPhotoUrl ?? undefined}
                  size={44}
                />
                <View style={styles.personText}>
                  <Text style={styles.personName} numberOfLines={1}>
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

              {/* Card de Conclusão e Avaliação (Spec 063 / Figma 06.07, 06.08, 06.21) */}
              <View style={styles.card} testID="negotiation-completion-card">
                <View style={styles.cardHeaderRow}>
                  <IconBadge icon="check" tone={meetingHappened || completed ? "action" : "neutral"} />
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    {ratingState.userRating ? "Negociação concluída" : "Concluir negociação"}
                  </Text>
                </View>
                {ratingState.userRating ? (
                  <View style={styles.completedRatingContainer}>
                    <Text style={styles.bodyText}>
                      Você avaliou esta negociação com {ratingState.userRating.score} estrelas.
                    </Text>
                    <View style={styles.ratingStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            styles.starStatic,
                            star <= ratingState.userRating!.score ? styles.starFilled : styles.starEmpty,
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.pendingRatingContainer}>
                    <Text style={styles.bodyText}>
                      {meetingHappened
                        ? "Vocês já se encontraram e a entrega do livro foi realizada?"
                        : "Depois do encontro e da entrega do livro, volte aqui para concluir e avaliar."}
                    </Text>
                    {/* Spec 084: o botão principal só aparece depois do encontro; antes, um atalho
                        discreto para quem fez a entrega sem marcar pelo app. */}
                    {meetingHappened ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Concluir negociação e avaliar"
                        onPress={() => setRatingModalVisible(true)}
                        style={styles.completeButton}
                      >
                        <AppIcon name="check" size={18} color={colors.surface} />
                        <Text style={styles.completeButtonText}>Concluir e avaliar</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Já fizemos a entrega"
                        hitSlop={8}
                        onPress={() => setRatingModalVisible(true)}
                        style={styles.earlyComplete}
                      >
                        <Text style={styles.earlyCompleteText}>Já fizemos a entrega</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <IconBadge icon="place" tone="action" />
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    Encontro seguro em Piripiri
                  </Text>
                </View>
                <Text style={styles.bodyText}>
                  {meetingConfirmed && !showAllPoints
                    ? "O local já está combinado. Se precisarem mudar, prefiram outro ponto público e movimentado."
                    : "Para a sua segurança, combinem a entrega sempre em locais públicos e movimentados:"}
                </Text>
                {meetingConfirmed ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showAllPoints }}
                    onPress={() => setShowAllPoints((value) => !value)}
                    style={styles.directionsButton}
                  >
                    <Text style={styles.directionsText}>
                      {showAllPoints ? "Ocultar pontos seguros" : "Ver pontos seguros de Piripiri"}
                    </Text>
                  </Pressable>
                ) : null}
                <View style={styles.pointList}>
                  {(meetingConfirmed && !showAllPoints ? [] : detail.safeMeetingPoints).map((point) => (
                    <View key={point.name}>
                      {/* Spec 084: a linha inteira abre o mapa, no lugar de um botão cheio por ponto. */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Como chegar à ${point.name}`}
                        onPress={() => void handleOpenMap(point)}
                        style={styles.pointRow}
                      >
                        <AppIcon name="place" size={20} color={colors.action} />
                        <View style={styles.pointText}>
                          <Text style={styles.pointName}>{point.name}</Text>
                          <Text style={styles.pointDetail}>{point.address}</Text>
                          <Text style={styles.pointDetail}>{point.recommendedTime}</Text>
                        </View>
                        <Text style={styles.pointLink}>Rota</Text>
                      </Pressable>
                      {mapErrors[point.name] ? (
                        <Text accessibilityRole="alert" style={styles.mapErrorText}>
                          {mapErrors[point.name]}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
                <Text style={styles.tipText}>
                  Chegue alguns minutos antes, verifique a conservação do livro no momento da troca e
                  prefira horários diurnos.
                </Text>
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
          onSubmit={async () => {
            const ok = await ratingActions.submitRating();
            return ok;
          }}
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
  focusKey?: number;
};

export default function RequestDetailScreen({
  requestId,
  onBack,
  onRequireSignIn,
  onNavigateToBookDetail,
  onScheduleMeeting,
  onOpenChat,
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
    minHeight: 40,
    paddingHorizontal: tokens.spacing[16],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.m3.secondaryContainer,
  },
  chatButtonText: {
    ...tokens.typography.labelMedium,
    fontWeight: "600",
    color: colors.m3.onSecondaryContainer,
  },
  pointList: { gap: tokens.spacing[12], paddingVertical: tokens.spacing[4] },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    minHeight: tokens.accessibility.touchTarget,
    paddingVertical: tokens.spacing[12],
    borderTopWidth: 1,
    borderTopColor: colors.m3.outlineVariant,
  },
  pointText: { flex: 1, gap: 2 },
  pointLink: { ...tokens.typography.labelMedium, fontWeight: "700", color: colors.action },
  earlyComplete: { alignSelf: "flex-start", minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
  earlyCompleteText: { ...tokens.typography.labelMedium, fontWeight: "600", color: colors.action, textDecorationLine: "underline" },
  pointName: {
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
    color: colors.text,
  },
  pointDetail: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  directionsButton: {
    alignSelf: "flex-start",
    marginTop: tokens.spacing[4],
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[16],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.m3.secondaryContainer,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  directionsText: {
    ...tokens.typography.labelMedium,
    fontWeight: "700",
    color: colors.m3.onSecondaryContainer,
  },
  mapErrorText: {
    ...tokens.typography.labelMedium,
    color: colors.error,
  },
  tipText: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
    fontStyle: "italic",
    marginTop: tokens.spacing[4],
  },
  completedRatingContainer: {
    gap: tokens.spacing[8],
  },
  pendingRatingContainer: {
    gap: tokens.spacing[12],
  },
  ratingStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
  },
  starStatic: {
    fontSize: 22,
  },
  starFilled: {
    color: colors.highlight,
  },
  starEmpty: {
    color: colors.border,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[8],
    backgroundColor: colors.action,
    borderRadius: tokens.radius.full,
    paddingVertical: tokens.spacing[12],
    paddingHorizontal: tokens.spacing[20],
    minHeight: tokens.accessibility.touchTarget,
    alignSelf: "flex-start",
  },
  completeButtonText: {
    ...tokens.typography.labelMedium,
    fontWeight: "700",
    color: colors.surface,
  },
  });
}
