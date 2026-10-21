import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";

export type ManageListingProps = {
  bookId: string;
  sessionUserId: string | null;
  onEdit?: (bookId: string) => void;
  onRemoved?: () => void;
  onBack?: () => void;
};

/** Figma `04.08 · Gerenciar anúncio` (nó `149:3348`) e `04.20 · Excluir anúncio?` (nó `397:6961`). */
export default function ManageListing({
  bookId,
  sessionUserId,
  onEdit,
  onRemoved,
  onBack,
}: ManageListingProps) {
  const [state, actions] = useManageListingViewModel(bookId, sessionUserId);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const handleRemove = async () => {
    const removed = await actions.remove();
    setConfirmingRemoval(false);
    if (removed) onRemoved?.();
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Gerenciar anúncio" onBack={() => onBack?.()} />
        <LoadingState label="Carregando anúncio" />
      </SafeAreaView>
    );
  }

  if (!state.book) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Gerenciar anúncio" onBack={() => onBack?.()} />
        <ErrorState
          message={state.error ?? "Não foi possível carregar o anúncio."}
          onRetry={() => void actions.load()}
        />
      </SafeAreaView>
    );
  }

  const { book } = state;
  const paused = book.status === "paused";
  const reserved = book.status === "reserved";
  const location = [book.neighborhood, book.city, book.state].filter(Boolean).join(" · ");

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Gerenciar anúncio" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Seu livro, suas escolhas.</Text>
          <Text style={styles.subtitle}>Acompanhe e atualize esta publicação.</Text>

          <View style={styles.bookRow}>
            <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
            <View style={styles.bookTexts}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
              <View style={styles.tagRow}>
                <Tag variant={book.modality} />
                {book.price !== undefined ? (
                  <Text style={styles.price}>{`R$ ${book.price.toFixed(2)}`}</Text>
                ) : null}
              </View>
              {book.condition ? (
                <Text style={styles.bookMeta}>{BOOK_CONDITION_LABELS[book.condition]}</Text>
              ) : null}
              {location ? <Text style={styles.bookMeta}>{location}</Text> : null}
            </View>
          </View>

          <View style={[styles.statusBox, paused && styles.statusBoxPaused]}>
            <Text style={styles.statusTitle}>
              {paused ? "Anúncio pausado" : reserved ? "Negociação em andamento" : "Anúncio ativo"}
            </Text>
            <Text style={styles.statusHint}>
              {paused
                ? `${book.title} não aparece no catálogo enquanto estiver pausado.`
                : reserved
                  ? `${book.title} está reservado para uma negociação aceita.`
                  : `${book.title} está disponível para leitores de Piripiri.`}
            </Text>
          </View>

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar anúncio"
            accessibilityState={{ disabled: reserved }}
            disabled={reserved}
            onPress={() => onEdit?.(book.id)}
            style={styles.actionRow}
          >
            <AppIcon name="edit" size={24} color={tokens.colors.action} />
            <View style={styles.actionTexts}>
              <Text style={styles.actionTitle}>Editar anúncio</Text>
              <Text style={styles.actionHint}>Atualize fotos, preço e descrição.</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? "Retomar anúncio" : "Pausar anúncio"}
            accessibilityState={{ disabled: state.busy || reserved }}
            disabled={state.busy || reserved}
            onPress={() => void actions.togglePause()}
            style={styles.actionRow}
          >
            <AppIcon name={paused ? "unarchive" : "archive"} size={24} color={tokens.colors.action} />
            <View style={styles.actionTexts}>
              <Text style={styles.actionTitle}>{paused ? "Retomar anúncio" : "Pausar anúncio"}</Text>
              <Text style={styles.actionHint}>
                {paused
                  ? "O livro volta a aparecer no catálogo."
                  : "O livro deixa de aparecer no catálogo."}
              </Text>
            </View>
          </Pressable>

          <TextButton
            label="Excluir anúncio"
            tone="danger"
            disabled={state.busy}
            onPress={() => setConfirmingRemoval(true)}
          />
        </View>
      </ScrollView>

      <Dialog
        visible={confirmingRemoval}
        title="Excluir anúncio?"
        message={`${book.title} sai do catálogo e esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Manter anúncio"
        destructive
        loading={state.busy}
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmingRemoval(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: tokens.colors.secondaryText,
  },
  bookRow: {
    flexDirection: "row",
    gap: tokens.spacing[12],
    backgroundColor: tokens.colors.m3.surfaceContainer,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
  },
  bookTexts: { flex: 1, gap: tokens.spacing[4] },
  tagRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
  bookTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: tokens.colors.text,
  },
  bookAuthor: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  bookMeta: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  price: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
    color: tokens.colors.action,
  },
  statusBox: {
    backgroundColor: tokens.colors.soft,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusBoxPaused: { backgroundColor: tokens.colors.m3.surfaceContainerHigh },
  statusTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: tokens.colors.text,
  },
  statusHint: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    minHeight: tokens.accessibility.touchTarget,
    paddingVertical: tokens.spacing[8],
  },
  actionTexts: { flex: 1, gap: 2 },
  actionTitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    fontWeight: "600",
    color: tokens.colors.text,
  },
  actionHint: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
});
