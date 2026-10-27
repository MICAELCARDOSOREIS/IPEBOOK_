import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { BookCover } from "@/view/components/BookCover";
import { Tag } from "@/view/components/Tag";

export type OwnerListingsProps = {
  ownerId: string;
  ownerName: string;
  onOpenBook?: (bookId: string) => void;
};

/** "Anúncios de <nome>" do perfil público na web larga (Figma `03.04`): grade com os livros da pessoa. */
export function OwnerListings({ ownerId, ownerName, onOpenBook }: OwnerListingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [state] = useHomeViewModel();
  const books = state.books.filter((book) => book.ownerId === ownerId && book.status !== "draft");

  if (state.loading || books.length === 0) return null;

  return (
    <View style={styles.section} testID="owner-listings">
      <Text accessibilityRole="header" style={styles.title}>{`Anúncios de ${ownerName} (${books.length})`}</Text>
      <View style={styles.grid}>
        {books.map((book) => (
          <Pressable
            key={book.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${book.title}`}
            onPress={() => onOpenBook?.(book.id)}
            style={styles.card}
          >
            <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
            <Text style={styles.cardTitle} numberOfLines={1}>{book.title}</Text>
            <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
            <View style={styles.meta}>
              <Text style={styles.price}>
                {book.modality === "sale" && book.price ? formatPrice(book.price) : book.modality === "trade" ? "Para trocar" : "Gratuito"}
              </Text>
              <Tag variant={book.modality} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: { gap: tokens.spacing[16], marginTop: tokens.spacing[16] },
    title: { ...tokens.typography.titleMedium, fontSize: 20, lineHeight: 28, color: colors.m3.onSurface },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[16] },
    card: { width: 200, gap: 6, padding: 12, borderRadius: 20, backgroundColor: colors.m3.surfaceContainerLowest },
    cardTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    cardAuthor: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
    meta: { flexDirection: "row", alignItems: "center", gap: 8 },
    price: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
  });
}

export default OwnerListings;
