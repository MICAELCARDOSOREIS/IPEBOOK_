import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { BOOK_CONDITION_LABELS, type BookModality } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, fontFamily, type ColorPalette } from "@/view/tokens";
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

/** Rótulo curto de modalidade na linha pequena do card (`02.06`). */
const MODALITY_LABELS: Readonly<Record<BookModality, string>> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
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

  const wideWeb = useIsWideWeb();
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "reserved">("all");
  const visibleBooks = state.books.filter((book) =>
    statusFilter === "all" ? true : statusFilter === "reserved" ? book.status === "reserved" : book.status !== "reserved",
  );

  return (
    <SafeAreaView style={styles.page}>
      {wideWeb ? null : <TopAppBar title="Favoritos" onBack={onBack} />}

      {wideWeb && userId ? (
        <View style={styles.wideHeader}>
          <Text accessibilityRole="header" style={styles.wideTitle}>Favoritos</Text>
          <Text style={styles.wideSubtitle}>
            {`${state.books.length} ${state.books.length === 1 ? "livro salvo" : "livros salvos"} · avisamos se o preço ou a disponibilidade mudar.`}
          </Text>
          <View style={styles.wideChips}>
            {([["all", "Todos"], ["available", "Disponíveis"], ["reserved", "Reservados"]] as const).map(([value, label]) => {
              const selected = statusFilter === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Mostrar ${label.toLowerCase()}`}
                  accessibilityState={{ selected }}
                  onPress={() => setStatusFilter(value)}
                  style={[styles.wideChip, selected && styles.wideChipSelected]}
                >
                  {selected ? <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} /> : null}
                  <Text style={[styles.wideChipText, selected && { color: colors.m3.onSecondaryContainer }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {userId && !wideWeb ? (
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
          key={wideWeb ? "grade" : "lista"}
          numColumns={wideWeb ? 4 : 1}
          columnWrapperStyle={wideWeb ? styles.wideGridRow : undefined}
          data={visibleBooks}
          keyExtractor={(book) => book.id}
          contentContainerStyle={wideWeb ? styles.wideList : styles.list}
          ListFooterComponent={
            wideWeb && state.books.length > 0 ? (
              <View style={styles.privacyNote}>
                <AppIcon name="info" size={20} color={colors.m3.onSurfaceVariant} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.privacyTitle}>Favoritos ficam só com você</Text>
                  <Text style={styles.privacyBody}>Quem anunciou não vê quem salvou o livro.</Text>
                </View>
              </View>
            ) : undefined
          }
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
              <View style={[styles.row, wideWeb && styles.wideCard]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${item.title}`}
                  onPress={() => onBook(item.id)}
                  style={[styles.rowMain, wideWeb && styles.wideCardMain]}
                >
                  <ModalityCoverArea modality={item.modality}>
                    <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                  </ModalityCoverArea>
                  <View style={styles.rowTexts}>
                    {/* Figma `02.06`: linha pequena acima do título — preço quando é venda,
                        senão a modalidade. Não é pílula de tag. */}
                    <Text style={styles.modalityLine}>
                      {item.modality === "sale" && item.price !== undefined
                        ? formatPrice(item.price)
                        : MODALITY_LABELS[item.modality]}
                    </Text>
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
  wideHeader: { width: "100%", maxWidth: 1440, alignSelf: "center", paddingHorizontal: 80, paddingTop: 32, gap: 8 },
  wideTitle: { fontFamily: tokens.typography.labelLarge.fontFamily, fontSize: 36, lineHeight: 44, fontWeight: "700", color: colors.m3.onSurface },
  wideSubtitle: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
  wideChips: { flexDirection: "row", gap: 8, paddingTop: 16 },
  wideChip: { flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 16, borderRadius: tokens.radius.small, borderWidth: 1, borderColor: colors.m3.outline },
  wideChipSelected: { backgroundColor: colors.m3.secondaryContainer, borderColor: colors.m3.secondaryContainer, paddingLeft: 8 },
  wideChipText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
  wideList: { width: "100%", maxWidth: 1440, alignSelf: "center", paddingHorizontal: 80, paddingVertical: 24, gap: 24 },
  wideGridRow: { gap: 24 },
  wideCard: { flex: 1, maxWidth: "25%", flexDirection: "column", alignItems: "stretch", borderRadius: 20, backgroundColor: colors.m3.surfaceContainerLowest, padding: 12 },
  wideCardMain: { flexDirection: "column", alignItems: "stretch" },
  privacyNote: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16, marginTop: 8, borderRadius: tokens.radius.medium, backgroundColor: colors.m3.surfaceContainer },
  privacyTitle: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
  privacyBody: { ...tokens.typography.bodyMedium, color: colors.m3.onSurfaceVariant },
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
  modalityLine: {
    ...tokens.typography.labelMedium,
    color: colors.m3.onSurfaceVariant,
  },
  bookTitle: {
    fontFamily: fontFamily.brand,
    fontSize: 18,
    lineHeight: 24,
    color: colors.m3.onSurface,
  },
  bookDetails: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    lineHeight: tokens.typography.bodyMedium.lineHeight,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: colors.secondaryText,
  },
  favoriteButton: {
    minWidth: tokens.accessibility.touchTarget,
    minHeight: tokens.accessibility.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  });
}
