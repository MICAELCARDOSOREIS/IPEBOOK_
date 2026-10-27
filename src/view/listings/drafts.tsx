import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";

const TOTAL_STEPS = 3;

const STEP_LABELS: Record<number, string> = {
  1: "no livro",
  2: "nas fotos",
  3: "nos detalhes",
};

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useDraftsViewModel(sessionUserId);
  const [toDiscard, setToDiscard] = useState<Book | null>(null);

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
      <TopAppBar title="Rascunhos" onBack={onBack ?? (() => {})} />
      <View style={styles.content}>
        {state.loading ? (
          <LoadingState label="Carregando seus rascunhos" />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : state.drafts.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <AppIcon name="document" size={32} color={colors.m3.onSecondaryContainer} />
            </View>
            <Text accessibilityRole="header" style={styles.emptyTitle}>Nenhum rascunho por aqui</Text>
            <Text style={styles.emptySubtitle}>
              Quando você começar a anunciar um livro e escolher "Salvar para depois", ele aparece
              aqui para você retomar de onde parou.
            </Text>
            {onNavigateToCreateListing ? (
              <View style={styles.emptyAction}>
                <FilledButton label="Anunciar um livro" onPress={onNavigateToCreateListing} />
              </View>
            ) : null}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.summary}>
              {state.drafts.length === 1 ? "1 anúncio em andamento" : `${state.drafts.length} anúncios em andamento`}
            </Text>
            {state.discardError ? (
              <Text accessibilityRole="alert" style={styles.cardError}>{state.discardError}</Text>
            ) : null}
            {state.drafts.map((book) => {
              const step = Math.min(Math.max(book.draftStep ?? 1, 1), TOTAL_STEPS);
              const title = book.title?.trim() || "Sem título";
              const discarding = state.discardingId === book.id;
              return (
                <View key={book.id} style={styles.card}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Rascunho ${title}, ${stepLabel(book)}`}
                    onPress={() => onResume?.(book.id)}
                    style={styles.cardMain}
                  >
                    <ModalityCoverArea modality={book.modality}>
                      <BookCover id={book.id} title={title} photoUrl={book.photoUrl} variant="list" />
                    </ModalityCoverArea>
                    <View style={styles.cardTexts}>
                      <Text numberOfLines={2} style={styles.cardTitle}>{title}</Text>
                      <Text numberOfLines={1} style={styles.cardAuthor}>{book.author?.trim() || "Autor não informado"}</Text>
                      <View style={styles.metaRow}>
                        <Tag variant={book.modality} />
                        <Text style={styles.cardSubtitle}>{stepLabel(book)}</Text>
                      </View>
                      {/* Andamento: três etapas, as já alcançadas preenchidas */}
                      <View accessible={false} importantForAccessibility="no" style={styles.progress}>
                        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                          <View key={index} style={[styles.progressSegment, index < step && styles.progressSegmentDone]} />
                        ))}
                      </View>
                    </View>
                  </Pressable>
                  <View style={styles.cardActions}>
                    <TextButton
                      label={discarding ? "Descartando…" : "Descartar"}
                      accessibilityLabel="Descartar rascunho"
                      tone="danger"
                      disabled={discarding}
                      onPress={() => setToDiscard(book)}
                    />
                    <View style={styles.resumeWrap}>
                      <FilledButton label="Retomar" accessibilityLabel="Retomar rascunho" onPress={() => onResume?.(book.id)} />
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
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
  const [authState] = useAuthViewModel();

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
    page: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
    },
    scroll: { gap: tokens.spacing[12], paddingBottom: tokens.spacing[24] },
    summary: { ...tokens.typography.labelLarge, color: colors.m3.primary, paddingTop: tokens.spacing[4] },
    card: {
      gap: tokens.spacing[8],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    cardMain: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "center" },
    cardTexts: { flex: 1, gap: tokens.spacing[4] },
    cardTitle: { ...tokens.typography.titleMedium, color: colors.text },
    cardAuthor: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
    cardSubtitle: { ...tokens.typography.labelMedium, color: colors.secondaryText },
    metaRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8], flexWrap: "wrap" },
    progress: { flexDirection: "row", gap: tokens.spacing[4], marginTop: tokens.spacing[4] },
    progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.m3.outlineVariant },
    progressSegmentDone: { backgroundColor: colors.m3.primary },
    cardError: { ...tokens.typography.bodyMedium, color: colors.error },
    cardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[8] },
    resumeWrap: { flex: 1, maxWidth: 200 },
    empty: {
      paddingTop: tokens.spacing[32],
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginBottom: tokens.spacing[8],
    },
    emptyTitle: { ...tokens.typography.titleMedium, color: colors.text, textAlign: "center" },
    emptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 320,
    },
    emptyAction: { alignSelf: "stretch", marginTop: tokens.spacing[16] },
  });
}
