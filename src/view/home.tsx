import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { LoadingState } from "@/view/components/LoadingState";
import { OfflineState } from "@/view/components/OfflineState";
import type { Book, BookModality } from "@/model/entities/book";
import type { ThemePreference } from "@/model/entities/themePreference";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

function createModalityTag(colors: ColorPalette): Record<BookModality, { background: string; text: string; label: string }> {
  return {
    sale: { background: colors.badge.sale.background, text: colors.badge.sale.text, label: "Venda" },
    trade: { background: colors.badge.trade.background, text: colors.badge.trade.text, label: "Troca" },
    donation: { background: colors.badge.donation.background, text: colors.badge.donation.text, label: "Doação" },
  };
}

const CAROUSEL_ITEM_WIDTH = 152;
const CAROUSEL_ITEM_GAP = tokens.spacing[12];
/**
 * Passo real entre dois cards: a largura do card mais a margem que os separa. Usar apenas
 * `CAROUSEL_ITEM_WIDTH` no `scrollToOffset` acumulava `CAROUSEL_ITEM_GAP` de desvio por clique,
 * deixando uma fatia do item anterior visível à esquerda.
 */
const CAROUSEL_ITEM_STRIDE = CAROUSEL_ITEM_WIDTH + CAROUSEL_ITEM_GAP;
const CAROUSEL_MAX_ITEMS = 8;

/** Deslocamento horizontal que deixa o item `index` alinhado à borda esquerda do carrossel. */
export function carouselOffsetFor(index: number): number {
  return index * CAROUSEL_ITEM_STRIDE;
}

type CatalogCarouselProps = {
  title: string;
  books: readonly Book[];
  onNavigateToBookDetail?: (bookId: string) => void;
  onViewMore: () => void;
  viewMoreLabel: string;
};

/**
 * Seção destacada da Home (Figma `02.01 · Início`, `02.02 · Explorar por seção`), com navegação
 * por botões Anterior/Próximo — acessível por teclado na Web via Tab, sem depender de gestos.
 */
function CatalogCarousel({ title, books, onNavigateToBookDetail, onViewMore, viewMoreLabel }: CatalogCarouselProps) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Book> | null>(null);
  const lastIndex = Math.max(0, books.length - 1);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);

  function goTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, lastIndex));
    setIndex(clamped);
    listRef.current?.scrollToOffset?.({ offset: carouselOffsetFor(clamped), animated: true });
  }

  return (
    <View style={styles.carouselSection} testID={`carousel-${title}`}>
      <View style={styles.carouselHeader}>
        <Text accessibilityRole="header" numberOfLines={2} style={styles.carouselTitle}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={viewMoreLabel}
          onPress={onViewMore}
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>Ver mais</Text>
        </Pressable>
      </View>
      <View style={styles.carouselRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Item anterior de ${title}`}
          accessibilityState={{ disabled: index <= 0 }}
          disabled={index <= 0}
          onPress={() => goTo(index - 1)}
          style={[styles.carouselNavButton, index <= 0 ? styles.carouselNavButtonDisabled : null]}
        >
          <Text style={styles.carouselNavText}>‹</Text>
        </Pressable>
        <FlatList
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={books as Book[]}
          keyExtractor={(item) => item.id}
          style={styles.carouselList}
          renderItem={({ item }) => {
            const tag = modalityTag[item.modality];
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
                onPress={() => onNavigateToBookDetail?.(item.id)}
                style={styles.carouselCard}
              >
                <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="carousel" />
                <Text numberOfLines={2} style={styles.carouselCardTitle}>{item.title}</Text>
                <View style={[styles.tag, styles.carouselCardTag, { backgroundColor: tag.background }]}>
                  <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                </View>
              </Pressable>
            );
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Próximo item de ${title}`}
          accessibilityState={{ disabled: index >= lastIndex }}
          disabled={index >= lastIndex}
          onPress={() => goTo(index + 1)}
          style={[styles.carouselNavButton, index >= lastIndex ? styles.carouselNavButtonDisabled : null]}
        >
          <Text style={styles.carouselNavText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

export type HomeProps = {
  onNavigateToSignIn?: () => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToMyListings?: () => void;
  onNavigateToReceivedRequests?: () => void;
  onNavigateToSentRequests?: () => void;
  onNavigateToBookDetail?: (bookId: string) => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToAlerts?: () => void;
  /** "Ver mais" das seções destacadas; `modality` pré-aplica o filtro na Pesquisa. */
  onNavigateToSearch?: (filter?: { modality?: BookModality }) => void;
  /** Mudar este valor força o catálogo a recarregar (ex.: ao voltar de cadastrar um anúncio). */
  focusKey?: unknown;
};

export default function Home({
  onNavigateToSignIn,
  onNavigateToCreateListing,
  onNavigateToMyListings,
  onNavigateToReceivedRequests,
  onNavigateToSentRequests,
  onNavigateToBookDetail,
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToNotifications,
  onNavigateToFavorites,
  onNavigateToAlerts,
  onNavigateToSearch,
  focusKey,
}: HomeProps = {}) {
  const [state, actions] = useHomeViewModel();
  const [authState, authActions] = useAuthViewModel();
  const { isOnline } = useNetworkStatus();
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modalityTag = useMemo(() => createModalityTag(colors), [colors]);

  const isFirstFocus = useRef(true);
  useEffect(() => {
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      return;
    }
    void actions.reload();
  }, [focusKey]);

  const recentBooks = state.books.slice(0, CAROUSEL_MAX_ITEMS);
  const donationBooks = state.books
    .filter((book) => book.modality === "donation" && book.status === "available")
    .slice(0, CAROUSEL_MAX_ITEMS);

  // Cabeçalho e rodapé viajam dentro da própria lista: assim a Home inteira rola em um único
  // gesto, sem aninhar uma VirtualizedList dentro de um ScrollView.
  const listHeader = (
    <View>
      <View style={styles.brand}>
        <View style={styles.mark} accessible={false} />
        <Text accessibilityRole="header" style={styles.title}>Ipebook</Text>
      </View>
      <Text style={styles.subtitle}>Um lugar para descobrir sua próxima leitura.</Text>
      <View testID="theme-toggle-radiogroup" accessibilityRole="radiogroup" style={styles.themeToggleRow}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityState={{ checked: isSelected }}
              onPress={() => void setPreference(option.value)}
              style={[styles.themeToggleOption, isSelected && styles.themeToggleOptionSelected]}
            >
              <Text style={[styles.themeToggleText, isSelected && styles.themeToggleTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {authState.loading ? null : authState.user ? (
        <View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>Olá, {authState.user.email}</Text>
          <View style={styles.sessionActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onNavigateToCreateListing?.()}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>Anunciar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void authActions.signOut()}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>Sair</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.requestsRow}>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToFavorites?.()} style={styles.sessionButton}>
            <Text style={styles.sessionButtonText}>Favoritos</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigateToAlerts?.()} style={styles.sessionButton}>
            <Text style={styles.sessionButtonText}>Meus alertas</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToNotifications?.()}
            style={styles.sessionButton}
          >
            <Text style={styles.sessionButtonText}>Notificações</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToMyListings?.()}
            style={styles.sessionButton}
          >
            <Text style={styles.sessionButtonText}>Meus anúncios</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToReceivedRequests?.()}
            style={styles.sessionButton}
          >
            <Text style={styles.sessionButtonText}>Pedidos recebidos</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToSentRequests?.()}
            style={styles.sessionButton}
          >
            <Text style={styles.sessionButtonText}>Meus pedidos</Text>
          </Pressable>
        </View>
        </View>
      ) : (
        <View style={styles.sessionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToSignIn?.()}
            style={styles.sessionButton}
          >
            <Text style={styles.sessionButtonText}>Entrar</Text>
          </Pressable>
        </View>
      )}
      {!state.loading && !state.error && recentBooks.length > 0 ? (
        <CatalogCarousel
          title="Recém-adicionados"
          books={recentBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => onNavigateToSearch?.()}
          viewMoreLabel="Ver mais livros recém-adicionados"
        />
      ) : null}
      {!state.loading && !state.error && donationBooks.length > 0 ? (
        <CatalogCarousel
          title="Doações disponíveis na comunidade"
          books={donationBooks}
          onNavigateToBookDetail={onNavigateToBookDetail}
          onViewMore={() => onNavigateToSearch?.({ modality: "donation" })}
          viewMoreLabel="Ver mais doações disponíveis em Piripiri"
        />
      ) : null}
      <Text accessibilityRole="header" style={styles.heading}>Livros</Text>
    </View>
  );

  const listFooter = (
    <View style={styles.footerLinks}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onNavigateToTerms?.()}
        style={styles.legalButton}
      >
        <Text style={styles.legalText}>Termos e Privacidade</Text>
      </Pressable>
      <Text style={styles.footerSeparator}>•</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => onNavigateToHelp?.()}
        style={styles.legalButton}
      >
        <Text style={styles.legalText}>Central de Ajuda</Text>
      </Pressable>
    </View>
  );

  const listEmpty = state.loading ? (
    <LoadingState label="Carregando livros" />
  ) : state.error ? (
    isOnline ? (
      <ErrorState message={state.error} onRetry={() => void actions.reload()} />
    ) : (
      <OfflineState onRetry={() => void actions.reload()} />
    )
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Ainda não há livros por aqui.</Text>
      <Text style={styles.body}>Quando houver livros disponíveis, eles aparecerão neste espaço.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={state.loading || state.error ? [] : state.books}
        keyExtractor={(book) => book.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        renderItem={({ item }) => {
          const tag = modalityTag[item.modality];
          return (
            <View style={styles.book}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver detalhe de ${item.title}, ${item.author}`}
              onPress={() => onNavigateToBookDetail?.(item.id)}
              style={styles.bookMain}
            >
              <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
              <View style={styles.bookInfo}>
                <View style={styles.bookHeader}>
                  <Text style={styles.emptyTitle}>{item.title}</Text>
                  <View style={[styles.tag, { backgroundColor: tag.background }]}>
                    <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                  </View>
                </View>
                <Text style={styles.body}>{item.author}</Text>
                {item.status === "reserved" ? (
                  <Text style={styles.reserved}>Reservado</Text>
                ) : null}
              </View>
            </Pressable>
            <FavoriteButton bookId={item.id} userId={authState.user?.id ?? null} />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[8],
    },
    footerSeparator: {
      color: colors.secondaryText,
      fontSize: tokens.typography.labelMedium.fontSize,
    },
    legalButton: {
      paddingVertical: tokens.spacing[12],
    },
    legalText: {
      fontSize: tokens.typography.labelMedium.fontSize,
      color: colors.secondaryText,
      textDecorationLine: "underline",
    },
    // Usado como `contentContainerStyle`: `flexGrow` (e não `flex: 1`) deixa o conteúdo crescer
    // além da altura da tela, que é o que permite a rolagem.
    content: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      padding: tokens.spacing[24],
      paddingTop: tokens.spacing[48],
      paddingBottom: tokens.spacing[24],
    },
    brand: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
    mark: { width: 16, height: 36, backgroundColor: colors.highlight, borderTopRightRadius: tokens.radius.medium },
    title: { fontSize: tokens.typography.displayLarge.fontSize, fontWeight: tokens.typography.displayLarge.fontWeight, color: colors.action },
    subtitle: { fontSize: 17, lineHeight: 26, color: colors.secondaryText, marginTop: 14, marginBottom: tokens.spacing[12] },
    themeToggleRow: { flexDirection: "row", gap: tokens.spacing[8], marginBottom: tokens.spacing[24] },
    themeToggleOption: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeToggleOptionSelected: { backgroundColor: colors.soft, borderColor: colors.action },
    themeToggleText: { fontSize: tokens.typography.labelMedium.fontSize, color: colors.secondaryText, fontWeight: "600" },
    themeToggleTextSelected: { color: colors.action },
    sessionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.spacing[24] },
    sessionText: { fontSize: tokens.typography.bodyMedium.fontSize, color: colors.secondaryText },
    sessionActions: { flexDirection: "row", alignItems: "center" },
    sessionButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[12] },
    sessionButtonText: { color: colors.action, fontSize: 14, fontWeight: "600" },
    heading: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: colors.action, marginBottom: tokens.spacing[24] },
    empty: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 28, gap: 10 },
    emptyTitle: { fontSize: 19, fontWeight: "600", color: colors.action },
    body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: colors.secondaryText },
    book: { flexDirection: "row", gap: tokens.spacing[12], paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
    bookMain: { flex: 1, flexDirection: "row", gap: tokens.spacing[12] },
    bookInfo: { flex: 1, gap: 6 },
    bookHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
    tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6] },
    tagText: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
    requestsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: -tokens.spacing[12], marginBottom: tokens.spacing[24] },
    reserved: { fontSize: tokens.typography.bodyMedium.fontSize, color: colors.secondaryText, fontStyle: "italic" },
    carouselSection: { marginBottom: tokens.spacing[24] },
    carouselHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.spacing[12] },
    carouselTitle: {
      flexShrink: 1,
      fontSize: tokens.typography.titleMedium.fontSize,
      fontWeight: tokens.typography.titleMedium.fontWeight,
      color: colors.action,
    },
    viewMoreButton: { flexShrink: 0, minHeight: tokens.accessibility.touchTarget, justifyContent: "center" },
    viewMoreText: { fontSize: tokens.typography.labelMedium.fontSize, color: colors.action, fontWeight: "600" },
    carouselRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    carouselList: { flexGrow: 0 },
    carouselNavButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    carouselNavButtonDisabled: { opacity: 0.3 },
    carouselNavText: { fontSize: 22, color: colors.action, fontWeight: "700" },
    carouselCard: { width: CAROUSEL_ITEM_WIDTH, marginRight: CAROUSEL_ITEM_GAP, gap: tokens.spacing[4] },
    carouselCardTag: { alignSelf: "flex-start" },
    carouselCardTitle: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: "600", color: colors.text },
  });
}
