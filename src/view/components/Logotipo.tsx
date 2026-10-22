import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type LogotipoProps = {
  inverse?: boolean;
  /** Traço dourado sob a marca, como na tela `01.04 · Recuperar acesso` do Figma. */
  underline?: boolean;
};

/** Logotipo da marca (design-system/04-componentes/logotipo.md): "IpêBook" em Source Serif 4 Bold. */
export function Logotipo({ inverse = false, underline = false }: LogotipoProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const marca = (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: fontFamily.brand,
        fontSize: 24,
        color: inverse ? colors.cover.text : colors.brandBrown,
      }}
    >
      IpêBook
    </Text>
  );

  if (!underline) return marca;

  return (
    <View style={styles.wrapper}>
      {marca}
      <View accessible={false} importantForAccessibility="no" style={styles.underline} />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrapper: { alignSelf: "flex-start", gap: tokens.spacing[4] },
    underline: {
      width: tokens.spacing[32],
      height: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.highlight,
    },
  });
}

export default Logotipo;
