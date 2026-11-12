import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag } from "@/view/components/Tag";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { makeAuthViewModel, makeDraftsViewModel } from "@/di/container";
import { WEB_MAX_WIDTH, WEB_GUTTER, useWebColumns, webColumnWidth } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { formatPrice } from "@/view/formatPrice";
import { withPress } from "@/view/pressFeedback";

const TOTAL_STEPS = 3;
const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

const STEP_LABELS: Record<number, string> = {
  1: "no livro",
  2: "nas fotos",
  3: "nos detalhes",
};

const STEP_NAMES = ["Livro", "Fotos", "Detalhes"];

function stepLabel(book: Book): string {
  const step = book.draftStep ?? 1;
  return `Parou ${STEP_LABELS[step] ?? "no livro"}`;
}

export type DraftsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onResume?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
  /** Muda a cada vez que a tela volta ao foco; recarrega a lista. */
  focusKey?: number;
};

/**
 * Tela "Rascunhos" (Spec 017, Figma `04.11 · Rascunhos`, `04.15 · Descartar rascunho?`,
 * `04.16 · Rascunhos · vazio`). Lista os anúncios em andamento, permite retomar de onde a
 * pessoa parou e descartar com confirmação.
 */
export function Drafts({ sessionUserId, onBack, onResume, onNavigateToCreateListing, focusKey = 0 }: DraftsProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedResume = useGuardedPress(onResume);
  const guardedCreate = useGuardedPress(onNavigateToCreateListing);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = makeDraftsViewModel(sessionUserId);
  const [toDiscard, setToDiscard] = useState<Book | null>(null);
  // Web larga: coluna mais larga e dois rascunhos por linha, em vez de uma faixa estreita no meio.
  const wide = useIsWideWeb();
  const columns = useWebColumns(2, 3);
  const columnWidth = { width: webColumnWidth(columns) };

  // A primeira carga é do próprio viewmodel; as seguintes acontecem quando a tela volta ao foco.
  const firstFocus = useRef(true);
  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    void actions.reload();
  }, [focusKey]);

  const confirmDiscard = async () => {
    const target = toDiscard;
    if (!target) return;
    await actions.discardDraft(target.id);
    setToDiscard(null);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {wide ? (
        <View style={styles.wideHeader}>
          <View style={styles.wideHeaderLeft}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={8}
                onPress={guardedBack}
                style={withPress(styles.wideBackButton)}
              >
                <AppIcon name="back" size={20} color={colors.m3.onSurface} />
              </Pressable>
            ) : null}
            <View>
              <Text accessibilityRole="header" style={styles.wideTitle}>
                Rascunhos
              </Text>
              <Text style={styles.wideSubtitle}>
                Seus anúncios de livros em andamento
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TopAppBar contentMaxWidth={560} title="Rascunhos" onBack={guardedBack} />
      )}
      <View style={[styles.content, wide && styles.contentWide]}>
        {state.loading ? (
          <LoadingState label="Carregando seus rascunhos" />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : state.drafts.length === 0 ? (
          <View style={[styles.empty, wide && styles.emptyWide]}>
            <View style={styles.emptyIcon}>
              <AppIcon name="document" size={36} color={colors.m3.onSecondaryContainer} />
            </View>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              Nenhum rascunho por aqui
            </Text>
            <Text style={styles.emptySubtitle}>
              Quando você começar a anunciar um livro e escolher "Salvar para depois", ele aparece
              aqui para você retomar de onde parou.
            </Text>
            <View style={styles.tipCard}>
              <AppIcon name="info" size={18} color={colors.m3.primary} />
              <Text style={styles.tipText}>
                Dica: Você não precisa cadastrar tudo de uma vez. Comece pelo título e adicione fotos ou detalhes quando for mais conveniente.
              </Text>
            </View>
            {onNavigateToCreateListing ? (
              <View style={styles.emptyAction}>
                <FilledButton label="Anunciar um livro" onPress={guardedCreate} />
              </View>
            ) : null}
          </View>
        ) : (
          <FlatList
            key={wide ? `grid-drafts-${columns}` : "list-drafts-1"}
            numColumns={wide ? columns : 1}
            columnWrapperStyle={wide ? styles.gridRow : undefined}
            data={state.drafts}
            keyExtractor={(item) => item.id}
            {...standardVerticalScrollProps}
            style={styles.flexOne}
            contentContainerStyle={[
              styles.scroll,
              wide && styles.scrollWide,
              { paddingBottom: scrollBottomPadding.withoutBottomBar },
            ]}
            ListHeaderComponent={
              <View style={[styles.headerSection, wide && styles.fullRow]}>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryBadge}>
                    <AppIcon name="document" size={16} color={colors.m3.primary} />
                    <Text style={styles.summary}>
                      {state.drafts.length === 1 ? "1 anúncio em andamento" : `${state.drafts.length} anúncios em andamento`}
                    </Text>
                  </View>
                  <Text style={styles.summaryHint}>Toque no cartão ou em "Retomar" para continuar seu cadastro</Text>
                </View>
                {state.discardError ? (
                  <InlineErrorCard
                    message={state.discardError}
                    style={styles.discardErrorCard}
                  />
                ) : null}
              </View>
            }
            ListFooterComponent={
              <View style={[styles.footerTip, wide && styles.fullRow]}>
                <AppIcon name="lock" size={16} color={colors.m3.onSurfaceVariant} />
                <Text style={styles.footerTipText}>
                  Seus rascunhos são particulares e seguros. Ninguém na comunidade vê o livro até você concluir a publicação.
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: tokens.spacing[12] }} />}
            renderItem={({ item: book }) => {
              const step = Math.min(Math.max(book.draftStep ?? 1, 1), TOTAL_STEPS);
              const title = book.title?.trim() || "Sem título";
              const discarding = state.discardingId === book.id;
              const hasPrice = book.modality === "sale" && book.price != null && book.price > 0;

              return (
                <View style={[styles.card, wide && styles.cardWide]}>
                  {/* Linha superior: Tag da modalidade à esquerda e ação sutil de descartar à direita */}
                  <View style={styles.cardHeader}>
                    <View style={styles.metaRow}>
                      <Tag variant={book.modality} />
                      {hasPrice ? (
                        <View style={styles.priceBadge}>
                          <Text style={styles.priceBadgeText}>{formatPrice(book.price ?? 0)}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Descartar rascunho"
                      disabled={discarding}
                      hitSlop={8}
                      onPress={() => setToDiscard(book)}
                      style={({ pressed }) => [
                        styles.topDiscardButton,
                        pressed && styles.topDiscardButtonPressed,
                        discarding && styles.topDiscardButtonDisabled,
                      ]}
                    >
                      <AppIcon name="delete" size={14} color={colors.m3.onSurfaceVariant} />
                      <Text style={styles.topDiscardText}>
                        {discarding ? "Descartando…" : "Descartar"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Corpo do cartão: capa e detalhes */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Rascunho ${title}, ${stepLabel(book)}`}
                    onPress={() => guardedResume(book.id)}
                    style={withPress(styles.cardMain)}
                  >
                    <ModalityCoverArea modality={book.modality}>
                      <BookCover id={book.id} title={title} photoUrl={book.photoUrl} variant="list" />
                    </ModalityCoverArea>
                    <View style={styles.cardTexts}>
                      <Text numberOfLines={2} style={styles.cardTitle}>
                        {title}
                      </Text>
                      <Text numberOfLines={1} style={styles.cardAuthor}>
                        {book.author?.trim() || "Autor não informado"}
                      </Text>
                      <View style={styles.stepInfoRow}>
                        <AppIcon name="edit" size={14} color={colors.m3.primary} />
                        <Text style={styles.cardSubtitle}>{stepLabel(book)}</Text>
                      </View>
                      {/* Barra de andamento visual: três etapas preenchidas proporcionalmente */}
                      <View accessible={false} importantForAccessibility="no" style={styles.progressContainer}>
                        <View style={styles.progress}>
                          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.progressSegment,
                                index < step && styles.progressSegmentDone,
                              ]}
                            />
                          ))}
                        </View>
                        <View style={styles.progressLabels}>
                          {STEP_NAMES.map((name, idx) => (
                            <Text
                              key={name}
                              style={[
                                styles.progressLabelText,
                                idx < step && styles.progressLabelTextActive,
                              ]}
                            >
                              {name}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  </Pressable>

                  <View style={styles.cardDivider} />

                  {/* Rodapé do cartão: botão Retomar amplo e ergonômico */}
                  <View style={styles.cardActionsFull}>
                    <FilledButton
                      label="Retomar"
                      accessibilityLabel="Retomar rascunho"
                      onPress={() => guardedResume(book.id)}
                    />
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <Dialog
        visible={toDiscard !== null}
        title="Descartar rascunho?"
        message={`O progresso de "${toDiscard?.title?.trim() || "Sem título"}" será apagado. Esta ação não pode ser desfeita.`}
        confirmLabel="Descartar"
        cancelLabel="Cancelar"
        destructive
        loading={state.discardingId !== null && state.discardingId === toDiscard?.id}
        onConfirm={() => void confirmDiscard()}
        onCancel={() => setToDiscard(null)}
      />
    </SafeAreaView>
  );
}

export type DraftsScreenProps = {
  focusKey?: number;
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onResume?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
};

export default function DraftsScreen({
  focusKey,
  onBack,
  onRequireSignIn,
  onResume,
  onNavigateToCreateListing,
}: DraftsScreenProps = {}) {
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <Drafts
      sessionUserId={authState.user.id}
      focusKey={focusKey}
      onBack={onBack}
      onResume={onResume}
      onNavigateToCreateListing={onNavigateToCreateListing}
    />
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background, minHeight: 0 },
    flexOne: { flex: 1, minHeight: 0 },
    wideHeader: {
      width: "100%",
      maxWidth: WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[12],
    },
    wideHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    wideBackButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    wideTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    wideSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[2],
    },
    content: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
    },
    contentWide: { maxWidth: WIDE_CONTENT_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    scrollWide: {},
    gridRow: { gap: tokens.spacing[16] },
    cardWide: { flex: 1 },
    fullRow: { width: "100%" },
    scroll: { gap: tokens.spacing[12], paddingBottom: tokens.spacing[24] },
    headerSection: {
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    summaryContainer: {
      gap: tokens.spacing[2],
      paddingVertical: tokens.spacing[4],
    },
    summaryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    summary: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    summaryHint: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
    },
    discardErrorCard: {
      marginTop: tokens.spacing[4],
    },
    card: {
      gap: tokens.spacing[10],
      padding: tokens.spacing[14],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
    },
    topDiscardButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
      minHeight: 28,
    },
    topDiscardButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
    topDiscardButtonDisabled: {
      opacity: 0.5,
    },
    topDiscardText: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.medium,
    },
    cardMain: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      alignItems: "flex-start",
    },
    cardTexts: { flex: 1, gap: tokens.spacing[4] },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      flexWrap: "wrap",
    },
    priceBadge: {
      backgroundColor: colors.m3.secondaryContainer,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    priceBadgeText: {
      ...tokens.typography.labelSmall,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
    cardTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.semiBold,
      lineHeight: 22,
    },
    cardAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    stepInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[2],
    },
    cardSubtitle: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.medium,
    },
    progressContainer: {
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[6],
    },
    progress: {
      flexDirection: "row",
      gap: tokens.spacing[6],
    },
    progressSegment: {
      flex: 1,
      height: 5,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    progressSegmentDone: {
      backgroundColor: colors.m3.primary,
    },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[2],
    },
    progressLabelText: {
      ...tokens.typography.captionSmall,
      fontSize: 10,
      color: colors.m3.onSurfaceVariant,
      opacity: 0.7,
    },
    progressLabelTextActive: {
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
      opacity: 1,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.m3.surfaceContainerHighest,
      marginTop: tokens.spacing[2],
    },
    cardActionsFull: {
      width: "100%",
    },
    empty: {
      paddingTop: tokens.spacing[32],
      alignItems: "center",
      gap: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyWide: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[40],
      maxWidth: 640,
      width: "100%",
      alignSelf: "center",
      marginTop: tokens.spacing[24],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.circle72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[4],
    },
    emptyTitle: {
      ...tokens.typography.brandTitle,
      fontSize: 22,
      lineHeight: 28,
      color: colors.text,
      textAlign: "center",
    },
    emptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 360,
      lineHeight: 20,
    },
    tipCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[10],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      marginTop: tokens.spacing[12],
      maxWidth: 380,
    },
    tipText: {
      ...tokens.typography.footnote,
      color: colors.m3.onSecondaryContainer,
      flex: 1,
      lineHeight: 18,
    },
    emptyAction: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 320,
      marginTop: tokens.spacing[16],
    },
    footerTip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[12],
      marginTop: tokens.spacing[8],
    },
    footerTipText: {
      ...tokens.typography.captionSmall,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
      flex: 1,
      maxWidth: 420,
    },
  });
}
