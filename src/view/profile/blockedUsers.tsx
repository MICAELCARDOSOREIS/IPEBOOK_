import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBlockedUsersViewModel } from "@/viewmodel/useBlockedUsersViewModel";
import { Avatar } from "@/view/components/Avatar";
import { Dialog } from "@/view/components/Dialog";
import { Snackbar } from "@/view/components/Snackbar";
import { TopAppBar } from "@/view/components/TopAppBar";
import { AppIcon } from "@/view/components/AppIcon";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import type { BlockedUser } from "@/model/entities/blockedUser";

export type BlockedUsersProps = {
  onBack: () => void;
};

/**
 * Figma `07.10` a `07.12 · Pessoas bloqueadas`.
 * Lista pessoas bloqueadas pelo usuário com opção de desbloqueio confirmado.
 */
export function BlockedUsers({ onBack }: BlockedUsersProps) {
  const [authState] = useAuthViewModel();
  const sessionUserId = authState.user?.id ?? null;
  const [state, actions] = useBlockedUsersViewModel(sessionUserId);
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
      <TopAppBar title="Pessoas bloqueadas" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.introText}>
            Pessoas bloqueadas não podem visualizar seus anúncios, enviar propostas de livros nem combinar encontros com você em Piripiri.
          </Text>

          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.action} accessibilityLabel="Carregando pessoas bloqueadas" />
            </View>
          ) : state.error ? (
            <View style={styles.card}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {state.error}
              </Text>
            </View>
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
            <View style={styles.list}>
              {state.blockedUsers.map((item) => (
                <View key={item.userId} style={styles.card}>
                  <View style={styles.userRow}>
                    <Avatar name={item.name} photoUrl={item.photoUrl} size={40} />
                    <View style={styles.userText}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.blockedDate}>Bloqueado na comunidade</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Desbloquear ${item.name}`}
                      onPress={() => setTargetToUnblock(item)}
                      style={styles.unblockButton}
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
      maxWidth: 720,
      alignSelf: "center",
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
      borderRadius: 32,
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
      gap: 2,
    },
    userName: {
      ...tokens.typography.bodyLarge,
      fontWeight: "600",
      color: colors.text,
    },
    blockedDate: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
    },
    unblockButton: {
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[8],
      borderRadius: tokens.radius.small,
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
