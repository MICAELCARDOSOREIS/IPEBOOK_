import { type ComponentRef, forwardRef, useMemo } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import conviteIpebook from "@/view/assets/convite-ipebook.png";
import { tokens } from "@/view/tokens";

export type InviteCardProps = {
  /** Endereço do app, preservado no rótulo acessível e na captura de imagem. */
  url: string;
};

/**
 * Arte oficial do convite do IpêBook (Figma `27 · Convidar amigos`, nó `1023:2883`):
 * é este cartão que a tela captura e envia como PNG.
 */
export const InviteCard = forwardRef<ComponentRef<typeof View>, InviteCardProps>(function InviteCard({ url }, ref) {
  const styles = useMemo(() => createStyles(), []);
  const display = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <View
      ref={ref}
      collapsable={false}
      accessible
      accessibilityLabel={`Convite para o IpêBook em Piripiri. Acesse ${display}`}
      style={styles.card}
    >
      <Image
        source={conviteIpebook}
        style={styles.artwork}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
});

function createStyles() {
  return StyleSheet.create({
    card: {
      alignSelf: "center",
      width: 292,
      height: 365,
      borderRadius: tokens.radius.small,
      ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : {}),
      overflow: "hidden",
      shadowColor: tokens.colors.m3.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    artwork: {
      width: "100%",
      height: "100%",
    },
  });
}
