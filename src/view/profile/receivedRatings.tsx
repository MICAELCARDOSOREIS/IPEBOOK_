import { useEffect, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeAuthViewModel, makeReceivedRatingsViewModel } from "@/di/container";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
export type ReceivedRatingsProps = {
  sessionUserId: string | null;
  onBack: () => void;
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function starParts(score: number): { filled: string; empty: string } {
  const rounded = Math.max(0, Math.min(5, Math.round(score)));
  return {
    filled: "★".repeat(rounded),
    empty: "☆".repeat(5 - rounded),
  };
}

/** Figma `07.03 · Avaliações recebidas` (`145:2486` / Web `370:16701`). */
export function ReceivedRatings({ sessionUserId, onBack }: ReceivedRatingsProps) {
  const guardedBack = useGuardedPress(onBack);
  const [state, actions] = makeReceivedRatingsViewModel(sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Web larga: coluna mais ampla e dois cartões por linha.
  const wide = useIsWideWeb();

  return (
    <SafeAreaView style={styles.page}>
      {wide ? (
        <View style={styles.wideHeader}>
          <View style={styles.wideHeaderLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={guardedBack}
              style={withPress(styles.wideBackButton)}
            >
              <AppIcon name="back" size={20} color={colors.m3.onSurface} />
            </Pressable>
            <View>
              <Text accessibilityRole="header" style={styles.wideTitle}>
                Avaliações recebidas
              </Text>
              <Text style={styles.wideSubtitle}>
                Opiniões e notas deixadas pela comunidade de Piripiri
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TopAppBar contentMaxWidth={undefined} title="Avaliações recebidas" onBack={guardedBack} />
      )}
      {state.loading ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <LoadingState label="Carregando avaliações" />
        </View>
      ) : state.error ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={[styles.status, wide && styles.emptyWide]}>
            <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente"
              onPress={() => void actions.reload()}
              style={withPress(styles.retryButton)}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        </View>
      ) : state.ratings.length === 0 ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={[styles.status, wide && styles.emptyWide]}>
            <Text style={styles.emptyText}>Você ainda não recebeu avaliações.</Text>
          </View>
        </View>
      ) : (
        <FlatList
          key={wide ? "grid-ratings-2" : "list-ratings-1"}
          numColumns={wide ? 2 : 1}
          columnWrapperStyle={wide ? styles.gridRow : undefined}
          data={state.ratings}
          keyExtractor={(item) => item.id}
          {...standardVerticalScrollProps}
          style={styles.flexOne}
          contentContainerStyle={[
            styles.scroll,
            styles.content,
            wide && styles.contentWide,
            { paddingBottom: scrollBottomPadding.withoutBottomBar },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: tokens.spacing[16] }} />}
          renderItem={({ item: rating }) => {
            const { filled, empty } = starParts(rating.score);
            return (
              <View style={[styles.card, wide && styles.cardWide]}>
                <Text
                  accessibilityLabel={`Nota ${rating.score} de 5`}
                  style={styles.stars}
                >
                  {filled}
                  {empty ? <Text style={styles.starsEmpty}>{empty}</Text> : null}
                </Text>
                <Text style={styles.raterName}>{rating.raterName ?? "Pessoa da comunidade"}</Text>
                <Text style={styles.date}>{formatDate(rating.createdAt)}</Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

export type ReceivedRatingsScreenProps = {
  onBack: () => void;
  onNavigateToSignIn?: () => void;
};

export default function ReceivedRatingsScreen({ onBack, onNavigateToSignIn }: ReceivedRatingsScreenProps) {
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onNavigateToSignIn?.();
  }, [authState.loading, authState.user, onNavigateToSignIn]);

  if (authState.loading || !authState.user) return null;

  return <ReceivedRatings sessionUserId={authState.user.id} onBack={onBack} />;
}

const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, minHeight: 0 },
  flexOne: { flex: 1, minHeight: 0 },
  wideHeader: {
    width: "100%",
    maxWidth: WIDE_CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: WEB_GUTTER,
    paddingTop: tokens.spacing[24],
    paddingBottom: tokens.spacing[12],
  },
  wideHeaderLeft: {
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
  scroll: { flexGrow: 1 },
  content: { width: "100%", padding: tokens.spacing[24] },
  status: { alignItems: "center", gap: tokens.spacing[16], paddingTop: tokens.spacing[48] },
  emptyWide: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[40],
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    marginTop: tokens.spacing[24],
    paddingTop: tokens.spacing[40],
  },
  errorText: { ...tokens.typography.bodyMedium, color: colors.error, textAlign: "center" },
  emptyText: { ...tokens.typography.bodyMedium, color: colors.secondaryText, textAlign: "center" },
  retryButton: {
    paddingVertical: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[24],
    borderRadius: tokens.radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.m3.outline,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  retryText: { ...tokens.typography.bodyMedium, color: colors.action, fontWeight: tokens.fontWeight.semiBold },
  list: { gap: tokens.spacing[12] },
  contentWide: { maxWidth: WIDE_CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
  gridRow: { gap: tokens.spacing[16] },
  cardWide: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  stars: { ...tokens.typography.titleBlock, color: colors.highlight },
  starsEmpty: { color: colors.m3.outline },
  raterName: { ...tokens.typography.titleMedium, fontFamily: tokens.typography.displayLarge.fontFamily, color: colors.text },
  date: { ...tokens.typography.labelMedium, color: colors.secondaryText },
  });
}
