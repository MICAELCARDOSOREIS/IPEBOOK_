import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { TextButton } from "@/view/components/TextButton";
import { withPress } from "@/view/pressFeedback";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ReservedListingSheetProps = {
  visible: boolean;
  onClose: () => void;
  status: "reserved" | "delivered";
  category?: string | null;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: () => void;
  onSearchCategory?: (category: string) => void;
  onViewOwnerProfile?: () => void;
  ownerName?: string | null;
};

/**
 * Folha informativa M3 Expressive aberta ao tocar na pílula "Reservado" ou "Entregue" (Spec 110).
 * Apresenta contexto da reserva e atalhos úteis (favoritar para ser avisado, buscar na categoria e perfil).
 */
export function ReservedListingSheet({
  visible,
  onClose,
  status,
  category,
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
  onSearchCategory,
  onViewOwnerProfile,
  ownerName,
}: ReservedListingSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const isReserved = status === "reserved";
  const title = isReserved ? "Exemplar Reservado" : "Exemplar Entregue";
  const message = isReserved
    ? "Este livro já está reservado para outro leitor de Piripiri em uma troca ou entrega agendada. Se o encontro não for concluído em até 7 dias, a reserva cai e o exemplar volta a ficar disponível."
    : "Este exemplar já foi entregue e a negociação foi concluída com sucesso entre os leitores da comunidade.";

  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      aria-modal
    >
      <View style={styles.scrim}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar informações da reserva"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: tokens.spacing[16] + insets.bottom }]}>
          <View style={styles.handle} />

          {/* Cabeçalho informativo com ícone temático */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <AppIcon
                name={isReserved ? "bookmark" : "checkCircle"}
                size={28}
                color={colors.m3.primary}
              />
            </View>
            <View style={styles.headerTextCol}>
              <Text accessibilityRole="header" style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>

          {/* Lista de Ações Úteis */}
          <View style={styles.actionsList}>
            {/* 1. Favoritar / Lista de Espera */}
            {isReserved && onToggleFavorite ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite
                    ? "Livro salvo nos favoritos. Toque para remover aviso."
                    : "Favoritar para ser avisado se a reserva for cancelada"
                }
                disabled={favoriteLoading}
                onPress={onToggleFavorite}
                style={withPress(styles.actionCard)}
              >
                <View style={styles.actionIconBox}>
                  <AppIcon
                    name={isFavorite ? "heartFill" : "heart"}
                    size={22}
                    color={isFavorite ? colors.ipe.bloomDeep : colors.m3.onSurfaceVariant}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    {isFavorite ? "Salvo nos seus favoritos" : "Avisar se voltar a ficar disponível"}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    {isFavorite
                      ? "Você receberá uma notificação se o livro voltar."
                      : "Adicione aos favoritos para entrar na lista de espera."}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* 2. Buscar por outros livros da mesma categoria */}
            {category && onSearchCategory ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Buscar outros livros da categoria ${category}`}
                onPress={() => {
                  onClose();
                  onSearchCategory(category);
                }}
                style={withPress(styles.actionCard)}
              >
                <View style={styles.actionIconBox}>
                  <AppIcon name="search" size={22} color={colors.m3.primary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Outros livros de {category}</Text>
                  <Text style={styles.actionSubtitle}>
                    Ver exemplares disponíveis em Piripiri
                  </Text>
                </View>
                <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : null}

            {/* 3. Ver outros livros do anunciante */}
            {onViewOwnerProfile ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil e outros anúncios de ${ownerName ?? "deste leitor"}`}
                onPress={() => {
                  onClose();
                  onViewOwnerProfile();
                }}
                style={withPress(styles.actionCard)}
              >
                <View style={styles.actionIconBox}>
                  <AppIcon name="person" size={22} color={colors.m3.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    Outros livros de {ownerName ? ownerName.split(" ")[0] : "deste leitor"}
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Aproveite o mesmo encontro para circular mais títulos
                  </Text>
                </View>
                <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Botão de Fechar */}
          <View style={styles.footerRow}>
            <TextButton label="Entendi" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: colors.m3.scrim ?? "rgba(0, 0, 0, 0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopLeftRadius: tokens.radius.xl,
      borderTopRightRadius: tokens.radius.xl,
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[12],
    },
    handle: {
      width: 32,
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.outlineVariant,
      alignSelf: "center",
      marginBottom: tokens.spacing[16],
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[16],
      marginBottom: tokens.spacing[20],
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTextCol: {
      flex: 1,
    },
    title: {
      fontFamily: fontFamily.brand,
      fontSize: tokens.fontSize[20],
      lineHeight: tokens.lineHeight[28],
      color: colors.m3.onSurface,
      marginBottom: tokens.spacing[4],
    },
    message: {
      fontFamily: fontFamily.regular,
      fontSize: tokens.fontSize[14],
      lineHeight: tokens.lineHeight[20],
      color: colors.m3.onSurfaceVariant,
    },
    actionsList: {
      gap: tokens.spacing[8],
      marginBottom: tokens.spacing[16],
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: tokens.radius.card,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    actionIconBox: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
      alignItems: "center",
      justifyContent: "center",
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontFamily: fontFamily.medium,
      fontSize: tokens.fontSize[14],
      lineHeight: tokens.lineHeight[20],
      color: colors.m3.onSurface,
    },
    actionSubtitle: {
      fontFamily: fontFamily.regular,
      fontSize: tokens.fontSize[12],
      lineHeight: tokens.lineHeight[16],
      color: colors.m3.onSurfaceVariant,
    },
    footerRow: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: tokens.spacing[4],
    },
  });
}
