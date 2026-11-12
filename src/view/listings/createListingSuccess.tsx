import { useCallback, useMemo } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Book } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { Manchete } from "@/view/components/Manchete";
import { BookCover } from "@/view/components/BookCover";
import { FilledButton } from "@/view/components/FilledButton";
import { Tag } from "@/view/components/Tag";
import { AppIcon } from "@/view/components/AppIcon";
import { Snackbar } from "@/view/components/Snackbar";
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";
import { makeShareListingViewModel } from "@/di/container";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useExpressivePress } from "@/view/useExpressivePress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

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
  const guardedViewMyListings = useGuardedPress(onViewMyListings);
  const guardedGoHome = useGuardedPress(onGoHome);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [shareState, shareActions] = makeShareListingViewModel();

  const {
    scale: whatsappScale,
    isPressed: isWhatsappPressed,
    onPressIn: whatsappPressIn,
    onPressOut: whatsappPressOut,
  } = useExpressivePress();

  const shareableListing = useMemo(
    () => ({
      title: published.title,
      author: published.author,
      modality: published.modality,
      price: published.price,
      neighborhood: published.neighborhood,
      condition: published.condition,
      category: published.category,
      isBox: published.isBox,
      boxVolumesCount: published.boxVolumesCount,
      photoUrl: published.photoUrl,
    }),
    [published],
  );

  const handleShareWhatsApp = useCallback(() => {
    void shareActions.shareToWhatsApp(published.id, shareableListing);
  }, [published.id, shareableListing, shareActions]);

  const handleShare = useCallback(() => {
    void shareActions.share(published.id, shareableListing);
  }, [published.id, shareableListing, shareActions]);

  return (
    <SafeAreaView style={styles.page}>
      <IpePetalsCelebration />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        {...standardVerticalScrollProps}
      >
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <Manchete texto="Seu livro ganhou" realce="um novo começo." />
            <Text style={styles.subtitle}>
              O anúncio já aparece para leitores de Piripiri.
            </Text>
            <View style={styles.successBadge}>
              <View style={styles.successIconCircle}>
                <AppIcon name="check" size={15} color={colors.surface} />
              </View>
              <Text style={styles.successBadgeText}>Publicado com sucesso</Text>
            </View>
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
                  <AppIcon name="place" size={13} color={colors.secondaryText} />
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

          {/* Próximos passos com design M3 refinado */}
          <View style={styles.stepsContainer}>
            <View style={styles.sectionHeaderRow}>
              <AppIcon name="info" size={16} color={colors.action} />
              <Text style={styles.sectionLabel}>Próximos passos</Text>
            </View>

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
                  Escolham juntos um ponto seguro e o horário.
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

          {/* Ações com hierarquia clara (Lei de Hick & Fitts) */}
          <View style={styles.actionsBlock}>
            {/* WhatsApp Hero Button */}
            <Animated.View style={{ transform: [{ scale: whatsappScale }] }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Divulgar no WhatsApp"
                accessibilityHint="Abre o WhatsApp para divulgar o anúncio em grupos ou status de Piripiri."
                onPress={handleShareWhatsApp}
                onPressIn={whatsappPressIn}
                onPressOut={whatsappPressOut}
                style={[
                  styles.whatsappPrimaryButton,
                  isWhatsappPressed && styles.whatsappButtonPressed,
                ]}
              >
                <AppIcon name="whatsapp" size={20} color={colors.nature.onFoliage} />
                <Text style={styles.whatsappPrimaryButtonText}>Divulgar no WhatsApp</Text>
              </Pressable>
            </Animated.View>

            <FilledButton
              label="Ver estante"
              onPress={guardedViewMyListings}
            />

            {/* Ações secundárias agrupadas em linha (clean e minimalista) */}
            <View style={styles.secondaryActionsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Compartilhar anúncio"
                accessibilityHint="Abre opções para copiar link ou enviar anúncio por outros apps."
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.secondaryLinkButton,
                  pressed && styles.secondaryLinkPressed,
                ]}
              >
                <AppIcon name="share" size={16} color={colors.action} />
                <Text style={styles.secondaryLinkText}>Compartilhar anúncio</Text>
              </Pressable>

              <View style={styles.secondaryDivider} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar ao início"
                accessibilityHint="Retorna para a tela inicial do aplicativo."
                onPress={guardedGoHome}
                style={({ pressed }) => [
                  styles.secondaryLinkButton,
                  pressed && styles.secondaryLinkPressed,
                ]}
              >
                <Text style={styles.secondaryLinkText}>Voltar ao início</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <Snackbar
        visible={shareState.linkCopied}
        message="Link do anúncio copiado para a área de transferência!"
        onDismiss={shareActions.dismissLinkCopied}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      position: "relative",
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[16],
      paddingBottom: Math.max(scrollBottomPadding.withoutBottomBar, tokens.spacing[40]),
    },
    content: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      gap: tokens.spacing[16],
    },
    headerBlock: {
      gap: tokens.spacing[6],
      alignItems: "flex-start",
    },
    successBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      backgroundColor: colors.m3.secondaryContainer,
      paddingVertical: tokens.spacing[6],
      paddingLeft: tokens.spacing[8],
      paddingRight: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      alignSelf: "flex-start",
      marginTop: tokens.spacing[6],
    },
    successIconCircle: {
      width: 26,
      height: 26,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
      alignItems: "center",
      justifyContent: "center",
    },
    successBadgeText: {
      ...tokens.typography.labelLarge,
      color: colors.action,
      fontWeight: tokens.fontWeight.semiBold,
      letterSpacing: 0.2,
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
      padding: tokens.spacing[14],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    coverWrapper: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    publishedTexts: {
      flex: 1,
      gap: tokens.spacing[3],
    },
    modalityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    locationChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[2],
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
      padding: tokens.spacing[14],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[10],
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[2],
    },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
    },
    nextStep: {
      flexDirection: "row",
      gap: tokens.spacing[10],
      alignItems: "flex-start",
    },
    stepNumberBadge: {
      width: 24,
      height: 24,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    nextStepNumber: {
      color: colors.action,
      textAlign: "center",
      fontFamily: tokens.typography.labelMedium.fontFamily,
      fontWeight: tokens.fontWeight.bold,
      fontSize: 12,
    },
    nextStepTexts: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    nextStepTitle: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    nextStepHint: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      lineHeight: tokens.lineHeight[16],
    },
    stepDivider: {
      height: 1,
      backgroundColor: colors.m3.outlineVariant,
      marginLeft: 34,
    },
    actionsBlock: {
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[4],
    },
    whatsappPrimaryButton: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[10],
      borderRadius: tokens.shapeMorph.buttonRest,
      backgroundColor: colors.nature.foliage,
      paddingHorizontal: tokens.spacing[20],
      shadowColor: colors.nature.foliage,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 2,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    whatsappButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      opacity: 0.92,
    },
    whatsappPrimaryButtonText: {
      color: colors.nature.onFoliage,
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.semiBold,
    },
    secondaryActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[12],
      marginTop: tokens.spacing[4],
      paddingVertical: tokens.spacing[4],
    },
    secondaryLinkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    secondaryLinkPressed: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      opacity: 0.8,
    },
    secondaryLinkText: {
      ...tokens.typography.labelLarge,
      color: colors.action,
      fontWeight: tokens.fontWeight.medium,
    },
    secondaryDivider: {
      width: 1,
      height: 16,
      backgroundColor: colors.m3.outlineVariant,
    },
  });
}
