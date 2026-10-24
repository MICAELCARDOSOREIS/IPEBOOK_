import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type NegotiationRatingModalProps = {
  visible: boolean;
  counterpartName: string;
  selectedScore: number;
  onSelectScore: (score: number) => void;
  onSubmit: () => Promise<boolean>;
  onClose: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  isSuccess: boolean;
};

const SCORES = [1, 2, 3, 4, 5] as const;

/**
 * Modal para avaliar a negociação presencial (Spec 063 / ADR 0046).
 * Telas Figma 06.21 (Avaliar negociação) e 06.22 (Avaliação enviada).
 */
export function NegotiationRatingModal({
  visible,
  counterpartName,
  selectedScore,
  onSelectScore,
  onSubmit,
  onClose,
  isSubmitting,
  submitError,
  isSuccess,
}: NegotiationRatingModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} accessible={true} accessibilityViewIsModal={true}>
          {isSuccess ? (
            <View style={styles.successContent}>
              <View style={styles.successIconBox}>
                <AppIcon name="check" size={32} color={colors.badge.sale.text} />
              </View>
              <Text accessibilityRole="header" style={styles.title}>
                Avaliação enviada!
              </Text>
              <Text style={styles.body}>
                Sua nota ajuda a construir uma comunidade leitora de confiança e respeito em Piripiri.
              </Text>
              <View style={styles.starRowStatic}>
                {SCORES.map((score) => (
                  <Text
                    key={score}
                    style={[
                      styles.starStatic,
                      score <= selectedScore ? styles.starFilled : styles.starEmpty,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <View style={styles.buttonContainer}>
                <FilledButton
                  label="Concluir"
                  accessibilityLabel="Fechar diálogo de avaliação"
                  onPress={onClose}
                />
              </View>
            </View>
          ) : (
            <View style={styles.formContent}>
              <Text accessibilityRole="header" style={styles.title}>
                Avaliar negociação
              </Text>
              <Text style={styles.subtitle}>
                Como foi a sua experiência com{" "}
                <Text style={styles.counterpartBold}>{counterpartName}</Text> no encontro em Piripiri?
              </Text>

              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Selecione a nota de 1 a 5 estrelas"
                style={styles.starRow}
              >
                {SCORES.map((score) => {
                  const isFilled = score <= selectedScore;
                  return (
                    <Pressable
                      key={score}
                      testID={`star-radio-${score}`}
                      accessibilityRole="radio"
                      accessibilityLabel={`${score} ${score === 1 ? "estrela" : "estrelas"}`}
                      accessibilityState={{ checked: score === selectedScore }}
                      onPress={() => onSelectScore(score)}
                      disabled={isSubmitting}
                      style={styles.starButton}
                    >
                      <Text style={[styles.starIcon, isFilled ? styles.starFilled : styles.starEmpty]}>
                        ★
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.scoreLegend}>
                {selectedScore === 5
                  ? "Excelente · Encontro pontual e exemplar"
                  : selectedScore === 4
                  ? "Muito bom · Negociação tranquila"
                  : selectedScore === 3
                  ? "Bom · Encontro realizado"
                  : selectedScore === 2
                  ? "Regular · Houve contratempos"
                  : "Ruim · Experiência insatisfatória"}
              </Text>

              {submitError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {submitError}
                </Text>
              ) : null}

              <View style={styles.actionRow}>
                <OutlinedButton
                  label="Agora não"
                  accessibilityLabel="Fechar diálogo sem avaliar agora"
                  disabled={isSubmitting}
                  onPress={onClose}
                />
                <FilledButton
                  label={isSubmitting ? "Enviando…" : "Enviar avaliação"}
                  accessibilityLabel="Confirmar e enviar avaliação"
                  loading={isSubmitting}
                  onPress={() => void onSubmit()}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: tokens.spacing[20],
    },
    card: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.large,
      padding: tokens.spacing[24],
      borderWidth: 1,
      borderColor: colors.border,
      gap: tokens.spacing[16],
    },
    formContent: {
      gap: tokens.spacing[16],
      alignItems: "center",
    },
    successContent: {
      gap: tokens.spacing[16],
      alignItems: "center",
    },
    successIconBox: {
      width: 56,
      height: 56,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.badge.sale.background,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...tokens.typography.titleLarge,
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    counterpartBold: {
      fontWeight: "700",
      color: colors.text,
    },
    starRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
    },
    starRowStatic: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: tokens.spacing[6],
      paddingVertical: tokens.spacing[4],
    },
    starButton: {
      minWidth: tokens.accessibility.touchTarget,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    starIcon: {
      fontSize: 36,
    },
    starStatic: {
      fontSize: 28,
    },
    starFilled: {
      color: colors.highlight,
    },
    starEmpty: {
      color: colors.border,
    },
    scoreLegend: {
      ...tokens.typography.labelSmall,
      color: colors.action,
      fontWeight: "600",
      textAlign: "center",
    },
    body: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    errorText: {
      ...tokens.typography.labelSmall,
      color: colors.error,
      textAlign: "center",
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: tokens.spacing[12],
      marginTop: tokens.spacing[8],
    },
    buttonContainer: {
      width: "100%",
      marginTop: tokens.spacing[8],
    },
  });
}
