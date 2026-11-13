import { useEffect, useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { makeAuthViewModel, makeNetworkStatus } from "@/di/container";
import { IpeMark } from "@/view/components/IpeMark";
import { OfflineState } from "@/view/components/OfflineState";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useHydrated } from "@/view/useHydrated";

export type RequireAuthProps = {
  /** Chamada quando a pessoa não tem sessão ativa (ex.: replaceOnce("/entrar")). */
  onRequireSignIn: () => void;
  children: ReactNode;
};

/**
 * Rede de segurança de acesso (Spec 092): o catálogo só é servido a pessoas conectadas.
 * Enquanto a sessão é verificada mostra tela acolhedora com a marca do Ipê e feedback visual;
 * quando não há internet e não há sessão em cache, oferece estado offline amigável e ações claras.
 */
export function RequireAuth({ onRequireSignIn, children }: RequireAuthProps) {
  const [authState, authActions] = makeAuthViewModel();
  const hydrated = useHydrated();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  let isOnline = true;
  try {
    const net = makeNetworkStatus();
    isOnline = net.isOnline;
  } catch {
    isOnline = true;
  }

  useEffect(() => {
    if (!authState.loading && !authState.user && isOnline) {
      onRequireSignIn();
    }
  }, [authState.loading, authState.user, isOnline, onRequireSignIn]);

  // Se estiver sem conexão e sem usuário em cache, apresenta estado offline acolhedor
  if (hydrated && !isOnline && !authState.user && !authState.loading) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} maxWidth={480}>
        <View style={styles.centerContainer}>
          <OfflineState
            message="Você está sem conexão com a internet."
            retryLabel="Tentar novamente"
            onRetry={() => {
              void authActions.refreshSession?.();
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir para o início"
            onPress={onRequireSignIn}
            style={withPress(styles.secondaryButton)}
          >
            <Text style={styles.secondaryButtonText}>Ir para o início</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // Enquanto verifica a sessão: tela de abertura do Ipê acolhedora e elegante.
  // `!hydrated` mantém a primeira renderização do cliente igual ao HTML estático (Spec 136).
  if (!hydrated || authState.loading) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} maxWidth={480}>
        <View style={styles.loadingContainer}>
          <View style={styles.ipeIconBox}>
            <IpeMark size={84} />
          </View>
          <Text style={styles.loadingTitle}>Verificando sua sessão…</Text>
          <Text style={styles.loadingSubtitle}>
            Conectando à estante comunitária de Piripiri
          </Text>
          {!isOnline ? (
            <View style={styles.offlineWarningPill}>
              <Text style={styles.offlineWarningText}>
                Sem conexão. Tentando reconectar…
              </Text>
            </View>
          ) : null}
        </View>
      </ScreenContainer>
    );
  }

  if (!authState.user) return null;
  return <>{children}</>;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[16],
      gap: tokens.spacing[16],
      minHeight: 360,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: tokens.spacing[24],
      gap: tokens.spacing[12],
      minHeight: 360,
    },
    ipeIconBox: {
      width: 104,
      height: 104,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.ipe.petalSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: tokens.spacing[8],
      elevation: 2,
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    loadingTitle: {
      ...tokens.typography.titleMedium,
      fontWeight: tokens.fontWeight.bold,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    loadingSubtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
      maxWidth: 280,
    },
    offlineWarningPill: {
      marginTop: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      backgroundColor: colors.errorContainer,
      borderRadius: tokens.radius.full,
    },
    offlineWarningText: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onErrorContainer,
      fontWeight: tokens.fontWeight.bold,
    },
    secondaryButton: {
      marginTop: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[20],
      paddingVertical: tokens.spacing[10],
      borderRadius: tokens.radius.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    secondaryButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.bold,
    },
  });
}
