import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { tokens } from "@/view/tokens";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import type { BookModality } from "@/model/entities/book";

const modalityTag: Record<BookModality, { background: string; text: string; label: string }> = {
  sale: { background: tokens.colors.badge.sale.background, text: tokens.colors.badge.sale.text, label: "Venda" },
  trade: { background: tokens.colors.badge.trade.background, text: tokens.colors.badge.trade.text, label: "Troca" },
  donation: { background: tokens.colors.badge.donation.background, text: tokens.colors.badge.donation.text, label: "Doação" },
};

export type BookDetailProps = {
  bookId: string;
  onBack: () => void;
  onNavigateToUserProfile?: (ownerId: string) => void;
};

export default function BookDetail({ bookId, onBack, onNavigateToUserProfile }: BookDetailProps) {
  const [state] = useBookDetailViewModel(bookId);
  const [authState] = useAuthViewModel();
  const [negotiation, negotiationActions] = useRequestNegotiationViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const book = state.book;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Detalhe" onBack={onBack} />
      <View style={styles.content}>
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando anúncio" />
          </View>
        ) : state.error ? (
          <Text accessibilityRole="alert" style={styles.body}>{state.error}</Text>
        ) : book ? (
          <View style={styles.card}>
            <BookCover id={book.id} title={book.title} author={book.author} variant="card" />
            <Text accessibilityRole="header" style={styles.title}>{book.title}</Text>
            <Text style={styles.body}>{book.author}</Text>
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
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  status: { alignItems: "center", paddingTop: tokens.spacing[48] },
  card: { gap: tokens.spacing[12], alignItems: "flex-start" },
  title: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: tokens.colors.action },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: tokens.colors.secondaryText },
  tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6] },
  tagText: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
  price: { fontSize: tokens.typography.titleMedium.fontSize, fontWeight: "600", color: tokens.colors.text },
  ownerButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
  ownerText: { color: tokens.colors.action, fontSize: 14, fontWeight: "600" },
  reserved: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText, fontStyle: "italic" },
  requested: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText, fontWeight: "600" },
  requestError: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.error },
});
