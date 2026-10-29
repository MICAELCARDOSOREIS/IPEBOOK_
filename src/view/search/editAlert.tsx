import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BookModality } from "@/model/entities/book";
import { ALL_ALERT_MODALITIES } from "@/model/entities/searchAlert";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { ALERT_CITY, ALERT_MODALITY_LABELS } from "@/view/search/alertLabels";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type EditAlertProps = {
  alertId: string;
  userId: string | null;
  onBack: () => void;
  /** Volta ao gerenciamento depois de salvar. */
  onSaved: () => void;
};

/** Figma `02.10 · Editar alerta` (`254:4437`). */
export default function EditAlert({ alertId, userId, onBack, onSaved }: EditAlertProps) {
  const [state, actions] = useSearchAlertsViewModel(userId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const alert = state.alerts.find((item) => item.id === alertId);
  const [term, setTerm] = useState("");
  const [modalities, setModalities] = useState<readonly BookModality[]>(ALL_ALERT_MODALITIES);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [modalityError, setModalityError] = useState<string | null>(null);

  useEffect(() => {
    if (!alert || loadedId === alert.id) return;
    setTerm(alert.query);
    setModalities(alert.modalities);
    setLoadedId(alert.id);
  }, [alert, loadedId]);

  const toggle = (modality: BookModality) => {
    setModalityError(null);
    setModalities((previous) =>
      previous.includes(modality)
        ? previous.filter((item) => item !== modality)
        : [...previous, modality],
    );
  };

  if (state.loading) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Editar alerta" onBack={onBack} />
        <View style={styles.status}>
          <ActivityIndicator color={colors.action} accessibilityLabel="Carregando alerta" />
        </View>
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.page}>
        <TopAppBar title="Editar alerta" onBack={onBack} />
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.headline}>
            Alerta não encontrado
          </Text>
          <Text style={styles.body}>Ele pode ter sido excluído enquanto você editava.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Editar alerta" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.headline}>
            Ajuste sua busca.
          </Text>
          <Text style={styles.body}>
            Estas preferências serão usadas nos próximos avisos.
          </Text>

          <TextField
            label="O que você procura?"
            value={term}
            onChangeText={setTerm}
            maxLength={100}
          />

          <TextField
            label="Cidade"
            value={ALERT_CITY}
            onChangeText={() => {}}
            editable={false}
            helperText="O IpêBook atende apenas Piripiri por enquanto."
          />

          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Tipo de anúncio</Text>
            <View style={styles.chipRow}>
              {ALL_ALERT_MODALITIES.map((modality) => (
                <Chip
                  key={modality}
                  label={ALERT_MODALITY_LABELS[modality]}
                  selected={modalities.includes(modality)}
                  accessibilityLabel={`Tipo ${ALERT_MODALITY_LABELS[modality]}`}
                  onPress={() => toggle(modality)}
                />
              ))}
            </View>
            {modalityError ? (
              <Text accessibilityRole="alert" style={styles.error}>{modalityError}</Text>
            ) : (
              <Text style={styles.hint}>Selecione pelo menos um tipo.</Text>
            )}
          </View>

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {state.error}
            </Text>
          ) : null}

          <FilledButton
            label="Salvar alterações"
            onPress={() => {
              if (modalities.length === 0) {
                setModalityError("Selecione pelo menos um tipo.");
                return;
              }
              void actions.update(alert.id, term, modalities).then((saved) => {
                if (saved) onSaved();
              });
            }}
          />
          <TextButton label="Cancelar" onPress={onBack} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
  status: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: tokens.spacing[24],
    paddingTop: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  headline: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  body: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  field: { gap: tokens.spacing[8] },
  sectionLabel: { ...tokens.typography.titleMedium, color: colors.text },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  hint: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  error: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}
