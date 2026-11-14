import { StyleSheet } from "react-native";
import { type ColorPalette, tokens } from "@/view/tokens";
import { WEB_GUTTER } from "@/view/webLayout";

/** Container na web larga (1080 px) mantém a coluna de leitura (~600 px após sidebar de 300 px) sem vazio à direita. */
export const SETTINGS_WIDE_CONTENT_MAX_WIDTH = 1080;

export function createSettingsStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    wideTopHeader: {
      width: "100%",
      maxWidth: SETTINGS_WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[12],
    },
    wideTopHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    wideBackButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
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
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    accountIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    accountInfo: { flex: 1, minWidth: 0, gap: tokens.spacing[2] },
    accountEyebrow: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.semiBold,
    },
    accountName: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.semiBold,
    },
    accountAction: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    accountActionText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSecondaryContainer,
      fontWeight: tokens.fontWeight.semiBold,
    },
    signOutRow: { alignItems: "center", paddingTop: tokens.spacing[4] },
    iconCircle: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    linkDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      marginLeft: 68,
    },
    linkPressed: { backgroundColor: colors.m3.surfaceContainerHigh },
    scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
    content: {
      width: "100%",
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    contentWide: {
      maxWidth: SETTINGS_WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[48],
    },
    mainStacked: { gap: tokens.spacing[12] },
    // Coluna de leitura: as listas de opções não passam de ~720 px (no container de 1080 px,
    // a barra lateral de 300 px + vão já as deixam em ~600 px).
    main: { flex: 1, minWidth: 0, maxWidth: 720, gap: tokens.spacing[16] },
    sidebar: {
      width: 300,
      gap: tokens.spacing[16],
      // Fica visível enquanto a coluna principal rola (só existe na web).
      position: "sticky" as "relative",
      top: tokens.spacing[16],
    },
    accountCardWide: { flexDirection: "column", alignItems: "flex-start", gap: tokens.spacing[12] },
    // Na web larga o cartão é coluna: a pílula "Editar" fica ancorada à direita, sob o
    // bloco de texto, para não sobrar canto vazio no cartão.
    accountActionWide: { alignSelf: "flex-end" },
    sideNav: { gap: tokens.spacing[2] },
    sideNavItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
    },
    sideNavItemActive: { backgroundColor: colors.m3.surfaceContainerHigh },
    sideNavLabel: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    sideSignOut: { alignItems: "flex-start", paddingHorizontal: tokens.spacing[4] },
    sectionCard: {
      borderRadius: tokens.radius.xl,
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    sectionHeaderRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    sectionHeaderTextCol: {
      flex: 1,
      minWidth: 0,
      gap: tokens.spacing[2],
    },
    disclosureHeader: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
    },
    disclosureHeaderExpanded: {
      backgroundColor: colors.m3.surfaceContainer,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    sectionHeaderIcon: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.semiBold,
    },
    sectionSubtitle: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    chevronBadge: {
      width: tokens.spacing[32],
      height: tokens.spacing[32],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    chevronBadgeExpanded: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    sectionBodyList: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    sectionBodyCard: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    inlineFeedback: {
      paddingHorizontal: tokens.spacing[16],
      paddingBottom: tokens.spacing[12],
    },
    sectionDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    footer: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[20],
      lineHeight: tokens.lineHeight[20],
      marginTop: tokens.spacing[4],
    },
    feedbackSuccess: {
      ...tokens.typography.bodyMedium,
      color: colors.success,
    },
    feedbackError: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
    versionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[16],
    },
    versionLabel: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    versionValue: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      minHeight: 64,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      minHeight: 64,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
    },
    linkText: { flex: 1, gap: tokens.spacing[2] },
    linkLabel: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
    },
    linkDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: tokens.lineHeight[20],
    },
  });
}
