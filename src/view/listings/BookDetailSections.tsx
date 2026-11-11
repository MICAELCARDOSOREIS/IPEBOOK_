import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import type { PublicProfile } from "@/model/entities/publicProfile";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { Book3D } from "@/view/components/Book3D";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";

/** Texto usado enquanto o perfil carrega ou quando ele não pôde ser lido. */
const OWNER_FALLBACK_LABEL = "Anunciado por outro membro da comunidade";

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
  const styles = useMemo(() => createStyles(colors), [colors]);
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
            <AppIcon name="place" size={13} color={colors.nature.foliage} />
            <Text style={styles.sellerTrustText}>Ponto Seguro de Piripiri · Confirmação por QR Code</Text>
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
export function DetailRow({ icon, label, value, last = false }: { icon: AppIconName; label: string; value: string; last?: boolean }) {
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
  onShareWhatsApp: () => void;
  onShareLink: () => void;
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
  onBack,
  onShareWhatsApp,
  onShareLink,
  onToggleFavorite,
  onOpenGallery,
}: BookDetailHeroSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.hero,
        wideWeb ? styles.heroWide : { paddingTop: topInset + tokens.spacing[8] },
        heroBackgroundColor ? { backgroundColor: heroBackgroundColor } : null,
      ]}
    >
      <View style={styles.heroBar}>
        {wideWeb ? <View /> : <HeroIconButton icon="back" label="Voltar" onPress={onBack} />}
        <View style={styles.heroBarTrailing}>
          <HeroIconButton
            icon="whatsapp"
            label="Compartilhar anúncio no WhatsApp"
            disabled={sharing}
            iconColor={colors.nature.foliage}
            onPress={onShareWhatsApp}
          />
          <HeroIconButton
            icon="share"
            label="Compartilhar anúncio"
            disabled={sharing}
            onPress={onShareLink}
          />
          <HeroIconButton
            icon={isFavorite ? "heartFill" : "heart"}
            label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            disabled={favoriteLoading}
            iconColor={isFavorite ? colors.ipe.bloomDeep : undefined}
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
              scale={wideWeb ? 1.6 : 1}
            />
          </View>
          {photos.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver fotos do anúncio em tela cheia"
              onPress={onOpenGallery}
              hitSlop={8}
              style={withPress(styles.photosButton)}
            >
              <AppIcon name="camera" size={16} color={colors.m3.primary} />
              <Text style={styles.photosButtonText}>Ver fotos</Text>
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
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    heroWide: { flex: 1.6, borderRadius: tokens.radius.xxl, paddingTop: tokens.spacing[16], minHeight: 520 },
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
    sellerColumn: { flex: 1, gap: tokens.spacing[2], paddingVertical: tokens.spacing[8] },
    sellerTextCol: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[8] },
    sellerTrustRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    sellerTrustText: { ...tokens.typography.labelSmall, color: colors.nature.foliage, fontWeight: tokens.fontWeight.medium },
    sellerName: { flexShrink: 1, ...tokens.typography.bodyLarge, fontWeight: tokens.fontWeight.medium, color: colors.m3.onSurface },
    sellerMeta: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
  });
}
