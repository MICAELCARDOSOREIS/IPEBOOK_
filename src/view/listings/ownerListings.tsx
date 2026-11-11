import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { makeHomeViewModel } from "@/di/container";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { withPress } from "@/view/pressFeedback";

export type OwnerListingsProps = {
  ownerId: string;
  ownerName: string;
  onOpenBook?: (bookId: string) => void;
  wideWeb?: boolean;
};

/** "Anúncios de <nome>" do perfil público (Figma `03.04`): grade com os livros da pessoa. */
export function OwnerListings({ ownerId, ownerName, onOpenBook, wideWeb = false }: OwnerListingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const [state, actions] = makeHomeViewModel();

  if (state.loading) return null;
  if (state.error) {
    return (
      <View style={styles.section} testID="owner-listings-error">
        <ErrorState message={state.error} onRetry={() => void actions.reload()} />
      </View>
    );
  }

  const books = state.books.filter((book) => book.ownerId === ownerId && book.status !== "draft");

  if (books.length === 0) return null;

  return (
    <View style={styles.section} testID="owner-listings">
      <View style={styles.headerRow}>
        <AppIcon name="shelf" size={20} color={colors.nature.foliage} />
        <Text accessibilityRole="header" style={styles.title}>{`Anúncios de ${ownerName} (${books.length})`}</Text>
      </View>
      <View style={styles.grid}>
        {books.map((book) => (
          <Pressable
            key={book.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${book.title}`}
            onPress={() => onOpenBook?.(book.id)}
            style={withPress(styles.card)}
          >
            <View style={styles.coverWrapper}>
              <BookCover id={book.id} title={book.title} author={book.author} photoUrl={book.photoUrl} variant="card" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
              <View style={styles.meta}>
                <Text style={[styles.price, book.modality === "sale" && styles.priceSale]}>
                  {book.modality === "sale" && book.price ? formatPrice(book.price) : book.modality === "trade" ? "Para trocar" : "Gratuito"}
                </Text>
                <Tag variant={book.modality} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    section: { gap: tokens.spacing[12], marginTop: tokens.spacing[16] },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    title: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[12],
      justifyContent: wideWeb ? "flex-start" : "space-between",
    },
    card: {
      width: wideWeb ? 180 : "48%",
      maxWidth: wideWeb ? 220 : "48.5%",
      flexGrow: 0,
      flexShrink: 0,
      gap: tokens.spacing[6],
      padding: tokens.spacing[10],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      elevation: 1,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    coverWrapper: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.medium,
      paddingVertical: tokens.spacing[8],
      overflow: "hidden",
    },
    cardInfo: {
      flex: 1,
      justifyContent: "space-between",
      gap: tokens.spacing[4],
    },
    cardTitle: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
      minHeight: 36,
    },
    cardAuthor: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontFamily: fontFamily.medium,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[4],
      paddingTop: tokens.spacing[6],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
      marginTop: tokens.spacing[4],
    },
    price: {
      ...tokens.typography.labelSmall,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
      fontVariant: ["tabular-nums"],
    },
    priceSale: {
      color: colors.nature.foliageDeep,
    },
  });
}

export default OwnerListings;
