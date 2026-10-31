import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAQ_ITEMS } from "@/model/helpContent";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_MAX_WIDTH, WEB_GUTTER, useWebColumns, webColumnWidth } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type HelpAndFaqProps = {
  onBack: () => void;
  /** Abre as negociações em andamento, como o botão "Abrir conversas" do Figma `09.01`. */
  onOpenConversations?: () => void;
};

const WIDE_CONTENT_MAX_WIDTH = 1240;

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<CategoryFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  // Web larga: coluna mais larga, com as respostas em duas colunas.
  const wide = useIsWideWeb();
  const columns = useWebColumns(2, 3);
  const columnWidth = { width: webColumnWidth(columns) };

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
    return inQuestion || inAnswer;
  });

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Ajuda" onBack={onBack} contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={styles.headerSection}>
            <Text style={styles.heroHeadline}>Vamos ajudar.</Text>
            <Text style={styles.heroSubtitle}>
              Respostas para continuar sua próxima leitura.
            </Text>
          </View>

          <TextField
            label="Buscar dúvida"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Ex: ponto de encontro, doação, senha..."
          />

          <View style={styles.filterContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = filter === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${cat.label}`}
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
              filteredItems.map((item) => (
                <View key={item.id} style={[styles.faqCard, wide && columnWidth]}>
                  <Text style={styles.question}>{item.question}</Text>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              ))
            )}
          </View>

          {onOpenConversations ? (
            <View style={styles.footerAction}>
              <OutlinedButton
                label="Abrir conversas"
                accessibilityLabel="Abrir conversas: suas negociações em andamento"
                onPress={onOpenConversations}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    maxWidth: 720,
    alignSelf: "center",
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
    borderColor: colors.m3.outlineVariant,
    backgroundColor: colors.m3.surfaceContainerLowest,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: colors.m3.secondaryContainer,
    borderColor: colors.m3.secondaryContainer,
    borderRadius: tokens.shapeMorph.chipSelected,
    borderWidth: 0,
  },
  filterText: {
    ...tokens.typography.labelLarge,
    color: colors.m3.onSurfaceVariant,
  },
  filterTextSelected: {
    color: colors.m3.onSecondaryContainer,
  },
  list: {
    gap: tokens.spacing[12],
  },
  contentWide: { maxWidth: WIDE_CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: tokens.spacing[24] },
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
    borderColor: colors.m3.outlineVariant,
    gap: tokens.spacing[12],
    alignItems: "center",
  },
  faqCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
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
