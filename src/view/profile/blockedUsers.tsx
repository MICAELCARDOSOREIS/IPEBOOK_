import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
      <TopAppBar contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} title="Pessoas bloqueadas" onBack={guardedBack} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        {...standardVerticalScrollProps}
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text style={styles.introText}>
            Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
          </Text>

          {state.loading ? (
            <LoadingState label="Carregando pessoas bloqueadas" variant="conversations" />
          ) : state.error ? (
            <ErrorState message={state.error} onRetry={() => void actions.reload()} />
          ) : state.blockedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="lock" size={32} color={colors.secondaryText} />
              </View>
              <Text accessibilityRole="header" style={styles.emptyTitle}>
                Nenhuma pessoa bloqueada
              </Text>
              <Text style={styles.emptySubtitle}>
                Você não possui pessoas bloqueadas no momento.
              </Text>
            </View>
          ) : (
            <View style={[styles.list, wide && styles.listWide]}>
              {state.blockedUsers.map((item) => (
                <View key={item.userId} style={[styles.card, wide && styles.cardWide]}>
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
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
    listWide: { flexDirection: "row", flexWrap: "wrap" },
    cardWide: { flexBasis: "48%", flexGrow: 0 },
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
