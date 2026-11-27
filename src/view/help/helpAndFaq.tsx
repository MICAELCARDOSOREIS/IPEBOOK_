import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { FAQ_ITEMS } from "@/model/helpContent";
import { FilledButton } from "@/view/components/FilledButton";
import { HelpContactLinks } from "@/view/help/HelpContactLinks";
import { iosNeutralCardStyle } from "@/view/components/IosCardSurface";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { ScrollEdgeScrollView, ScrollEdgeScreen } from "@/view/components/ScrollEdgeScreen";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_GUTTER, WEB_MAX_WIDTH, useWebColumns, webColumnWidth } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
export type HelpAndFaqProps = {
  onBack: () => void;
  /** Abre as negociações em andamento, como o botão "Abrir conversas" do Figma `09.01`. */
  onOpenConversations?: () => void;
};

const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

type CategoryFilter = "todos" | "seguranca" | "regras" | "suporte";

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: "todos", label: "Todas" },
  { key: "seguranca", label: "Segurança em Piripiri" },
  { key: "regras", label: "Regras e Trocas" },
  { key: "suporte", label: "Suporte e Contato" },
];

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Figma `09.01 · Ajuda` (`145:2702` / Web `370:17541`).
 */
export default function HelpAndFaq({ onBack, onOpenConversations }: HelpAndFaqProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedOpenConversations = useGuardedPress(onOpenConversations);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<CategoryFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  // Web larga: coluna mais larga, com as respostas em duas colunas.
  const wide = useIsWideWeb();
  const columns = useWebColumns(2, 3);
  const columnWidth =
    Platform.OS === "web"
      ? ({ width: `calc((100% - ${(columns - 1) * 16}px) / ${columns})` as unknown as `${number}%` })
      : { width: webColumnWidth(columns) };

  const normalizedQuery = normalizeSearchText(searchQuery);

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      filter === "todos"
        ? true
        : filter === "seguranca"
          ? item.category === "seguranca"
          : filter === "regras"
            ? item.category === "regras" || item.category === "funcionamento"
            : item.category === "suporte";

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const inQuestion = normalizeSearchText(item.question).includes(normalizedQuery);
    const inAnswer = normalizeSearchText(item.answer).includes(normalizedQuery);
    const inLinks = item.links?.some(({ label }) => normalizeSearchText(label).includes(normalizedQuery));
    return inQuestion || inAnswer || inLinks;
  });

  return (
    <ScrollEdgeScreen style={styles.page} header={<TopAppBar title="Ajuda" onBack={guardedBack} contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} />}>
      <ScrollEdgeScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        {...standardVerticalScrollProps}
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={styles.headerSection}>
            <Text style={styles.heroHeadline}>Vamos ajudar.</Text>
            <Text style={styles.heroSubtitle}>
              Respostas para continuar sua próxima leitura.
            </Text>
          </View>

          <TextField
            label="Buscar dúvida"
            labelBackgroundColor={colors.background}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Ex: ponto de encontro, doação, senha..."
            returnKeyType="search"
          />

          <View style={styles.filterContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = filter === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${cat.label}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setFilter(cat.key)}
                  style={withPress([styles.filterChip, isSelected && styles.filterChipSelected])}
                >
                  <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.list, wide && styles.listWide]}>
            {filteredItems.length === 0 ? (
              <View style={[styles.emptyCard, wide && styles.fullRow]}>
                <Text style={styles.question}>Nenhuma dúvida encontrada para sua busca.</Text>
                <Text style={styles.answer}>
                  Tente buscar por outra palavra-chave ou limpe o filtro ativo.
                </Text>
                <FilledButton
                  label="Limpar busca"
                  onPress={() => {
                    setSearchQuery("");
                    setFilter("todos");
                  }}
                />
              </View>
            ) : (
              filteredItems.map((item, index) => {
                const isOddLast = wide && index === filteredItems.length - 1 && filteredItems.length % 2 === 1;
                return (
                  <View key={item.id} style={[styles.faqCard, wide && (isOddLast ? styles.fullRow : columnWidth)]}>
                    <Text style={styles.question}>{item.question}</Text>
                    <Text style={styles.answer}>{item.answer}</Text>
                    {item.links ? <HelpContactLinks links={item.links} /> : null}
                  </View>
                );
              })
            )}
          </View>

          {onOpenConversations ? (
            <View style={styles.footerAction}>
              <OutlinedButton
                label="Abrir conversas"
                accessibilityLabel="Abrir conversas: suas negociações em andamento"
                onPress={guardedOpenConversations}
              />
            </View>
          ) : null}
        </View>
      </ScrollEdgeScrollView>
    </ScrollEdgeScreen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: tokens.spacing[48],
  },
  content: {
    flex: 1,
    width: "100%",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  headerSection: {
    gap: tokens.spacing[8],
  },
  heroHeadline: {
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
  },
  filterChip: {
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[8],
    borderRadius: tokens.shapeMorph.chipUnselected,
    borderWidth: 1,
    borderColor: colors.book.paperEdge,
    backgroundColor: colors.m3.surfaceContainerLowest,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: colors.nature.foliage,
    borderColor: colors.nature.foliage,
    borderRadius: tokens.shapeMorph.chipSelected,
    borderWidth: 0,
  },
  filterText: {
    ...tokens.typography.labelLarge,
    color: colors.m3.onSurfaceVariant,
  },
  filterTextSelected: {
    color: colors.nature.onFoliage,
    fontWeight: tokens.fontWeight.semiBold,
  },
  list: {
    gap: tokens.spacing[12],
  },
  contentWide: { maxWidth: WIDE_CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
  listWide: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: tokens.spacing[16], rowGap: tokens.spacing[16] },
  fullRow: { width: "100%" },
  footerAction: {
    paddingTop: tokens.spacing[24],
  },
  emptyCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[20],
    borderWidth: 1,
    borderColor: colors.book.paperEdge,
    ...iosNeutralCardStyle(colors),
    gap: tokens.spacing[12],
    alignItems: "center",
  },
  faqCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: colors.book.paperEdge,
    ...iosNeutralCardStyle(colors),
    gap: tokens.spacing[8],
  },
  question: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  answer: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  });
}
