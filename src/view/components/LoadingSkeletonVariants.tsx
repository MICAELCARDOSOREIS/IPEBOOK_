import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type LoadingSkeletonVariant =
  | "list"
  | "profile"
  | "publicProfile"
  | "catalog"
  | "homeCarousel"
  | "shelf"
  | "conversations"
  | "detail"
  | "manage"
  | "form";

export function LoadingSkeletonContent({ variant }: { variant: LoadingSkeletonVariant }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  switch (variant) {
    case "shelf":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-shelf">
          {/* 3 caixinhas de estatísticas (À venda | Em troca | Para doar) */}
          <View style={styles.shelfStatsRow}>
            <View style={[styles.shelfStatCard, { backgroundColor: colors.badge.sale.background }]}>
              <View style={[styles.block, styles.h24, styles.w35]} />
              <View style={[styles.blockSubtle, styles.h10, styles.w70]} />
            </View>
            <View style={[styles.shelfStatCard, { backgroundColor: colors.badge.trade.background }]}>
              <View style={[styles.block, styles.h24, styles.w35]} />
              <View style={[styles.blockSubtle, styles.h10, styles.w70]} />
            </View>
            <View
              style={[styles.shelfStatCard, { backgroundColor: colors.badge.donation.background }]}
            >
              <View style={[styles.block, styles.h24, styles.w35]} />
              <View style={[styles.blockSubtle, styles.h10, styles.w70]} />
            </View>
          </View>

          {/* Barra segmentada de 3 abas (Anúncios | Propostas | Concluídos) */}
          <View style={styles.shelfSegmentedBar}>
            <View style={styles.shelfSegmentActive}>
              <View style={[styles.blockOnPrimary, styles.h12, styles.w60]} />
            </View>
            <View style={styles.shelfSegmentInactive}>
              <View style={[styles.blockSubtle, styles.h12, styles.w60]} />
            </View>
            <View style={styles.shelfSegmentInactive}>
              <View style={[styles.blockSubtle, styles.h12, styles.w60]} />
            </View>
          </View>

          {/* Fileira de chips (Todos | Ativos | Pausados | Reservados) */}
          <View style={styles.chipsRow}>
            <View style={[styles.chipPillActive, styles.w76px]} />
            <View style={[styles.chipPillOutline, styles.w76px]} />
            <View style={[styles.chipPillOutline, styles.w88px]} />
            <View style={[styles.chipPillOutline, styles.w88px]} />
          </View>

          {/* Container agrupador de anúncios da Estante */}
          <View style={styles.shelfListCard}>
            <View style={[styles.block, styles.h16, styles.w35]} />
            {[0, 1].map((idx) => (
              <View
                key={idx}
                style={[styles.shelfBookRow, idx > 0 && styles.shelfBookRowDivider]}
              >
                <View style={styles.listThumbBox} />
                <View style={styles.linesCol}>
                  <View style={[styles.block, styles.h16, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w85]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
                </View>
                <View style={styles.shelfRowActions}>
                  <View style={styles.circleAction36} />
                  <View style={styles.chevronDot} />
                </View>
              </View>
            ))}
          </View>
        </View>
      );

    case "catalog":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-catalog">
          {/* Cabeçalho de contagem e ordenação ("12 livros" --- "Mais recentes") */}
          <View style={styles.catalogToolbarRow}>
            <View style={[styles.block, styles.h16, styles.w88px]} />
            <View style={[styles.blockSubtle, styles.h28, styles.w120px, styles.radiusFull]} />
          </View>

          {/* Lista de cards horizontais do Explorar */}
          {[0, 1, 2].map((idx) => (
            <View key={idx} style={styles.catalogHorizontalCard}>
              <View style={styles.catalogThumbBox} />
              <View style={styles.linesCol}>
                <View style={[styles.block, styles.h16, styles.w70]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w50]} />
                <View style={styles.inlineMetaRow}>
                  <View style={styles.modalityTagSkeleton} />
                  <View style={[styles.block, styles.h16, styles.w64px]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w52px]} />
                </View>
                <View style={[styles.blockSubtle, styles.h10, styles.w40]} />
              </View>
              <View style={styles.catalogRightActions}>
                <View style={styles.circleAction24} />
                <View style={styles.chevronDot} />
              </View>
            </View>
          ))}
        </View>
      );

    case "homeCarousel":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-homeCarousel">
          {/* Cabeçalho da seção ("Perto de você" + badge + "Ver todos") */}
          <View style={styles.catalogToolbarRow}>
            <View style={styles.inlineMetaRow}>
              <View style={[styles.block, styles.h22, styles.w140px]} />
              <View style={[styles.blockSubtle, styles.h22, styles.w36px, styles.radiusFull]} />
            </View>
            <View style={[styles.blockSubtle, styles.h16, styles.w76px]} />
          </View>

          {/* Fileira horizontal de cards verticais (168px) do carrossel */}
          <View style={styles.carouselRow}>
            {[0, 1, 2].map((idx) => (
              <View key={idx} style={styles.carouselVerticalCard}>
                <View style={styles.carouselCoverBox} />
                <View style={styles.inlineMetaRow}>
                  <View style={styles.modalityTagSkeleton} />
                  <View style={[styles.block, styles.h16, styles.w52px]} />
                </View>
                <View style={[styles.block, styles.h16, styles.w85]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w60]} />
                <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
              </View>
            ))}
          </View>
        </View>
      );

    case "profile":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-profile">
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.linesCol}>
                <View style={[styles.block, styles.h28, styles.w60]} />
                <View style={[styles.blockSubtle, styles.h16, styles.w80]} />
              </View>
              <View style={styles.profileAvatar} />
            </View>
            <View style={styles.profileMetricsRow}>
              {[0, 1, 2].map((idx) => (
                <View key={idx} style={styles.profileMetricItemWrap}>
                  {idx > 0 ? <View style={styles.metricDivider} /> : null}
                  <View style={styles.profileMetricBox}>
                    <View style={[styles.block, styles.h22, styles.w40]} />
                    <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.profileButtonsRow}>
              <View style={[styles.block, styles.pillButton]} />
              <View style={[styles.block, styles.pillButton]} />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={[styles.block, styles.h16, styles.w50]} />
            <View style={styles.badgesRow}>
              {[0, 1, 2].map((idx) => (
                <View key={idx} style={styles.badgeSkeletonCard}>
                  <View style={styles.badgeCircle} />
                  <View style={[styles.block, styles.h12, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={[styles.block, styles.h16, styles.w35]} />
            {[0, 1, 2].map((idx) => (
              <View key={idx} style={styles.menuRowSkeleton}>
                <View style={styles.menuIconBox} />
                <View style={styles.linesCol}>
                  <View style={[styles.block, styles.h16, styles.w60]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w80]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      );

    case "publicProfile":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-publicProfile">
          <View style={styles.publicProfileHeaderCard}>
            <View style={styles.publicAvatarCentered} />
            <View style={[styles.block, styles.h22, styles.w50]} />
            <View style={[styles.blockSubtle, styles.h12, styles.w35]} />
            <View style={[styles.blockSubtle, styles.h24, styles.w120px, styles.radiusFull]} />
          </View>
          <View style={styles.badgesRow}>
            {[0, 1, 2].map((idx) => (
              <View key={idx} style={styles.badgeSkeletonCard}>
                <View style={[styles.block, styles.h22, styles.w40]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
              </View>
            ))}
          </View>
          {[0, 1].map((idx) => (
            <View key={idx} style={styles.listCardSkeleton}>
              <View style={styles.listThumbBox} />
              <View style={styles.linesCol}>
                <View style={[styles.block, styles.h16, styles.w70]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w50]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w40]} />
              </View>
            </View>
          ))}
        </View>
      );

    case "conversations":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-conversations">
          {[0, 1, 2, 3, 4].map((idx) => (
            <View key={idx} style={styles.listCardSkeleton}>
              <View style={styles.avatarCircle48} />
              <View style={styles.linesCol}>
                <View style={styles.catalogToolbarRow}>
                  <View style={[styles.block, styles.h16, styles.w50]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w36px]} />
                </View>
                <View style={[styles.blockSubtle, styles.h12, styles.w85]} />
                <View style={styles.inlineMetaRow}>
                  <View style={styles.modalityTagSkeleton} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w40]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      );

    case "detail":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-detail">
          {/* Bloco de título, autor e preço abaixo da capa do livro */}
          <View style={styles.sectionBlock}>
            <View style={[styles.block, styles.h24, styles.w80]} />
            <View style={[styles.blockSubtle, styles.h16, styles.w50]} />
            <View style={styles.inlineMetaRow}>
              <View style={[styles.block, styles.h28, styles.w88px]} />
              <View style={[styles.blockSubtle, styles.h24, styles.w76px, styles.radiusFull]} />
            </View>
          </View>

          {/* Especificações do livro (Conservação, Categoria, Retirada) */}
          <View style={styles.shelfListCard}>
            {[0, 1, 2].map((idx) => (
              <View key={idx} style={styles.menuRowSkeleton}>
                <View style={styles.menuIconBox} />
                <View style={styles.linesCol}>
                  <View style={[styles.blockSubtle, styles.h10, styles.w35]} />
                  <View style={[styles.block, styles.h16, styles.w60]} />
                </View>
              </View>
            ))}
          </View>

          {/* Card do Anunciante (SellerCard) */}
          <View style={styles.listCardSkeleton}>
            <View style={styles.avatarCircle48} />
            <View style={styles.linesCol}>
              <View style={[styles.block, styles.h16, styles.w60]} />
              <View style={[styles.blockSubtle, styles.h12, styles.w40]} />
            </View>
            <View style={[styles.block, styles.h28, styles.w76px, styles.radiusFull]} />
          </View>
        </View>
      );

    case "manage":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-manage">
          <View style={styles.listCardSkeleton}>
            <View style={styles.catalogThumbBox} />
            <View style={styles.linesCol}>
              <View style={[styles.block, styles.h16, styles.w70]} />
              <View style={[styles.blockSubtle, styles.h12, styles.w50]} />
              <View style={styles.inlineMetaRow}>
                <View style={styles.modalityTagSkeleton} />
                <View style={[styles.blockSubtle, styles.h16, styles.w64px]} />
              </View>
            </View>
          </View>
          {[0, 1, 2, 3].map((idx) => (
            <View key={idx} style={styles.listCardSkeleton}>
              <View style={styles.menuIconBox} />
              <View style={styles.linesCol}>
                <View style={[styles.block, styles.h16, styles.w60]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w85]} />
              </View>
              <View style={styles.chevronDot} />
            </View>
          ))}
        </View>
      );

    case "form":
      return (
        <View style={styles.wrapper} testID="skeleton-variant-form">
          <View style={styles.sectionBlock}>
            <View style={[styles.block, styles.h24, styles.w60]} />
            <View style={[styles.blockSubtle, styles.h12, styles.w85]} />
          </View>
          {[0, 1, 2].map((idx) => (
            <View key={idx} style={styles.sectionBlock}>
              <View style={[styles.block, styles.h12, styles.w35]} />
              <View style={styles.formInputSkeleton} />
            </View>
          ))}
          <View style={styles.chipsRow}>
            <View style={[styles.chipPillActive, styles.w88px]} />
            <View style={[styles.chipPillOutline, styles.w88px]} />
            <View style={[styles.chipPillOutline, styles.w88px]} />
          </View>
          <View style={[styles.block, styles.pillButton]} />
        </View>
      );

    case "list":
    default:
      return (
        <View style={styles.wrapper} testID="skeleton-variant-list">
          {[0, 1, 2].map((idx) => (
            <View key={idx} style={styles.listCardSkeleton}>
              <View style={styles.listThumbBox} />
              <View style={styles.linesCol}>
                <View style={[styles.block, styles.h16, styles.w70]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w85]} />
                <View style={styles.inlineMetaRow}>
                  <View style={styles.modalityTagSkeleton} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w40]} />
                </View>
              </View>
              <View style={styles.chevronDot} />
            </View>
          ))}
        </View>
      );
  }
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrapper: {
      width: "100%",
      gap: tokens.spacing[14],
    },
    block: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      borderRadius: tokens.radius.small,
    },
    blockSubtle: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.small,
    },
    blockOnPrimary: {
      backgroundColor: colors.m3.onPrimary,
      opacity: 0.45,
      borderRadius: tokens.radius.small,
    },
    h10: { height: 10 },
    h12: { height: 12 },
    h16: { height: 16 },
    h22: { height: 22 },
    h24: { height: 24 },
    h28: { height: 28 },
    w35: { width: "35%" },
    w40: { width: "40%" },
    w50: { width: "50%" },
    w60: { width: "60%" },
    w70: { width: "70%" },
    w80: { width: "80%" },
    w85: { width: "85%" },
    w36px: { width: 36 },
    w52px: { width: 52 },
    w64px: { width: 64 },
    w76px: { width: 76 },
    w88px: { width: 88 },
    w120px: { width: 120 },
    w140px: { width: 140 },
    radiusFull: { borderRadius: tokens.radius.full },
    linesCol: {
      flex: 1,
      gap: tokens.spacing[6],
    },
    inlineMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    modalityTagSkeleton: {
      width: 56,
      height: 20,
      borderRadius: tokens.radius.small,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    // Shelf (Estante)
    shelfStatsRow: {
      flexDirection: "row",
      gap: tokens.spacing[10],
    },
    shelfStatCard: {
      flex: 1,
      borderRadius: tokens.radius.large,
      paddingVertical: tokens.spacing[14],
      paddingHorizontal: tokens.spacing[12],
      gap: tokens.spacing[8],
    },
    shelfSegmentedBar: {
      flexDirection: "row",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[4],
      gap: tokens.spacing[4],
    },
    shelfSegmentActive: {
      flex: 1,
      height: 40,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    shelfSegmentInactive: {
      flex: 1,
      height: 40,
      borderRadius: tokens.radius.medium,
      alignItems: "center",
      justifyContent: "center",
    },
    chipsRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      flexWrap: "wrap",
    },
    chipPillActive: {
      height: 34,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    chipPillOutline: {
      height: 34,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    shelfListCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
      gap: tokens.spacing[14],
    },
    shelfBookRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingTop: tokens.spacing[8],
    },
    shelfBookRowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      paddingTop: tokens.spacing[14],
    },
    shelfRowActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    circleAction36: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.badge.donation.background,
    },
    circleAction24: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    chevronDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    // Catalog (Explorar)
    catalogToolbarRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    catalogHorizontalCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[14],
    },
    catalogThumbBox: {
      width: 68,
      height: 94,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    catalogRightActions: {
      alignSelf: "stretch",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: tokens.spacing[4],
    },
    // Home Carousel (Início)
    carouselRow: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      overflow: "hidden",
    },
    carouselVerticalCard: {
      width: 168,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[10],
      gap: tokens.spacing[8],
    },
    carouselCoverBox: {
      width: "100%",
      height: 164,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    // Profile (Meu Perfil)
    profileCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[20],
      gap: tokens.spacing[20],
    },
    profileTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[16],
    },
    profileAvatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    profileMetricsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: tokens.spacing[8],
    },
    profileMetricItemWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    profileMetricBox: {
      flex: 1,
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    metricDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.m3.outlineVariant,
    },
    profileButtonsRow: {
      flexDirection: "row",
      gap: tokens.spacing[12],
    },
    pillButton: {
      flex: 1,
      height: 44,
      borderRadius: tokens.radius.full,
    },
    sectionBlock: {
      gap: tokens.spacing[10],
    },
    badgesRow: {
      flexDirection: "row",
      gap: tokens.spacing[10],
    },
    badgeSkeletonCard: {
      flex: 1,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[12],
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    badgeCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    menuRowSkeleton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
    },
    menuIconBox: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    // Public Profile
    publicProfileHeaderCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[20],
      alignItems: "center",
      gap: tokens.spacing[10],
    },
    publicAvatarCentered: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    // Conversations / Avatar List
    avatarCircle48: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    // List & Form
    listCardSkeleton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[14],
    },
    listThumbBox: {
      width: 56,
      height: 76,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    formInputSkeleton: {
      width: "100%",
      height: 52,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
  });
}
