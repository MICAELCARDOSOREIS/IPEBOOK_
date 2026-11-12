import { StyleSheet, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type IpeRibbonProps = {
  /** Largura da fita em dp (padrão: 10 dp). */
  width?: number;
  /** Comprimento visível da fita em dp (padrão: 22 dp). */
  height?: number;
  /** Identificador de teste. */
  testID?: string;
};

/**
 * Fita marcadora de página na cor do Ipê-Amarelo (ouro solar).
 * Posicionada no canto superior de capas e cartões de livros, remetendo
 * à fita de cetim tradicional das encadernações clássicas.
 */
export function IpeRibbon({ width = 10, height = 22, testID = "ipe-ribbon" }: IpeRibbonProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      pointerEvents="none"
      style={[
        styles.ribbon,
        {
          width,
          height,
          backgroundColor: colors.ipe.bloom,
          borderBottomColor: colors.ipe.bloomDeep,
        },
      ]}
    >
      {/* Filete de brilho interior simulando a dobra de cetim */}
      <View style={[styles.sheen, { backgroundColor: colors.ipe.bloomDeep }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    position: "absolute",
    top: 0,
    right: tokens.spacing[8],
    borderBottomLeftRadius: tokens.radius.hairline,
    borderBottomRightRadius: tokens.radius.hairline,
    borderBottomWidth: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 1.5,
    elevation: 2,
    zIndex: 3,
  },
  sheen: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.45,
  },
});

export default IpeRibbon;
