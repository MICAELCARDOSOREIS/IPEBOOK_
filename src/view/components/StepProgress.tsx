import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

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

  return (
    <View>
      <Text accessibilityLiveRegion="polite" style={styles.labelsRow}>
        <Text style={styles.label}>{`Etapa ${currentStep} de ${totalSteps}`}</Text>
        {"  "}
        <Text style={styles.label}>{stepLabel}</Text>
      </Text>
      <View style={styles.track} importantForAccessibility="no">
        <View testID="step-progress-fill" style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <View style={styles.endDot} importantForAccessibility="no" />
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium },
  track: {
    flexDirection: "row",
    height: 4,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.m3.secondaryContainer,
    marginTop: tokens.spacing[8],
    overflow: "hidden",
  },
  fill: {
    backgroundColor: tokens.colors.action,
    borderRadius: tokens.radius.full,
  },
  endDot: {
    position: "absolute",
    right: 0,
    top: tokens.spacing[8],
    width: 4,
    height: 4,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.action,
  },
});

export default StepProgress;
