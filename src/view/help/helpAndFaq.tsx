import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAQ_ITEMS } from "@/model/helpContent";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type HelpAndFaqProps = {
  onBack: () => void;
  /** Abre as negociações em andamento, como o botão "Abrir conversas" do Figma `09.01`. */
  onOpenConversations?: () => void;
};

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
      <TopAppBar title="Ajuda" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
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
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.list}>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyCard}>
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
                <View key={item.id} style={styles.faqCard}>
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
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
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
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[8],
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    backgroundColor: colors.surface,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: colors.action,
    borderColor: colors.action,
  },
  filterText: {
    ...tokens.typography.labelMedium,
    color: colors.text,
  },
  filterTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
  list: {
    gap: tokens.spacing[12],
  },
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
