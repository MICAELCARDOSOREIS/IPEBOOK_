import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import { ShelfRow } from "@/view/listings/shelfRow";
import { COMMUNITY_MEMBER } from "@/view/requests/receivedRequests";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import type { ReceivedRequestsState } from "@/viewmodel/useReceivedRequestsViewModel";

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
  const wideWeb = useIsWideWeb();

  const hasReserved = proposals.some(
    (item) => item.request.status === "accepted" || item.listing.status === "reserved",
  );

  return (
    <>
      {proposals.length === 0 ? (
        <Text style={styles.proposalsEmpty}>
          Nenhuma proposta em aberto. Quando alguém se interessar por um livro seu, ela aparece aqui.
        </Text>
      ) : (
        <View style={wideWeb ? styles.listCardWide : styles.listSectionMobile}>
          {wideWeb ? (
            <>
              <Text style={styles.listTitle}>
                {`${proposals.length} ${proposals.length === 1 ? "proposta" : "propostas"}`}
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3, minWidth: 220 }]}>Livro</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Modalidade</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5, minWidth: 120 }]}>Local</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.2, minWidth: 100 }]}>Situação</Text>
                <Text style={[styles.tableHeaderText, { width: 148, textAlign: "right" }]}>Ação</Text>
              </View>
            </>
          ) : null}
          {proposals.map((item) => (
            <ShelfRow
              key={item.request.id}
              wide={
                wideWeb
                  ? {
                      statusVariant: item.request.status === "accepted" ? "completed" : "reserved",
                      statusLabel: item.request.status === "accepted" ? "Aceita" : "Pendente",
                      offer: MODALITY_LABELS[item.listing.modality],
                      actionLabel: "Ver proposta",
                    }
                  : undefined
              }
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
          {hasReserved
            ? "Livro reservado! Combine os detalhes e um ponto de encontro seguro em Piripiri para concluir a troca ou entrega."
            : "Confira a proposta e combine os detalhes antes de reservar seu livro."}
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
    listSectionMobile: {
      gap: tokens.spacing[12],
    },
    listCardWide: {
      gap: tokens.spacing[4],
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[8],
      borderRadius: tokens.radius.card,
      backgroundColor: colors.m3.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    listTitle: {
      ...tokens.typography.titleMedium,
      fontVariant: ["tabular-nums"],
      color: colors.m3.onSurface,
      paddingHorizontal: tokens.spacing[16],
      paddingBottom: tokens.spacing[8],
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.m3.outlineVariant,
    },
    tableHeaderText: {
      ...tokens.typography.labelLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
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
