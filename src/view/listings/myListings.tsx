import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens } from "@/view/tokens";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Snackbar } from "@/view/components/Snackbar";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { BOOK_CONDITION_LABELS, type Book } from "@/model/entities/book";

export type MyListingsProps = {
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToEditListing?: (bookId: string) => void;
  onNavigateToManageListing?: (bookId: string) => void;
};

/**
 * Figma `05.01 · Estante` (`25:302` / Web `159:1728`),
 * `05.02 · Estante vazia` (`25:430` / Web `159:1857`) e
 * `05.07 · Estante após exclusão` (`403:7319` / Web `403:22271`).
 */
export function MyListings({
  sessionUserId,
  onBack,
  onNavigateToBookDetail,
  onNavigateToCreateListing,
  onNavigateToEditListing,
  onNavigateToManageListing,
}: MyListingsProps) {
  const [state, actions] = useMyListingsViewModel(sessionUserId);
  const { isOnline } = useNetworkStatus();
  const [listingToDelete, setListingToDelete] = useState<Book | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Meus anúncios" onBack={() => onBack?.()} />
      <View style={styles.content}>
        {state.loading ? (
          <LoadingState label="Carregando seus anúncios" />
        ) : state.error ? (
          isOnline ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : (
            <OfflineState onRetry={() => void actions.reload()} />
          )
        ) : (
          <>
            <Snackbar
              visible={feedbackMessage !== null}
              message={feedbackMessage ?? ""}
              actionLabel="✕"
              onAction={() => setFeedbackMessage(null)}
              onDismiss={() => setFeedbackMessage(null)}
            />
            {state.cancelError ? (
              <Text accessibilityRole="alert" style={styles.cancelErrorText}>
                {state.cancelError}
              </Text>
            ) : null}
            {state.pauseError ? (
              <Text accessibilityRole="alert" style={styles.cancelErrorText}>
                {state.pauseError}
              </Text>
            ) : null}
            {state.books.length > 0 ? (
              <View style={styles.heroHeader}>
                <Text style={styles.heroHeadline}>Cada livro, uma conversa.</Text>
                <Text style={styles.orientationHint}>
                  Toque em um livro para editar, pausar ou marcar como concluído.
                </Text>
              </View>
            ) : null}
            <FlatList
              data={state.books}
              keyExtractor={(book) => book.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <IconBadge icon="shelf" tone="neutral" />
                  <Text style={styles.emptyHeadline}>Sua estante começa com um livro</Text>
                  <Text style={styles.emptyTitle}>Você ainda não cadastrou nenhum anúncio.</Text>
                  <Text style={styles.body}>
                    Anuncie um livro para vender, trocar ou doar na sua região.
                  </Text>
                  <View style={styles.emptyAction}>
                    <FilledButton
                      label="Cadastrar anúncio"
                      onPress={() => onNavigateToCreateListing?.()}
                    />
                  </View>
                </View>
              }
              renderItem={({ item }) => {
                const extraMeta = [
                  item.condition ? BOOK_CONDITION_LABELS[item.condition] : null,
                  item.neighborhood,
                ]
                  .filter(Boolean)
                  .join(" · ");

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
                        <Tag variant={item.modality} />
                      </View>
                      <Text style={styles.bookAuthor}>{item.author}</Text>
                      {extraMeta ? <Text style={styles.bookMeta}>{extraMeta}</Text> : null}
                      <View style={styles.statusRow}>
                        <Tag variant={item.status} />
                        {item.modality === "sale" && item.price ? (
                          <Text style={styles.price}>{`R$ ${item.price.toFixed(2)}`}</Text>
                        ) : null}
                      </View>
                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Gerenciar anúncio de ${item.title}`}
                          onPress={() => onNavigateToManageListing?.(item.id)}
                          style={styles.editButton}
                        >
                          <Text style={styles.editText}>Gerenciar</Text>
                        </Pressable>
                        {item.status !== "reserved" ? (
                          <>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Editar anúncio de ${item.title}`}
                              onPress={() => onNavigateToEditListing?.(item.id)}
                              style={styles.editButton}
                            >
                              <Text style={styles.editText}>Editar</Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={
                                item.status === "paused"
                                  ? `Retomar anúncio de ${item.title}`
                                  : `Pausar anúncio de ${item.title}`
                              }
                              disabled={state.pausingId === item.id}
                              onPress={async () => {
                                const wasPaused = item.status === "paused";
                                const ok = await actions.togglePauseListing(item.id);
                                if (ok) {
                                  setFeedbackMessage(
                                    wasPaused
                                      ? `Anúncio de "${item.title}" reativado no catálogo.`
                                      : `Anúncio de "${item.title}" pausado. Ele não aparecerá no catálogo público.`,
                                  );
                                }
                              }}
                              style={styles.pauseButton}
                            >
                              <Text style={styles.pauseText}>
                                {state.pausingId === item.id
                                  ? "Aguarde..."
                                  : item.status === "paused"
                                    ? "Retomar"
                                    : "Pausar"}
                              </Text>
                            </Pressable>
                          </>
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
  onNavigateToEditListing?: (bookId: string) => void;
  onNavigateToManageListing?: (bookId: string) => void;
};

export default function MyListingsScreen({
  onBack,
  onRequireSignIn,
  onNavigateToBookDetail,
  onNavigateToCreateListing,
  onNavigateToEditListing,
  onNavigateToManageListing,
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
      onNavigateToEditListing={onNavigateToEditListing}
      onNavigateToManageListing={onNavigateToManageListing}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: tokens.spacing[16] },
  body: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  orientationHint: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  heroHeader: {
    marginTop: tokens.spacing[12],
    gap: tokens.spacing[4],
  },
  heroHeadline: {
    ...tokens.typography.displayLarge,
    color: tokens.colors.text,
  },
  list: { paddingVertical: tokens.spacing[16], gap: tokens.spacing[12] },
  empty: { paddingTop: tokens.spacing[48], alignItems: "center", gap: tokens.spacing[12] },
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
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
    borderColor: tokens.colors.m3.outlineVariant,
  },
  bookInfo: { flex: 1, gap: tokens.spacing[4] },
  bookHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: tokens.spacing[8] },
  bookTitle: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  bookAuthor: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  bookMeta: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing[4],
  },
  price: {
    ...tokens.typography.bodyMedium,
    fontWeight: "600",
    color: tokens.colors.action,
  },
  actionButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[8],
  },
  editButton: {
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.soft,
    minHeight: tokens.spacing[32],
    justifyContent: "center",
  },
  editText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.action,
    fontWeight: "600",
  },
  pauseButton: {
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    minHeight: tokens.spacing[32],
    justifyContent: "center",
  },
  pauseText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[6],
    borderRadius: tokens.radius.small,
    backgroundColor: tokens.colors.errorContainer,
    minHeight: tokens.spacing[32],
    justifyContent: "center",
  },
  cancelText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.error,
    fontWeight: "600",
  },
  cancelErrorText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
    marginBottom: tokens.spacing[12],
  },
});
