import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { SHARE_BASE_URL, useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { captureRef } from "react-native-view-shot";
import { Book3D } from "@/view/components/Book3D";
import { ListingShareCard } from "@/view/components/ListingShareCard";
import { FilledButton } from "@/view/components/FilledButton";
import { Snackbar } from "@/view/components/Snackbar";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { PhotoGallery } from "@/view/listings/photoGallery";
import { ReservedListingSheet } from "@/view/listings/ReservedListingSheet";
import { BOOK_CONDITION_LABELS, type BookModality } from "@/model/entities/book";
import { WEB_MAX_WIDTH } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
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
  onPress,
}: {
  ownerId: string;
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
  const metaText = `${ratingText}${exchangesText}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={withPress(styles.sellerCard)}
    >
      <View style={styles.sellerInfo}>
        <Avatar name={name || "Comunidade"} photoUrl={profile?.photoUrl} size={40} />
        <View style={styles.sellerTextCol}>
          <Text style={styles.sellerName}>{name || "Membro da comunidade"}</Text>
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
  onNavigateToSignIn?: () => void;
  onNavigateToManageListing?: (bookId: string) => void;
  onNavigateToMyRequests?: () => void;
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
  onNavigateToCategorySearch,
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
  const [ownerProfileState] = usePublicProfileViewModel(book?.ownerId ?? "");
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [reservedSheetVisible, setReservedSheetVisible] = useState(false);
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
  const primaryActionLabel = book ? PRIMARY_ACTION_LABEL[book.modality] : "";
  const insets = useSafeAreaInsets();
  const wideWeb = useIsWideWeb();
  const heroColors = book ? modalityTag[book.modality] : null;

  const isOwner = Boolean(sessionUserId && book && book.ownerId === sessionUserId);
  const isRequested = Boolean(book && negotiation.requestedListingIds.includes(book.id));

  const handleStatusPress = () => {
    if (!book) return;
    if (book.status === "reserved" || book.status === "delivered") {
      if (isOwner) {
        onNavigateToManageListing?.(book.id);
      } else if (isRequested) {
        onNavigateToMyRequests?.();
      } else {
        setReservedSheetVisible(true);
      }
      return;
    }
    if (isRequested) {
      onNavigateToMyRequests?.();
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

  const actionBar = book && !state.loading ? (
    <View style={[styles.bottomBar, wideWeb && styles.bottomBarWide]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Compartilhar anúncio como imagem"
      accessibilityState={{ disabled: share.sharing }}
      disabled={share.sharing}
      onPress={() =>
        void shareActions.shareImage(
          book.id,
          { title: book.title, author: book.author, modality: book.modality, price: book.price },
          captureShareImage,
        )
      }
      style={withPress(styles.tonalButton)}
    >
      <Text style={styles.tonalButtonText}>Compartilhar</Text>
    </Pressable>
    {book.status === "reserved" || book.status === "delivered" || !sessionUserId || book.ownerId !== sessionUserId ? (
      <View style={styles.primarySlot}>
        {book.status === "reserved" || book.status === "delivered" ? (
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
              onPress={onNavigateToSignIn}
            />
          ) : null
        ) : book.ownerId !== sessionUserId ? (
          isRequested ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={statusA11yLabel}
              onPress={handleStatusPress}
              style={withPress([styles.statusButton, styles.statusButtonRequested])}
            >
              <Text style={[styles.statusButtonText, styles.statusTextRequested]}>Negociação solicitada</Text>
            </Pressable>
          ) : (
            <FilledButton
              label={primaryActionLabel}
              loading={negotiation.pendingListingId === book.id}
              loadingLabel="Solicitando negociação"
              onPress={() => void negotiationActions.request(book.id, sessionUserId)}
            />
          )
        ) : null}
      </View>
    ) : null}
  </View>
  ) : null;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.page}>
      <ScrollView contentContainerStyle={wideWeb ? styles.scrollContentWide : styles.scrollContent} keyboardShouldPersistTaps="handled">
        {wideWeb ? (
          <View accessibilityRole="header" style={styles.breadcrumb}>
            <Pressable accessibilityRole="link" accessibilityLabel="Voltar para Explorar" onPress={onBack}>
              <Text style={styles.breadcrumbLink}>Explorar</Text>
            </Pressable>
            {book?.category ? <Text style={styles.breadcrumbSep}>›</Text> : null}
            {book?.category ? <Text style={styles.breadcrumbText}>{book.category}</Text> : null}
            {book ? <Text style={styles.breadcrumbSep}>›</Text> : null}
            {book ? <Text numberOfLines={1} style={styles.breadcrumbCurrent}>{book.title}</Text> : null}
          </View>
        ) : null}
        {/* 1. Capa em destaque na cor da modalidade (Figma `03.01`–`03.03`), indo até a barra de status. */}
        <View
          style={[
            styles.hero,
            wideWeb ? styles.heroWide : { paddingTop: insets.top + tokens.spacing[8] },
            heroColors ? { backgroundColor: heroColors.background } : null,
          ]}
        >
          <View style={styles.heroBar}>
            {/* Na web larga o caminho "Explorar › …" acima já volta; a seta sobre a capa sobrava. */}
            {wideWeb ? <View /> : <HeroIconButton icon="back" label="Voltar" onPress={onBack} />}
            <View style={styles.heroBarTrailing}>
              <HeroIconButton
                icon="share"
                label="Compartilhar anúncio"
                disabled={share.sharing}
                onPress={() => void shareActions.share(book?.id ?? bookId)}
              />
              <HeroIconButton
                icon={state.isFavorite ? "heartFill" : "heart"}
                label={state.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                disabled={state.favoriteLoading}
                iconColor={state.isFavorite ? colors.action : undefined}
                onPress={() => void actions.toggleFavorite(sessionUserId)}
              />
            </View>
          </View>

          {book ? (
            <View style={[styles.coverArea, wideWeb && styles.coverAreaWide]}>
              <View>
                {/* Gira com o dedo; havendo fotos, tocar sem arrastar abre a galeria em tela cheia. */}
                <Book3D
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.synopsis ?? book.description}
                  publisher={book.publisher}
                  pageCount={book.pageCount}
                  photoUrl={book.photoUrl}
                  scale={wideWeb ? 1.6 : 1}
                  onPress={photos.length > 0 ? () => setGalleryVisible(true) : undefined}
                />
              </View>
              {photos.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver fotos do anúncio em tela cheia"
                  onPress={() => setGalleryVisible(true)}
                  hitSlop={8}
                  style={withPress(styles.photosLink)}
                >
                  <Text style={styles.photosLinkText}>Ver fotos</Text>
                </Pressable>
              ) : null}
              <View pointerEvents="none" style={styles.hintBadgeHero}>
                <Text style={styles.hintTextHero}>3D · Toque para virar</Text>
              </View>
              {photos.length > 1 && wideWeb ? (
                <View style={styles.thumbRow} accessibilityLabel={`${photos.length} fotos`}>
                  {photos.map((url, idx) => (
                    <Pressable
                      key={`${url}-${idx}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver foto ${idx + 1} em tela cheia`}
                      onPress={() => setGalleryVisible(true)}
                      style={withPress([styles.thumb, idx === 0 && styles.thumbActive])}
                    >
                      <Image source={{ uri: url }} style={styles.thumbImage} resizeMode="cover" accessible={false} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {photos.length > 1 && !wideWeb ? (
                <View style={styles.photoDots} accessibilityLabel={`${photos.length} fotos`}>
                  {photos.map((_, idx) => (
                    <View key={idx} style={[styles.dot, idx === 0 && styles.dotActive]} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando anúncio" />
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
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
            <SellerCard ownerId={book.ownerId} onPress={() => onNavigateToUserProfile?.(book.ownerId)} />

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
            {negotiation.errorListingId === book.id ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{negotiation.error}</Text>
            ) : null}
            {share.error ? (
              <Text accessibilityRole="alert" style={styles.requestError}>{share.error}</Text>
            ) : null}

            {onNavigateToReport && (!sessionUserId || book.ownerId !== sessionUserId) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Denunciar anúncio"
                onPress={() => onNavigateToReport(book.id)}
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

      {/* 6. Barra fixa inferior: Compartilhar (tonal) + ação principal por modalidade */}
      {book && !state.loading && !wideWeb ? (
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
    </SafeAreaView>
  );
}

/** Botão de ícone tonal circular sobre a capa (M3 Expressive filled tonal icon button, 40 dp com 48 dp de toque). */
function HeroIconButton({
  icon,
  label,
  onPress,
  disabled = false,
  iconColor,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  iconColor?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.heroIconButton,
        pressed && !disabled && styles.heroIconButtonPressed,
      ]}
    >
      <AppIcon name={icon} size={22} color={iconColor ?? colors.m3.onSurface} />
    </Pressable>
  );
}

/** Linha da lista de detalhes (Figma `03.01`: ícone em selo, rótulo à esquerda, valor à direita). */
function DetailRow({ icon, label, value, last = false }: { icon: AppIconName; label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <View style={styles.detailIcon}>
        <AppIcon name={icon} size={18} color={colors.m3.onSecondaryContainer} />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
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
    // Web larga (Figma `03.01`): capa à esquerda e cartão de ações à direita, com 48 px entre as colunas.
    scrollContentWide: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: tokens.spacing[48], rowGap: tokens.spacing[16], width: "100%", maxWidth: WEB_MAX_WIDTH, alignSelf: "center", paddingHorizontal: tokens.spacing[80], paddingTop: tokens.spacing[32], paddingBottom: tokens.spacing[48] },
    heroWide: { flex: 1.6, borderRadius: tokens.radius.xxl, paddingTop: tokens.spacing[16], minHeight: 520 },
    breadcrumb: { width: "100%", flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    breadcrumbLink: { ...tokens.typography.bodyMedium, color: colors.m3.primary },
    breadcrumbText: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    breadcrumbSep: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    breadcrumbCurrent: { ...tokens.typography.bodyMedium, color: colors.m3.onSurface, flexShrink: 1 },
    safeMeetingCard: { flexDirection: "row", gap: tokens.spacing[12], padding: tokens.spacing[16], borderRadius: tokens.radius.medium, backgroundColor: colors.m3.surfaceContainer },
    safeMeetingText: { flex: 1, gap: tokens.spacing[2] },
    safeMeetingTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    safeMeetingBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    contentWide: { flex: 1, maxWidth: 440, padding: tokens.spacing[24], borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: colors.m3.outlineVariant, backgroundColor: colors.m3.surfaceContainerLow },
    bottomBarWide: { paddingHorizontal: 0, paddingVertical: 0 },
    hero: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderBottomLeftRadius: tokens.radius.xxl,
      borderBottomRightRadius: tokens.radius.xxl,
      paddingHorizontal: tokens.spacing[16],
      paddingBottom: tokens.spacing[24],
    },
    heroBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    heroBarTrailing: { flexDirection: "row", gap: tokens.spacing[8] },
    heroIconButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.shapeMorph.buttonRest,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    heroIconButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      transform: [{ scale: 0.92 }],
    },
    coverArea: {
      position: "relative",
      alignItems: "center",
      paddingTop: tokens.spacing[8],
      paddingBottom: tokens.spacing[8],
    },
    coverAreaWide: { flex: 1, justifyContent: "center", paddingTop: 0 },
    hintBadgeHero: {
      position: "absolute",
      right: tokens.spacing[16],
      bottom: tokens.spacing[8],
      backgroundColor: "rgba(0, 0, 0, 0.60)",
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      zIndex: 20,
    },
    hintTextHero: {
      color: "#FFFFFF",
      fontFamily: fontFamily.medium,
      fontSize: tokens.fontSize[11] ?? 11,
      letterSpacing: 0.3,
    },
    // A área da capa na web larga tem ~520 px de altura; a capa de 218 px ficava perdida nela.
    photosLink: { alignSelf: "center", minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[16] },
    photosLinkText: { ...tokens.typography.labelLarge, fontFamily: fontFamily.semiBold, color: colors.m3.primary, textDecorationLine: "underline" },
    thumbRow: { flexDirection: "row", gap: tokens.spacing[12], marginTop: tokens.spacing[16] },
    thumb: { width: 56, height: 72, borderRadius: tokens.radius.small, overflow: "hidden", borderWidth: 2, borderColor: "transparent", backgroundColor: colors.m3.surfaceContainerLowest },
    thumbActive: { borderColor: colors.m3.primary },
    thumbImage: { width: "100%", height: "100%" },
    photoDots: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    dot: { width: 6, height: 6, borderRadius: tokens.radius.micro, backgroundColor: colors.m3.outlineVariant },
    dotActive: { backgroundColor: colors.m3.onSurface },
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
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.spacing[56],
    },
    detailRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.m3.outlineVariant },
    detailIcon: {
      width: tokens.spacing[32],
      height: tokens.spacing[32],
      borderRadius: tokens.radius.small,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    detailLabel: { flex: 1, ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    detailValue: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant, maxWidth: "50%" },
    synopsisSection: { gap: tokens.spacing[8] },
    synopsisTitle: { ...tokens.typography.titleMedium, fontFamily: fontFamily.semiBold, color: colors.m3.onSurface },
    synopsisText: { ...tokens.typography.subheadline, lineHeight: tokens.lineHeight[23], color: colors.m3.onSurfaceVariant },
    descriptionText: { ...tokens.typography.bodyLarge, color: colors.m3.onSurface },
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      paddingHorizontal: tokens.spacing[16],
      minHeight: tokens.spacing[64],
    },
    sellerInfo: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], flex: 1 },
    sellerTextCol: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[8] },
    sellerName: { flexShrink: 1, ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.medium, color: colors.m3.onSurface },
    sellerMeta: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
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
    tonalButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
      paddingHorizontal: tokens.spacing[16],
    },
    tonalButtonText: { ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    primarySlot: { flex: 1 },
    statusPill: { alignItems: "center", justifyContent: "center", minHeight: 52 },
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
    reserved: { ...tokens.typography.labelLarge, color: colors.m3.onTertiaryContainer, backgroundColor: colors.m3.tertiaryContainer, paddingHorizontal: tokens.spacing[16], paddingVertical: tokens.spacing[8], borderRadius: tokens.radius.full, overflow: "hidden" },
    requested: { ...tokens.typography.bodyMedium, color: colors.action, fontWeight: tokens.fontWeight.semiBold },
    requestError: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
