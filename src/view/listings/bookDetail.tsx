import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { Snackbar } from "@/view/components/Snackbar";
import { AppIcon } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { PhotoGallery } from "@/view/listings/photoGallery";
import { BOOK_CONDITION_LABELS, type BookModality } from "@/model/entities/book";

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.badge.sale.background, text: colors.badge.sale.text, label: "Venda" },
    trade: { background: colors.badge.trade.background, text: colors.badge.trade.text, label: "Troca" },
    donation: { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Doação" },
  };
}

/** Texto usado enquanto o perfil carrega ou quando ele não pôde ser lido. */
const OWNER_FALLBACK_LABEL = "Anunciado por outro membro da comunidade";

/**
 * Card do anunciante (Figma `03.01 · O Pequeno Príncipe`, nó `Material 3 · Link · Anunciante`).
 */
function SellerCard({
  ownerId,
  neighborhood = "Centro",
  onPress,
}: {
  ownerId: string;
  neighborhood?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profileState] = usePublicProfileViewModel(ownerId);
  const profile = profileState.profile;
  const name = profile?.name?.trim();
  const label = name ? `Anunciado por ${name}` : OWNER_FALLBACK_LABEL;

  const ratingText = profile?.averageRating != null
    ? `★ ${profile.averageRating.toFixed(1).replace(".", ",")} · `
    : "";
  const exchangesCount = profile?.completedNegotiations ?? 0;
  const exchangesText = `${exchangesCount} ${exchangesCount === 1 ? "troca" : "trocas"}`;
  const metaText = `${ratingText}${exchangesText} · ${neighborhood}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.sellerCard}
    >
      <View style={styles.sellerInfo}>
        <Avatar name={name || "Comunidade"} photoUrl={profile?.photoUrl} size={44} />
        <View style={styles.sellerTextCol}>
          <Text style={styles.sellerName}>{label}</Text>
          <Text style={styles.sellerMeta}>{metaText}</Text>
        </View>
      </View>
      <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
    </Pressable>
  );
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

  const formattedPrice = useMemo(() => {
    if (!book) return "";
    if (book.modality === "sale" && book.price != null) {
      return `R$ ${book.price.toFixed(2).replace(".", ",")}`;
    }
    if (book.modality === "trade") {
      return "Por outro livro";
    }
    return "Gratuito";
  }, [book]);

  const conditionLabel = book?.condition ? BOOK_CONDITION_LABELS[book.condition] : "Bom estado";
  const categoryLabel = book?.category || "Literatura";
  const neighborhoodLabel = book?.neighborhood || "Centro";
  const metaLine = `${conditionLabel} · ${categoryLabel} · ${neighborhoodLabel}`;

  const negotiationGuidance = useMemo(() => {
    if (!book) return "";
    if (book.modality === "sale") {
      return "Pagamento direto entre vocês, depois de conferir o exemplar.";
    }
    if (book.modality === "trade") {
      return "Combinem o local e confiram os livros antes da troca.";
    }
    return "Doação para quem vai ler. Retirada em local público.";
  }, [book]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      {/* 1. Barra de Topo M3: Voltar + "Detalhes" + Ações (Favoritar e Compartilhar) */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeading}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack}
            style={styles.iconButton}
          >
            <AppIcon name="back" size={24} color={colors.text} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.topBarTitle}>Detalhes</Text>
        </View>

        <View style={styles.topBarTrailing}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={state.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            accessibilityState={{ disabled: state.favoriteLoading }}
            disabled={state.favoriteLoading}
            onPress={() => void actions.toggleFavorite(sessionUserId)}
            style={styles.iconButton}
          >
            <AppIcon
              name={state.isFavorite ? "heartFill" : "heart"}
              size={24}
              color={state.isFavorite ? colors.action : colors.m3.onSurfaceVariant}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compartilhar anúncio"
            accessibilityState={{ disabled: share.sharing }}
            disabled={share.sharing}
            onPress={() => void shareActions.share(book?.id ?? bookId)}
            style={styles.iconButton}
          >
            <AppIcon name="share" size={24} color={colors.m3.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando anúncio" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
          </View>
        ) : book ? (
          <View style={styles.card}>
            {/* 2. Destaque de Capa (Figma nó div · SAINT-EXUPÉRY O Pequeno Príncipe) */}
            <View style={styles.coverContainer}>
              {photos.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver fotos do anúncio em tela cheia"
                  onPress={() => setGalleryVisible(true)}
                  style={styles.coverTouch}
                >
                  <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
                </Pressable>
              ) : (
                <View style={styles.coverTouch}>
                  <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
                </View>
              )}
              {photos.length > 1 ? (
                <View style={styles.photoDots}>
                  {photos.map((_, idx) => (
                    <View key={idx} style={[styles.dot, idx === 0 && styles.dotActive]} />
                  ))}
                </View>
              ) : null}
            </View>

            {/* 3. Título e Autor */}
            <View style={styles.titleSection}>
              <Text accessibilityRole="header" style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
            </View>

            {/* 4. Modalidade e Valor */}
            <View style={styles.priceRow}>
              {book.modality === "sale" ? (
                <Text style={styles.priceValue}>{formattedPrice}</Text>
              ) : null}
              <View style={[styles.tag, { backgroundColor: modalityTag[book.modality].background }]}>
                <Text style={[styles.tagText, { color: modalityTag[book.modality].text }]}>
                  {modalityTag[book.modality].label}
                </Text>
              </View>
              {book.modality !== "sale" ? (
                <Text style={styles.conditionPriceValue}>{formattedPrice}</Text>
              ) : null}
            </View>

            {/* 5. Conservação, Categoria e Bairro */}
            <Text style={styles.metaLine}>{metaLine}</Text>

            {/* 6. Descrição */}
            {book.description ? (
              <Text style={styles.descriptionText}>{book.description}</Text>
            ) : null}

            {state.favoriteError ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{state.favoriteError}</Text>
            ) : null}

            {/* 7. Card do Anunciante */}
            <SellerCard
              ownerId={book.ownerId}
              neighborhood={book.neighborhood}
              onPress={() => onNavigateToUserProfile?.(book.ownerId)}
            />

            {/* 8. Orientação da Negociação */}
            <View style={styles.guidanceBox}>
              <AppIcon name="info" size={20} color={colors.m3.onSurfaceVariant} />
              <Text style={styles.guidanceText}>{negotiationGuidance}</Text>
            </View>

            {/* Ações Secundárias */}
            <View style={styles.secondaryActions}>
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

            {negotiation.errorListingId === book.id ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{negotiation.error}</Text>
            ) : null}
            {share.error ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{share.error}</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* 9. Barra Fixa Inferior: Ação Principal */}
      {book && !state.loading ? (
        <SafeAreaView edges={["bottom"]} style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            {book.status === "reserved" ? (
              <View style={styles.statusPill}>
                <Text style={styles.reserved}>Reservado</Text>
              </View>
            ) : sessionUserId && book.ownerId !== sessionUserId ? (
              negotiation.requestedListingIds.includes(book.id) ? (
                <View style={styles.statusPill}>
                  <Text style={styles.requested}>Negociação solicitada</Text>
                </View>
              ) : (
                <FilledButton
                  label="Solicitar negociação"
                  loading={negotiation.pendingListingId === book.id}
                  loadingLabel="Solicitando negociação"
                  onPress={() => void negotiationActions.request(book.id, sessionUserId)}
                />
              )
            ) : null}
          </View>
        </SafeAreaView>
      ) : null}

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
    topBar: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.background,
    },
    topBarLeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    topBarTitle: {
      fontSize: 20,
      fontWeight: "500",
      color: colors.text,
    },
    topBarTrailing: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: tokens.radius.full,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[32],
    },
    status: {
      alignItems: "center",
      paddingTop: tokens.spacing[48],
    },
    errorText: {
      fontSize: tokens.typography.bodyLarge.fontSize,
      color: colors.error,
      textAlign: "center",
    },
    card: {
      gap: tokens.spacing[16],
    },
    coverContainer: {
      width: "100%",
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.medium,
      paddingVertical: tokens.spacing[24],
      alignItems: "center",
      justifyContent: "center",
    },
    coverTouch: {
      alignItems: "center",
      justifyContent: "center",
    },
    photoDots: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: tokens.spacing[12],
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.m3.outlineVariant,
    },
    dotActive: {
      backgroundColor: colors.text,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    titleSection: {
      gap: tokens.spacing[4],
    },
    title: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700",
      color: colors.text,
    },
    author: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.secondaryText,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    priceValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
    },
    conditionPriceValue: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    tag: {
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 16,
    },
    metaLine: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.secondaryText,
    },
    descriptionText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
    },
    sellerInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      flex: 1,
    },
    sellerTextCol: {
      flex: 1,
      gap: 2,
    },
    sellerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    sellerMeta: {
      fontSize: 13,
      color: colors.secondaryText,
    },
    guidanceBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
    },
    guidanceText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: colors.secondaryText,
    },
    secondaryActions: {
      gap: tokens.spacing[8],
      alignItems: "center",
      paddingTop: tokens.spacing[8],
    },
    whatsAppButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#25D366",
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[24],
      width: "100%",
    },
    whatsAppText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    reportButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingVertical: tokens.spacing[8],
    },
    reportText: {
      color: colors.secondaryText,
      fontSize: tokens.typography.labelMedium.fontSize,
      textDecorationLine: "underline",
    },
    bottomBarContainer: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    bottomBar: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    statusPill: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: tokens.spacing[12],
    },
    reserved: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      color: colors.secondaryText,
      fontStyle: "italic",
    },
    requested: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      color: colors.action,
      fontWeight: "600",
    },
    requestError: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      color: colors.error,
    },
  });
}
