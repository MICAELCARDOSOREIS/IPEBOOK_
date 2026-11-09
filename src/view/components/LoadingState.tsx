import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type LoadingSkeletonVariant = "list" | "profile" | "catalog" | "detail";

export type LoadingStateProps = {
  /** Nome acessível, sem reticências (ex: "Carregando livros"). */
  label?: string;
  /** Formato estrutural das caixinhas de esqueleto (Spec 132 / ADR 0103). */
  variant?: LoadingSkeletonVariant;
};

/**
 * Estado de carregamento com Skeleton Loading estrutural (Spec 132 / ADR 0103):
 * desenha caixinhas pulsantes com a estrutura visual da tela sem textos aparentes,
 * preservando rótulo e texto oculto para leitores de tela (TalkBack / VoiceOver).
 */
export function LoadingState({ label = "Carregando", variant = "list" }: LoadingStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          pulseAnim.setValue(0.75);
          return;
        }
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.92,
              duration: 680,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.45,
              duration: 680,
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
      })
      .catch(() => {
        pulseAnim.setValue(0.75);
      });
    return () => {
      loop?.stop();
    };
  }, [pulseAnim]);

  return (
    <View
      testID={`loading-skeleton-${variant}`}
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      {/* Nó acessível para leitores de tela e contratos de acessibilidade, sem exibir texto visual */}
      <View accessibilityLabel={label} style={styles.srOnly}>
        <Text style={styles.srOnlyText}>{label}…</Text>
      </View>

      <Animated.View style={[styles.skeletonRoot, { opacity: pulseAnim }]}>
        {variant === "profile" ? (
          <View style={styles.profileWrapper} testID="skeleton-variant-profile">
            {/* Cartão de Identidade do Perfil */}
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <View style={styles.profileInfoCol}>
                  <View style={[styles.block, styles.h28, styles.w60]} />
                  <View style={[styles.blockSubtle, styles.h16, styles.w80]} />
                </View>
                <View style={styles.profileAvatar} />
              </View>

              {/* 3 métricas em faixa */}
              <View style={styles.profileMetricsRow}>
                <View style={styles.profileMetricBox}>
                  <View style={[styles.block, styles.h22, styles.w40]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.profileMetricBox}>
                  <View style={[styles.block, styles.h22, styles.w40]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.profileMetricBox}>
                  <View style={[styles.block, styles.h22, styles.w40]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
                </View>
              </View>

              {/* 2 botões lado a lado */}
              <View style={styles.profileButtonsRow}>
                <View style={[styles.block, styles.pillButton]} />
                <View style={[styles.block, styles.pillButton]} />
              </View>
            </View>

            {/* Selos Comunitários (3 caixinhas) */}
            <View style={styles.sectionBlock}>
              <View style={[styles.block, styles.h16, styles.w50]} />
              <View style={styles.badgesRow}>
                <View style={styles.badgeSkeletonCard}>
                  <View style={styles.badgeCircle} />
                  <View style={[styles.block, styles.h12, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
                </View>
                <View style={styles.badgeSkeletonCard}>
                  <View style={styles.badgeCircle} />
                  <View style={[styles.block, styles.h12, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
                </View>
                <View style={styles.badgeSkeletonCard}>
                  <View style={styles.badgeCircle} />
                  <View style={[styles.block, styles.h12, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h10, styles.w50]} />
                </View>
              </View>
            </View>

            {/* Lista de Atividade (3 caixinhas de linha) */}
            <View style={styles.sectionBlock}>
              <View style={[styles.block, styles.h16, styles.w35]} />
              {[0, 1, 2].map((idx) => (
                <View key={idx} style={styles.menuRowSkeleton}>
                  <View style={styles.menuIconBox} />
                  <View style={styles.menuLinesCol}>
                    <View style={[styles.block, styles.h16, styles.w60]} />
                    <View style={[styles.blockSubtle, styles.h12, styles.w80]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : variant === "catalog" ? (
          <View style={styles.catalogWrapper} testID="skeleton-variant-catalog">
            <View style={styles.chipsSkeletonRow}>
              <View style={[styles.block, styles.chipSkeleton]} />
              <View style={[styles.blockSubtle, styles.chipSkeleton]} />
              <View style={[styles.blockSubtle, styles.chipSkeleton]} />
            </View>
            <View style={styles.catalogGrid}>
              {[0, 1, 2, 3].map((idx) => (
                <View key={idx} style={styles.bookSkeletonCard}>
                  <View style={styles.bookCoverSkeleton} />
                  <View style={[styles.block, styles.h16, styles.w80]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w50]} />
                </View>
              ))}
            </View>
          </View>
        ) : variant === "detail" ? (
          <View style={styles.detailWrapper} testID="skeleton-variant-detail">
            <View style={styles.detailHeroCard}>
              <View style={styles.detailCoverBox} />
              <View style={styles.detailMetaCol}>
                <View style={[styles.block, styles.h22, styles.w80]} />
                <View style={[styles.blockSubtle, styles.h16, styles.w60]} />
                <View style={[styles.block, styles.h28, styles.w40]} />
              </View>
            </View>
            <View style={styles.listCardSkeleton}>
              <View style={styles.menuLinesCol}>
                <View style={[styles.block, styles.h16, styles.w50]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w90]} />
                <View style={[styles.blockSubtle, styles.h12, styles.w70]} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.listWrapper} testID="skeleton-variant-list">
            {[0, 1, 2].map((idx) => (
              <View key={idx} style={styles.listCardSkeleton}>
                <View style={styles.listThumbBox} />
                <View style={styles.menuLinesCol}>
                  <View style={[styles.block, styles.h16, styles.w70]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w90]} />
                  <View style={[styles.blockSubtle, styles.h12, styles.w40]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: tokens.spacing[12],
    },
    srOnly: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
      overflow: "hidden",
    },
    srOnlyText: {
      fontSize: 1,
      color: "transparent",
    },
    skeletonRoot: {
      width: "100%",
    },
    block: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      borderRadius: tokens.radius.small,
    },
    blockSubtle: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.small,
    },
    h10: { height: 10 },
    h12: { height: 12 },
    h16: { height: 16 },
    h22: { height: 22 },
    h28: { height: 28 },
    w35: { width: "35%" },
    w40: { width: "40%" },
    w50: { width: "50%" },
    w60: { width: "60%" },
    w70: { width: "70%" },
    w80: { width: "80%" },
    w90: { width: "90%" },
    // Variante Profile
    profileWrapper: {
      width: "100%",
      gap: tokens.spacing[20],
    },
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
    profileInfoCol: {
      flex: 1,
      gap: tokens.spacing[10],
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
      gap: tokens.spacing[12],
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
      paddingVertical: tokens.spacing[8],
    },
    menuIconBox: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    menuLinesCol: {
      flex: 1,
      gap: tokens.spacing[8],
    },
    // Variante Catalog
    catalogWrapper: {
      width: "100%",
      gap: tokens.spacing[16],
    },
    chipsSkeletonRow: {
      flexDirection: "row",
      gap: tokens.spacing[8],
    },
    chipSkeleton: {
      width: 92,
      height: 36,
      borderRadius: tokens.radius.full,
    },
    catalogGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[12],
    },
    bookSkeletonCard: {
      width: "47%",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[12],
      gap: tokens.spacing[8],
    },
    bookCoverSkeleton: {
      width: "100%",
      height: 150,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    // Variante Detail
    detailWrapper: {
      width: "100%",
      gap: tokens.spacing[16],
    },
    detailHeroCard: {
      flexDirection: "row",
      gap: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
    },
    detailCoverBox: {
      width: 100,
      height: 144,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    detailMetaCol: {
      flex: 1,
      justifyContent: "center",
      gap: tokens.spacing[10],
    },
    // Variante List
    listWrapper: {
      width: "100%",
      gap: tokens.spacing[12],
    },
    listCardSkeleton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
    },
    listThumbBox: {
      width: 56,
      height: 76,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
  });
}

export default LoadingState;
