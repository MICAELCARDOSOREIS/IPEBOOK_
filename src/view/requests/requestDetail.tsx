import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { tokens } from "@/view/tokens";
import { BookCover } from "@/view/components/BookCover";
import { IconBadge } from "@/view/components/IconBadge";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";

export type RequestDetailProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
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
}: RequestDetailProps) {
  const [state, actions] = useRequestDetailViewModel(requestId, sessionUserId);
  const detail = state.detail;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Negociação" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator
                color={tokens.colors.action}
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
              <Text style={styles.heroHeadline}>Um encontro, um novo capítulo.</Text>
              <View style={styles.successBanner}>
                <IconBadge icon="check" tone="action" />
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.successTitle}>Negociação aceita!</Text>
                  <Text style={styles.successSubtitle}>
                    O livro está reservado para esta negociação.
                  </Text>
                </View>
              </View>

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
                      <Text style={styles.price}>{`R$ ${detail.book.price.toFixed(2)}`}</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>

              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <IconBadge icon="person" tone="neutral" />
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    Participantes
                  </Text>
                </View>
                <Text style={styles.bodyText}>
                  {detail.isOwner ? "Pessoa interessada: " : "Pessoa que anunciou: "}
                  <Text style={styles.highlightText}>{detail.counterpartId}</Text>
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <IconBadge icon="place" tone="action" />
                  <Text accessibilityRole="header" style={styles.sectionHeader}>
                    Encontro seguro em Piripiri
                  </Text>
                </View>
                <Text style={styles.bodyText}>
                  Para a sua segurança, combinem a entrega sempre em locais públicos e movimentados:
                </Text>
                <View style={styles.pointList}>
                  {detail.safeMeetingPoints.map((point) => (
                    <Text key={point} style={styles.pointItem}>
                      • {point}
                    </Text>
                  ))}
                </View>
                <Text style={styles.tipText}>
                  Dica: Verifique a conservação do livro no momento da troca e prefira horários diurnos.
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  errorText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outline,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.action,
    fontWeight: "600",
  },
  container: { gap: tokens.spacing[16] },
  heroHeadline: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.badge.sale.background,
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
    color: tokens.colors.action,
  },
  successSubtitle: {
    ...tokens.typography.bodyMedium,
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
    borderColor: tokens.colors.m3.outlineVariant,
  },
  bookInfo: { flex: 1, gap: tokens.spacing[4] },
  bookTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  bookAuthor: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
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
    color: tokens.colors.action,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
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
    color: tokens.colors.text,
  },
  bodyText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.text,
  },
  highlightText: {
    fontWeight: "700",
    color: tokens.colors.action,
  },
  pointList: { gap: tokens.spacing[4], paddingVertical: tokens.spacing[4] },
  pointItem: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  tipText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
    fontStyle: "italic",
    marginTop: tokens.spacing[4],
  },
});
