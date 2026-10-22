import { useEffect, useMemo, useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type FavoritesProps = {
  userId: string | null;
  focusKey?: number;
  onBack: () => void;
  onLogin: () => void;
  onBook: (id: string) => void;
  onNavigateToAlerts?: () => void;
  onExploreBooks?: () => void;
};

/** Figma `02.06 · Favoritos` (nó `10:227`) e `02.14 · Favoritos · vazio` (nó `254:4129`). */
export default function Favorites({
  userId,
  focusKey = 0,
  onBack,
  onLogin,
  onBook,
  onNavigateToAlerts,
  onExploreBooks,
}: FavoritesProps) {
  const [state, actions] = useFavoritesViewModel(userId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // A aba "Alertas" de `02.06` mostra a contagem ao lado do rótulo, como "Livros (n)".
  const [alertsState] = useSearchAlertsViewModel(userId);
  const { isOnline } = useNetworkStatus();
  const firstFocus = useRef(true);

  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    void actions.reload();
  }, [focusKey]);

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Favoritos" onBack={onBack} />

      {userId ? (
        <View testID="favorites-tablist" accessibilityRole="tablist" style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: true }}
            onPress={() => undefined}
            style={[styles.tab, styles.tabActive]}
          >
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>
              {`Livros (${state.books.length})`}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            onPress={() => onNavigateToAlerts?.()}
            style={styles.tab}
          >
            <Text style={styles.tabLabel}>{`Alertas (${alertsState.alerts.length})`}</Text>
          </Pressable>
        </View>
      ) : null}

      {!userId ? (
        <View style={styles.status}>
          <IconBadge icon="heart" tone="action" />
          <Text accessibilityRole="header" style={styles.statusTitle}>
            Entre para ver seus favoritos
          </Text>
          <Pressable accessibilityRole="button" onPress={onLogin}>
            <Text style={styles.link}>Entrar</Text>
          </Pressable>
        </View>
      ) : state.loading ? (
        <LoadingState label="Carregando favoritos" />
      ) : state.error ? (
        isOnline ? (
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        ) : (
          <OfflineState onRetry={() => void actions.reload()} />
        )
      ) : (
        <FlatList
          data={state.books}
          keyExtractor={(book) => book.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            // `02.14`: título, apoio e ação alinhados à esquerda, sem ícone (Spec 043, RN-10).
            <View style={styles.emptyBox}>
              <Text accessibilityRole="header" style={styles.emptyHeadline}>
                Nenhum livro salvo
              </Text>
              <Text style={styles.emptyHint}>
                Toque em Favoritar no anúncio para guardar os livros que você quer ler.
              </Text>
              <FilledButton label="Explorar livros" onPress={onExploreBooks ?? onBack} />
            </View>
          }
          renderItem={({ item }) => {
            const details = [
              item.author,
              item.condition ? BOOK_CONDITION_LABELS[item.condition] : null,
              item.neighborhood,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${item.title}`}
                  onPress={() => onBook(item.id)}
                  style={styles.rowMain}
                >
                  <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                  <View style={styles.rowTexts}>
                    <View style={styles.rowHeader}>
                      <Tag variant={item.modality} />
                      {item.price !== undefined ? (
                        <Text style={styles.price}>{formatPrice(item.price)}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookDetails}>{details}</Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.title} dos favoritos`}
                  accessibilityState={{ disabled: state.removingId === item.id }}
                  disabled={state.removingId === item.id}
                  onPress={() => void actions.removeFavorite(item.id)}
                  style={styles.favoriteButton}
                >
                  <AppIcon name="heart" size={24} color={colors.action} />
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {userId && onNavigateToAlerts ? (
        <TextButton label="Ver meus alertas de busca" onPress={() => onNavigateToAlerts()} />
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  tabs: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    gap: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[16],
    borderBottomWidth: 1,
    borderBottomColor: colors.m3.outlineVariant,
  },
  tab: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[16],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: colors.action },
  tabLabel: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: colors.secondaryText,
  },
  tabLabelActive: { color: colors.action, fontWeight: "600" },
  list: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[16],
    gap: tokens.spacing[8],
  },
  status: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    alignItems: "center",
    gap: tokens.spacing[12],
    padding: tokens.spacing[24],
  },
  emptyBox: { gap: tokens.spacing[12], paddingVertical: tokens.spacing[24] },
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  emptyHint: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
  },
  statusTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: colors.text,
  },
  link: {
    color: colors.action,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
    padding: tokens.spacing[12],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.m3.outlineVariant,
    paddingVertical: tokens.spacing[12],
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    minHeight: tokens.accessibility.touchTarget,
  },
  rowTexts: { flex: 1, gap: tokens.spacing[4] },
  rowHeader: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
  bookTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    fontWeight: tokens.typography.titleMedium.fontWeight,
    color: colors.text,
  },
  bookDetails: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: colors.secondaryText,
  },
  price: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
    color: colors.action,
  },
  favoriteButton: {
    minWidth: tokens.accessibility.touchTarget,
    minHeight: tokens.accessibility.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  });
}
