import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Book } from "@/model/entities/book";
import { AppIcon } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export type OwnerPendingProposalCardProps = {
  counterpartName: string;
  initialMessage?: string | null;
  offeredBook?: Book | null;
  isWebStandalone?: boolean;
  responding: boolean;
  error?: string | null;
  onAccept: () => void;
  onReject: () => void;
};

/**
 * Cartão exibido ao anunciante quando há proposta pendente de aceitação no chat.
 */
export function OwnerPendingProposalCard({
  counterpartName,
  initialMessage,
  offeredBook,
  isWebStandalone = false,
  responding,
  error,
  onAccept,
  onReject,
}: OwnerPendingProposalCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.proposalCard, isWebStandalone && styles.proposalCardWide]}>
      <View style={styles.proposalHeader}>
        <View style={styles.proposalIconBox}>
          <AppIcon name="swap" size={18} color={colors.nature.foliage} />
        </View>
        <View style={styles.proposalText}>
          <Text style={styles.proposalTitle}>Nova proposta recebida</Text>
          <Text style={styles.proposalSubtitle}>
            Aceite para reservar o livro e liberar a conversa para combinar a entrega.
          </Text>
        </View>
      </View>

      {initialMessage ? (
        <View style={styles.proposalInitialMessageBox}>
          <Text style={styles.proposalInitialMessageLabel}>Mensagem de {counterpartName}:</Text>
          <Text style={styles.proposalInitialMessageText}>"{initialMessage}"</Text>
        </View>
      ) : null}

      {offeredBook ? (
        <View style={styles.proposalOfferedBookBox}>
          <Text style={styles.proposalOfferedBookLabel}>Livro oferecido em troca:</Text>
          <View style={styles.proposalOfferedBookRow}>
            <BookCover id={offeredBook.id} title={offeredBook.title} photoUrl={offeredBook.photoUrl} variant="list" />
            <View style={styles.proposalOfferedBookText}>
              <Text style={styles.proposalOfferedBookTitle} numberOfLines={1}>{offeredBook.title}</Text>
              <Text style={styles.proposalOfferedBookAuthor} numberOfLines={1}>{offeredBook.author}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.proposalActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aceitar proposta"
          disabled={responding}
          onPress={onAccept}
          style={withPress(styles.proposalAcceptButton)}
        >
          <Text style={styles.proposalAcceptText}>Aceitar proposta</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recusar proposta"
          disabled={responding}
          onPress={onReject}
          style={withPress(styles.proposalRejectButton)}
        >
          <Text style={styles.proposalRejectText}>Recusar</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.proposalError}>{error}</Text> : null}
    </View>
  );
}

export type BuyerPendingProposalBannerProps = {
  initialMessage?: string | null;
  offeredBook?: Book | null;
  isWebStandalone?: boolean;
};

/**
 * Faixa exibida ao solicitante enquanto a proposta aguarda resposta do anunciante.
 */
export function BuyerPendingProposalBanner({
  initialMessage,
  offeredBook,
  isWebStandalone = false,
}: BuyerPendingProposalBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.buyerProposalBanner, isWebStandalone && styles.buyerProposalBannerWide]}>
      <AppIcon name="info" size={16} color={colors.m3.onSecondaryContainer} />
      <View style={styles.buyerProposalTextContainer}>
        <Text style={styles.buyerProposalText}>
          Sua proposta foi enviada. O bate-papo será liberado assim que o anunciante aceitar.
        </Text>
        {initialMessage ? (
          <Text style={styles.buyerProposalSubtext} numberOfLines={2}>
            Sua mensagem: "{initialMessage}"
          </Text>
        ) : null}
        {offeredBook ? (
          <Text style={styles.buyerProposalSubtext} numberOfLines={1}>
            Livro oferecido: {offeredBook.title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    proposalCard: {
      backgroundColor: colors.nature.sprout,
      marginHorizontal: tokens.spacing[16],
      marginTop: tokens.spacing[8],
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[12],
      gap: tokens.spacing[8],
      borderWidth: 1,
      borderColor: colors.nature.foliage,
    },
    proposalCardWide: {
      marginHorizontal: tokens.spacing[20],
      marginTop: tokens.spacing[12],
    },
    proposalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    proposalIconBox: {
      width: 32,
      height: 32,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.nature.onFoliage,
      alignItems: "center",
      justifyContent: "center",
    },
    proposalText: {
      flex: 1,
      gap: 2,
    },
    proposalTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.bold,
      color: colors.nature.foliageDeep,
    },
    proposalSubtitle: {
      ...tokens.typography.labelSmall,
      color: colors.nature.foliageDeep,
    },
    proposalActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      marginTop: tokens.spacing[4],
    },
    proposalAcceptButton: {
      flex: 1,
      minHeight: tokens.accessibility.touchTarget,
      backgroundColor: colors.nature.foliage,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
    },
    proposalAcceptText: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.nature.onFoliage,
    },
    proposalRejectButton: {
      minHeight: tokens.accessibility.touchTarget,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outline,
    },
    proposalRejectText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    proposalError: {
      ...tokens.typography.labelSmall,
      color: colors.error,
    },
    proposalInitialMessageBox: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      padding: tokens.spacing[10],
      borderRadius: tokens.radius.cardSmall,
      gap: tokens.spacing[2],
    },
    proposalInitialMessageLabel: {
      ...tokens.typography.labelSmall,
      color: colors.nature.foliageDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    proposalInitialMessageText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
      fontStyle: "italic",
    },
    proposalOfferedBookBox: {
      backgroundColor: colors.m3.surfaceContainerLowest,
      padding: tokens.spacing[10],
      borderRadius: tokens.radius.cardSmall,
      gap: tokens.spacing[6],
    },
    proposalOfferedBookLabel: {
      ...tokens.typography.labelSmall,
      color: colors.nature.foliageDeep,
      fontWeight: tokens.fontWeight.semiBold,
    },
    proposalOfferedBookRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
    },
    proposalOfferedBookText: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    proposalOfferedBookTitle: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurface,
    },
    proposalOfferedBookAuthor: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    buyerProposalBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.secondaryContainer,
      marginHorizontal: tokens.spacing[16],
      marginTop: tokens.spacing[8],
      borderRadius: tokens.radius.small,
      padding: tokens.spacing[10],
      gap: tokens.spacing[8],
    },
    buyerProposalBannerWide: {
      marginHorizontal: tokens.spacing[20],
      marginTop: tokens.spacing[12],
    },
    buyerProposalText: {
      flex: 1,
      ...tokens.typography.labelSmall,
      color: colors.m3.onSecondaryContainer,
    },
    buyerProposalTextContainer: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    buyerProposalSubtext: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSecondaryContainer,
      opacity: 0.85,
    },
  });
}
