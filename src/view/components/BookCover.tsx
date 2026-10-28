import { useEffect, useMemo, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useBookCoverImage } from "@/viewmodel/useBookCoverImage";
import capaNoite from "@/view/assets/capas/capa-1.webp";
import capaArvore from "@/view/assets/capas/capa-2.webp";
import capaMontanhas from "@/view/assets/capas/capa-3.webp";
import capaOndas from "@/view/assets/capas/capa-4.webp";

export type BookCoverVariant = "list" | "card" | "carousel" | "detail";

export type BookCoverProps = {
  id: string;
  title: string;
  /** Aceito por compatibilidade: a capa ilustrativa é só arte, e o autor aparece ao lado dela. */
  author?: string;
  photoUrl?: string;
  variant?: BookCoverVariant;
  timeoutMs?: number;
  maxRetries?: number;
  initialBackoffMs?: number;
  testID?: string;
  /** Largura em dp que substitui a da variante (o livro 3D ampliado na web larga). */
  width?: number;
};

/** A cor de cada arte, na mesma ordem de `COVER_ARTS`: noite marrom, árvore petróleo, montanhas verdes e ondas azul-marinho. */
const COVER_BACKGROUNDS = ["#3A2A20", "#0F4B5B", "#2C5232", "#14284B"] as const;
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

const asSource = (art: number | string) => (typeof art === "string" ? { uri: art } : art);

/** Quatro capas ilustrativas, recortadas dos cadernos artesanais do design: noite, ondas, árvore e montanhas. */
const COVER_ARTS = [capaNoite, capaArvore, capaMontanhas, capaOndas] as const;
const GOLD = "#D9A93A";

/** Hash FNV-1a: espalha ids parecidos (uuid) entre os quatro desenhos; a soma dos caracteres repetia o mesmo. */
/** Cor da capa ilustrativa deste livro; também serve de cor da lombada e da contracapa no livro 3D. */
export function coverBackground(id: string): string {
  return COVER_BACKGROUNDS[hashId(id) % 4];
}

function hashId(id: string): number {
  let hash = 2166136261;
  for (const char of id) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Capa de anúncio: foto real resiliente com cache em memória, timeout, retry e skeleton
 * progressivo (Spec 040, ADR 0034), ou capa ilustrativa determinística do design system.
 */
export function BookCover({
  id,
  title,
  photoUrl,
  variant = "list",
  width: widthOverride,
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
  const kind = hashId(id) % 4;
  const backgroundColor = COVER_BACKGROUNDS[kind];
  const width = widthOverride ?? VARIANT_WIDTH[variant] ?? LIST_WIDTH;
  const height = width / ASPECT_RATIO;

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
      <Image source={asSource(COVER_ARTS[kind])} resizeMode="cover" accessible={false} style={{ position: "absolute", left: 0, top: 0, width, height }} />
      {/* Lombada: faixa escura com filetes dourados, como na encadernação do caderno. */}
      <View pointerEvents="none" accessible={false} style={[styles.spine, { width: Math.max(4, width * 0.06) }]}>
        {[0.07, 0.11, 0.87, 0.91].map((at) => (
          <View key={at} style={{ position: "absolute", left: 0, right: 0, top: height * at, height: 1, backgroundColor: GOLD }} />
        ))}
      </View>
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
    spine: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.22)",
      borderRightWidth: 1,
      borderRightColor: "rgba(245,239,232,0.28)",
    },
    skeleton: {
      backgroundColor: colors.disabledBackground,
      borderRadius: tokens.radius.extraSmall,
    },
    hiddenImage: {
      opacity: 0,
    },
  });
}

export default BookCover;
