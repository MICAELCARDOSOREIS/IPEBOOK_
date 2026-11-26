import React, { useRef, useState } from "react";
import { type GestureResponderEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { triggerHaptic } from "@/view/haptics";
import { formatPrice } from "@/view/formatPrice";
import { isMainTabsSwipeActive } from "@/view/mainTabsState";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
import { formatBookLocation } from "@/model/entities/location";
import { useTheme } from "@/view/theme/ThemeProvider";
import { getTouchOrigin, isDragPressRelease, type TouchOrigin } from "@/view/useGuardedPress";
import { useReduceTransparency } from "@/view/useReduceTransparency";
import { webColumnWidth } from "@/view/webLayout";

export type SearchBookCardProps = {
  item: Book;
  wideWeb: boolean;
  compactWeb?: boolean;
  gridColumns: number;
  userId: string | null;
  onPress: (bookId: string) => void;
  onFavoriteToggle: (selected: boolean, bookTitle?: string) => void;
};

const cardStylesCache = new WeakMap<ColorPalette, ReturnType<typeof createCardStyles>>();
function getCardStyles(colors: ColorPalette) {
  let cached = cardStylesCache.get(colors);
  if (!cached) {
    cached = createCardStyles(colors);
    cardStylesCache.set(colors, cached);
  }
  return cached;
}

function SearchBookCardComponent({
  item,
  wideWeb,
  compactWeb,
  gridColumns,
  userId,
  onPress,
  onFavoriteToggle,
}: SearchBookCardProps) {
  const { colors } = useTheme();
  const isIos = Platform.OS === "ios";
  const reduceTransparency = useReduceTransparency();
  const iosGlass = isIos && !reduceTransparency;
  const styles = getCardStyles(colors);
  const [isHovered, setIsHovered] = useState(false);
  const pressOriginRef = useRef<TouchOrigin | null>(null);

  const handlePressIn = (event?: GestureResponderEvent) => {
    pressOriginRef.current = getTouchOrigin(event);
  };

  const handleCardPress = (event?: GestureResponderEvent, withHaptic = true) => {
    const origin = pressOriginRef.current;
    pressOriginRef.current = null;
    if (isMainTabsSwipeActive() || isDragPressRelease(origin, event)) {
      return;
    }
    if (withHaptic && isIos) triggerHaptic("light");
    onPress(item.id);
  };

  const priceOrCondition =
    item.price != null
      ? formatPrice(item.price)
      : item.modality === "trade"
      ? "Por outro livro"
      : "Gratuito";

  const statusTone =
    item.status === "reserved"
      ? { background: colors.badge.reserved.background, text: colors.badge.reserved.text, label: "Reservado" }
      : item.status === "paused"
      ? { background: colors.badge.paused.background, text: colors.badge.paused.text, label: "Pausado" }
      : { background: colors.nature.sprout, text: colors.nature.foliageDeep, label: "Disponível" };

  const wideColumnMaxWidth =
    Platform.OS === "web"
      ? (`calc((100% - ${(gridColumns - 1) * tokens.spacing[24]}px) / ${gridColumns})` as unknown as `${number}%`)
      : webColumnWidth(gridColumns);

  return (
    <View
      style={[
        styles.card,
        isIos && (iosGlass ? styles.iosGlassCard : styles.iosOpaqueCard),
        wideWeb && styles.cardWide,
        wideWeb && isHovered && styles.cardWideHovered,
        wideWeb && { maxWidth: wideColumnMaxWidth },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}${item.neighborhood ? ` em ${item.neighborhood}` : ""}`}
        onPressIn={handlePressIn}
        onPress={(event) => handleCardPress(event, true)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => [
          styles.cardMain,
          wideWeb && styles.cardMainWide,
          pressed && styles.cardMainPressed,
        ]}
      >
        <ModalityCoverArea modality={item.modality}>
          <View style={styles.coverShadowWrap}>
            <BookCover
              id={item.id}
              title={item.title}
              photoUrl={item.photoUrl}
              variant={wideWeb ? "card" : "list"}
            />
          </View>
        </ModalityCoverArea>
        <View style={[styles.cardInfo, wideWeb && styles.cardInfoWide]}>
          <View style={styles.cardTopGroup}>
            <View style={[styles.cardMetaRow, wideWeb && styles.cardMetaRowWide]}>
              <View style={styles.cardBadgesGroup}>
                <Tag variant={item.modality} />
                {item.isBox ? (
                  <Tag
                    variant="box"
                    label={item.boxVolumesCount ? `Box (${item.boxVolumesCount} vols)` : "Box"}
                  />
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.priceText}>{priceOrCondition}</Text>
            </View>
            <View style={styles.cardTitleBlock}>
              <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.cardAuthor}>{item.author}</Text>
              {item.category ? <Text numberOfLines={1} style={styles.categoryBadge}>{item.category}</Text> : null}
            </View>
          </View>
          <View style={[styles.cardFooterRow, compactWeb && styles.cardFooterCompact]}>
            <View style={styles.cardLocationBadge}>
              <AppIcon name="place" size={13} color={colors.nature.foliageDeep} />
              <Text numberOfLines={compactWeb ? undefined : 1} style={styles.cardLocationText}>
                {formatBookLocation(item.neighborhood)}
              </Text>
            </View>
            <View style={[styles.cardStatusPill, { backgroundColor: statusTone.background }]}>
              <Text style={[styles.cardStatusPillText, { color: statusTone.text }]}>
                {statusTone.label}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
      <View style={[styles.cardActions, wideWeb && styles.cardActionsWide]}>
        <FavoriteButton
          bookId={item.id}
          userId={userId}
          variant={wideWeb ? "overlay" : "default"}
          onToggleSuccess={(selected) => onFavoriteToggle(selected, item.title)}
        />
        {!wideWeb ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.title}`}
            onPressIn={handlePressIn}
            onPress={(event) => handleCardPress(event, false)}
            style={styles.chevronButton}
          >
            <AppIcon name="chevronRight" size={18} color={colors.nature.foliage} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const SearchBookCard = React.memo(SearchBookCardComponent);
SearchBookCard.displayName = "SearchBookCard";

function createCardStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      paddingLeft: tokens.spacing[12],
      paddingRight: tokens.spacing[6],
      paddingVertical: tokens.spacing[12],
      marginBottom: tokens.spacing[12],
      elevation: 2,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      gap: tokens.spacing[8],
    },
    iosGlassCard: {
      borderRadius: tokens.radius.xl,
      borderCurve: "continuous",
      backgroundColor: tokens.glass.fill,
      borderColor: tokens.glass.stroke,
      shadowColor: "#362b1f",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    iosOpaqueCard: {
      borderRadius: tokens.radius.xl,
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderColor: tokens.ios.separator,
    },
    cardWide: {
      flex: 1,
      minWidth: 0,
      flexDirection: "column",
      alignItems: "stretch",
      backgroundColor: colors.surface,
      padding: tokens.spacing[14],
      marginHorizontal: 0,
      marginBottom: tokens.spacing[20],
      position: "relative",
      borderRadius: tokens.radius.xl,
      ...(Platform.OS === "web" ? ({ transitionProperty: "transform, box-shadow, border-color", transitionDuration: "150ms" } as never) : {}),
    },
    cardWideHovered: {
      borderColor: colors.m3.outline,
      elevation: 4,
      shadowOpacity: 0.14,
      shadowRadius: 12,
    },
    cardMain: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    cardMainWide: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: tokens.spacing[10],
    },
    cardMainPressed: {
      transform: [{ scale: 0.985 }],
    },
    coverShadowWrap: {
      borderRadius: tokens.radius.cardSmall,
      elevation: 5,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.24,
      shadowRadius: 6,
    },
    cardInfo: {
      flex: 1,
      minWidth: 0,
      gap: tokens.spacing[6],
      justifyContent: "center",
    },
    cardInfoWide: {
      justifyContent: "space-between",
      paddingRight: 0,
      gap: tokens.spacing[10],
    },
    cardTopGroup: {
      gap: tokens.spacing[6],
    },
    cardTitleBlock: {
      gap: 2,
    },
    cardTitle: {
      ...tokens.typography.brandCardTitle,
      fontSize: 15,
      lineHeight: 20,
      color: colors.m3.onSurface,
    },
    cardAuthor: {
      ...tokens.typography.bodyMedium,
      fontSize: 13,
      lineHeight: 17,
      color: colors.m3.onSurfaceVariant,
    },
    categoryBadge: {
      ...tokens.typography.captionSmall,
      color: colors.brandBrown,
      fontWeight: tokens.fontWeight.medium,
      paddingTop: 2,
    },
    cardMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: tokens.spacing[6],
    },
    cardMetaRowWide: {
      flexWrap: "wrap",
      rowGap: tokens.spacing[4],
    },
    cardBadgesGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[6],
    },
    cardFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "nowrap",
      gap: tokens.spacing[6],
      paddingTop: tokens.spacing[8],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.book.paperEdge,
    },
    cardFooterCompact: { flexDirection: "column", alignItems: "flex-start" },
    cardLocationBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      flexShrink: 1,
    },
    cardLocationText: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      flexShrink: 1,
    },
    cardStatusPill: {
      flexShrink: 0,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
    },
    cardStatusPillText: {
      ...tokens.typography.captionSmall,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: tokens.fontWeight.bold,
    },
    priceText: {
      ...tokens.typography.labelLarge,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: tokens.fontWeight.bold,
      fontVariant: ["tabular-nums"],
      color: colors.nature.foliageDeep,
    },
    cardActions: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "stretch",
      width: tokens.accessibility.touchTarget,
    },
    cardActionsWide: {
      position: "absolute",
      top: tokens.spacing[12],
      right: tokens.spacing[12],
      flexDirection: "row",
      width: "auto",
      height: "auto",
      alignSelf: "auto",
      zIndex: 2,
    },
    chevronButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
