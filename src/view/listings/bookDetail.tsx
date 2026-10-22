import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { Snackbar } from "@/view/components/Snackbar";
import { TopAppBar } from "@/view/components/TopAppBar";
import { PhotoGallery } from "@/view/listings/photoGallery";
import type { BookModality } from "@/model/entities/book";

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.badge.sale.background, text: colors.badge.sale.text, label: "Venda" },
    trade: { background: colors.badge.trade.background, text: colors.badge.trade.text, label: "Troca" },
    donation: { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Doação" },
  };
}

export type BookDetailProps = {
  bookId: string;
  onBack: () => void;
  onNavigateToUserProfile?: (ownerId: string) => void;
  onNavigateToReport?: (bookId: string) => void;
};

export default function BookDetail({
  bookId,
  onBack,
  onNavigateToUserProfile,
  onNavigateToReport,
}: BookDetailProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);
  const [authState] = useAuthViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const [state, actions] = useBookDetailViewModel(bookId, undefined, undefined, sessionUserId);
  const [negotiation, negotiationActions] = useRequestNegotiationViewModel();
  const [share, shareActions] = useShareListingViewModel();
  const book = state.book;
  const [galleryVisible, setGalleryVisible] = useState(false);
  const photos = book ? [book.photoUrl, ...(book.photos ?? [])].filter((url): url is string => Boolean(url)) : [];

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Detalhe" onBack={onBack} />
      <View style={styles.content}>
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando anúncio" />
          </View>
        ) : state.error ? (
          <Text accessibilityRole="alert" style={styles.body}>{state.error}</Text>
        ) : book ? (
          <View style={styles.card}>
            {photos.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver fotos do anúncio em tela cheia"
                onPress={() => setGalleryVisible(true)}
              >
                <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
              </Pressable>
            ) : (
              <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
            )}
            <Text accessibilityRole="header" style={styles.title}>{book.title}</Text>
            <Text style={styles.body}>{book.author}</Text>
            <Pressable accessibilityRole="button"
              accessibilityLabel={state.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              accessibilityState={{ disabled: state.favoriteLoading }}
              disabled={state.favoriteLoading}
              onPress={() => void actions.toggleFavorite(sessionUserId)} style={styles.ownerButton}>
              <Text style={styles.ownerText}>{state.isFavorite ? "♥ Favoritado" : "♡ Favoritar"}</Text>
            </Pressable>
            {state.favoriteError ? <Text accessibilityRole="alert" style={styles.requestError}>{state.favoriteError}</Text> : null}
            <View style={[styles.tag, { backgroundColor: modalityTag[book.modality].background }]}>
              <Text style={[styles.tagText, { color: modalityTag[book.modality].text }]}>
                {modalityTag[book.modality].label}
              </Text>
            </View>
            {book.modality === "sale" && book.price ? (
              <Text style={styles.price}>{`R$ ${book.price.toFixed(2)}`}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => onNavigateToUserProfile?.(book.ownerId)}
              style={styles.ownerButton}
            >
              <Text style={styles.ownerText}>Anunciado por {book.ownerId}</Text>
            </Pressable>
            {book.status === "reserved" ? (
              <Text style={styles.reserved}>Reservado</Text>
            ) : sessionUserId && book.ownerId !== sessionUserId ? (
              negotiation.requestedListingIds.includes(book.id) ? (
                <Text style={styles.requested}>Negociação solicitada</Text>
              ) : (
                <FilledButton
                  label="Solicitar negociação"
                  loading={negotiation.pendingListingId === book.id}
                  loadingLabel="Solicitando negociação"
                  onPress={() => void negotiationActions.request(book.id, sessionUserId)}
                />
              )
            ) : null}
            {negotiation.errorListingId === book.id ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{negotiation.error}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar anúncio"
              accessibilityState={{ disabled: share.sharing }}
              disabled={share.sharing}
              onPress={() => void shareActions.share(book.id)}
              style={styles.ownerButton}
            >
              <Text style={styles.ownerText}>Compartilhar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar no WhatsApp"
              accessibilityState={{ disabled: share.sharing }}
              disabled={share.sharing}
              onPress={() =>
                void shareActions.shareToWhatsApp(book.id, {
                  title: book.title,
                  author: book.author,
                  modality: book.modality,
                  price: book.price,
                })
              }
              style={styles.whatsAppButton}
            >
              <Text style={styles.whatsAppText}>Compartilhar no WhatsApp</Text>
            </Pressable>
            {share.error ? <Text accessibilityRole="alert" style={styles.requestError}>{share.error}</Text> : null}
            {onNavigateToReport && (!sessionUserId || book.ownerId !== sessionUserId) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Denunciar anúncio"
                onPress={() => onNavigateToReport(book.id)}
                style={styles.reportButton}
              >
                <Text style={styles.reportText}>Denunciar anúncio</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      {photos.length > 0 ? (
        <PhotoGallery
          photos={photos}
          visible={galleryVisible}
          onClose={() => setGalleryVisible(false)}
        />
      ) : null}
      <Snackbar
        visible={share.linkCopied}
        message="Link copiado"
        onDismiss={shareActions.dismissLinkCopied}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  status: { alignItems: "center", paddingTop: tokens.spacing[48] },
  card: { gap: tokens.spacing[12], alignItems: "flex-start" },
  title: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: colors.action },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: colors.secondaryText },
  tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6] },
  tagText: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
  price: { fontSize: tokens.typography.titleMedium.fontSize, fontWeight: "600", color: colors.text },
  ownerButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
  ownerText: { color: colors.action, fontSize: 14, fontWeight: "600" },
  whatsAppButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25D366",
    borderRadius: tokens.radius.full,
    paddingHorizontal: tokens.spacing[16],
  },
  whatsAppText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  reserved: { fontSize: tokens.typography.bodyMedium.fontSize, color: colors.secondaryText, fontStyle: "italic" },
  requested: { fontSize: tokens.typography.bodyMedium.fontSize, color: colors.secondaryText, fontWeight: "600" },
  requestError: { fontSize: tokens.typography.bodyMedium.fontSize, color: colors.error },
  reportButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", marginTop: tokens.spacing[8] },
  reportText: { color: colors.secondaryText, fontSize: tokens.typography.labelMedium.fontSize, textDecorationLine: "underline" },
  });
}
