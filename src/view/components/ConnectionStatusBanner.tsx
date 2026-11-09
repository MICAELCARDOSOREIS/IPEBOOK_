import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { networkStatusDataSource as defaultNetworkStatusDataSource } from "@/di/container";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

export type ConnectionStatusBannerProps = {
  dataSource?: INetworkStatusDataSource;
  message?: string;
};

/**
 * Banner global de conectividade (Spec 130 / ADR 0101).
 * Exibido no topo quando o aparelho perde a conexão de rede, sumindo assim que o sinal retorna.
 */
export function ConnectionStatusBanner({
  dataSource = defaultNetworkStatusDataSource,
  message = "Sem conexão com a internet",
}: ConnectionStatusBannerProps) {
  const { isOnline } = useNetworkStatus(dataSource);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (isOnline) return null;

  return (
    <View
      testID="connection-status-banner"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.banner}
    >
      <AppIcon name="wifiOff" size={18} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.errorContainer,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 9999,
    },
    text: {
      ...tokens.typography.labelMedium,
      color: colors.text,
      fontWeight: "600",
    },
  });
}

export default ConnectionStatusBanner;
