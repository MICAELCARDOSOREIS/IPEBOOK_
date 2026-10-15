import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAQ_ITEMS, type FaqItem } from "@/model/helpContent";
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
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text accessibilityRole="header" style={styles.title}>
            Dúvidas frequentes
          </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  headerSection: {
    gap: tokens.spacing[6],
  },
  title: {
    fontSize: tokens.typography.titleLarge.fontSize,
    fontWeight: "700",
    color: tokens.colors.action,
  },
  subtitle: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    lineHeight: 22,
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
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.action,
    borderColor: tokens.colors.action,
  },
  filterText: {
    fontSize: tokens.typography.labelMedium.fontSize,
    fontWeight: "500",
    color: tokens.colors.text,
  },
  filterTextSelected: {
    color: tokens.colors.surface,
  },
  list: {
    gap: tokens.spacing[12],
  },
  faqCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: tokens.spacing[8],
  },
  question: {
    fontSize: tokens.typography.titleMedium.fontSize,
    fontWeight: "600",
    color: tokens.colors.text,
    lineHeight: 24,
  },
  answer: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    color: tokens.colors.secondaryText,
    lineHeight: 22,
  },
});
