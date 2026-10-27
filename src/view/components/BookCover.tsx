import { useEffect, useMemo, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useBookCoverImage } from "@/viewmodel/useBookCoverImage";

export type BookCoverVariant = "list" | "card" | "carousel" | "detail";

export type BookCoverProps = {
  id: string;
  title: string;
  author?: string;
  photoUrl?: string;
  variant?: BookCoverVariant;
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
  testID?: string;
};

const COVER_COLORS = [
  tokens.colors.cover.blue,
  tokens.colors.cover.brown,
  tokens.colors.cover.green,
  tokens.colors.cover.wine,
  tokens.colors.cover.ochre,
] as const;
/** Proporção da capa no Figma (`02.01`, `02.02`): 55x88dp e 74x119dp, ambas em 5:8. */
const ASPECT_RATIO = 5 / 8;
/** Largura canônica de capa em listas no Figma (`05.01`, `02.06`, `04.08`: 55x88dp). */
const LIST_WIDTH = 56;
/** Capa dentro do card de carrossel da Home (`02.01`: 74x119dp). */
const CARD_WIDTH = 74;
/** Preenche a largura do card de carrossel da Home (`CAROUSEL_ITEM_WIDTH`). */
const CAROUSEL_WIDTH = 152;
/**
 * Capa de destaque no detalhe do anúncio. O Figma (`03.01`) usa 97x155dp, mas na prática a capa
 * ficava perdida na área de destaque; 136x218dp mantém a proporção 5:8 com título legível.
 */
const DETAIL_WIDTH = 136;

const VARIANT_WIDTH: Record<BookCoverVariant, number> = {
  list: LIST_WIDTH,
  card: CARD_WIDTH,
  carousel: CAROUSEL_WIDTH,
  detail: DETAIL_WIDTH,
};

function hashId(id: string): number {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/**
 * Capa de anúncio: foto real resiliente com cache em memória, timeout, retry e skeleton
 * progressivo (Spec 040, ADR 0034), ou capa ilustrativa determinística do design system.
 */
export function BookCover({
  id,
  title,
  author,
  photoUrl,
  variant = "list",
  timeoutMs,
  maxRetries,
  initialBackoffMs,
  testID,
}: BookCoverProps) {
  const {
    isLoading,
    isLoaded,
    hasFailed,
    retryKey,
    onLoad,
    onError,
  } = useBookCoverImage({
    url: photoUrl,
    timeoutMs,
    maxRetries,
    initialBackoffMs,
  });

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const backgroundColor = COVER_COLORS[hashId(id) % COVER_COLORS.length];
  const width = VARIANT_WIDTH[variant] ?? LIST_WIDTH;
  const height = width / ASPECT_RATIO;
  // Capa de lista no Figma (`02.02`, `05.01`) tem 56x80dp e não comporta texto legível; o título já
  // aparece na própria linha, então só o card grande e o detalhe repetem o texto sobre a ilustração.
  const showText = variant === "card" || variant === "detail";

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isLoading) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isLoading, pulseAnim]);

  // Se tem foto e não falhou definitivamente
  if (photoUrl && !hasFailed) {
    if (isLoaded) {
      return (
        <View testID={testID} style={[styles.cover, { width, height }]}>
          <Image
            source={{ uri: photoUrl }}
            accessibilityRole="image"
            accessibilityLabel={`Foto da capa de ${title}`}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        </View>
      );
    }

    // Estado de carregamento: imagem sendo baixada + skeleton progressivo
    return (
      <View testID={testID} style={[styles.cover, { width, height }]}>
        <Image
          key={`cover-${photoUrl}-${retryKey}`}
          source={{ uri: photoUrl }}
          accessibilityRole="image"
          accessibilityLabel={`Foto da capa de ${title}`}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, styles.hiddenImage]}
          onLoad={onLoad}
          onError={onError}
        />
        <Animated.View
          testID="book-cover-skeleton"
          accessibilityRole="image"
          accessibilityLabel={`Carregando capa de ${title}`}
          style={[StyleSheet.absoluteFill, styles.skeleton, { opacity: pulseAnim }]}
        />
      </View>
    );
  }

  // Fallback gracioso: capa ilustrativa padronizada do design system
  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={`Capa ilustrativa de ${title}`}
      style={[styles.cover, { backgroundColor, width, height }]}
    >
      {showText ? (
        <View style={[styles.textOverlay, variant === "detail" && styles.textOverlayDetail]} accessible={false}>
          <Text style={[styles.title, variant === "detail" && styles.titleDetail]} numberOfLines={variant === "detail" ? 4 : 3}>
            {title}
          </Text>
          {author ? (
            <Text style={[styles.author, variant === "detail" && styles.authorDetail]} numberOfLines={2}>
              {author}
            </Text>
          ) : null}
        </View>
      ) : (
        // Capa de lista sem foto: a inicial do título dá identidade ao bloco, em vez de um retângulo liso.
        <Text accessible={false} style={styles.initial}>
          {title.trim().charAt(0).toLocaleUpperCase("pt-BR")}
        </Text>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    cover: {
      // Figma `02.02`: capa com canto praticamente reto (raio ~2dp).
      borderRadius: tokens.radius.extraSmall,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    initial: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: "center",
      textAlignVertical: "center",
      fontFamily: fontFamily.brand,
      fontSize: 28,
      color: "rgba(255,255,255,0.85)",
    },
    skeleton: {
      backgroundColor: colors.disabledBackground,
      borderRadius: tokens.radius.extraSmall,
    },
    hiddenImage: {
      opacity: 0,
    },
    textOverlay: {
      padding: tokens.spacing[8],
    },
    textOverlayDetail: {
      padding: tokens.spacing[16],
      gap: tokens.spacing[8],
    },
    titleDetail: {
      fontFamily: fontFamily.brand,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "700",
    },
    authorDetail: {
      fontSize: 13,
      lineHeight: 17,
      opacity: 0.9,
    },
    title: {
      color: tokens.colors.cover.text,
      // Capa de 74 dp: 11 dp/14 dp cabem em três linhas sem truncar títulos curtos.
      fontSize: 11,
      lineHeight: 14,
      fontFamily: tokens.typography.labelMedium.fontFamily,
    },
    author: {
      color: tokens.colors.cover.text,
      fontSize: 11,
    },
  });
}

export default BookCover;
