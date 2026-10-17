import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { tokens } from "@/view/tokens";
import { BookCover } from "@/view/components/BookCover";
import { TopAppBar } from "@/view/components/TopAppBar";
import type { BookModality } from "@/model/entities/book";

const modalityTag: Record<BookModality, { background: string; text: string; label: string }> = {
  sale: { background: tokens.colors.badge.sale.background, text: tokens.colors.badge.sale.text, label: "Venda" },
  trade: { background: tokens.colors.badge.trade.background, text: tokens.colors.badge.trade.text, label: "Troca" },
  donation: { background: tokens.colors.badge.donation.background, text: tokens.colors.badge.donation.text, label: "Doação" },
};

export type RequestDetailProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
};

export function RequestDetail({
  requestId,
  sessionUserId,
  onBack,
  onNavigateToBookDetail,
}: RequestDetailProps) {
  const [state, actions] = useRequestDetailViewModel(requestId, sessionUserId);
  const detail = state.detail;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Negociação" onBack={() => onBack?.()} />
      <View style={styles.content}>
          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando detalhes da negociação" />
              <Text style={styles.body}>Carregando detalhes…</Text>
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
          ) : detail ? (
            <View style={styles.container}>
              <View style={styles.successBanner}>
                <Text style={styles.successTitle}>Negociação aceita!</Text>
                <Text style={styles.successSubtitle}>
                  O livro está reservado para esta negociação.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver anúncio de ${detail.book.title}`}
                onPress={() => onNavigateToBookDetail?.(detail.book.id)}
                style={styles.bookCard}
              >
                <BookCover id={detail.book.id} title={detail.book.title} photoUrl={detail.book.photoUrl} variant="list" />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{detail.book.title}</Text>
                  <Text style={styles.bookAuthor}>{detail.book.author}</Text>
                  <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: modalityTag[detail.book.modality].background }]}>
                      <Text style={[styles.tagText, { color: modalityTag[detail.book.modality].text }]}>
                        {modalityTag[detail.book.modality].label}
                      </Text>
                    </View>
                    {detail.book.modality === "sale" && detail.book.price ? (
                      <Text style={styles.price}>{`R$ ${detail.book.price.toFixed(2)}`}</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>

              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.sectionHeader}>Participantes</Text>
                <Text style={styles.bodyText}>
                  {detail.isOwner ? "Pessoa interessada: " : "Pessoa que anunciou: "}
                  <Text style={styles.highlightText}>{detail.counterpartId}</Text>
                </Text>
              </View>

              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.sectionHeader}>Encontro seguro em Piripiri</Text>
                <Text style={styles.bodyText}>
                  Para a sua segurança, combinem a entrega sempre em locais públicos e movimentados:
                </Text>
                <View style={styles.pointList}>
                  {detail.safeMeetingPoints.map((point) => (
                    <Text key={point} style={styles.pointItem}>• {point}</Text>
                  ))}
                </View>
                <Text style={styles.tipText}>
                  Dica: Verifique a conservação do livro no momento da troca e prefira horários diurnos.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
    </SafeAreaView>
  );
}

export type RequestDetailScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
};

export default function RequestDetailScreen({
  requestId,
  onBack,
  onRequireSignIn,
  onNavigateToBookDetail,
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
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[16] },
  status: { flex: 1, justifyContent: "center", alignItems: "center", gap: tokens.spacing[16], paddingTop: tokens.spacing[48] },
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
  container: { gap: tokens.spacing[16] },
  successBanner: {
    backgroundColor: tokens.colors.badge.sale.background,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    gap: 4,
  },
  successTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.action,
  },
  successSubtitle: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
  },
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
  bookTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  bookAuthor: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
  },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  tag: {
    paddingHorizontal: tokens.spacing[8],
    paddingVertical: 2,
    borderRadius: tokens.radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  price: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[8],
  },
  sectionHeader: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  bodyText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.text,
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: "bold",
    color: tokens.colors.action,
  },
  pointList: { gap: 4, paddingVertical: 4 },
  pointItem: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
  },
  tipText: {
    fontSize: tokens.typography.labelMedium.fontSize,
    color: tokens.colors.secondaryText,
    fontStyle: "italic",
    marginTop: 4,
  },
});
