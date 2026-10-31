import { useCallback, useMemo } from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
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
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { AppIcon } from "@/view/components/AppIcon";
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";

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

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Acabei de anunciar o livro "${published.title}" no IPEBOOK! Venha conferir na comunidade de leitores de Piripiri: https://ipebook.com.br/livro/${published.id}`,
        title: published.title,
      });
    } catch {
      // Ignora cancelamentos de compartilhamento
    }
  }, [published.id, published.title]);

  return (
    <SafeAreaView style={styles.page}>
      <IpePetalsCelebration />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <View style={styles.badgeContainer}>
              <IconBadge icon="check" tone="action" size="large" />
            </View>
            <Manchete texto="Seu livro ganhou" realce="um novo começo." />
            <Text style={styles.subtitle}>
              O anúncio já aparece para leitores de Piripiri.
            </Text>
          </View>

          {/* Cartão de destaque do livro publicado */}
          <View style={styles.publishedCard}>
            <View style={styles.coverWrapper}>
              <BookCover
                id={published.id}
                title={published.title}
                photoUrl={published.photoUrl}
                variant="list"
              />
            </View>
            <View style={styles.publishedTexts}>
              <View style={styles.modalityRow}>
                <Tag variant={published.modality} />
                <View style={styles.locationChip}>
                  <AppIcon name="place" size={14} color={colors.secondaryText} />
                  <Text style={styles.locationText}>Piripiri, PI</Text>
                </View>
              </View>
              <Text style={styles.publishedTitle} numberOfLines={2}>
                {published.title}
              </Text>
              <Text style={styles.publishedAuthor} numberOfLines={1}>
                {published.author}
              </Text>
              {published.price !== undefined ? (
                <Text style={styles.publishedPrice}>{formatPrice(published.price)}</Text>
              ) : null}
            </View>
          </View>

          {/* Próximos passos com design M3 */}
          <View style={styles.stepsContainer}>
            <Text style={styles.sectionLabel}>Próximos passos</Text>

            <View style={styles.nextStep}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.nextStepNumber}>1</Text>
              </View>
              <View style={styles.nextStepTexts}>
                <Text style={styles.nextStepTitle}>Espere o primeiro contato</Text>
                <Text style={styles.nextStepHint}>
                  Você recebe uma notificação quando alguém se interessar.
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.nextStep}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.nextStepNumber}>2</Text>
              </View>
              <View style={styles.nextStepTexts}>
                <Text style={styles.nextStepTitle}>Combine em local público</Text>
                <Text style={styles.nextStepHint}>
                  Escolham juntos o ponto, o dia e o horário.
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.nextStep}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.nextStepNumber}>3</Text>
              </View>
              <View style={styles.nextStepTexts}>
                <Text style={styles.nextStepTitle}>Conclua pelo app</Text>
                <Text style={styles.nextStepHint}>
                  No encontro, confirme a entrega via QR code com facilidade e segurança.
                </Text>
              </View>
            </View>
          </View>

          {/* Ações */}
          <View style={styles.actionsBlock}>
            <FilledButton
              label="Ver estante"
              onPress={() => onViewMyListings?.()}
            />
            <OutlinedButton
              label="Compartilhar anúncio"
              icon={<AppIcon name="share" size={18} color={colors.action} />}
              onPress={() => void handleShare()}
            />
            <TextButton label="Voltar ao início" onPress={() => onGoHome?.()} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[48],
    },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[20],
    },
    headerBlock: {
      gap: tokens.spacing[8],
      alignItems: "flex-start",
    },
    badgeContainer: {
      marginBottom: tokens.spacing[4],
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
      marginTop: tokens.spacing[2],
    },
    publishedCard: {
      flexDirection: "row",
      gap: tokens.spacing[16],
      alignItems: "center",
      padding: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    coverWrapper: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    publishedTexts: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    modalityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: tokens.spacing[2],
    },
    locationChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    locationText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    publishedTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.semiBold,
    },
    publishedAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    publishedPrice: {
      ...tokens.typography.titleMedium,
      fontWeight: tokens.fontWeight.bold,
      color: colors.action,
      marginTop: tokens.spacing[2],
    },
    stepsContainer: {
      padding: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[14],
    },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
      marginBottom: tokens.spacing[4],
    },
    nextStep: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      alignItems: "flex-start",
    },
    stepNumberBadge: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
    },
    nextStepNumber: {
      color: colors.action,
      textAlign: "center",
      fontFamily: tokens.typography.labelMedium.fontFamily,
      fontWeight: tokens.fontWeight.bold,
      fontSize: 14,
    },
    nextStepTexts: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    nextStepTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    nextStepHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: tokens.lineHeight[20],
    },
    stepDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      marginLeft: 40,
    },
    actionsBlock: {
      gap: tokens.spacing[10],
      marginTop: tokens.spacing[4],
    },
  });
}
