import {
  Platform,
  type PressableStateCallbackType,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { expressivePressedStyle, webFocusRing } from "@/view/pressFeedback";
import { tokens, type ColorPalette } from "@/view/tokens";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";

type WebPressableState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

const webInteractiveBase: ViewStyle | null =
  Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as unknown as ViewStyle) : null;

export function withWebInteractive(
  baseStyle: StyleProp<ViewStyle>,
  hoverStyle: StyleProp<ViewStyle>,
  focusColor: string,
) {
  return ({ pressed, hovered, focused }: WebPressableState): StyleProp<ViewStyle> => {
    const focus = Platform.OS === "web" && focused && !pressed ? webFocusRing(focusColor) : null;
    if (pressed) {
      return webInteractiveBase
        ? [webInteractiveBase, baseStyle, expressivePressedStyle]
        : [baseStyle, expressivePressedStyle];
    }
    if (Platform.OS === "web" && hovered) {
      return [webInteractiveBase, focus, baseStyle, hoverStyle];
    }
    return webInteractiveBase ? [webInteractiveBase, focus, baseStyle] : baseStyle;
  };
}

export function createNotificationsStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background, minHeight: 0 },
    sectionHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[8],
    },
    sectionHeader: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.bold,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    sectionCountBadge: {
      ...tokens.typography.labelSmall,
      fontSize: 11,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
      backgroundColor: colors.m3.surfaceContainerHigh,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
    },
    sectionHeaderLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      opacity: 0.6,
    },
    content: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[8],
    },
    permissionBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderLeftWidth: 4,
      borderLeftColor: colors.highlight,
      borderRadius: tokens.radius.cardSmall,
      padding: tokens.spacing[14],
      marginBottom: tokens.spacing[12],
      gap: tokens.spacing[10],
    },
    permissionIconCircle: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    permissionTextContainer: {
      flex: 1,
      minWidth: 0,
    },
    permissionBannerTitle: {
      ...tokens.typography.labelLarge,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
      marginBottom: 2,
    },
    permissionBannerDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    // Controle para reabrir o aviso explicativo depois de uma recusa (Spec 127).
    permissionBannerAction: { marginTop: tokens.spacing[10], maxWidth: 320 },
    flexOne: { flex: 1, minHeight: 0 },
    contentWide: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[12],
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      columnGap: tokens.spacing[32],
      rowGap: tokens.spacing[16],
    },
    // Aviso de permissão ocupa a linha inteira; filtros e lista ficam lado a lado abaixo dele.
    permissionBannerWide: { width: "100%", marginBottom: 0 },
    main: {
      flex: 1,
      minWidth: 0,
      maxWidth: 860,
      alignSelf: "stretch",
      minHeight: 0,
    },
    // Sem barra lateral (lista vazia, carregamento ou erro), o conteúdo ocupa a linha toda e centraliza.
    mainSolo: {
      width: "100%",
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      minHeight: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingSolo: {
      maxWidth: 860,
      alignSelf: "center",
    },
    filterBarWide: {
      width: 280,
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
      gap: tokens.spacing[12],
      marginBottom: 0,
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    sidebarSectionLabel: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.bold,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      paddingHorizontal: tokens.spacing[4],
    },
    sidebarDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      opacity: 0.7,
      marginVertical: tokens.spacing[4],
    },
    filterTabsWide: { flexDirection: "column", gap: tokens.spacing[6] },
    filterChipWide: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: tokens.spacing[14],
      borderRadius: tokens.radius.cardSmall,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: "transparent",
    },
    filterBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[14],
      flexWrap: "wrap",
      rowGap: tokens.spacing[10],
      columnGap: tokens.spacing[8],
    },
    filterTabs: {
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    filterChip: {
      minHeight: tokens.spacing[40],
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    filterChipHover: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    filterChipActive: {
      backgroundColor: colors.nature.foliage,
      borderColor: colors.nature.foliage,
    },
    filterChipActiveHover: {
      backgroundColor: colors.nature.foliageDeep,
      borderColor: colors.nature.foliageDeep,
    },
    filterChipText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onSurfaceVariant,
      fontWeight: tokens.fontWeight.medium,
    },
    filterChipTextActive: {
      color: colors.nature.onFoliage,
      fontWeight: tokens.fontWeight.semiBold,
    },
    filterCountBadge: {
      minWidth: 26,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    filterCountBadgeAlert: {
      backgroundColor: colors.ipe.container,
    },
    filterCountBadgeActive: {
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    filterCountBadgeText: {
      ...tokens.typography.labelSmall,
      fontSize: 12,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onSurfaceVariant,
    },
    filterCountBadgeAlertText: {
      color: colors.ipe.onContainer,
    },
    filterCountBadgeTextActive: {
      color: colors.text,
    },
    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      flexWrap: "wrap",
    },
    actionButtonsRowWide: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: tokens.spacing[8],
    },
    actionBtn: {
      minHeight: tokens.spacing[40],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    actionBtnWide: {
      minHeight: 40,
      borderRadius: tokens.radius.cardSmall,
      paddingHorizontal: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLowest,
      justifyContent: "flex-start",
    },
    actionBtnPrimary: {
      backgroundColor: colors.soft,
      borderColor: colors.m3.secondaryContainer,
    },
    actionBtnHover: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    actionBtnPrimaryHover: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    actionBtnDangerHover: {
      backgroundColor: colors.errorContainer,
      borderColor: colors.error,
    },
    actionBtnText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
    actionBtnSecondaryText: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.medium,
    },
    actionBtnDangerText: {
      ...tokens.typography.labelMedium,
      color: colors.error,
      fontWeight: tokens.fontWeight.medium,
    },
    wideHeader: {
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[14],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
    },
    wideHeaderLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    wideHeaderTextGroup: {
      flex: 1,
      minWidth: 0,
    },
    wideBackButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    wideBackButtonHover: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    wideTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    wideSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[2],
    },
    refreshButton: {
      minHeight: 38,
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    refreshButtonHover: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    refreshButtonDisabled: {
      opacity: 0.6,
    },
    refreshButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.text,
      fontWeight: tokens.fontWeight.medium,
    },
    centered: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    centeredWide: {
      paddingVertical: tokens.spacing[40],
    },
    emptyState: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      paddingVertical: tokens.spacing[48],
      gap: tokens.spacing[12],
    },
    emptyStateWide: {
      maxWidth: 560,
      width: "100%",
      alignSelf: "center",
      paddingVertical: tokens.spacing[24],
    },
    emptyStateSolo: {
      paddingTop: tokens.spacing[48],
      paddingBottom: tokens.spacing[56],
    },
    emptyCard: {
      width: "100%",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    emptyCardWide: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      paddingHorizontal: tokens.spacing[40],
      paddingVertical: tokens.spacing[48],
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.container,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[8],
    },
    emptyHeadline: {
      ...tokens.typography.titleLarge,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
      textAlign: "center",
    },
    emptyDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 20,
    },
    textCentered: {
      textAlign: "center",
    },
    buttonWrapper: {
      marginTop: tokens.spacing[12],
      width: "100%",
      maxWidth: 320,
    },
    listContent: {
      paddingBottom: tokens.spacing[32],
      gap: tokens.spacing[12],
    },
    card: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    unreadStripe: {
      width: 4,
      backgroundColor: colors.action,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      padding: tokens.spacing[16],
      gap: tokens.spacing[10],
    },
    cardBodyHover: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    cardUnread: {
      borderColor: colors.m3.secondaryContainer,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[12],
    },
    cardTitleContainer: {
      flex: 1,
      minWidth: 0,
      gap: tokens.spacing[4],
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    cardTitle: {
      ...tokens.typography.titleMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
      flexShrink: 1,
    },
    cardTitleUnread: {
      fontWeight: tokens.fontWeight.bold,
      color: colors.actionDeep,
    },
    novaBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.primaryContainer,
    },
    novaBadgeText: {
      ...tokens.typography.labelSmall,
      fontSize: 11,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onPrimaryContainer,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: tokens.spacing[4],
    },
    typeBadge: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: 2,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    typeBadgeText: {
      ...tokens.typography.labelSmall,
      fontSize: 11,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.medium,
    },
    timeText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontSize: 12,
    },
    unreadDot: {
      width: 6,
      height: 6,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
    cardActions: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[6],
      paddingTop: tokens.spacing[14],
      paddingRight: tokens.spacing[14],
    },
    cardIconButton: {
      width: 34,
      height: 34,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    cardIconButtonPrimaryHover: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    cardIconButtonDangerHover: {
      backgroundColor: colors.errorContainer,
    },
    cardMessage: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 21,
    },
    cardFooter: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[4],
      marginTop: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    cardFooterUnread: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    actionHintText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
    },
    actionHintTextUnread: {
      color: colors.m3.onSecondaryContainer,
    },
  });
}
