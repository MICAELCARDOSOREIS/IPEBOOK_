import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useScheduleMeetingViewModel } from "@/viewmodel/useScheduleMeetingViewModel";
import { tokens } from "@/view/tokens";
import { formatMeetingDay, spokenMeetingDay } from "@/view/meetingFormat";
import { useFormErrorAnnouncer } from "@/view/useFormErrorAnnouncer";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ScheduleMeetingProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  /** Chamado depois que o convite ou a nova sugestão foi enviado. */
  onSent?: () => void;
};

type OptionChipProps = { label: string; accessibilityLabel: string; selected: boolean; onPress: () => void };

/** Opção de escolha única de `06.04`, anunciada como `radio` (Spec 052, RN-09). */
function OptionChip({ label, accessibilityLabel, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

/**
 * Figma `06.04 · Combinar encontro` (`27:809`) e `06.13 · Reagendar encontro` (`370:6601`):
 * local entre os pontos seguros, dia nos próximos sete dias e faixa de horário.
 */
export function ScheduleMeeting({ requestId, sessionUserId, onBack, onSent }: ScheduleMeetingProps) {
  const [state, actions] = useScheduleMeetingViewModel(requestId, sessionUserId);
  const errorRef = useFormErrorAnnouncer(state.error);
  const rescheduling = state.mode === "reschedule";

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title={rescheduling ? "Reagendar encontro" : "Combinar encontro"} onBack={() => onBack?.()} />
      {state.loading ? (
        <LoadingState label="Carregando o encontro" />
      ) : state.loadError ? (
        <ErrorState message={state.loadError} onRetry={() => onBack?.()} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.content}>
              {rescheduling ? (
                <>
                  <Text accessibilityRole="header" style={styles.headline}>Encontre um novo horário.</Text>
                  <Text style={styles.body}>Escolha uma nova data e envie a sugestão para a outra pessoa.</Text>
                </>
              ) : null}

              <Text accessibilityRole="header" style={styles.sectionLabel}>Onde</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Local do encontro" style={styles.places}>
                {PIRIPIRI_MEETING_POINTS.map((point) => {
                  const selected = state.pointName === point.name;
                  return (
                    <Pressable
                      key={point.name}
                      accessibilityRole="radio"
                      accessibilityLabel={`Local ${point.name}, ${point.recommendedTime}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => actions.selectPoint(point.name)}
                      style={[styles.place, selected && styles.placeSelected]}
                    >
                      <AppIcon name="place" size={24} color={tokens.colors.text} />
                      <View style={styles.placeText}>
                        <Text style={styles.placeName}>{point.name}</Text>
                        <Text style={styles.placeDetail}>{point.recommendedTime}</Text>
                      </View>
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected ? <View style={styles.radioDot} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Text accessibilityRole="header" style={styles.sectionLabel}>Dia</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Dia do encontro" style={styles.chips}>
                {state.dayOptions.map((day, index) => (
                  <OptionChip
                    key={day.toISOString()}
                    label={formatMeetingDay(day)}
                    accessibilityLabel={`Dia ${spokenMeetingDay(day)}`}
                    selected={state.dayIndex === index}
                    onPress={() => actions.selectDay(index)}
                  />
                ))}
              </View>

              <Text accessibilityRole="header" style={styles.sectionLabel}>Horário</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Horário do encontro" style={styles.chips}>
                {state.timeSlots.map((hour) => (
                  <OptionChip
                    key={hour}
                    label={`${hour}h`}
                    accessibilityLabel={`Horário ${hour}h`}
                    selected={state.hour === hour}
                    onPress={() => actions.selectHour(hour)}
                  />
                ))}
              </View>

              {state.error ? (
                <Text ref={errorRef} accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                  {state.error}
                </Text>
              ) : null}
            </View>
          </ScrollView>
          {/* Ação principal fixa no rodapé, como em `06.04`. */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <FilledButton
                label={rescheduling ? "Enviar nova sugestão" : "Enviar convite"}
                loading={state.submitting}
                loadingLabel="Enviando"
                onPress={async () => {
                  if (await actions.submit()) onSent?.();
                }}
              />
              {rescheduling ? <TextButton label="Cancelar" onPress={() => onBack?.()} /> : null}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

export type ScheduleMeetingScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onSent?: () => void;
};

export default function ScheduleMeetingScreen({ requestId, onBack, onRequireSignIn, onSent }: ScheduleMeetingScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <ScheduleMeeting requestId={requestId} sessionUserId={authState.user.id} onBack={onBack} onSent={onSent} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scroll: { paddingBottom: tokens.spacing[24] },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: tokens.spacing[16], gap: tokens.spacing[12] },
  headline: {
    ...tokens.typography.displayLarge,
    color: tokens.colors.text,
  },
  body: { ...tokens.typography.bodyLarge, color: tokens.colors.secondaryText },
  sectionLabel: { ...tokens.typography.titleMedium, color: tokens.colors.text, marginTop: tokens.spacing[8] },
  places: { gap: tokens.spacing[12] },
  place: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[16],
    minHeight: tokens.accessibility.touchTarget,
    padding: tokens.spacing[16],
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    backgroundColor: tokens.colors.surface,
  },
  placeSelected: { borderColor: tokens.colors.action, borderWidth: 2, backgroundColor: tokens.colors.soft },
  placeText: { flex: 1, gap: tokens.spacing[4] },
  placeName: { ...tokens.typography.bodyLarge, color: tokens.colors.text },
  placeDetail: { ...tokens.typography.bodyMedium, color: tokens.colors.secondaryText },
  radio: {
    width: 20,
    height: 20,
    borderRadius: tokens.radius.full,
    borderWidth: 2,
    borderColor: tokens.colors.secondaryText,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: tokens.colors.action },
  radioDot: { width: 10, height: 10, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.action },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
  chip: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[16],
    borderRadius: tokens.radius.small,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    backgroundColor: tokens.colors.surface,
  },
  chipSelected: { backgroundColor: tokens.colors.soft, borderColor: tokens.colors.soft },
  chipText: { ...tokens.typography.bodyMedium, color: tokens.colors.text },
  chipTextSelected: { color: tokens.colors.actionDeep, fontWeight: "600" },
  error: { ...tokens.typography.bodyMedium, color: tokens.colors.error },
  footer: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.m3.outlineVariant,
    backgroundColor: tokens.colors.m3.surfaceContainer,
    padding: tokens.spacing[16],
  },
  footerContent: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[8] },
});
