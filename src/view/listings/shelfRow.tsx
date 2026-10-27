import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag, type TagProps } from "@/view/components/Tag";

export type ShelfRowProps = {
  book: Book;
  summary: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** Web larga (Figma `05.01`): linha de tabela com a situação em etiqueta e a ação "Editar". */
  wide?: { statusVariant: TagProps["variant"]; statusLabel: string; offer: string };
};

/** Linha da estante: capa, título, resumo e seta de avanço, como em `05.01` e `05.03`. */
export function ShelfRow({ book, summary, accessibilityLabel, onPress, wide }: ShelfRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (wide) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[styles.row, styles.tableRow]}
      >
        <View style={styles.cellBook}>
          <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
          <View style={styles.rowText}>
            <Text style={styles.tableTitle} numberOfLines={1}>{book.title}</Text>
            <Text style={styles.rowSummary} numberOfLines={1}>{wide.offer}</Text>
          </View>
        </View>
        <View style={styles.cellStatus}>
          <Tag variant={wide.statusVariant} label={wide.statusLabel} />
        </View>
        <Text style={styles.cellAction}>Editar</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.row}
    >
      <ModalityCoverArea modality={book.modality}>
        <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
      </ModalityCoverArea>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.rowSummary} numberOfLines={2}>
          {summary}
        </Text>
      </View>
      <AppIcon name="chevronRight" size={24} color={colors.m3.onSurfaceVariant} />
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
    tableRow: { paddingHorizontal: tokens.spacing[16], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.m3.outlineVariant },
    cellBook: { flex: 3, flexDirection: "row", alignItems: "center", gap: tokens.spacing[16] },
    cellStatus: { flex: 1.5, alignItems: "flex-start" },
    cellAction: { width: 96, ...tokens.typography.labelLarge, color: colors.m3.primary },
    tableTitle: { ...tokens.typography.titleMedium, color: colors.m3.onSurface },
    rowTitle: {
      // Figma `05.01`: título do livro na serifada da marca, 18dp.
      fontFamily: fontFamily.brand,
      fontSize: 18,
      lineHeight: 24,
      color: colors.m3.onSurface,
    },
    rowSummary: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
