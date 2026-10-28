import { useEffect, useMemo, useRef, type ReactNode } from "react";
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

const TONE = "rgba(245,239,232,0.22)";
const TONE_STRONG = "rgba(245,239,232,0.42)";
const SUN = tokens.colors.cover.sun;
const BLOSSOM = "#E8A0B4";

/** Bolinha posicionada pela fração da largura (`x`) e da altura da área (`y`); `d` é o diâmetro em fração da largura. */
function dot(w: number, h: number, x: number, y: number, d: number, color: string, key: string) {
  const size = w * d;
  return (
    <View
      key={key}
      style={{ position: "absolute", left: w * x - size / 2, top: h * y - size / 2, width: size, height: size, borderRadius: size, backgroundColor: color }}
    />
  );
}

/**
 * Motivo da capa ilustrativa (Figma "Capa ilustrativa" `39:1546`): estrelas, ondas, ipê ou sol com montanhas.
 * Desenhado com formas do próprio app, porque o Android não mostra `.svg` dentro de `Image`: antes a capa sem foto
 * aparecia como um retângulo liso.
 */
function CoverArt({ index, width, top, height }: { index: number; width: number; top: number; height: number }) {
  const kind = index % 4;
  let shapes: ReactNode;
  if (kind === 0) {
    // Céu de estrelas: pontos de tamanhos variados e uma estrela maior em ouro.
    const stars: Array<[number, number, number]> = [[0.2, 0.2, 0.05], [0.5, 0.1, 0.04], [0.78, 0.25, 0.06], [0.34, 0.5, 0.04], [0.64, 0.58, 0.05], [0.14, 0.78, 0.04], [0.86, 0.82, 0.04]];
    shapes = [...stars.map(([x, y, d], i) => dot(width, height, x, y, d, TONE_STRONG, `s${i}`)), dot(width, height, 0.5, 0.42, 0.14, SUN, "sol")];
  } else if (kind === 1) {
    // Ondas: fileiras de círculos vazados, cortados pela borda da área.
    const diameter = width * 0.34;
    shapes = [0, 1, 2, 3].flatMap((row) =>
      [0, 1, 2, 3, 4].map((col) => (
        <View
          key={`w${row}-${col}`}
          style={{
            position: "absolute",
            left: col * diameter * 0.6 - diameter * 0.35 + (row % 2) * diameter * 0.3,
            top: row * height * 0.22,
            width: diameter,
            height: diameter,
            borderRadius: diameter,
            borderWidth: Math.max(1, width * 0.018),
            borderColor: row === 0 ? TONE_STRONG : TONE,
          }}
        />
      )),
    );
  } else if (kind === 2) {
    // Ipê: tronco e copa de flores amarelas e rosadas.
    const trunk = width * 0.04;
    shapes = [
      <View key="tronco" style={{ position: "absolute", left: width / 2 - trunk / 2, top: height * 0.5, width: trunk, height: height * 0.5, backgroundColor: TONE_STRONG, borderRadius: trunk }} />,
      dot(width, height, 0.5, 0.3, 0.3, SUN, "c0"),
      dot(width, height, 0.33, 0.42, 0.22, BLOSSOM, "c1"),
      dot(width, height, 0.67, 0.42, 0.22, BLOSSOM, "c2"),
      dot(width, height, 0.42, 0.18, 0.16, BLOSSOM, "c3"),
      dot(width, height, 0.62, 0.2, 0.14, SUN, "c4"),
    ];
  } else {
    // Sol nascente entre montanhas (triângulos feitos com bordas).
    const mountain = (left: number, base: number, rise: number, color: string, key: string) => (
      <View
        key={key}
        style={{ position: "absolute", left, top: height - rise, width: 0, height: 0, borderLeftWidth: base / 2, borderRightWidth: base / 2, borderBottomWidth: rise, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color }}
      />
    );
    shapes = [
      dot(width, height, 0.66, 0.34, 0.2, SUN, "sol"),
      mountain(-width * 0.12, width * 0.7, height * 0.62, TONE, "m1"),
      mountain(width * 0.36, width * 0.8, height * 0.78, TONE_STRONG, "m2"),
    ];
  }
  return (
    <View pointerEvents="none" accessible={false} style={{ position: "absolute", left: 0, right: 0, top, height, overflow: "hidden" }}>
      {shapes}
    </View>
  );
}

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
      {/* Lombada: faixa escura e um filete claro, como na encadernação de um livro. */}
      <View pointerEvents="none" accessible={false} style={[styles.spine, { width: Math.max(4, width * 0.07) }]} />
      <CoverArt
        index={hashId(id)}
        width={width}
        top={showText ? height * 0.1 : height * 0.5}
        height={showText ? height * 0.42 : height * 0.4}
      />
      {showText ? (
        <View style={[styles.textOverlay, { paddingLeft: width * 0.07 + tokens.spacing[8] }, variant === "detail" && styles.textOverlayDetail]} accessible={false}>
          <Text style={[styles.title, variant === "detail" && styles.titleDetail]} numberOfLines={variant === "detail" ? 4 : 3}>
            {title}
          </Text>
          {author ? (
            <>
              <View style={[styles.rule, { width: width * 0.22 }]} />
              <Text style={[styles.author, variant === "detail" && styles.authorDetail]} numberOfLines={2}>
                {author}
              </Text>
            </>
          ) : null}
        </View>
      ) : (
        // Capa de lista sem foto: a inicial do título dá identidade ao bloco, em vez de um retângulo liso.
        <Text accessible={false} style={[styles.initial, { bottom: height * 0.5 }]}>
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
    spine: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.22)",
      borderRightWidth: 1,
      borderRightColor: "rgba(245,239,232,0.28)",
    },
    rule: {
      height: 1,
      backgroundColor: "rgba(245,239,232,0.5)",
      marginVertical: tokens.spacing[4],
    },
    initial: {
      position: "absolute",
      top: 0,
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
      fontFamily: fontFamily.brand,
      // Capa de 74 dp: 11 dp/14 dp cabem em três linhas sem truncar títulos curtos.
      fontSize: 11,
      lineHeight: 14,
    },
    author: {
      color: tokens.colors.cover.text,
      fontSize: 11,
    },
  });
}

export default BookCover;
