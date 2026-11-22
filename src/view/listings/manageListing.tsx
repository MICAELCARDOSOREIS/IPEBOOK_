import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { makeManageListingViewModel, makeShareListingViewModel } from "@/di/container";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { LoadingState } from "@/view/components/LoadingState";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Tag } from "@/view/components/Tag";
import { TopAppBar } from "@/view/components/TopAppBar";
import { formatPrice } from "@/view/formatPrice";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, fontFamily, tokens } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useOnRefocus } from "@/view/useRefocusKey";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { withPress } from "@/view/pressFeedback";

export type ManageListingProps = {
  bookId: string;
  sessionUserId: string | null;
  focusKey?: number;
  onEdit?: (bookId: string) => void;
  onViewPublicListing?: (bookId: string) => void;
  onRemoved?: () => void;
  onBack?: () => void;
};

/** Figma `04.08 · Gerenciar anúncio` (nó `149:3348`) e `04.20 · Excluir anúncio?` (nó `397:6961`). */
export default function ManageListing({
  bookId,
  sessionUserId,
  focusKey,
  onEdit,
  onViewPublicListing,
  onRemoved,
  onBack,
}: ManageListingProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedEdit = useGuardedPress(onEdit);
  const guardedViewPublic = useGuardedPress(onViewPublicListing);
  const guardedRemoved = useGuardedPress(onRemoved);
  const [state, actions] = makeManageListingViewModel(bookId, sessionUserId);
  useOnRefocus(focusKey, () => {
    void actions.load();
  });
  const [shareState, shareActions] = makeShareListingViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const wide = useIsWideWeb();

  const handleRemove = async () => {
    const removed = await actions.remove();
    setConfirmingRemoval(false);
    if (removed) guardedRemoved();
  };

  const handleShare = async () => {
    if (!state.book) return;
    await shareActions.share(state.book.id, {
      title: state.book.title,
      author: state.book.author,
      modality: state.book.modality,
      price: state.book.price,
      neighborhood: state.book.neighborhood,
      condition: state.book.condition,
      category: state.book.category,
      isBox: state.book.isBox,
      boxVolumesCount: state.book.boxVolumesCount,
      photoUrl: state.book.photoUrl,
    });
  };

  const handleShareWhatsApp = async () => {
    if (!state.book) return;
    await shareActions.shareToWhatsApp(state.book.id, {
      title: state.book.title,
      author: state.book.author,
      modality: state.book.modality,
      price: state.book.price,
      neighborhood: state.book.neighborhood,
      condition: state.book.condition,
      category: state.book.category,
      isBox: state.book.isBox,
      boxVolumesCount: state.book.boxVolumesCount,
      photoUrl: state.book.photoUrl,
    });
  };

  const contentMaxWidth = wide ? 1120 : 560;

  if (state.loading) {
    return (
      <ScreenContainer
        maxWidth={contentMaxWidth}
        header={<TopAppBar contentMaxWidth={contentMaxWidth} title="Gerenciar anúncio" onBack={guardedBack} />}
        scroll={false}
      >
        <View style={styles.loadingContainer}>
          <LoadingState label="Carregando anúncio" variant="manage" />
        </View>
      </ScreenContainer>
    );
  }

  if (!state.book) {
    return (
      <ScreenContainer
        maxWidth={contentMaxWidth}
        header={<TopAppBar contentMaxWidth={contentMaxWidth} title="Gerenciar anúncio" onBack={guardedBack} />}
        scroll={false}
      >
        <View style={styles.loadingContainer}>
          <ErrorState
            message={state.error ?? "Não foi possível carregar o anúncio."}
            onRetry={() => void actions.load()}
          />
        </View>
      </ScreenContainer>
    );
  }

  const { book } = state;
  const paused = book.status === "paused";
  const delivered = book.status === "delivered";
  const locked = book.status === "reserved" || delivered;
  const location = [book.neighborhood, book.city, book.state].filter(Boolean).join(" · ");

  const statusConfig: {
    title: string;
    hint: string;
    icon: AppIconName;
    tone: "active" | "paused" | "reserved" | "delivered";
    iconColor: string;
    badgeBg: string;
  } = paused
    ? {
        title: "Anúncio pausado",
        hint: "Oculto no catálogo até ser retomado.",
        icon: "archive",
        tone: "paused",
        iconColor: colors.secondaryText,
        badgeBg: colors.m3.surfaceContainerLow,
      }
    : delivered
    ? {
        title: "Livro entregue",
        hint: "A entrega foi concluída.",
        icon: "checkCircle",
        tone: "delivered",
        iconColor: colors.nature.foliage,
        badgeBg: colors.nature.sprout,
      }
    : locked
    ? {
        title: "Negociação em andamento",
        hint: "Reservado até o fim da negociação.",
        icon: "swap",
        tone: "reserved",
        iconColor: colors.actionDeep,
        badgeBg: colors.ipe.container,
      }
    : {
        title: "Anúncio ativo",
        hint: "Visível no catálogo de Piripiri.",
        icon: "checkCircle",
        tone: "active",
        iconColor: colors.nature.foliage,
        badgeBg: colors.nature.sprout,
      };

  const bookSummaryA11y = `Resumo do anúncio: ${book.title}, de ${book.author}. Modalidade: ${
    book.modality === "sale"
      ? `Venda por ${formatPrice(book.price ?? 0)}`
      : book.modality === "trade"
      ? "Disponível para troca"
      : "Disponível para doação"
  }. Conservação: ${book.condition ? BOOK_CONDITION_LABELS[book.condition] : "não especificada"}.${
    location ? ` Localização: ${location}.` : ""
  }`;

  return (
    <ScreenContainer
      maxWidth={contentMaxWidth}
      header={<TopAppBar contentMaxWidth={contentMaxWidth} title="Gerenciar anúncio" onBack={guardedBack} />}
      contentStyle={styles.containerContent}
    >
      <View style={styles.content}>
        {shareState.linkCopied ? (
          <View
            style={styles.toastBanner}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <AppIcon name="checkCircle" size={20} color={colors.nature.foliage} />
            <Text style={styles.toastBannerText}>Link do anúncio copiado para a área de transferência!</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar aviso"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={shareActions.dismissLinkCopied}
              style={styles.toastCloseButton}
            >
              <AppIcon name="close" size={18} color={colors.secondaryText} />
            </Pressable>
          </View>
        ) : null}

        {/* Compartilhar também pode falhar (validação ou folha do sistema): o erro fica visível aqui. */}
        {shareState.error ? <InlineErrorCard message={shareState.error} /> : null}

        {state.error ? <InlineErrorCard message={state.error} /> : null}

        <View style={styles.overview}>
          <View style={[styles.overviewDetails, wide && styles.overviewDetailsWide]}>
            <View
              style={styles.bookSummary}
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel={bookSummaryA11y}
            >
              <View style={styles.bookRow}>
                <BookCover
                  id={book.id}
                  title={book.title}
                  photoUrl={book.photoUrl}
                  variant="list"
                />
                <View style={styles.bookTexts}>
                  <Text accessibilityRole="header" style={styles.bookTitle}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookAuthor}>
                    {book.author}
                  </Text>

                  <View style={styles.tagRow}>
                    <Tag variant={book.modality} />
                    {book.price !== undefined ? (
                      <Text style={styles.price}>{formatPrice(book.price)}</Text>
                    ) : null}
                  </View>

                  <View style={styles.metaRow}>
                    {book.condition ? (
                      <View style={styles.metaBadge}>
                        <Text style={styles.bookMeta}>{BOOK_CONDITION_LABELS[book.condition]}</Text>
                      </View>
                    ) : null}
                    {location ? (
                      <View style={styles.metaBadge}>
                        <AppIcon name="place" size={13} color={colors.secondaryText} />
                        <Text style={styles.bookMeta}>
                          {location}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            <View
              accessible={true}
              accessibilityRole="summary"
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Status do anúncio: ${statusConfig.title}. ${statusConfig.hint}`}
              style={[
                styles.statusBox,
                wide && styles.statusBoxWide,
                statusConfig.tone === "paused" && styles.statusBoxPaused,
                statusConfig.tone === "reserved" && styles.statusBoxReserved,
                (statusConfig.tone === "active" || delivered) && styles.statusBoxActive,
              ]}
            >
              <View style={styles.statusHeader}>
                <View style={[styles.statusIconBadge, { backgroundColor: statusConfig.badgeBg }]}>
                  <AppIcon
                    name={statusConfig.icon}
                    size={20}
                    color={statusConfig.iconColor}
                  />
                </View>
                <View style={styles.statusTitleGroup}>
                  <Text style={styles.statusTitle}>{statusConfig.title}</Text>
                  <Text style={styles.statusHint}>{statusConfig.hint}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.shortcuts}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar anúncio"
              accessibilityHint="Abre o formulário para editar o anúncio."
              accessibilityState={{ disabled: locked }}
              disabled={locked}
              onPress={() => guardedEdit(book.id)}
              style={locked ? [styles.shortcut, styles.primaryShortcut, styles.actionCardDisabled]
                : withPress([styles.shortcut, styles.primaryShortcut])}
            >
              <AppIcon name="edit" size={18} color={colors.m3.onPrimary} />
              <Text style={styles.primaryShortcutText}>Editar anúncio</Text>
            </Pressable>
            {onViewPublicListing ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver anúncio como leitor"
                accessibilityHint="Abre a visualização pública do anúncio."
                onPress={() => guardedViewPublic(book.id)}
                style={withPress(styles.shortcut)}
              >
                <AppIcon name="visibility" size={18} color={colors.action} />
                <Text style={styles.shortcutText}>Ver anúncio como leitor</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={[styles.actionGroups, wide && styles.actionGroupsWide]}>
          <View style={[styles.actionGroup, wide && styles.actionGroupWide]}>
            <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
              Divulgação
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Divulgar no WhatsApp"
              accessibilityHint="Abre o WhatsApp com mensagem formatada para enviar a grupos ou status de Piripiri."
              onPress={() => void handleShareWhatsApp()}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: "#E8F5E9" }]}>
                <AppIcon name="whatsapp" size={22} color="#1B5E20" />
              </View>
              <View style={styles.actionTexts}>
                <Text style={styles.actionTitle}>Divulgar no WhatsApp</Text>
                <Text style={styles.actionHint}>Envie direto para status e grupos de Piripiri.</Text>
              </View>
              <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar anúncio"
              accessibilityHint="Abre o menu para copiar link ou enviar anúncio por outros aplicativos."
              onPress={() => void handleShare()}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: colors.ipe.container }]}>
                <AppIcon name="share" size={22} color={colors.ipe.onContainer} />
              </View>
              <View style={styles.actionTexts}>
                <Text style={styles.actionTitle}>Compartilhar anúncio</Text>
                <Text style={styles.actionHint}>Copie o link ou envie por outros aplicativos.</Text>
              </View>
              <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
            </Pressable>
          </View>

          <View style={[styles.actionGroup, wide && styles.actionGroupWide]}>
            <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
              Disponibilidade no catálogo
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={paused ? "Retomar anúncio" : "Pausar anúncio"}
              accessibilityHint={
                paused
                  ? "Reativa este anúncio para voltar a ser encontrado pelos leitores."
                  : "Oculta temporariamente este livro das buscas e do catálogo sem apagá-lo."
              }
              accessibilityState={{ disabled: state.busy || locked }}
              disabled={state.busy || locked}
              onPress={() => void actions.togglePause()}
              style={({ pressed }) => [
                styles.actionCard,
                (state.busy || locked) && styles.actionCardDisabled,
                pressed && !(state.busy || locked) && styles.actionCardPressed,
              ]}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  {
                    backgroundColor: paused
                      ? colors.nature.sprout
                      : colors.m3.surfaceContainerHigh,
                  },
                ]}
              >
                {state.busy ? (
                  <ActivityIndicator size="small" color={colors.action} />
                ) : (
                  <AppIcon
                    name={paused ? "unarchive" : "archive"}
                    size={22}
                    color={locked ? colors.secondaryText : paused ? colors.nature.foliage : colors.secondaryText}
                  />
                )}
              </View>
              <View style={styles.actionTexts}>
                <Text style={[styles.actionTitle, (state.busy || locked) && styles.textDisabled]}>
                  {paused ? "Retomar anúncio" : "Pausar anúncio"}
                </Text>
                <Text style={styles.actionHint}>
                  {delivered
                    ? "A entrega encerrou a publicação."
                    : locked
                      ? "O anúncio está reservado para uma negociação."
                      : paused
                        ? "O livro volta ao catálogo e às buscas."
                        : "Oculta temporariamente o livro do catálogo."}
                </Text>
              </View>
              <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
            </Pressable>
          </View>
        </View>

        <View style={styles.actionGroup}>
          <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
            Exclusão
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir anúncio"
            accessibilityHint="Abre o diálogo de confirmação para remover definitivamente este anúncio da sua estante."
            accessibilityState={{ disabled: state.busy || locked }}
            disabled={state.busy || locked}
            onPress={() => setConfirmingRemoval(true)}
            style={({ pressed }) => [
              styles.actionCard,
              (state.busy || locked) && styles.actionCardDisabled,
              pressed && !(state.busy || locked) && styles.actionCardPressed,
            ]}
          >
            <View style={styles.deleteIconWrapper}>
              <AppIcon
                name="delete"
                size={22}
                color={locked ? colors.secondaryText : colors.error}
              />
            </View>
            <View style={styles.actionTexts}>
              <Text style={[styles.deleteActionTitle, (state.busy || locked) && styles.textDisabled]}>
                Excluir anúncio
              </Text>
              <Text style={styles.deleteActionHint}>
                Cancela a publicação e remove o livro da sua estante.
              </Text>
            </View>
            <AppIcon
              name="chevronRight"
              size={20}
              color={locked ? colors.secondaryText : colors.error}
            />
          </Pressable>

          {locked ? (
            <View style={styles.reservedWarningBox}>
              <AppIcon name="info" size={16} color={colors.actionDeep} />
              <Text style={styles.deleteHint}>
                {delivered
                  ? "O anúncio de um livro entregue fica no histórico."
                  : "A exclusão fica indisponível enquanto houver uma negociação em andamento."}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

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
    </ScreenContainer>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    loadingContainer: { flex: 1, padding: tokens.spacing[16], justifyContent: "center" },
    containerContent: { paddingBottom: tokens.spacing[40] },
    content: { gap: tokens.spacing[24] },
    overview: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      padding: tokens.spacing[16],
      gap: tokens.spacing[16],
    },
    overviewDetails: { gap: tokens.spacing[16] },
    overviewDetailsWide: { flexDirection: "row", alignItems: "center" },
    bookSummary: { flex: 1, minWidth: 0 },
    shortcuts: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
      paddingTop: tokens.spacing[12],
      borderTopWidth: 1,
      borderTopColor: colors.book.paperEdge,
    },
    shortcut: {
      maxWidth: "100%",
      minHeight: tokens.accessibility.touchTarget,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
    },
    primaryShortcut: { backgroundColor: colors.action, borderColor: colors.action },
    shortcutText: { ...tokens.typography.labelLarge, color: colors.action, flexShrink: 1 },
    primaryShortcutText: { ...tokens.typography.labelLarge, color: colors.m3.onPrimary, flexShrink: 1 },
    toastBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      backgroundColor: colors.nature.sprout,
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
    toastCloseButton: {
      minWidth: 32,
      minHeight: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    actionGroups: { gap: tokens.spacing[20] },
    actionGroupsWide: { flexDirection: "row", alignItems: "flex-start" },
    bookRow: {
      flexDirection: "row",
      gap: tokens.spacing[14],
      alignItems: "center",
    },
    bookTexts: { flex: 1, minWidth: 0, gap: tokens.spacing[4] },
    tagRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8], marginTop: tokens.spacing[2] },
    bookTitle: {
      ...tokens.typography.titleLarge,
      color: colors.text,
    },
    bookAuthor: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      flexWrap: "wrap",
      marginTop: tokens.spacing[4],
    },
    metaBadge: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "100%",
      gap: tokens.spacing[4],
      backgroundColor: colors.m3.surfaceContainerLow,
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[4],
      borderRadius: tokens.radius.full,
    },
    bookMeta: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      flexShrink: 1,
    },
    price: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.action,
    },
    statusBox: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      padding: tokens.spacing[16],
      gap: tokens.spacing[8],
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    statusBoxWide: { width: 320 },
    statusBoxActive: {
      backgroundColor: colors.nature.sprout,
      borderColor: colors.nature.foliage,
      borderLeftWidth: 4,
    },
    statusBoxPaused: {
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
      gap: tokens.spacing[10],
    },
    statusIconBadge: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    statusTitleGroup: {
      flex: 1,
    },
    statusTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontFamily: fontFamily.semiBold,
    },
    statusHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    actionGroupWide: { flex: 1 },
    actionGroup: {
      minWidth: 0,
      gap: tokens.spacing[8],
    },
    sectionHeaderTitle: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
      fontFamily: fontFamily.semiBold,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      paddingHorizontal: tokens.spacing[4],
      marginTop: tokens.spacing[4],
      marginBottom: tokens.spacing[2],
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      padding: tokens.spacing[10],
      minHeight: tokens.accessibility.touchTarget,
      elevation: 1,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    actionCardPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
      transform: [{ scale: 0.98 }],
    },
    actionCardDisabled: {
      opacity: 0.45,
    },
    actionIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.cardSmall,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTexts: { flex: 1, minWidth: 0, gap: tokens.spacing[2] },
    actionTitle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.text,
    },
    actionHint: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 18,
    },
    textDisabled: {
      color: colors.secondaryText,
    },
    deleteIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.cardSmall,
      backgroundColor: colors.errorContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteActionTitle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.error,
    },
    deleteActionHint: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 18,
    },
    reservedWarningBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      backgroundColor: colors.ipe.petalSoft,
      padding: tokens.spacing[10],
      borderRadius: tokens.radius.cardSmall,
      marginTop: tokens.spacing[4],
    },
    deleteHint: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      flex: 1,
      lineHeight: 18,
    },
  });
}
