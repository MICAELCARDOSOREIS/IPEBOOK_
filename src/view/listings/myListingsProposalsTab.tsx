import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import type { ReceivedRequestsState } from "@/viewmodel/useReceivedRequestsViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import { ShelfRow } from "@/view/listings/shelfRow";

const MODALITY_LABELS: Readonly<Record<BookModality, string>> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

export function proposalSummary(item: ReceivedRequestsState["items"][number]): string {
  const stage = item.request.status === "accepted" ? "negociação aceita" : "proposta recebida";
  return [item.requesterName ?? COMMUNITY_MEMBER, stage, MODALITY_LABELS[item.listing.modality]].join(" · ");
}

export type MyListingsProposalsTabProps = {
  proposals: ReceivedRequestsState["items"];
  onNavigateToReceivedRequests?: () => void;
  onNavigateToNegotiationDetail?: (requestId: string) => void;
};

export function MyListingsProposalsTab({
  proposals,
  onNavigateToReceivedRequests,
  onNavigateToNegotiationDetail,
}: MyListingsProposalsTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      {proposals.length === 0 ? (
        <Text style={styles.proposalsEmpty}>
          Nenhuma proposta em aberto. Quando alguém se interessar por um livro seu, ela aparece aqui.
        </Text>
      ) : (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>
            {`${proposals.length} ${proposals.length === 1 ? "proposta" : "propostas"}`}
          </Text>
          {proposals.map((item) => (
            <ShelfRow
              key={item.request.id}
              book={item.listing}
              summary={proposalSummary(item)}
              accessibilityLabel={`Abrir proposta para ${item.listing.title}`}
              onPress={() =>
                item.request.status === "accepted"
                  ? onNavigateToNegotiationDetail?.(item.request.id)
                  : onNavigateToReceivedRequests?.()
              }
            />
          ))}
        </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Tudo pela conversa</Text>
        <Text style={styles.orientationHint}>
          Confira a proposta e combine os detalhes antes de reservar seu livro.
        </Text>
      </View>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    proposalsEmpty: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      paddingVertical: tokens.spacing[16],
    },
    listCard: {
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[4],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    listTitle: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
    },
    infoCard: {
      marginTop: tokens.spacing[16],
      padding: tokens.spacing[16],
      gap: tokens.spacing[4],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainer,
    },
    infoCardTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurface,
    },
    orientationHint: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[8],
    },
  });
}
