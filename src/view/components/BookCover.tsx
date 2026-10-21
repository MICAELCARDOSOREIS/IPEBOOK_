import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useBookCoverImage } from "@/viewmodel/useBookCoverImage";

export type BookCoverVariant = "list" | "card";

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
const ASPECT_RATIO = 120 / 170;
const LIST_WIDTH = 44;
const CARD_WIDTH = 96;

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

  const backgroundColor = COVER_COLORS[hashId(id) % COVER_COLORS.length];
  const width = variant === "card" ? CARD_WIDTH : LIST_WIDTH;
  const height = width / ASPECT_RATIO;
  const showText = variant === "card";

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
        <View style={styles.textOverlay} accessible={false}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {author ? (
            <Text style={styles.author} numberOfLines={1}>
              {author}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: tokens.radius.large,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  skeleton: {
    backgroundColor: tokens.colors.disabledBackground,
    borderRadius: tokens.radius.large,
  },
  hiddenImage: {
    opacity: 0,
  },
  textOverlay: {
    padding: tokens.spacing[8],
  },
  title: {
    color: tokens.colors.cover.text,
    ...tokens.typography.labelMedium,
  },
  author: {
    color: tokens.colors.cover.text,
    fontSize: 11,
  },
});

export default BookCover;
