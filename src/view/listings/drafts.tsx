import { useEffect, useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";

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
};

/**
 * Tela "Rascunhos" (Spec 017, Figma `04.11 · Rascunhos`, `04.15 · Descartar rascunho?`,
 * `04.16 · Rascunhos · vazio`). Lista os anúncios em andamento, permite retomar de onde a
 * pessoa parou e descartar com confirmação.
 */
export function Drafts({ sessionUserId, onBack, onResume, onNavigateToCreateListing }: DraftsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state, actions] = useDraftsViewModel(sessionUserId);

  const handleDiscard = (book: Book) => {
    Alert.alert(
      "Descartar rascunho?",
      `O progresso de "${book.title?.trim() || "Sem título"}" será apagado. Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => void actions.discardDraft(book.id),
        },
      ],
    );
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
            <Text style={styles.emptyTitle}>Nenhum rascunho por aqui</Text>
            <Text style={styles.emptySubtitle}>
              Quando você começar a anunciar um livro e escolher "Salvar para depois", ele aparece
              aqui para você retomar de onde parou.
            </Text>
            {onNavigateToCreateListing ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Anunciar um livro"
                onPress={onNavigateToCreateListing}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Anunciar um livro</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {state.drafts.map((book) => (
              <View
                key={book.id}
                style={styles.card}
                accessibilityLabel={`Rascunho ${book.title?.trim() || "Sem título"}, ${stepLabel(book)}`}
              >
                <Text style={styles.cardTitle}>{book.title?.trim() || "Sem título"}</Text>
                <Text style={styles.cardSubtitle}>{stepLabel(book)}</Text>
                {state.discardError ? <Text style={styles.cardError}>{state.discardError}</Text> : null}
                <View style={styles.cardActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retomar rascunho"
                    onPress={() => onResume?.(book.id)}
                    style={styles.resumeButton}
                  >
                    <Text style={styles.resumeButtonText}>Retomar</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Descartar rascunho"
                    disabled={state.discardingId === book.id}
                    onPress={() => handleDiscard(book)}
                    style={styles.discardButton}
                  >
                    <Text style={styles.discardButtonText}>
                      {state.discardingId === book.id ? "Descartando…" : "Descartar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

export type DraftsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onResume?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
};

export default function DraftsScreen({
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
    card: {
      gap: tokens.spacing[6],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    cardTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    cardSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    cardError: {
      ...tokens.typography.labelMedium,
      color: colors.error,
    },
    cardActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
    },
    resumeButton: {
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[16],
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.primary,
    },
    resumeButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onPrimary,
      fontWeight: "600",
    },
    discardButton: {
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      justifyContent: "center",
      alignItems: "center",
    },
    discardButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.error,
      fontWeight: "600",
    },
    empty: {
      paddingTop: tokens.spacing[32],
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      textAlign: "center",
    },
    emptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 320,
    },
    emptyButton: {
      marginTop: tokens.spacing[8],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[20],
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.primary,
    },
    emptyButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onPrimary,
      fontWeight: "600",
    },
  });
}
