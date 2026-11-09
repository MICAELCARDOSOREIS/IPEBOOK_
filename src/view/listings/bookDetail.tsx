import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import {
  makeAuthViewModel,
  makeBookDetailViewModel,
  makeMyListingsViewModel,
  makePublicProfileViewModel,
  makeRequestNegotiationViewModel,
  makeShareListingViewModel,
} from "@/di/container";
import { SHARE_BASE_URL } from "@/viewmodel/useShareListingViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { formatPrice } from "@/view/formatPrice";
import { useTheme } from "@/view/theme/ThemeProvider";
import { captureRef } from "react-native-view-shot";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { ErrorState } from "@/view/components/ErrorState";
import { ListingShareCard } from "@/view/components/ListingShareCard";
import { LoadingState } from "@/view/components/LoadingState";
import { FilledButton } from "@/view/components/FilledButton";
import { Snackbar } from "@/view/components/Snackbar";
import { AppIcon } from "@/view/components/AppIcon";
import { BookDetailHeroSection, DetailRow, SellerCard } from "@/view/listings/BookDetailSections";
import { PhotoGallery } from "@/view/listings/photoGallery";
import { ReservedListingSheet } from "@/view/listings/ReservedListingSheet";
import { ProposalSheet } from "@/view/listings/ProposalSheet";
import { buildBookOpenGraph } from "@/model/formatters/openGraphFormatter";
import { updateWebSocialMeta } from "@/view/webMeta";
import { BOOK_CONDITION_LABELS, type BookModality } from "@/model/entities/book";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";
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
  onNavigateToSignIn?: () => void;
  onNavigateToManageListing?: (bookId: string) => void;
  onNavigateToMyRequests?: () => void;
  onNavigateToNegotiation?: (requestId: string) => void;
  onNavigateToCategorySearch?: (category: string) => void;
};

export default function BookDetail({
  bookId,
  onBack,
  onNavigateToUserProfile,
  onNavigateToReport,
  onNavigateToSignIn,
  onNavigateToManageListing,
  onNavigateToMyRequests,
  onNavigateToNegotiation,
  onNavigateToCategorySearch,
}: BookDetailProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);
  const [authState] = makeAuthViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const [state, actions] = makeBookDetailViewModel(bookId, sessionUserId);
  const [negotiation, negotiationActions] = makeRequestNegotiationViewModel();
  const [share, shareActions] = makeShareListingViewModel();
  const book = state.book;
  const [ownerProfileState] = makePublicProfileViewModel(book?.ownerId ?? "");
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [reservedSheetVisible, setReservedSheetVisible] = useState(false);
  const [proposalSheetVisible, setProposalSheetVisible] = useState(false);
  const [myListingsState] = makeMyListingsViewModel(
    proposalSheetVisible && book?.modality === "trade" ? sessionUserId : null,
  );
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  useEffect(() => {
    if (!book) return;
    const meta = buildBookOpenGraph({
      id: book.id,
      title: book.title,
      author: book.author,
      tradeType: book.modality === "sale" ? "sell" : book.modality,
      price: book.price,
      photoUrl: book.photoUrl,
      neighborhood: book.neighborhood,
      isBox: book.isBox,
      boxVolumesCount: book.boxVolumesCount,
    });
    updateWebSocialMeta(meta);
  }, [book]);

  const guardedBack = useGuardedPress(onBack);
  const guardedNavigateToUserProfile = useGuardedPress((ownerId: string) => onNavigateToUserProfile?.(ownerId));
  const guardedNavigateToReport = useGuardedPress((id: string) => onNavigateToReport?.(id));
  const guardedNavigateToSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedNavigateToManageListing = useGuardedPress((id: string) => onNavigateToManageListing?.(id));
  const guardedNavigateToNegotiation = useGuardedPress((requestId: string) => onNavigateToNegotiation?.(requestId));

  // Imagem de compartilhamento: o cartão fica fora da tela e é capturado em PNG depois que a capa carrega.
  const shareCardRef = useRef<React.ComponentRef<typeof View>>(null);
  const coverSettled = useRef(false);
  const coverWaiters = useRef<Array<() => void>>([]);
  const onCoverSettled = () => {
    coverSettled.current = true;
    coverWaiters.current.splice(0).forEach((resolve) => resolve());
  };
  const captureShareImage = async () => {
    if (book?.photoUrl && !coverSettled.current) {
      await new Promise<void>((resolve) => {
        coverWaiters.current.push(resolve);
        setTimeout(resolve, 2500);
      });
    }
    return captureRef(shareCardRef, { format: "png", quality: 1, result: "tmpfile" });
  };
  const photos = book ? [book.photoUrl, ...(book.photos ?? [])].filter((url): url is string => Boolean(url)) : [];

  const formattedPrice = useMemo(() => {
    if (!book) return "";
    if (book.modality === "sale" && book.price != null) {
      return formatPrice(book.price);
    }
    if (book.modality === "trade") {
      return "Por outro livro";
    }
    return "Gratuito";
  }, [book]);

  const conditionLabel = book?.condition ? BOOK_CONDITION_LABELS[book.condition] : "Bom estado";
  const categoryLabel = book?.category || "Literatura";
  const neighborhoodLabel = book?.neighborhood || "Centro";
  const primaryActionLabel = book ? PRIMARY_ACTION_LABEL[book.modality] : "";
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const heroColors = book ? modalityTag[book.modality] : null;

  const isOwner = Boolean(sessionUserId && book && book.ownerId === sessionUserId);
  const activeRequestId = negotiation.activeRequestId;
  const isAccepted = negotiation.activeRequestStatus === "accepted";
  const isRequested = Boolean(book && (negotiation.requestedListingIds.includes(book.id) || Boolean(activeRequestId)));

  const { checkActiveRequest } = negotiationActions;
  useEffect(() => {
    if (book?.id && sessionUserId && book.ownerId !== sessionUserId) {
      void checkActiveRequest(book.id, sessionUserId);
    }
  }, [book?.id, sessionUserId, book?.ownerId, checkActiveRequest]);

  const navigateToActiveNegotiation = useCallback(() => {
    if (activeRequestId && onNavigateToNegotiation) {
      guardedNavigateToNegotiation(activeRequestId);
    } else {
      onNavigateToMyRequests?.();
    }
  }, [activeRequestId, onNavigateToNegotiation, guardedNavigateToNegotiation, onNavigateToMyRequests]);

  const handlePrimaryAction = useCallback(() => {
    if (!book) return;
    if (!sessionUserId) {
      guardedNavigateToSignIn();
      return;
    }
    if (isRequested) {
      navigateToActiveNegotiation();
      return;
    }
    setProposalError(null);
    setProposalSheetVisible(true);
  }, [book, sessionUserId, isRequested, navigateToActiveNegotiation, guardedNavigateToSignIn]);

  const handleProposalSubmit = useCallback(
    async (options: { initialMessage?: string; offeredBookId?: string }) => {
      if (!book || !sessionUserId) return;
      setProposalSubmitting(true);
      setProposalError(null);
      try {
        const created = await negotiationActions.request(book.id, sessionUserId, options);
        if (created) {
          setProposalSheetVisible(false);
          if (onNavigateToNegotiation) {
            guardedNavigateToNegotiation(created.id);
          } else {
            onNavigateToMyRequests?.();
          }
        }
      } catch (err) {
        setProposalError(err instanceof Error ? err.message : "Não foi possível enviar a proposta.");
      } finally {
        setProposalSubmitting(false);
      }
    },
    [book, sessionUserId, negotiationActions, onNavigateToNegotiation, guardedNavigateToNegotiation, onNavigateToMyRequests],
  );

  const handleStatusPress = () => {
    if (!book) return;
    if (book.status === "reserved" || book.status === "delivered") {
      if (isOwner) {
        guardedNavigateToManageListing(book.id);
      } else if (isRequested) {
        navigateToActiveNegotiation();
      } else {
        setReservedSheetVisible(true);
      }
      return;
    }
    if (isRequested) {
      navigateToActiveNegotiation();
    }
  };

  const statusA11yLabel = useMemo(() => {
    if (!book) return "";
    if (book.status === "reserved") {
      if (isOwner) return "Livro reservado. Toque para gerenciar anúncio e acompanhar";
      if (isRequested) return "Livro reservado para você. Toque para ver seus pedidos";
      return "Livro reservado. Toque para saber mais e entrar na lista de espera";
    }
    if (book.status === "delivered") {
      if (isOwner) return "Livro entregue. Toque para gerenciar anúncio";
      if (isRequested) return "Livro entregue. Toque para ver seus pedidos";
      return "Livro entregue. Toque para saber mais";
    }
    if (isRequested) {
      return "Negociação solicitada. Toque para ver seus pedidos";
    }
    return "";
  }, [book, isOwner, isRequested]);

  const shareableListing = useMemo(
    () =>
      book
        ? {
            title: book.title,
            author: book.author,
            modality: book.modality,
            price: book.price,
            neighborhood: book.neighborhood,
            condition: book.condition,
            category: book.category,
            isBox: book.isBox,
            boxVolumesCount: book.boxVolumesCount,
            photoUrl: book.photoUrl,
          }
        : undefined,
    [book],
  );

  const handleShareToWhatsApp = useCallback(() => {
    if (!book || !shareableListing) return;
    void shareActions.shareToWhatsApp(book.id, shareableListing, captureShareImage);
  }, [book, shareableListing, shareActions, captureShareImage]);

  const handleShareLink = useCallback(() => {
    void shareActions.share(book?.id ?? bookId, shareableListing, captureShareImage);
  }, [book?.id, bookId, shareableListing, shareActions, captureShareImage]);

  const primaryActionNode =
    book && !state.loading ? (
      book.status === "reserved" || book.status === "delivered" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={statusA11yLabel}
          onPress={handleStatusPress}
          style={withPress([
            styles.statusButton,
            book.status === "reserved" ? styles.statusButtonReserved : styles.statusButtonDelivered,
          ])}
        >
          <Text
            style={[
              styles.statusButtonText,
              book.status === "reserved" ? styles.statusTextReserved : styles.statusTextDelivered,
            ]}
          >
            {book.status === "delivered" ? "Entregue" : "Reservado"}
          </Text>
        </Pressable>
      ) : !sessionUserId ? (
        onNavigateToSignIn ? (
          <FilledButton
            label={primaryActionLabel}
            onPress={guardedNavigateToSignIn}
          />
        ) : null
      ) : book.ownerId !== sessionUserId ? (
        isRequested ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={statusA11yLabel}
            onPress={navigateToActiveNegotiation}
            style={withPress([
              styles.statusButton,
              isAccepted ? styles.statusButtonAccepted : styles.statusButtonRequested,
            ])}
          >
            <Text
              style={[
                styles.statusButtonText,
                isAccepted ? styles.statusTextAccepted : styles.statusTextRequested,
              ]}
            >
              {isAccepted ? "Combinar encontro" : "Negociação solicitada"}
            </Text>
          </Pressable>
        ) : (
          <FilledButton
            label={primaryActionLabel}
            loading={negotiation.pendingListingId === book.id}
            loadingLabel="Solicitando negociação"
            onPress={handlePrimaryAction}
          />
        )
      ) : null
    ) : null;

  const actionBar = primaryActionNode ? (
    <View style={[styles.bottomBar, wideWeb && styles.bottomBarWide]}>
      <View style={styles.primarySlot}>{primaryActionNode}</View>
    </View>
  ) : null;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.page}>
      <ScrollView {...standardVerticalScrollProps} contentContainerStyle={[wideWeb ? styles.scrollContentWide : styles.scrollContent, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}>
        {wideWeb ? (
          <Breadcrumb
            items={[
              { label: "Explorar", onPress: guardedBack, accessibilityLabel: "Voltar para Explorar" },
              ...(book?.category
                ? [
                    {
                      label: book.category,
                      onPress: onNavigateToCategorySearch ? () => onNavigateToCategorySearch(book.category as string) : undefined,
                      accessibilityLabel: `Ver livros de ${book.category}`,
                    },
                  ]
                : []),
              ...(book ? [{ label: book.title, isCurrent: true }] : []),
            ]}
          />
        ) : null}
        {/* 1. Capa em destaque na cor da modalidade (Figma `03.01`–`03.03`), indo até a barra de status. */}
        <BookDetailHeroSection
          book={book}
          photos={photos}
          wideWeb={wideWeb}
          topInset={insets.top}
          heroBackgroundColor={heroColors?.background}
          sharing={share.sharing}
          isFavorite={state.isFavorite}
          favoriteLoading={state.favoriteLoading}
          onBack={guardedBack}
          onShareWhatsApp={handleShareToWhatsApp}
          onShareLink={handleShareLink}
          onToggleFavorite={() => void actions.toggleFavorite(sessionUserId)}
          onOpenGallery={() => setGalleryVisible(true)}
        />

        {state.loading ? (
          <View style={styles.status}>
            <LoadingState label="Carregando anúncio" variant="detail" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          </View>
        ) : book ? (
          <View style={[styles.content, wideWeb && styles.contentWide]}>
            {/* 2. Título, autor, valor e etiqueta da modalidade */}
            <View style={styles.titleSection}>
              <Text accessibilityRole="header" style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{formattedPrice}</Text>
              <View style={[styles.tag, { backgroundColor: modalityTag[book.modality].background }]}>
                <Text style={[styles.tagText, { color: modalityTag[book.modality].text }]}>
                  {modalityTag[book.modality].label}
                </Text>
              </View>
              {book.isBox ? (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: colors.m3.secondaryContainer, marginLeft: 8 },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.m3.onSecondaryContainer }]}>
                    {book.boxVolumesCount ? `Box (${book.boxVolumesCount} volumes)` : "Box / Coleção"}
                  </Text>
                </View>
              ) : null}
            </View>

            {wideWeb ? actionBar : null}

            {/* 3. Cartão da modalidade (troca e doação) */}
            {book.modality !== "sale" ? (
              <View style={[styles.modalityCard, { backgroundColor: modalityTag[book.modality].background }]}>
                <AppIcon
                  name={book.modality === "trade" ? "swap" : "info"}
                  size={20}
                  color={modalityTag[book.modality].text}
                />
                <View style={styles.modalityCardText}>
                  <Text style={[styles.modalityCardTitle, { color: modalityTag[book.modality].text }]}>
                    {book.modality === "trade" ? "Aceita em troca" : "Doação para quem vai ler"}
                  </Text>
                  <Text style={[styles.modalityCardBody, { color: modalityTag[book.modality].text }]}>
                    {book.modality === "trade"
                      ? "Combine pelo chat qual livro oferecer. Levem os dois exemplares e confiram antes de trocar."
                      : "Sem cobrança pelo exemplar. Retirada em local público, combinada pelo chat."}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* 4. Detalhes: conservação, categoria e retirada */}
            <View style={styles.detailList}>
              {book.isBox ? (
                <DetailRow
                  icon="conservation"
                  label="Formato"
                  value={book.boxVolumesCount ? `Box / Coleção (${book.boxVolumesCount} volumes)` : "Box / Coleção"}
                />
              ) : null}
              <DetailRow icon="conservation" label="Conservação" value={conditionLabel} />
              <DetailRow icon="category" label="Categoria" value={categoryLabel} />
              {/* Dados da edição, preenchidos pelo ISBN (Spec 097). */}
              {book.publisher ? <DetailRow icon="info" label="Editora" value={book.publisher} /> : null}
              {book.pageCount ? <DetailRow icon="conservation" label="Páginas" value={String(book.pageCount)} /> : null}
              {book.publicationYear ? <DetailRow icon="info" label="Ano" value={String(book.publicationYear)} /> : null}
              <DetailRow icon="place" label="Retirada" value={neighborhoodLabel} last />
            </View>

            {book.description ? (
              <Text style={styles.descriptionText}>{book.description}</Text>
            ) : null}

            {book.synopsis ? (
              <View style={styles.synopsisSection}>
                <Text accessibilityRole="header" style={styles.synopsisTitle}>Sinopse</Text>
                <Text style={styles.synopsisText}>{book.synopsis}</Text>
              </View>
            ) : null}

            {/* 5. Anunciante */}
            <SellerCard profile={ownerProfileState.profile} onPress={() => guardedNavigateToUserProfile(book.ownerId)} />

            {/* Banner de negociação em andamento quando o usuário já solicitou o livro */}
            {isRequested && !isOwner ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isAccepted ? "Pedido aceito! Toque para combinar o encontro" : "Negociação em andamento. Toque para ver detalhes"}
                onPress={navigateToActiveNegotiation}
                style={withPress(styles.activeNegotiationBanner)}
              >
                <View style={styles.activeNegotiationIconBox}>
                  <AppIcon name="chat" size={24} color={colors.nature.foliage} />
                </View>
                <View style={styles.activeNegotiationContent}>
                  <Text style={styles.activeNegotiationTitle}>
                    {isAccepted ? "Pedido aceito!" : "Você já solicitou este exemplar"}
                  </Text>
                  <Text style={styles.activeNegotiationBody}>
                    {isAccepted
                      ? "Toque aqui para combinar o encontro em Piripiri."
                      : "Toque aqui para ver a negociação e combinar os detalhes."}
                  </Text>
                </View>
                <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : null}

            {wideWeb ? (
              <View style={styles.safeMeetingCard}>
                <AppIcon name="place" size={20} color={colors.m3.onSecondaryContainer} />
                <View style={styles.safeMeetingText}>
                  <Text style={styles.safeMeetingTitle}>Encontro seguro</Text>
                  <Text style={styles.safeMeetingBody}>Prefira locais públicos. Pague só depois de conferir o exemplar.</Text>
                </View>
              </View>
            ) : null}

            {state.favoriteError ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{state.favoriteError}</Text>
            ) : null}
            {negotiation.errorListingId === book.id && !isRequested ? (
              negotiation.error?.includes("pedido pendente") ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Você já tem uma proposta para este anúncio. Toque para ver a negociação"
                  onPress={navigateToActiveNegotiation}
                  style={withPress(styles.activeNegotiationBanner)}
                >
                  <View style={styles.activeNegotiationIconBox}>
                    <AppIcon name="chat" size={24} color={colors.nature.foliage} />
                  </View>
                  <View style={styles.activeNegotiationContent}>
                    <Text style={styles.activeNegotiationTitle}>Proposta já enviada</Text>
                    <Text style={styles.activeNegotiationBody}>Toque aqui para acompanhar a conversa e combinar o encontro.</Text>
                  </View>
                  <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
                </Pressable>
              ) : (
                <Text accessibilityRole="alert" style={styles.requestError}>{negotiation.error}</Text>
              )
            ) : null}
            {share.error ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{share.error}</Text>
            ) : null}

            {onNavigateToReport && (!sessionUserId || book.ownerId !== sessionUserId) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Denunciar anúncio"
                onPress={() => guardedNavigateToReport(book.id)}
                style={withPress(styles.reportButton)}
              >
                <AppIcon name="flag" size={18} color={colors.m3.onSurfaceVariant} />
                <Text style={styles.reportText}>Denunciar anúncio</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Cartão da imagem de compartilhamento: fora da tela e invisível ao leitor de tela, só para a captura. */}
      {book ? (
        <View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={styles.offscreen}
        >
          <ListingShareCard
            ref={shareCardRef}
            book={book}
            url={`${SHARE_BASE_URL}/livro/${book.id}`}
            onCoverSettled={onCoverSettled}
          />
        </View>
      ) : null}

      {/* 6. Barra fixa inferior: ação principal por modalidade */}
      {actionBar && !wideWeb ? (
        <SafeAreaView edges={["bottom"]} style={styles.bottomBarContainer}>
          {actionBar}
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

      {book ? (
        <ReservedListingSheet
          visible={reservedSheetVisible}
          onClose={() => setReservedSheetVisible(false)}
          status={book.status === "delivered" ? "delivered" : "reserved"}
          category={book.category}
          isFavorite={state.isFavorite}
          favoriteLoading={state.favoriteLoading}
          onToggleFavorite={() => {
            if (!sessionUserId) {
              setReservedSheetVisible(false);
              onNavigateToSignIn?.();
              return;
            }
            void actions.toggleFavorite(sessionUserId);
          }}
          onSearchCategory={(cat) => {
            setReservedSheetVisible(false);
            onNavigateToCategorySearch?.(cat);
          }}
          onViewOwnerProfile={() => {
            setReservedSheetVisible(false);
            onNavigateToUserProfile?.(book.ownerId);
          }}
          ownerName={ownerProfileState.profile?.name}
        />
      ) : null}

      {book ? (
        <ProposalSheet
          visible={proposalSheetVisible}
          onClose={() => setProposalSheetVisible(false)}
          targetBook={book}
          userBooks={myListingsState.books}
          loadingBooks={myListingsState.loading}
          submitting={proposalSubmitting}
          error={proposalError}
          onSubmit={handleProposalSubmit}
        />
      ) : null}
    </SafeAreaView>
  );
}

const PRIMARY_ACTION_LABEL: Record<BookModality, string> = {
  sale: "Tenho interesse",
  trade: "Propor troca",
  donation: "Quero receber",
};

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    offscreen: { position: "absolute", left: -10000, top: 0 },
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: tokens.spacing[32] },
    // Web larga (Figma `03.01`): capa à esquerda e cartão de ações à direita, centralizado em WEB_MAX_WIDTH.
    scrollContentWide: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      columnGap: tokens.spacing[48],
      rowGap: tokens.spacing[16],
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[32],
      paddingBottom: tokens.spacing[48],
    },
    safeMeetingCard: { flexDirection: "row", gap: tokens.spacing[12], padding: tokens.spacing[16], borderRadius: tokens.radius.medium, backgroundColor: colors.m3.surfaceContainer },
    safeMeetingText: { flex: 1, gap: tokens.spacing[2] },
    safeMeetingTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    safeMeetingBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    contentWide: { flex: 1, maxWidth: 440, padding: tokens.spacing[24], borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: colors.m3.outlineVariant, backgroundColor: colors.m3.surfaceContainerLow },
    bottomBarWide: { paddingHorizontal: 0, paddingVertical: 0 },
    status: { alignItems: "center", paddingTop: tokens.spacing[48] },
    errorText: {
      ...tokens.typography.bodyLarge,
      color: colors.error,
      textAlign: "center",
    },
    content: {
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[20],
      gap: tokens.spacing[16],
    },
    titleSection: { gap: tokens.spacing[4] },
    title: {
      ...tokens.typography.brandSection,
      color: colors.m3.onSurface,
    },
    author: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
    priceRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    priceValue: { ...tokens.typography.titleBar, fontWeight: tokens.fontWeight.bold, color: colors.m3.onSurface },
    tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[8], paddingVertical: tokens.spacing[2] },
    tagText: { ...tokens.typography.labelMedium },
    modalityCard: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[16],
    },
    modalityCardText: { flex: 1, gap: tokens.spacing[2] },
    modalityCardTitle: { ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.semiBold },
    modalityCardBody: { ...tokens.typography.bodyMedium },
    detailList: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      paddingHorizontal: tokens.spacing[16],
    },
    synopsisSection: { gap: tokens.spacing[8] },
    synopsisTitle: { ...tokens.typography.titleMedium, fontFamily: fontFamily.semiBold, color: colors.m3.onSurface },
    synopsisText: { ...tokens.typography.subheadline, lineHeight: tokens.lineHeight[23], color: colors.m3.onSurfaceVariant },
    descriptionText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    reportButton: {
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
    },
    reportText: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    bottomBarContainer: { backgroundColor: colors.m3.surfaceContainer },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
    },
    primarySlot: { flex: 1 },
    statusButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
    },
    statusButtonReserved: {
      backgroundColor: colors.m3.tertiaryContainer,
    },
    statusButtonDelivered: {
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    statusButtonRequested: {
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    statusButtonAccepted: {
      backgroundColor: colors.nature.foliage,
    },
    statusButtonText: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
    },
    statusTextReserved: {
      color: colors.m3.onTertiaryContainer,
    },
    statusTextDelivered: {
      color: colors.m3.onSurfaceVariant,
    },
    statusTextRequested: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
    },
    statusTextAccepted: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onPrimary,
    },
    activeNegotiationBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.nature.sprout,
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.nature.foliage,
    },
    activeNegotiationIconBox: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.onFoliage,
      alignItems: "center",
      justifyContent: "center",
    },
    activeNegotiationContent: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    activeNegotiationTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.bold,
      color: colors.nature.foliageDeep,
    },
    activeNegotiationBody: {
      ...tokens.typography.bodyMedium,
      color: colors.nature.foliageDeep,
    },
    reserved: { ...tokens.typography.labelLarge, color: colors.m3.onTertiaryContainer, backgroundColor: colors.m3.tertiaryContainer, paddingHorizontal: tokens.spacing[16], paddingVertical: tokens.spacing[8], borderRadius: tokens.radius.full, overflow: "hidden" },
    requested: { ...tokens.typography.bodyMedium, color: colors.action, fontWeight: tokens.fontWeight.semiBold },
    requestError: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
