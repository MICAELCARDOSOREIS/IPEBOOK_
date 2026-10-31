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
import { IpeMark } from "@/view/components/IpeMark";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { WEB_GUTTER, WEB_MAX_WIDTH, useWebGridColumns } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";

export type FavoritesProps = {
  userId: string | null;
  focusKey?: number;
  onBack: () => void;
  onLogin: () => void;
  onBook: (id: string) => void;
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
  onExploreBooks,
}: FavoritesProps) {
  const [state, actions] = useFavoritesViewModel(userId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const gridColumns = useWebGridColumns();
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
                  style={withPress([styles.wideChip, selected && styles.wideChipSelected])}
                >
                  {selected ? <AppIcon name="check" size={16} color={colors.m3.onSecondaryContainer} /> : null}
                  <Text style={[styles.wideChipText, selected && { color: colors.m3.onSecondaryContainer }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Lista de Favoritos */}
      {!userId ? (
        <View style={styles.status}>
          <View style={styles.emptyIpeContainer}>
            <IpeMark size={72} />
          </View>
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
          key={wideWeb ? `grade-${gridColumns}` : "lista"}
          numColumns={wideWeb ? gridColumns : 1}
          columnWrapperStyle={wideWeb ? styles.wideGridRow : undefined}
          data={visibleBooks}
          keyExtractor={(book) => book.id}
          contentContainerStyle={wideWeb ? styles.wideList : styles.list}
          keyboardShouldPersistTaps="handled"
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
            <View style={[styles.emptyBox, wideWeb && styles.emptyBoxWide]}>
              <View style={styles.emptyIpeContainer}>
                <IpeMark size={68} />
              </View>
              <Text accessibilityRole="header" style={styles.emptyHeadline}>
                Nenhum livro salvo
              </Text>
              <Text style={styles.emptyHint}>
                Toque no coração dos anúncios para guardar aqui os livros que você quer ler.
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
              <View style={[styles.row, wideWeb && styles.wideCard, wideWeb && { maxWidth: `${100 / gridColumns}%` }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${item.title}`}
                  onPress={() => onBook(item.id)}
                  style={({ pressed }) => [
                    styles.rowMain,
                    wideWeb && styles.wideCardMain,
                    pressed && styles.rowMainPressed,
                  ]}
                >
                  <ModalityCoverArea modality={item.modality}>
                    <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
                  </ModalityCoverArea>
                  <View style={styles.rowTexts}>
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
                  style={withPress(styles.favoriteButton)}
                >
                  <AppIcon name="heartFill" size={24} color={colors.ipe.bloomDeep} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    wideHeader: {
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[32],
      gap: tokens.spacing[8],
    },
    wideTitle: { ...tokens.typography.brandDisplayMd, color: colors.brandBrown },
    wideSubtitle: { ...tokens.typography.bodyLarge, color: colors.m3.onSurfaceVariant },
    wideChips: { flexDirection: "row", gap: tokens.spacing[8], paddingTop: tokens.spacing[16] },
    wideChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      height: tokens.spacing[32],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.shapeMorph.chipUnselected,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLowest,
    },
    wideChipSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
      borderWidth: 0,
      paddingLeft: tokens.spacing[8],
    },
    wideChipText: { ...tokens.typography.labelLarge, color: colors.m3.onSurfaceVariant },
    wideList: {
      width: "100%",
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingVertical: tokens.spacing[24],
      gap: tokens.spacing[24],
    },
    wideGridRow: { gap: tokens.spacing[24] },
    wideCard: {
      flex: 1,
      flexDirection: "column",
      alignItems: "stretch",
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLowest,
      padding: tokens.spacing[12],
    },
    wideCardMain: { flexDirection: "column", alignItems: "stretch" },
    privacyNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      padding: tokens.spacing[16],
      marginTop: tokens.spacing[8],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainer,
    },
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
    emptyBoxWide: { maxWidth: 420, alignSelf: "flex-start" },
    emptyBox: { gap: tokens.spacing[12], paddingVertical: tokens.spacing[24] },
    emptyIpeContainer: {
      width: 80,
      height: 80,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.container,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[6],
      elevation: 2,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
    },
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
      ...tokens.typography.titleMedium,
      fontFamily: tokens.typography.displayLarge.fontFamily,
      color: colors.text,
    },
    link: {
      color: colors.action,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      fontWeight: tokens.fontWeight.semiBold,
      padding: tokens.spacing[12],
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
      paddingVertical: tokens.spacing[12],
    },
    rowMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
    },
    rowMainPressed: {
      transform: [{ scale: 0.985 }],
    },
    rowTexts: { flex: 1, gap: tokens.spacing[4] },
    modalityLine: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    bookTitle: {
      ...tokens.typography.brandCardTitle,
      color: colors.m3.onSurface,
    },
    bookDetails: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    favoriteButton: {
      width: tokens.accessibility.touchTarget,
      height: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "flex-start",
      alignSelf: "flex-start",
      paddingTop: tokens.spacing[2],
    },
  });
}
