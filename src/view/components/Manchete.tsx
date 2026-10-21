import { StyleSheet, Text, View } from "react-native";
import { fontFamily, tokens } from "@/view/tokens";

export type MancheteProps = {
  /** Primeira linha da manchete, sem realce. */
  texto: string;
  /** Trecho final exibido sobre a faixa de realce da marca. */
  realce: string;
  accessibilityLabel?: string;
};

/**
 * Manchete de marca com faixa de realce, como nas telas `01.01` e `01.04` do Figma:
 * a primeira linha fica sobre o fundo e o trecho final sobre a faixa `tertiaryContainer`.
 */
export function Manchete({ texto, realce, accessibilityLabel }: MancheteProps) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={accessibilityLabel ?? `${texto} ${realce}`}>
      <Text style={styles.linha}>{texto}</Text>
      <View style={styles.realce}>
        <Text style={styles.linha}>{realce}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    fontFamily: fontFamily.brand,
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    color: tokens.colors.m3.onSurface,
  },
  realce: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colors.m3.tertiaryContainer,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[6],
  },
});

export default Manchete;
