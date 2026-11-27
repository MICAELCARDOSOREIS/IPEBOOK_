import { type ComponentRef, type RefObject, useMemo, useRef } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { extractBookSidePhotos } from "@/model/bookPhotos";
import type { Book } from "@/model/entities/book";
import type { PublicProfile } from "@/model/entities/publicProfile";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { Book3D } from "@/view/components/Book3D";
import { BottomSheet } from "@/view/components/BottomSheet";
import { iosNeutralCardStyle } from "@/view/components/IosCardSurface";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { Snackbar } from "@/view/components/Snackbar";
import { triggerHaptic } from "@/view/haptics";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, fontFamily, tokens } from "@/view/tokens";
import type { ShareListingState } from "@/viewmodel/useShareListingViewModel";

/** Texto usado enquanto o perfil carrega ou quando ele não pôde ser lido. */
const OWNER_FALLBACK_LABEL = "Anunciado por outro membro da comunidade";

const detailSectionStylesCache = new WeakMap<ColorPalette, ReturnType<typeof createStyles>>();
function getDetailSectionStyles(colors: ColorPalette) {
  let cached = detailSectionStylesCache.get(colors);
  if (!cached) {
    cached = createStyles(colors);
    detailSectionStylesCache.set(colors, cached);
  }
  return cached;
}

/**
 * Card do anunciante (Figma `03.01 · O Pequeno Príncipe`, nó `Material 3 · Link · Anunciante`).
 */
export function SellerCard({
  profile,
  onPress,
}: {
  profile: PublicProfile | null;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = getDetailSectionStyles(colors);
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
        <View style={styles.sellerColumn}>
          <View style={styles.sellerTextCol}>
            <Text style={styles.sellerName}>{name || "Membro da comunidade"}</Text>
            <Text style={styles.sellerMeta}>{metaText}</Text>
          </View>
          <View style={styles.sellerTrustRow}>
            <View style={styles.sellerTrustIconBox}>
              <AppIcon name="place" size={13} color={colors.nature.foliage} />
            </View>
            <Text style={styles.sellerTrustText}>Ponto recomendado em Piripiri · Confirmação por QR Code</Text>
          </View>
        </View>
      </View>
      <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
    </Pressable>
  );
}

/** Botão de ícone tonal circular sobre a capa (M3 Expressive filled tonal icon button, 40 dp com 48 dp de toque). */
export function HeroIconButton({
  icon,
  label,
  onPress,
  disabled = false,
  iconColor,
  buttonRef,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  iconColor?: string;
  buttonRef?: RefObject<ComponentRef<typeof View> | null>;
}) {
  const { colors } = useTheme();
  const reduceTransparency = useOpaqueIosSurfaces();
  const isIos = Platform.OS === "ios";
  const iosGlass = isIos && !reduceTransparency;
  const styles = getDetailSectionStyles(colors);
  return (
    <Pressable
      ref={buttonRef}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={() => {
        if (isIos) triggerHaptic("selection");
        onPress();
      }}
      style={({ pressed }) => [
        styles.heroIconButton,
        isIos && (iosGlass ? styles.iosHeroIconGlass : styles.iosHeroIconOpaque),
        pressed && !disabled && styles.heroIconButtonPressed,
      ]}
    >
      {iosGlass ? (
        <IosGlassBackdrop isInteractive style={styles.iosHeroIconGlassShape} />
      ) : null}
      <AppIcon name={icon} size={22} color={iconColor ?? colors.m3.onSurface} />
    </Pressable>
  );
}

/** Linha da lista de detalhes (Figma `03.01`: ícone em selo, rótulo à esquerda, valor à direita). */
export function DetailRow({
  icon,
  label,
  value,
  last = false,
  containerColor,
  iconColor,
}: {
  icon: AppIconName;
  label: string;
  value: string;
  last?: boolean;
  containerColor?: string;
  iconColor?: string;
}) {
  const { colors } = useTheme();
  const styles = getDetailSectionStyles(colors);
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <View
        style={[
          styles.detailIcon,
          containerColor ? { backgroundColor: containerColor } : null,
        ]}
      >
        <AppIcon
          name={icon}
          size={18}
          color={iconColor ?? colors.m3.onSecondaryContainer}
        />
      </View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export type BookDetailHeroSectionProps = {
  book: Book | null;
  photos: readonly string[];
  wideWeb: boolean;
  topInset: number;
  heroBackgroundColor?: string;
  sharing: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onBack: () => void;
  onShareWhatsApp?: () => void;
  onShareLink: () => void;
  shareButtonRef?: RefObject<ComponentRef<typeof View> | null>;
  favoriteDisabled?: boolean;
  onToggleFavorite: () => void;
  onOpenGallery: () => void;
};

/**
 * Bloco hero de capa 3D, controles flutuantes e miniaturas do detalhe do anúncio.
 */
export function BookDetailHeroSection({
  book,
  photos,
  wideWeb,
  topInset,
  heroBackgroundColor,
  sharing,
  isFavorite,
  favoriteLoading,
  favoriteDisabled,
  onBack,
  onShareLink,
  shareButtonRef,
  onToggleFavorite,
  onOpenGallery,
}: BookDetailHeroSectionProps) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const styles = getDetailSectionStyles(colors);
  const sidePhotos = useMemo(() => extractBookSidePhotos(book?.photos), [book?.photos]);

  return (
    <View
      style={[
        styles.hero,
        wideWeb ? styles.heroWide : { paddingTop: topInset + tokens.spacing[8] },
        !wideWeb && heroBackgroundColor ? { backgroundColor: heroBackgroundColor } : null,
      ]}
    >
      <View
        style={[
          styles.heroStage,
          wideWeb && styles.heroStageWide,
          wideWeb && heroBackgroundColor ? { backgroundColor: heroBackgroundColor } : null,
        ]}
      >
        <View style={styles.heroBar}>
          {wideWeb ? <View /> : <HeroIconButton icon="back" label="Voltar" onPress={onBack} />}
          <View style={styles.heroBarTrailing}>
            <HeroIconButton
              icon="share"
              label="Compartilhar anúncio"
              disabled={sharing}
              onPress={onShareLink}
              buttonRef={shareButtonRef}
            />
            <HeroIconButton
              icon={isFavorite ? "heartFill" : "heart"}
              label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              disabled={favoriteLoading || favoriteDisabled}
              iconColor={isFavorite ? colors.ipe.bloom : undefined}
              onPress={onToggleFavorite}
            />
          </View>
        </View>

        {book ? (
          <View style={[styles.coverArea, wideWeb && styles.coverAreaWide]}>
            <View>
              <Book3D
                id={book.id}
                title={book.title}
                author={book.author}
                description={book.synopsis ?? book.description}
                publisher={book.publisher}
                pageCount={book.pageCount}
                photoUrl={book.photoUrl}
                spinePhotoUrl={sidePhotos.spinePhotoUrl}
                backPhotoUrl={sidePhotos.backPhotoUrl}
                scale={wideWeb ? 1.35 : 1}
              />
            </View>
            {photos.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver fotos do anúncio em tela cheia"
                onPress={onOpenGallery}
                hitSlop={8}
                style={withPress([styles.photosButton, iosGlass && styles.iosGlassPhotosButton])}
              >
                {iosGlass ? <IosGlassBackdrop isInteractive style={{ borderRadius: tokens.radius.full }} /> : null}
                <AppIcon name="camera" size={16} color={colors.m3.primary} />
                <Text style={styles.photosButtonText}>
                  {photos.length > 1 ? `Ver fotos (${photos.length})` : "Ver fotos"}
                </Text>
              </Pressable>
            ) : null}
            {photos.length > 1 && wideWeb ? (
              <View style={styles.thumbRow} accessibilityLabel={`${photos.length} fotos`}>
                {photos.map((url, idx) => (
                  <Pressable
                    key={`${url}-${idx}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver foto ${idx + 1} em tela cheia`}
                    onPress={onOpenGallery}
                    style={withPress([styles.thumb, idx === 0 && styles.thumbActive])}
                  >
                    <Image source={{ uri: url }} style={styles.thumbImage} resizeMode="cover" accessible={false} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function ShareListingFeedback({ state, onDismissCopied, onDismissError, shareButtonRef }: {
  state: ShareListingState;
  onDismissCopied: () => void;
  onDismissError: () => void;
  shareButtonRef: RefObject<ComponentRef<typeof View> | null>;
}) {
  const { colors } = useTheme();
  const styles = getDetailSectionStyles(colors);
  const linkRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { manualShareLink, linkCopied, error } = state;

  return (
    <>
      <Snackbar
        visible={!manualShareLink && (linkCopied || Boolean(error))}
        message={error ?? "Link copiado"}
        onDismiss={error ? onDismissError : onDismissCopied}
      />
      <BottomSheet
        visible={Boolean(manualShareLink)}
        onClose={onDismissError}
        onDismiss={() => shareButtonRef.current?.focus()}
        title="Compartilhar anúncio"
        showCloseButton
        initialFocusRef={linkRef}
      >
        <Text style={styles.manualShareHint}>Copie o link abaixo para compartilhar o anúncio.</Text>
        <TextInput
          ref={linkRef}
          accessibilityLabel="Link do anúncio"
          value={manualShareLink ?? ""}
          readOnly
          selectTextOnFocus
          style={styles.manualShareLink}
        />
      </BottomSheet>
    </>
  );
}

/** Cartão de denúncia do anúncio exibido no rodapé de detalhes para visitantes e leitores. */
export function BookDetailReportSection({
  onPress,
}: {
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const styles = getDetailSectionStyles(colors);

  return (
    <View style={styles.reportSection}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Denunciar anúncio"
        onPress={onPress}
        style={withPress([styles.reportCard, iosGlass && styles.iosGlassCard])}
      >
        {iosGlass ? <IosGlassBackdrop isInteractive style={styles.iosGlassCardShape} /> : null}
        <View style={styles.reportIconBox}>
          <AppIcon name="flag" size={18} color={colors.error} />
        </View>
        <View style={styles.reportContent}>
          <Text style={styles.reportTitle}>Denunciar anúncio</Text>
          <Text style={styles.reportSubtitle}>
            Conteúdo impróprio, dados falsos ou suspeita de golpe
          </Text>
        </View>
        <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    manualShareHint: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    manualShareLink: {
      // 16 px evita o zoom involuntário do Safari ao focar o campo (Spec 136).
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      borderRadius: tokens.radius.small,
      padding: tokens.spacing[12],
      marginTop: tokens.spacing[12],
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : {}),
    },
    heroWide: {
      flex: 1.15,
      minWidth: 380,
      borderRadius: tokens.radius.xxl,
      padding: tokens.spacing[20],
      minHeight: 500,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    heroStage: { flex: 1 },
    heroStageWide: {
      flex: 1,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing[20],
      justifyContent: "space-between",
    },
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
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.buttonRest,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    iosHeroIconGlass: {
      borderRadius: tokens.radius.full,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
      shadowColor: "#302e24",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
      overflow: "hidden",
    },
    iosHeroIconOpaque: {
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    iosHeroIconGlassShape: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
    },
    heroIconButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      transform: [{ scale: 0.96 }],
    },
    coverArea: { alignItems: "center", paddingTop: tokens.spacing[8], paddingBottom: tokens.spacing[8] },
    coverAreaWide: { flex: 1, justifyContent: "center", paddingTop: 0 },
    photosButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      alignSelf: "center",
      marginTop: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[14],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    photosButtonText: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.primary,
    },
    iosGlassPhotosButton: {
      borderCurve: "continuous",
      backgroundColor: "transparent",
      borderColor: "transparent",
      overflow: "hidden",
    },
    thumbRow: { flexDirection: "row", gap: tokens.spacing[12], marginTop: tokens.spacing[16] },
    thumb: { width: 56, height: 72, borderRadius: tokens.radius.small, overflow: "hidden", borderWidth: 2, borderColor: "transparent", backgroundColor: colors.m3.surfaceContainerLowest },
    thumbActive: { borderColor: colors.m3.primary },
    thumbImage: { width: "100%", height: "100%" },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.spacing[48],
      paddingVertical: tokens.spacing[8],
    },
    detailRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.book.paperEdge },
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
    sellerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[6],
      minHeight: tokens.spacing[64],
    },
    sellerInfo: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], flex: 1 },
    sellerColumn: { flex: 1, gap: tokens.spacing[2], paddingVertical: tokens.spacing[8] },
    sellerTextCol: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[8] },
    sellerTrustRow: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[4] },
    sellerTrustIconBox: { paddingTop: 2 },
    sellerTrustText: {
      flex: 1,
      flexShrink: 1,
      ...tokens.typography.labelSmall,
      color: colors.nature.foliage,
      fontWeight: tokens.fontWeight.medium,
    },
    sellerName: { flexShrink: 1, ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.medium, color: colors.m3.onSurface },
    sellerMeta: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    reportSection: { paddingTop: tokens.spacing[8], paddingBottom: tokens.spacing[16] },
    reportCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      gap: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      minHeight: 56,
      ...iosNeutralCardStyle(colors),
    },
    reportIconBox: {
      width: tokens.spacing[32],
      height: tokens.spacing[32],
      borderRadius: tokens.radius.cardSmall,
      backgroundColor: colors.m3.errorContainerM3 ?? colors.errorContainer ?? "#F9DEDC",
      alignItems: "center",
      justifyContent: "center",
    },
    reportContent: { flex: 1, gap: tokens.spacing[2] },
    reportTitle: { ...tokens.typography.labelLarge, fontFamily: fontFamily.semiBold, color: colors.m3.onSurface },
    reportSubtitle: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    iosGlassCard: {
      borderRadius: tokens.radius.xl,
      borderCurve: "continuous",
      backgroundColor: "transparent",
      borderColor: "transparent",
      overflow: "hidden",
    },
    iosGlassCardShape: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.xl,
      overflow: "hidden",
    },
  });
}
