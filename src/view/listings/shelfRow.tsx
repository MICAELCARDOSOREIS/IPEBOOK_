import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag, type TagProps } from "@/view/components/Tag";

import { withPress } from "@/view/pressFeedback";
export type ShelfRowProps = {
  book: Book;
  summary: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** Web larga (Figma `05.01`): linha de tabela com a situação em etiqueta e a ação "Editar". */
  wide?: { statusVariant: TagProps["variant"]; statusLabel: string; offer: string; actionLabel?: string };
};

/** Linha da estante: capa, título, resumo e seta de avanço, como em `05.01` e `05.03`. */
export function ShelfRow({ book, summary, accessibilityLabel, onPress, wide }: ShelfRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (wide) {
    const actionText = wide.actionLabel ?? "Editar";
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={withPress([styles.row, styles.tableRow])}
      >
        <View style={styles.cellBook}>
          <ModalityCoverArea modality={book.modality}>
            <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" />
          </ModalityCoverArea>
          <View style={styles.rowText}>
            <View style={styles.titleRow}>
              <Text style={styles.tableTitle} numberOfLines={1}>
                {book.title}
              </Text>
              {book.isBox ? (
                <Tag
                  variant="box"
                  label={book.boxVolumesCount ? `Box (${book.boxVolumesCount} vols)` : "Box"}
                />
              ) : null}
            </View>
            {book.author ? (
              <Text style={styles.tableAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.cellModality}>
          <Tag variant={book.modality} />
          {wide.offer && wide.offer !== book.modality ? (
            <Text style={styles.cellPrice} numberOfLines={1}>
              {wide.offer}
            </Text>
          ) : null}
        </View>
        <View style={styles.cellNeighborhood}>
          <AppIcon name="place" size={14} color={colors.m3.onSurfaceVariant} />
          <Text style={styles.cellNeighborhoodText} numberOfLines={1}>
            {book.neighborhood || "Piripiri"}
          </Text>
        </View>
        <View style={styles.cellStatus}>
          <Tag variant={wide.statusVariant} label={wide.statusLabel} />
        </View>
        <View style={styles.cellActionBox}>
          <View style={styles.actionButton}>
            <Text style={styles.cellAction}>{actionText}</Text>
            <AppIcon name="chevronRight" size={16} color={colors.m3.primary} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
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
      borderRadius: tokens.shapeMorph.cardRest,
    },
    rowPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.shapeMorph.cardPressed,
      transform: [{ scale: 0.985 }],
    },
    rowText: { flex: 1, gap: tokens.spacing[4] },
    titleRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    tableRow: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    cellBook: { flex: 3, minWidth: 220, flexDirection: "row", alignItems: "center", gap: tokens.spacing[16] },
    cellModality: { flex: 1.5, minWidth: 120, alignItems: "flex-start", gap: tokens.spacing[4] },
    cellPrice: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSurface },
    cellNeighborhood: { flex: 1.5, minWidth: 120, flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    cellNeighborhoodText: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    cellStatus: { flex: 1.2, minWidth: 100, alignItems: "flex-start" },
    cellActionBox: { width: 110, alignItems: "flex-end" },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    cellAction: { ...tokens.typography.labelMedium, fontWeight: tokens.fontWeight.semiBold, color: colors.m3.onSecondaryContainer },
    tableTitle: { ...tokens.typography.brandCardTitle, color: colors.m3.onSurface },
    tableAuthor: { ...tokens.typography.footnote, color: colors.m3.onSurfaceVariant },
    rowTitle: {
      // Figma `05.01` / `02-tokens.md`: título do livro em linhas de lista usa `brandCardTitle`.
      ...tokens.typography.brandCardTitle,
      color: colors.m3.onSurface,
    },
    rowSummary: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}
