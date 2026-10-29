import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";

export type ShelfRowProps = {
  book: Book;
  summary: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** Linha da estante: capa, título, resumo e seta de avanço, como em `05.01` e `05.03`. */
export function ShelfRow({ book, summary, accessibilityLabel, onPress }: ShelfRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.row}
    >
      <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{book.title}</Text>
        <Text style={styles.rowSummary}>{summary}</Text>
      </View>
      <AppIcon name="chevronRight" size={24} color={colors.secondaryText} />
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
      paddingVertical: tokens.spacing[12],
    },
    rowText: { flex: 1, gap: tokens.spacing[4] },
    rowTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
    },
    rowSummary: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
  });
}
