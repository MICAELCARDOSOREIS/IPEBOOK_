import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeAuthViewModel, makeScheduleMeetingViewModel } from "@/di/container";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
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
import { OptionChip, ScheduleMeetingWideLayout } from "@/view/requests/ScheduleMeetingWideLayout";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, standardHorizontalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";

export type ScheduleMeetingProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
  /** Chamado depois que o convite ou a nova sugestão foi enviado. */
  onSent?: () => void;
};

/**
 * Figma `06.04 · Combinar encontro` (`27:809`) e `06.13 · Reagendar encontro` (`370:6601`):
 * local entre os pontos seguros, dia nos próximos sete dias e faixa de horário.
 */
export function ScheduleMeeting({ requestId, sessionUserId, onBack, onSent }: ScheduleMeetingProps) {
  const guardedBack = useGuardedPress(onBack);
  const [state, actions] = makeScheduleMeetingViewModel(requestId, sessionUserId);
  const errorRef = useFormErrorAnnouncer(state.error);
  const rescheduling = state.mode === "reschedule";
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const dayY = useRef(0);

  // Escolhido o local, leva a lista ao "Dia" para o próximo passo não ficar escondido abaixo da dobra.
  useEffect(() => {
    if (state.pointName && state.dayIndex === null) scrollRef.current?.scrollTo({ y: Math.max(0, dayY.current - 8), animated: true });
  }, [state.pointName, state.dayIndex]);

  const selectedPoint = PIRIPIRI_MEETING_POINTS.find((item) => item.name === state.pointName) ?? null;

  const summary = (() => {
    if (!state.isPointOpenOnDay && state.dayIndex !== null) {
      return { complete: false, text: "O local selecionado não abre aos finais de semana." };
    }
    const missing = [
      state.pointName ? null : "o local",
      state.dayIndex === null ? "o dia" : null,
      state.hour === null ? "o horário" : null,
    ].filter(Boolean);
    if (missing.length > 0) return { complete: false, text: `Falta escolher ${missing.join(", ").replace(/, ([^,]*)$/, " e $1")}.` };
    const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === state.pointName);
    return { complete: true, text: `${point?.name.replace(/ \(.*\)$/, "")} · ${formatMeetingDay(state.dayOptions[state.dayIndex as number])} · ${state.hour}h` };
  })();

  if (wideWeb && !state.loading && !state.loadError) {
    return (
      <ScheduleMeetingWideLayout
        rescheduling={rescheduling}
        windowWidth={windowWidth}
        windowHeight={windowHeight}
        pointName={state.pointName}
        dayOptions={state.dayOptions}
        dayIndex={state.dayIndex}
        isPointOpenOnDay={state.isPointOpenOnDay}
        timeSlots={state.timeSlots}
        hour={state.hour}
        error={state.error}
        submitting={state.submitting}
        selectedPoint={selectedPoint}
        summary={summary}
        scrollRef={scrollRef}
        errorRef={errorRef}
        onBack={guardedBack}
        onSelectPoint={(name) => actions.selectPoint(name)}
        onSelectDay={(index) => actions.selectDay(index)}
        onSelectHour={(hour) => actions.selectHour(hour)}
        onSubmit={async () => {
          if (await actions.submit()) onSent?.();
        }}
      />
    );
  }

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.safe} pointerEvents="box-none">
      <TopAppBar contentMaxWidth={560} title={rescheduling ? "Reagendar encontro" : "Combinar encontro"} onBack={guardedBack} />
      {state.loading ? (
        <View style={styles.loadingContainer}>
          <LoadingState label="Carregando o encontro" variant="detail" />
        </View>
      ) : state.loadError ? (
        <View style={styles.loadingContainer}>
          <ErrorState message={state.loadError} onRetry={() => void actions.reload()} />
        </View>
      ) : (
        <View style={styles.stage} pointerEvents="box-none">
          <View style={styles.sheetFull}>
          <ScrollView
            ref={scrollRef}
            style={styles.sheetScroll}
            contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
            {...standardVerticalScrollProps}
          >
            <View style={styles.content}>
              {rescheduling ? (
                <>
                  <Text accessibilityRole="header" style={styles.headline}>Encontre um novo horário.</Text>
                  <Text style={styles.body}>Escolha uma nova data e envie a sugestão para a outra pessoa.</Text>
                </>
              ) : null}

              <View style={styles.whereHeader}>
                <Text accessibilityRole="header" style={styles.sectionLabel}>Onde</Text>
                <Text style={styles.whereHint}>Escolha um ponto público e seguro.</Text>
              </View>
              <View accessibilityRole="radiogroup" accessibilityLabel="Local do encontro" style={styles.places}>
                {PIRIPIRI_MEETING_POINTS.map((point, index) => {
                  const selected = state.pointName === point.name;
                  return (
                    <Pressable
                      key={point.name}
                      accessibilityRole="radio"
                      accessibilityLabel={`Local ${point.name}, ${point.recommendedTime}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => actions.selectPoint(point.name)}
                      style={withPress([styles.place, selected && styles.placeSelected])}
                    >
                      <View style={[styles.placeIconBox, selected && styles.placeIconBoxSelected]}>
                        {/* O número é o mesmo do pino no mapa. */}
                        <Text
                          accessibilityElementsHidden
                          importantForAccessibility="no"
                          style={[styles.placeNumber, selected && styles.placeNumberSelected]}
                        >
                          {index + 1}
                        </Text>
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

              <Text accessibilityRole="header" style={styles.sectionLabel} onLayout={(event) => { dayY.current = event.nativeEvent.layout.y; }}>Dia</Text>
              <ScrollView
                horizontal
                style={styles.daysScroll}
                contentContainerStyle={styles.daysRow}
                {...standardHorizontalScrollProps}
              >
              <View accessibilityRole="radiogroup" accessibilityLabel="Dia do encontro" style={styles.daysChips}>
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
              </ScrollView>

              <Text accessibilityRole="header" style={styles.sectionLabel}>Horário</Text>
              {!state.isPointOpenOnDay && state.dayIndex !== null ? (
                <View style={styles.closedNotice}>
                  <Text style={styles.closedNoticeText}>
                    O Campus IFPI e o Museu funcionam exclusivamente em dias úteis (segunda a sexta-feira). Escolha um dia útil para este local ou escolha uma das praças para os fins de semana.
                  </Text>
                </View>
              ) : (
                <View accessibilityRole="radiogroup" accessibilityLabel="Horário do encontro" style={styles.chips}>
                  {state.timeSlots.map((hour) => (
                    <OptionChip
                      key={hour}
                      compact
                      label={`${hour}h`}
                      accessibilityLabel={`Horário ${hour}h`}
                      selected={state.hour === hour}
                      onPress={() => actions.selectHour(hour)}
                    />
                  ))}
                </View>
              )}

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
              <View accessibilityLiveRegion="polite" style={styles.summary}>
                <AppIcon name={summary.complete ? "check" : "info"} size={18} color={summary.complete ? colors.m3.primary : colors.m3.onSurfaceVariant} />
                <Text numberOfLines={2} style={[styles.summaryText, summary.complete && styles.summaryTextDone]}>{summary.text}</Text>
              </View>
              <FilledButton
                label={rescheduling ? "Enviar nova sugestão" : "Enviar convite"}
                disabled={!summary.complete}
                loading={state.submitting}
                loadingLabel="Enviando"
                onPress={async () => {
                  if (await actions.submit()) onSent?.();
                }}
              />
              {rescheduling ? <TextButton label="Cancelar" onPress={guardedBack} /> : null}
            </View>
          </View>
          </View>
        </View>
      )}
      </SafeAreaView>
    </View>
  );
}

export type ScheduleMeetingScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
  onSent?: () => void;
};

export default function ScheduleMeetingScreen({ requestId, onBack, onRequireSignIn, onSent }: ScheduleMeetingScreenProps) {
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <ScheduleMeeting requestId={requestId} sessionUserId={authState.user.id} onBack={onBack} onSent={onSent} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    safe: { flex: 1 },
    loadingContainer: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
    },
    stage: { flex: 1 },
    summary: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    summaryText: { flex: 1, ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    summaryTextDone: { fontFamily: fontFamily.semiBold, color: colors.m3.onSurface },
    sheetFull: { flex: 1 },
    sheetScroll: { flex: 1 },
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
    placeNumber: { ...tokens.typography.titleLarge, fontFamily: fontFamily.brand, color: colors.m3.onSurfaceVariant },
    placeNumberSelected: { color: colors.m3.onSecondaryContainer },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
      marginTop: tokens.spacing[8],
    },
    whereHeader: { gap: tokens.spacing[4] },
    whereHint: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    places: { gap: tokens.spacing[8] },
    place: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
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
      width: 40,
      height: 40,
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
    daysScroll: { marginHorizontal: -tokens.spacing[16] },
    daysRow: { paddingHorizontal: tokens.spacing[16] },
    daysChips: { flexDirection: "row", gap: tokens.spacing[8] },
    daysChipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    chip: {
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.shapeMorph.chipUnselected,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      backgroundColor: "transparent",
    },
    chipCompact: { width: 52, paddingHorizontal: 0, alignItems: "center" },
    chipWithCheck: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: tokens.spacing[4] },
    chipSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
      borderWidth: 0,
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
      backgroundColor: colors.m3.surfaceContainerLow,
      padding: tokens.spacing[16],
    },
    footerContent: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[8] },
    closedNotice: {
      backgroundColor: colors.errorContainer,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[12],
      marginTop: tokens.spacing[4],
    },
    closedNoticeText: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.medium,
      color: colors.error,
    },
  });
}
