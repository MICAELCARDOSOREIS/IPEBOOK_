import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeAuthViewModel, makeBlockedUsersViewModel } from "@/di/container";
import { Avatar } from "@/view/components/Avatar";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { LoadingState } from "@/view/components/LoadingState";
import { Snackbar } from "@/view/components/Snackbar";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import type { BlockedUser } from "@/model/entities/blockedUser";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";
import { withPress } from "@/view/pressFeedback";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
export type BlockedUsersProps = {
  onBack: () => void;
};

/**
 * Figma `07.10` a `07.12 · Pessoas bloqueadas`.
 * Lista pessoas bloqueadas pelo usuário com opção de desbloqueio confirmado.
 */
export function BlockedUsers({ onBack }: BlockedUsersProps) {
  const guardedBack = useGuardedPress(onBack);
  const [authState] = makeAuthViewModel();
  // Web larga: coluna mais ampla e dois cartões por linha.
  const wide = useIsWideWeb();
  const sessionUserId = authState.user?.id ?? null;
  const [state, actions] = makeBlockedUsersViewModel(sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [targetToUnblock, setTargetToUnblock] = useState<BlockedUser | null>(null);

  async function handleConfirmUnblock() {
    if (!targetToUnblock) return;
    const ok = await actions.unblockUser(targetToUnblock.userId);
    if (ok) {
      setTargetToUnblock(null);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      {wide ? (
        <View style={styles.wideHeader}>
          <View style={styles.wideHeaderLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={guardedBack}
              style={withPress(styles.wideBackButton)}
            >
              <AppIcon name="back" size={20} color={colors.m3.onSurface} />
            </Pressable>
            <View>
              <Text accessibilityRole="header" style={styles.wideTitle}>
                Pessoas bloqueadas
              </Text>
              <Text style={styles.wideSubtitle}>
                Gerencie os perfis que não podem interagir com você
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TopAppBar contentMaxWidth={undefined} title="Pessoas bloqueadas" onBack={guardedBack} />
      )}
      {state.loading ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text style={styles.introText}>
            Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
          </Text>
          <LoadingState label="Carregando pessoas bloqueadas" variant="conversations" />
        </View>
      ) : state.error ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text style={styles.introText}>
            Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
          </Text>
          <ErrorState message={state.error} onRetry={() => void actions.reload()} />
        </View>
      ) : state.blockedUsers.length === 0 ? (
        <View style={[styles.content, wide && styles.contentWide]}>
          <View style={[styles.emptyContainer, wide && styles.emptyWide]}>
            <View style={styles.emptyIconCircle}>
              <AppIcon name="lock" size={32} color={colors.secondaryText} />
            </View>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              Nenhuma pessoa bloqueada
            </Text>
            <Text style={styles.emptySubtitle}>
              Você não possui pessoas bloqueadas no momento.
            </Text>
            <Text style={styles.introTextCard}>
              Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          key={wide ? "grid-blocked-2" : "list-blocked-1"}
          numColumns={wide ? 2 : 1}
          columnWrapperStyle={wide ? styles.gridRow : undefined}
          data={state.blockedUsers}
          keyExtractor={(item) => item.userId}
          {...standardVerticalScrollProps}
          style={styles.flexOne}
          contentContainerStyle={[
            styles.content,
            wide && styles.contentWide,
            { paddingBottom: scrollBottomPadding.withoutBottomBar },
          ]}
          ListHeaderComponent={
            <Text style={styles.introText}>
              Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
            </Text>
          }
          ItemSeparatorComponent={() => <View style={{ height: tokens.spacing[16] }} />}
          renderItem={({ item }) => (
            <View style={[styles.card, wide && styles.cardWide]}>
              <View style={styles.userRow}>
                <Avatar name={item.name} photoUrl={item.photoUrl} size={40} />
                <View style={styles.userText}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.blockedDate}>Bloqueado na comunidade</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Desbloquear ${item.name}`}
                  accessibilityState={{ disabled: state.unblockingId === item.userId }}
                  disabled={state.unblockingId === item.userId}
                  onPress={() => setTargetToUnblock(item)}
                  style={withPress(styles.unblockButton)}
                >
                  <Text style={styles.unblockButtonText}>Desbloquear</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Dialog
        visible={targetToUnblock !== null}
        title="Desbloquear pessoa?"
        message={
          targetToUnblock
            ? `Deseja desbloquear ${targetToUnblock.name}? Essa pessoa voltará a ver seus livros e poderá enviar propostas.`
            : ""
        }
        confirmLabel="Desbloquear"
        cancelLabel="Cancelar"
        loading={state.unblockingId !== null}
        onConfirm={() => void handleConfirmUnblock()}
        onCancel={() => setTargetToUnblock(null)}
      />

      <Snackbar
        visible={state.actionMessage !== null}
        message={state.actionMessage ?? ""}
        onDismiss={actions.clearActionMessage}
      />
    </SafeAreaView>
  );
}

const WIDE_CONTENT_MAX_WIDTH = WEB_MAX_WIDTH;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      minHeight: 0,
    },
    flexOne: {
      flex: 1,
      minHeight: 0,
    },
    wideHeader: {
      width: "100%",
      maxWidth: WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[12],
    },
    wideHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    wideBackButton: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    wideTitle: {
      ...tokens.typography.brandLargeTitle,
      color: colors.brandBrown,
    },
    wideSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[2],
    },
    scroll: {
      flexGrow: 1,
    },
    content: {
      width: "100%",
      padding: tokens.spacing[24],
      gap: tokens.spacing[16],
    },
    introText: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    status: {
      padding: tokens.spacing[24],
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      paddingVertical: tokens.spacing[32],
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
    },
    emptyWide: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.card,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[40],
      maxWidth: 640,
      width: "100%",
      alignSelf: "center",
      marginTop: tokens.spacing[16],
    },
    introTextCard: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 480,
      marginTop: tokens.spacing[8],
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: tokens.radius.circle64,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[4],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    emptyTitle: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      textAlign: "center",
    },
    emptySubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: 320,
    },
    list: {
      gap: tokens.spacing[12],
    },
    contentWide: { maxWidth: WIDE_CONTENT_MAX_WIDTH, alignSelf: "center", paddingHorizontal: WEB_GUTTER },
    gridRow: { gap: tokens.spacing[16] },
    cardWide: { flex: 1 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
    },
    userText: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    userName: {
      ...tokens.typography.bodyLarge,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    blockedDate: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    unblockButton: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.full,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
    },
    unblockButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.action,
    },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
