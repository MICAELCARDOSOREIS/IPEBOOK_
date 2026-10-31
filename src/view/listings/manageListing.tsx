import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { formatPrice } from "@/view/formatPrice";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";

export type ManageListingProps = {
  bookId: string;
  sessionUserId: string | null;
  onEdit?: (bookId: string) => void;
  onViewPublicListing?: (bookId: string) => void;
  onRemoved?: () => void;
  onBack?: () => void;
};

/** Figma `04.08 · Gerenciar anúncio` (nó `149:3348`) e `04.20 · Excluir anúncio?` (nó `397:6961`). */
export default function ManageListing({
  bookId,
  sessionUserId,
  onEdit,
  onViewPublicListing,
  onRemoved,
  onBack,
}: ManageListingProps) {
  const [state, actions] = useManageListingViewModel(bookId, sessionUserId);
  const [shareState, shareActions] = useShareListingViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  // Web larga: o livro e o estado de um lado, as ações do outro.
  const wide = useIsWideWeb();

  const handleRemove = async () => {
    const removed = await actions.remove();
    setConfirmingRemoval(false);
    if (removed) onRemoved?.();
  };

  const handleShare = async () => {
    if (!state.book) return;
    await shareActions.share(state.book.id);
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Gerenciar anúncio" onBack={() => onBack?.()} />
        <LoadingState label="Carregando anúncio" />
      </SafeAreaView>
    );
  }

  if (!state.book) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Gerenciar anúncio" onBack={() => onBack?.()} />
        <ErrorState
          message={state.error ?? "Não foi possível carregar o anúncio."}
          onRetry={() => void actions.load()}
        />
      </SafeAreaView>
    );
  }

  const { book } = state;
  const paused = book.status === "paused";
  const reserved = book.status === "reserved" || book.status === "delivered";
  const location = [book.neighborhood, book.city, book.state].filter(Boolean).join(" · ");

  const statusConfig: { title: string; hint: string; icon: AppIconName; tone: "active" | "paused" | "reserved" | "delivered" } = paused
    ? {
        title: "Anúncio pausado",
        hint: `${book.title} não aparece no catálogo enquanto estiver pausado.`,
        icon: "archive",
        tone: "paused",
      }
    : book.status === "delivered"
    ? {
        title: "Livro entregue",
        hint: `${book.title} foi entregue e saiu do catálogo. Ciclo concluído com sucesso!`,
        icon: "checkCircle",
        tone: "delivered",
      }
    : reserved
    ? {
        title: "Negociação em andamento",
        hint: `${book.title} está reservado para uma negociação aceita.`,
        icon: "swap",
        tone: "reserved",
      }
    : {
        title: "Anúncio ativo",
        hint: `${book.title} está disponível para leitores de Piripiri.`,
        icon: "checkCircle",
        tone: "active",
      };

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title="Gerenciar anúncio" onBack={() => onBack?.()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text accessibilityRole="header" style={styles.title}>Seu livro, suas escolhas.</Text>
          <Text style={styles.subtitle}>Acompanhe e atualize esta publicação.</Text>

          {shareState.linkCopied ? (
            <View style={styles.toastBanner} accessibilityRole="alert">
              <AppIcon name="checkCircle" size={18} color={colors.nature.foliage} />
              <Text style={styles.toastBannerText}>Link do anúncio copiado para a área de transferência!</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar aviso"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={shareActions.dismissLinkCopied}
              >
                <AppIcon name="close" size={16} color={colors.secondaryText} />
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.columns, wide && styles.columnsWide]}>
            {/* Coluna da Esquerda: Resumo do Livro e Status Atual */}
            <View style={[styles.column, wide && styles.columnHalf]}>
              <View style={styles.bookCard}>
                <View style={styles.bookRow}>
                  <BookCover
                    id={book.id}
                    title={book.title}
                    photoUrl={book.photoUrl}
                    variant="list"
                    showRibbon={true}
                  />
                  <View style={styles.bookTexts}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    <View style={styles.tagRow}>
                      <Tag variant={book.modality} />
                      {book.price !== undefined ? (
                        <Text style={styles.price}>{formatPrice(book.price)}</Text>
                      ) : null}
                    </View>
                    {book.condition ? (
                      <Text style={styles.bookMeta}>{BOOK_CONDITION_LABELS[book.condition]}</Text>
                    ) : null}
                    {location ? <Text style={styles.bookMeta}>{location}</Text> : null}
                  </View>
                </View>

                {/* Métricas rápidas do livro */}
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <AppIcon
                      name={book.modality === "trade" ? "swap" : book.modality === "sale" ? "category" : "heart"}
                      size={16}
                      color={colors.action}
                    />
                    <Text style={styles.statPillText}>
                      {book.modality === "trade"
                        ? "Disponível para troca"
                        : book.modality === "sale"
                        ? "Disponível para compra"
                        : "Disponível para doação"}
                    </Text>
                  </View>
                  {book.neighborhood ? (
                    <View style={styles.statPill}>
                      <AppIcon name="place" size={16} color={colors.action} />
                      <Text style={styles.statPillText}>{book.neighborhood}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View
                style={[
                  styles.statusBox,
                  statusConfig.tone === "paused" && styles.statusBoxPaused,
                  statusConfig.tone === "reserved" && styles.statusBoxReserved,
                  statusConfig.tone === "active" && styles.statusBoxActive,
                ]}
              >
                <View style={styles.statusHeader}>
                  <AppIcon
                    name={statusConfig.icon}
                    size={20}
                    color={
                      statusConfig.tone === "active"
                        ? colors.nature.foliage
                        : statusConfig.tone === "reserved"
                        ? colors.actionDeep
                        : colors.secondaryText
                    }
                  />
                  <Text style={styles.statusTitle}>{statusConfig.title}</Text>
                </View>
                <Text style={styles.statusHint}>{statusConfig.hint}</Text>
              </View>
            </View>

            {/* Coluna da Direita: Ações de Gerenciamento */}
            <View style={[styles.column, wide && styles.columnHalf]}>
              {state.error ? (
                <Text accessibilityRole="alert" style={styles.errorText}>{state.error}</Text>
              ) : null}

              <View style={styles.actionsContainer}>
                {/* 1. Editar Anúncio */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Editar anúncio"
                  accessibilityState={{ disabled: reserved }}
                  disabled={reserved}
                  onPress={() => onEdit?.(book.id)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    reserved && styles.actionCardDisabled,
                    pressed && !reserved && styles.actionCardPressed,
                  ]}
                >
                  <View style={styles.actionIconWrapper}>
                    <AppIcon name="edit" size={22} color={reserved ? colors.secondaryText : colors.action} />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={[styles.actionTitle, reserved && styles.textDisabled]}>Editar anúncio</Text>
                    <Text style={styles.actionHint}>
                      {reserved
                        ? "Edição bloqueada durante negociação ativa."
                        : "Atualize fotos, preço, descrição e estado de conservação."}
                    </Text>
                  </View>
                  <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
                </Pressable>

                {/* 2. Ver Anúncio Como Leitor */}
                {onViewPublicListing ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver anúncio como leitor"
                    onPress={() => onViewPublicListing(book.id)}
                    style={({ pressed }) => [
                      styles.actionCard,
                      pressed && styles.actionCardPressed,
                    ]}
                  >
                    <View style={styles.actionIconWrapper}>
                      <AppIcon name="visibility" size={22} color={colors.action} />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text style={styles.actionTitle}>Ver como leitor</Text>
                      <Text style={styles.actionHint}>Visualize a página pública do livro no catálogo.</Text>
                    </View>
                    <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
                  </Pressable>
                ) : null}

                {/* 3. Compartilhar Anúncio */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Compartilhar anúncio"
                  onPress={() => void handleShare()}
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.actionCardPressed,
                  ]}
                >
                  <View style={styles.actionIconWrapper}>
                    <AppIcon name="share" size={22} color={colors.action} />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionTitle}>Compartilhar anúncio</Text>
                    <Text style={styles.actionHint}>Divulgue o livro para leitores ou grupos de Piripiri.</Text>
                  </View>
                  <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
                </Pressable>

                {/* 4. Pausar ou Retomar Publicação */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={paused ? "Retomar anúncio" : "Pausar anúncio"}
                  accessibilityState={{ disabled: state.busy || reserved }}
                  disabled={state.busy || reserved}
                  onPress={() => void actions.togglePause()}
                  style={({ pressed }) => [
                    styles.actionCard,
                    (state.busy || reserved) && styles.actionCardDisabled,
                    pressed && !(state.busy || reserved) && styles.actionCardPressed,
                  ]}
                >
                  <View style={styles.actionIconWrapper}>
                    {state.busy ? (
                      <ActivityIndicator size="small" color={colors.action} />
                    ) : (
                      <AppIcon
                        name={paused ? "unarchive" : "archive"}
                        size={22}
                        color={reserved ? colors.secondaryText : colors.action}
                      />
                    )}
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={[styles.actionTitle, (state.busy || reserved) && styles.textDisabled]}>
                      {paused ? "Retomar anúncio" : "Pausar anúncio"}
                    </Text>
                    <Text style={styles.actionHint}>
                      {paused
                        ? "O livro volta a aparecer no catálogo e nas buscas."
                        : "Oculta temporariamente do catálogo sem excluir o livro."}
                    </Text>
                  </View>
                  <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
                </Pressable>
              </View>

              <View style={styles.deleteSection}>
                <TextButton
                  label="Excluir anúncio"
                  tone="danger"
                  disabled={state.busy}
                  onPress={() => setConfirmingRemoval(true)}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Dialog
        visible={confirmingRemoval}
        title="Excluir anúncio?"
        message={`${book.title} sai do catálogo e esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Manter anúncio"
        destructive
        loading={state.busy}
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmingRemoval(false)}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: tokens.spacing[16], paddingBottom: tokens.spacing[48] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    columns: { gap: tokens.spacing[16] },
    columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    column: { gap: tokens.spacing[16] },
    columnHalf: { flex: 1 },
    title: {
      ...tokens.typography.displayLarge,
      color: colors.text,
    },
    subtitle: {
      ...tokens.typography.bodyLarge,
      color: colors.secondaryText,
    },
    toastBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.nature.foliage,
      borderRadius: tokens.radius.cardSmall,
      padding: tokens.spacing[12],
    },
    toastBannerText: {
      ...tokens.typography.bodyMedium,
      color: colors.text,
      flex: 1,
    },
    bookCard: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    bookRow: {
      flexDirection: "row",
      gap: tokens.spacing[12],
    },
    bookTexts: { flex: 1, gap: tokens.spacing[4] },
    tagRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    bookTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.bold,
    },
    bookAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    bookMeta: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    price: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.action,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[8],
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      flexWrap: "wrap",
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      backgroundColor: colors.m3.surfaceContainerLow,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
    },
    statPillText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    statusBox: {
      backgroundColor: colors.soft,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      gap: tokens.spacing[6],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    statusBoxActive: {
      backgroundColor: colors.soft,
      borderColor: colors.nature.foliage,
      borderLeftWidth: 4,
    },
    statusBoxPaused: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderColor: colors.m3.outline,
      borderLeftWidth: 4,
    },
    statusBoxReserved: {
      backgroundColor: colors.ipe.petalSoft,
      borderColor: colors.action,
      borderLeftWidth: 4,
    },
    statusHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    statusTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.semiBold,
    },
    statusHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    actionsContainer: {
      gap: tokens.spacing[8],
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.cardSmall,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[14],
      minHeight: tokens.accessibility.touchTarget,
    },
    actionCardPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
      transform: [{ scale: 0.99 }],
    },
    actionCardDisabled: {
      opacity: 0.5,
    },
    actionIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerLow,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTexts: { flex: 1, gap: tokens.spacing[2] },
    actionTitle: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    actionHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 18,
    },
    textDisabled: {
      color: colors.secondaryText,
    },
    deleteSection: {
      marginTop: tokens.spacing[8],
      alignItems: "center",
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
