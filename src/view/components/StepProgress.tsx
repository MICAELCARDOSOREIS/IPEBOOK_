import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type StepProgressProps = {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
};

/**
 * Indicador de etapas do design system (indicador-de-etapas.md): barra contínua, preenchimento
 * proporcional a currentStep / totalSteps (não segmentos de largura igual).
 */
export function StepProgress({ currentStep, totalSteps, stepLabel }: StepProgressProps) {
  const progress = Math.min(1, Math.max(0, currentStep / totalSteps));
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <View accessibilityLiveRegion="polite" style={styles.labelsRow}>
        <Text style={styles.label}>{`Etapa ${currentStep} de ${totalSteps}`}</Text>
        <Text style={styles.label}>{stepLabel}</Text>
      </View>
      {/* O ponto final é posicionado em relação à barra, não ao bloco com os rótulos (Spec 043, RN-06). */}
      <View style={styles.trackArea} importantForAccessibility="no">
        <View style={styles.track}>
          <View testID="step-progress-fill" style={[styles.fill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
        <View testID="step-progress-end-dot" style={styles.endDot} />
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    labelsRow: { flexDirection: "row", justifyContent: "space-between" },
    label: { color: colors.secondaryText, ...tokens.typography.bodyMedium },
    trackArea: { marginTop: tokens.spacing[8] },
    track: {
      flexDirection: "row",
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      overflow: "hidden",
    },
    fill: {
      backgroundColor: colors.action,
      borderRadius: tokens.radius.full,
    },
    endDot: {
      position: "absolute",
      right: 0,
      top: 0,
      width: 4,
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.action,
    },
  });
}

export default StepProgress;
