import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useScheduleMeetingViewModel } from "@/viewmodel/useScheduleMeetingViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
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

type OptionChipProps = {
  label: string;
  accessibilityLabel: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

/** Opção de escolha única de `06.04`, anunciada como `radio` (Spec 052, RN-09). */
function OptionChip({ label, accessibilityLabel, selected, onPress, styles }: OptionChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, selected && styles.chipWithCheck]}
    >
      {selected ? <AppIcon name="check" size={18} color={colors.m3.onSecondaryContainer} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
                      <View style={[styles.placeIconBox, selected && styles.placeIconBoxSelected]}>
                        <AppIcon
                          name="place"
                          size={24}
                          color={selected ? colors.m3.onSecondaryContainer : colors.m3.onSurfaceVariant}
                        />
                      </View>
                      <View style={styles.placeText}>
                        <Text style={[styles.placeName, selected && styles.placeNameSelected]}>{point.name}</Text>
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
                    styles={styles}
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
                    styles={styles}
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    scroll: { paddingBottom: tokens.spacing[24] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: tokens.spacing[16], gap: tokens.spacing[12] },
    headline: {
      ...tokens.typography.displayLarge,
      fontFamily: fontFamily.brand,
      color: colors.m3.onSurface,
    },
    body: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
      marginTop: tokens.spacing[8],
    },
    places: { gap: tokens.spacing[12] },
    place: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    placeSelected: {
      borderColor: colors.m3.primary,
      borderWidth: 2,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    placeIconBox: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    placeIconBoxSelected: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    placeText: { flex: 1, gap: tokens.spacing[4] },
    placeName: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    placeNameSelected: {
      color: colors.m3.primary,
    },
    placeDetail: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: tokens.radius.full,
      borderWidth: 2,
      borderColor: colors.m3.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: { borderColor: colors.m3.primary },
    radioDot: { width: 12, height: 12, borderRadius: tokens.radius.full, backgroundColor: colors.m3.primary },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    chip: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    chipWithCheck: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[4] },
    chipSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
    },
    chipText: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurface,
    },
    chipTextSelected: {
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
    error: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.medium,
      color: colors.error,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainer,
      padding: tokens.spacing[16],
    },
    footerContent: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[8] },
  });
}
