import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { Manchete } from "@/view/components/Manchete";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";

export type CreateListingSuccessProps = {
  published: Book;
  onViewMyListings?: () => void;
  onGoHome?: () => void;
};

export function CreateListingSuccess({
  published,
  onViewMyListings,
  onGoHome,
}: CreateListingSuccessProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <IconBadge icon="check" tone="action" />
          <Manchete texto="Seu livro ganhou" realce="um novo começo." />
          <Text style={styles.subtitle}>
            O anúncio já aparece para leitores de Piripiri.
          </Text>

          <View style={styles.publishedRow}>
            <BookCover
              id={published.id}
              title={published.title}
              photoUrl={published.photoUrl}
              variant="list"
            />
            <View style={styles.publishedTexts}>
              <Tag variant={published.modality} />
              <Text style={styles.publishedTitle}>{published.title}</Text>
              <Text style={styles.publishedAuthor}>{published.author}</Text>
              {published.price !== undefined ? (
                <Text style={styles.publishedPrice}>{formatPrice(published.price)}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionLabel}>Próximos passos</Text>
          <View style={styles.nextStep}>
            <Text style={styles.nextStepNumber}>1</Text>
            <View style={styles.nextStepTexts}>
              <Text style={styles.nextStepTitle}>Espere o primeiro contato</Text>
              <Text style={styles.nextStepHint}>
                Você recebe uma notificação quando alguém se interessar.
              </Text>
            </View>
          </View>
          <View style={styles.nextStep}>
            <Text style={styles.nextStepNumber}>2</Text>
            <View style={styles.nextStepTexts}>
              <Text style={styles.nextStepTitle}>Combine em local público</Text>
              <Text style={styles.nextStepHint}>
                Escolham juntos o ponto, o dia e o horário.
              </Text>
            </View>
          </View>

          <FilledButton
            label="Ver estante"
            onPress={() => onViewMyListings?.()}
          />
          <TextButton label="Voltar ao início" onPress={() => onGoHome?.()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[16],
    },
    subtitle: {
      fontSize: tokens.typography.bodyLarge.fontSize,
      lineHeight: tokens.typography.bodyLarge.lineHeight,
      fontFamily: tokens.typography.bodyLarge.fontFamily,
      color: colors.secondaryText,
    },
    publishedRow: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      alignItems: "center",
    },
    publishedTexts: { flex: 1, gap: tokens.spacing[4] },
    publishedTitle: {
      fontSize: tokens.typography.titleMedium.fontSize,
      lineHeight: tokens.typography.titleMedium.lineHeight,
      fontFamily: tokens.typography.titleMedium.fontFamily,
      fontWeight: tokens.typography.titleMedium.fontWeight,
      color: colors.text,
    },
    publishedAuthor: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      color: colors.secondaryText,
    },
    publishedPrice: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      fontWeight: "600",
      color: colors.action,
    },
    sectionLabel: {
      fontSize: tokens.typography.titleMedium.fontSize,
      lineHeight: tokens.typography.titleMedium.lineHeight,
      fontFamily: tokens.typography.titleMedium.fontFamily,
      fontWeight: tokens.typography.titleMedium.fontWeight,
      color: colors.text,
    },
    nextStep: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "flex-start" },
    nextStepNumber: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      color: colors.action,
      textAlign: "center",
      lineHeight: 28,
      fontFamily: tokens.typography.labelMedium.fontFamily,
      fontWeight: "600",
    },
    nextStepTexts: { flex: 1, gap: 2 },
    nextStepTitle: {
      fontSize: tokens.typography.bodyLarge.fontSize,
      lineHeight: tokens.typography.bodyLarge.lineHeight,
      fontFamily: tokens.typography.bodyLarge.fontFamily,
      fontWeight: "600",
      color: colors.text,
    },
    nextStepHint: {
      fontSize: tokens.typography.bodyMedium.fontSize,
      lineHeight: tokens.typography.bodyMedium.lineHeight,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
      color: colors.secondaryText,
    },
  });
}
