import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

export type BookCoverVariant = "list" | "card";

export type BookCoverProps = {
  id: string;
  title: string;
  author?: string;
  photoUrl?: string;
  variant?: BookCoverVariant;
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

/** Capa de anúncio: foto real se disponível ou capa ilustrativa determinística do design system. */
export function BookCover({ id, title, author, photoUrl, variant = "list" }: BookCoverProps) {
  const [imageError, setImageError] = useState(false);
  const backgroundColor = COVER_COLORS[hashId(id) % COVER_COLORS.length];
  const width = variant === "card" ? CARD_WIDTH : LIST_WIDTH;
  const height = width / ASPECT_RATIO;
  const showText = variant === "card";

  if (photoUrl && !imageError) {
    return (
      <View style={[styles.cover, { width, height }]}>
        <Image
          source={{ uri: photoUrl }}
          accessibilityLabel={`Foto da capa de ${title}`}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={`Capa ilustrativa de ${title}`}
      style={[styles.cover, { backgroundColor, width, height }]}
    >
      {showText ? (
        <View style={styles.textOverlay} accessible={false}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {author ? <Text style={styles.author} numberOfLines={1}>{author}</Text> : null}
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
  textOverlay: { padding: tokens.spacing[8] },
  title: { color: tokens.colors.cover.text, ...tokens.typography.labelMedium },
  author: { color: tokens.colors.cover.text, fontSize: 11 },
});

export default BookCover;
