import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { tokens } from "@/view/tokens";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { FilledButton } from "@/view/components/FilledButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import type { Book, BookModality } from "@/model/entities/book";

const modalityTag: Record<BookModality, { background: string; text: string; label: string }> = {
  sale: { background: tokens.colors.badge.sale.background, text: tokens.colors.badge.sale.text, label: "Venda" },
  trade: { background: tokens.colors.badge.trade.background, text: tokens.colors.badge.trade.text, label: "Troca" },
  donation: { background: tokens.colors.badge.donation.background, text: tokens.colors.badge.donation.text, label: "Doação" },
};

export type MyListingsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
};

export function MyListings({
  sessionUserId,
  onBack,
  onNavigateToBookDetail,
  onNavigateToCreateListing,
}: MyListingsProps) {
  const [state, actions] = useMyListingsViewModel(sessionUserId);
  const [listingToDelete, setListingToDelete] = useState<Book | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Meus anúncios" onBack={() => onBack?.()} />
      <View style={styles.content}>
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando seus anúncios" />
            <Text style={styles.body}>Carregando seus anúncios…</Text>
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void actions.reload()}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {feedbackMessage ? (
              <View style={styles.feedbackBanner} accessibilityRole="alert">
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar aviso"
                  onPress={() => setFeedbackMessage(null)}
                  style={styles.closeFeedbackButton}
                >
                  <Text style={styles.closeFeedbackText}>✕</Text>
                </Pressable>
              </View>
            ) : null}
            {state.cancelError ? (
              <Text accessibilityRole="alert" style={styles.cancelErrorText}>
                {state.cancelError}
              </Text>
            ) : null}
            <FlatList
              data={state.books}
              keyExtractor={(book) => book.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Você ainda não cadastrou nenhum anúncio.</Text>
                  <Text style={styles.body}>Compartilhe livros com a sua comunidade desapegando dos que já leu.</Text>
                  <View style={styles.emptyAction}>
                    <FilledButton
                      label="Cadastrar anúncio"
                      onPress={() => onNavigateToCreateListing?.()}
                    />
                  </View>
                </View>
              }
              renderItem={({ item }) => {
                const tag = modalityTag[item.modality];
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                    onPress={() => onNavigateToBookDetail?.(item.id)}
                    style={styles.bookCard}
                  >
                    <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                    <View style={styles.bookInfo}>
                      <View style={styles.bookHeader}>
                        <Text style={styles.bookTitle}>{item.title}</Text>
                        <View style={[styles.tag, { backgroundColor: tag.background }]}>
                          <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.bookAuthor}>{item.author}</Text>
                      <View style={styles.statusRow}>
                        <Text style={item.status === "reserved" ? styles.reservedBadge : styles.availableBadge}>
                          {item.status === "reserved" ? "Reservado" : "Disponível"}
                        </Text>
                        {item.modality === "sale" && item.price ? (
                          <Text style={styles.price}>{`R$ ${item.price.toFixed(2)}`}</Text>
                        ) : null}
                        {item.status === "available" ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remover anúncio de ${item.title}`}
                            disabled={state.cancellingId === item.id}
                            onPress={() => setListingToDelete(item)}
                            style={styles.cancelButton}
                          >
                            <Text style={styles.cancelText}>
                              {state.cancellingId === item.id ? "Removendo..." : "Remover"}
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </>
        )}
      </View>
      <Dialog
        visible={listingToDelete !== null}
        title="Excluir anúncio?"
        message={
          listingToDelete
            ? `Tem certeza de que deseja excluir o anúncio de "${listingToDelete.title}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir anúncio"
        cancelLabel="Cancelar"
        destructive
        loading={state.cancellingId !== null}
        onCancel={() => setListingToDelete(null)}
        onConfirm={async () => {
          if (!listingToDelete) return;
          const bookTitle = listingToDelete.title;
          const ok = await actions.cancelListing(listingToDelete.id);
          if (ok) {
            setListingToDelete(null);
            setFeedbackMessage(`Anúncio de "${bookTitle}" excluído com sucesso.`);
          }
        }}
      />
    </SafeAreaView>
  );
}

export type MyListingsScreenProps = {
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
};

export default function MyListingsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToBookDetail,
  onNavigateToCreateListing,
}: MyListingsScreenProps = {}) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      onRequireSignIn?.();
    }
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;

  return (
    <MyListings
      sessionUserId={authState.user.id}
      onBack={onBack}
      onNavigateToBookDetail={onNavigateToBookDetail}
      onNavigateToCreateListing={onNavigateToCreateListing}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: tokens.spacing[16] },
  status: { flex: 1, justifyContent: "center", alignItems: "center", gap: tokens.spacing[16] },
  body: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  errorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.action,
    fontWeight: "bold",
  },
  list: { paddingVertical: tokens.spacing[16], gap: tokens.spacing[12] },
  empty: { paddingTop: tokens.spacing[48], alignItems: "center", gap: tokens.spacing[8] },
  emptyTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
    textAlign: "center",
  },
  emptyAction: { marginTop: tokens.spacing[16], width: "100%", maxWidth: 260 },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[12],
    gap: tokens.spacing[12],
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  bookInfo: { flex: 1, gap: 4 },
  bookHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  bookTitle: {
    flex: 1,
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  bookAuthor: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  availableBadge: {
    fontSize: 12,
    color: tokens.colors.action,
    fontWeight: "bold",
  },
  reservedBadge: {
    fontSize: 12,
    color: tokens.colors.error,
    fontWeight: "bold",
  },
  price: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  tag: {
    paddingHorizontal: tokens.spacing[8],
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.errorContainer,
    minHeight: 32,
    justifyContent: "center",
  },
  cancelText: {
    fontSize: tokens.typography.labelMedium.fontSize,
    color: tokens.colors.error,
    fontWeight: "600",
  },
  cancelErrorText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.error,
    marginBottom: tokens.spacing[12],
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: tokens.colors.soft,
    borderColor: tokens.colors.action,
    borderWidth: 1,
    borderRadius: tokens.radius.medium,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[12],
    marginBottom: tokens.spacing[12],
    gap: tokens.spacing[8],
  },
  feedbackText: {
    flex: 1,
    color: tokens.colors.actionDeep,
    fontSize: 14,
    fontWeight: "500",
  },
  closeFeedbackButton: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeFeedbackText: {
    color: tokens.colors.actionDeep,
    fontSize: 14,
    fontWeight: "700",
  },
});
