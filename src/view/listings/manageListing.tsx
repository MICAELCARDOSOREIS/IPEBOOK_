import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { makeManageListingViewModel, makeShareListingViewModel } from "@/di/container";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { BookCover } from "@/view/components/BookCover";
import { Breadcrumb } from "@/view/components/Breadcrumb";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { LoadingState } from "@/view/components/LoadingState";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { formatPrice } from "@/view/formatPrice";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_GUTTER } from "@/view/webLayout";

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
  const guardedBack = useGuardedPress(onBack);
  const guardedEdit = useGuardedPress(onEdit);
  const guardedViewPublic = useGuardedPress(onViewPublicListing);
  const guardedRemoved = useGuardedPress(onRemoved);
  const [state, actions] = makeManageListingViewModel(bookId, sessionUserId);
  const [shareState, shareActions] = makeShareListingViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  // Web larga: o livro e o estado de um lado, as ações do outro.
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

  const contentMaxWidth = wide ? 1040 : 560;

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
  const reserved = book.status === "reserved" || book.status === "delivered";
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
        hint: `${book.title} não aparece no catálogo enquanto estiver pausado.`,
        icon: "archive",
        tone: "paused",
        iconColor: colors.secondaryText,
        badgeBg: colors.m3.surfaceContainerLow,
      }
    : book.status === "delivered"
    ? {
        title: "Livro entregue",
        hint: `${book.title} foi entregue e saiu do catálogo. Ciclo concluído com sucesso!`,
        icon: "checkCircle",
        tone: "delivered",
        iconColor: colors.nature.foliage,
        badgeBg: colors.nature.sprout,
      }
    : reserved
    ? {
        title: "Negociação em andamento",
        hint: `${book.title} está reservado para uma negociação aceita.`,
        icon: "swap",
        tone: "reserved",
        iconColor: colors.actionDeep,
        badgeBg: colors.ipe.container,
      }
    : {
        title: "Anúncio ativo",
        hint: `${book.title} está disponível para leitores de Piripiri.`,
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
      <View style={[styles.content, wide && styles.contentWide]}>
        {wide ? (
          <Breadcrumb
            items={[
              { label: "Estante", onPress: guardedBack, accessibilityLabel: "Voltar para Estante" },
              { label: book.title, isCurrent: true },
            ]}
            style={styles.breadcrumb}
          />
        ) : null}

        {/* Cabeçalho Ergonômico: compacto e escaneável */}
        <View style={styles.headerBlock}>
          <Text accessibilityRole="header" style={styles.title}>
            Seu livro, suas escolhas.
          </Text>
          <Text style={styles.subtitle}>Acompanhe e atualize esta publicação.</Text>
        </View>

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

        <View style={[styles.columns, wide && styles.columnsWide]}>
          {/* Coluna da Esquerda: Resumo do Livro e Status Atual */}
          <View style={[styles.column, wide && styles.columnHalf]}>
            {/* Card com Resumo do Livro */}
            <View
              style={styles.bookCard}
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
                  showRibbon={true}
                />
                <View style={styles.bookTexts}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {book.author}
                  </Text>
                  <View style={styles.tagRow}>
                    <Tag variant={book.modality} />
                    {book.price !== undefined ? (
                      <Text style={styles.price}>{formatPrice(book.price)}</Text>
                    ) : null}
                  </View>
                  {book.condition ? (
                    <Text style={styles.bookMeta}>{BOOK_CONDITION_LABELS[book.condition]}</Text>
                  ) : null}
                  {location ? (
                    <Text style={styles.bookMeta} numberOfLines={1}>
                      {location}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Informações rápidas em pílulas */}
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

            {/* Caixa de Status do Anúncio */}
            <View
              accessible={true}
              accessibilityRole="summary"
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Status do anúncio: ${statusConfig.title}. ${statusConfig.hint}`}
              style={[
                styles.statusBox,
                statusConfig.tone === "paused" && styles.statusBoxPaused,
                statusConfig.tone === "reserved" && styles.statusBoxReserved,
                statusConfig.tone === "active" && styles.statusBoxActive,
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
                  <Text style={styles.statusBadgeSubtitle}>Situação no catálogo</Text>
                </View>
              </View>
              <Text style={styles.statusHint}>{statusConfig.hint}</Text>
            </View>
          </View>

          {/* Coluna da Direita: Ações de Gerenciamento Agrupadas */}
          <View style={[styles.column, wide && styles.columnHalf]}>
            {state.error ? <InlineErrorCard message={state.error} /> : null}

            {/* Grupo 1: Edição e Visualização */}
            <View style={styles.actionGroup}>
              <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
                Edição e visualização
              </Text>

              {/* 1. Editar Anúncio */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar anúncio"
                accessibilityHint="Abre o formulário para alterar fotos, preço, descrição e estado de conservação."
                accessibilityState={{ disabled: reserved }}
                disabled={reserved}
                onPress={() => guardedEdit(book.id)}
                style={({ pressed }) => [
                  styles.actionCard,
                  reserved && styles.actionCardDisabled,
                  pressed && !reserved && styles.actionCardPressed,
                ]}
              >
                <View style={[styles.actionIconWrapper, { backgroundColor: colors.soft }]}>
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
                  accessibilityHint="Abre a visualização do anúncio como os outros leitores o veem no catálogo."
                  onPress={() => guardedViewPublic(book.id)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.actionCardPressed,
                  ]}
                >
                  <View style={[styles.actionIconWrapper, { backgroundColor: colors.soft }]}>
                    <AppIcon name="visibility" size={22} color={colors.action} />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionTitle}>Ver como leitor</Text>
                    <Text style={styles.actionHint}>Visualize a página pública do livro no catálogo.</Text>
                  </View>
                  <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
                </Pressable>
              ) : null}
            </View>

            {/* Grupo 2: Divulgação e Compartilhamento */}
            <View style={styles.actionGroup}>
              <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
                Divulgar e compartilhar
              </Text>

              {/* 3. Divulgar no WhatsApp */}
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
                <View style={[styles.actionIconWrapper, { backgroundColor: colors.nature.sprout }]}>
                  <AppIcon name="whatsapp" size={22} color={colors.nature.foliage} />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={styles.actionTitle}>Divulgar no WhatsApp</Text>
                  <Text style={styles.actionHint}>Envie direto para status e grupos de Piripiri.</Text>
                </View>
                <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
              </Pressable>

              {/* 4. Compartilhar Anúncio */}
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
                <View style={[styles.actionIconWrapper, { backgroundColor: colors.m3.surfaceContainerLow }]}>
                  <AppIcon name="share" size={22} color={colors.action} />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={styles.actionTitle}>Compartilhar anúncio</Text>
                  <Text style={styles.actionHint}>Copie o link ou envie por outros aplicativos.</Text>
                </View>
                <AppIcon name="chevronRight" size={20} color={colors.secondaryText} />
              </Pressable>
            </View>

            {/* Grupo 3: Disponibilidade e Visibilidade */}
            <View style={styles.actionGroup}>
              <Text accessibilityRole="header" style={styles.sectionHeaderTitle}>
                Disponibilidade no catálogo
              </Text>

              {/* 5. Pausar ou Retomar Publicação */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={paused ? "Retomar anúncio" : "Pausar anúncio"}
                accessibilityHint={
                  paused
                    ? "Reativa este anúncio para voltar a ser encontrado pelos leitores."
                    : "Oculta temporariamente este livro das buscas e do catálogo sem apagá-lo."
                }
                accessibilityState={{ disabled: state.busy || reserved }}
                disabled={state.busy || reserved}
                onPress={() => void actions.togglePause()}
                style={({ pressed }) => [
                  styles.actionCard,
                  (state.busy || reserved) && styles.actionCardDisabled,
                  pressed && !(state.busy || reserved) && styles.actionCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.actionIconWrapper,
                    {
                      backgroundColor: paused
                        ? colors.nature.sprout
                        : colors.m3.surfaceContainerLow,
                    },
                  ]}
                >
                  {state.busy ? (
                    <ActivityIndicator size="small" color={colors.action} />
                  ) : (
                    <AppIcon
                      name={paused ? "unarchive" : "archive"}
                      size={22}
                      color={reserved ? colors.secondaryText : paused ? colors.nature.foliage : colors.action}
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

            {/* Grupo 4: Zona de Perigo / Exclusão Definitiva */}
            <View style={styles.dangerZone}>
              <View style={styles.dangerZoneHeader}>
                <AppIcon name="delete" size={18} color={colors.error} />
                <Text style={styles.dangerZoneTitle}>Zona de exclusão</Text>
              </View>
              <Text style={styles.dangerZoneDescription}>
                Remover o livro cancela a publicação de forma definitiva e o retira da sua estante.
              </Text>
              <View style={styles.deleteButtonContainer}>
                <TextButton
                  label="Excluir anúncio"
                  tone="danger"
                  accessibilityLabel="Excluir anúncio"
                  disabled={state.busy || reserved}
                  onPress={() => setConfirmingRemoval(true)}
                />
              </View>
              {reserved ? (
                <Text style={styles.deleteHint}>
                  Conclua ou cancele a negociação em andamento para excluir este anúncio.
                </Text>
              ) : null}
            </View>
          </View>
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
    content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
    contentWide: { maxWidth: 1040, paddingHorizontal: WEB_GUTTER },
    breadcrumb: { marginBottom: tokens.spacing[4] },
    headerBlock: {
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[4],
    },
    title: {
      ...tokens.typography.headlineMedium,
      color: colors.text,
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
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
    columns: { gap: tokens.spacing[16] },
    columnsWide: { flexDirection: "row", alignItems: "flex-start", gap: tokens.spacing[24] },
    column: { gap: tokens.spacing[16] },
    columnHalf: { flex: 1 },
    bookCard: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
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
      paddingTop: tokens.spacing[10],
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      flexWrap: "wrap",
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      backgroundColor: colors.m3.surfaceContainerLow,
      paddingHorizontal: tokens.spacing[10],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
    },
    statPillText: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    statusBox: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      gap: tokens.spacing[8],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    statusBoxActive: {
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
      fontWeight: tokens.fontWeight.semiBold,
    },
    statusBadgeSubtitle: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    statusHint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    actionGroup: {
      gap: tokens.spacing[8],
    },
    sectionHeaderTitle: {
      ...tokens.typography.labelLarge,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.semiBold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: tokens.spacing[2],
      marginBottom: tokens.spacing[2],
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
    dangerZone: {
      marginTop: tokens.spacing[8],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[14],
      gap: tokens.spacing[6],
    },
    dangerZoneHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
    },
    dangerZoneTitle: {
      ...tokens.typography.labelLarge,
      color: colors.error,
      fontWeight: tokens.fontWeight.semiBold,
    },
    dangerZoneDescription: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    deleteButtonContainer: {
      alignItems: "flex-start",
      paddingTop: tokens.spacing[4],
    },
    deleteHint: {
      ...tokens.typography.footnote,
      color: colors.secondaryText,
      marginTop: tokens.spacing[4],
    },
  });
}
