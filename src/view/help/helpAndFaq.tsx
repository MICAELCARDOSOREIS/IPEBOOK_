import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAQ_ITEMS } from "@/model/helpContent";
import { IconBadge } from "@/view/components/IconBadge";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";

export type HelpAndFaqProps = {
  onBack: () => void;
};

type CategoryFilter = "todos" | "seguranca" | "regras" | "suporte";

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: "todos", label: "Todas" },
  { key: "seguranca", label: "Segurança em Piripiri" },
  { key: "regras", label: "Regras e Trocas" },
  { key: "suporte", label: "Suporte e Contato" },
];

/**
 * Figma `09.01 · Ajuda` (`145:2702` / Web `370:17541`).
 */
export default function HelpAndFaq({ onBack }: HelpAndFaqProps) {
  const [filter, setFilter] = useState<CategoryFilter>("todos");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (filter === "todos") return true;
    if (filter === "seguranca") return item.category === "seguranca";
    if (filter === "regras") return item.category === "regras" || item.category === "funcionamento";
    if (filter === "suporte") return item.category === "suporte";
    return true;
  });

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Central de Ajuda" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.heroHeadline}>Vamos ajudar.</Text>
            <Text style={styles.heroSubtitle}>
              Respostas para continuar sua próxima leitura.
            </Text>
            <View style={styles.headerTitleRow}>
              <IconBadge icon="info" tone="action" />
              <Text accessibilityRole="header" style={styles.title}>
                Dúvidas frequentes
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Tudo o que você precisa saber sobre trocas, doações e segurança na comunidade de Piripiri, PI.
            </Text>
          </View>

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
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.faqCard}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
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
    color: tokens.colors.text,
  },
  heroSubtitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.secondaryText,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[4],
  },
  title: {
    flex: 1,
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.secondaryText,
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
    borderColor: tokens.colors.m3.outlineVariant,
    backgroundColor: tokens.colors.surface,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.action,
    borderColor: tokens.colors.action,
  },
  filterText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.text,
  },
  filterTextSelected: {
    color: tokens.colors.surface,
    fontWeight: "600",
  },
  list: {
    gap: tokens.spacing[12],
  },
  faqCard: {
    backgroundColor: tokens.colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    gap: tokens.spacing[8],
  },
  question: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  answer: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
});
