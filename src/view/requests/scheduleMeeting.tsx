import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
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
import { MeetingMap } from "@/view/requests/MeetingMap";

import { withPress } from "@/view/pressFeedback";
/** Parte da altura que o painel do formulário cobre sobre o mapa. */
const SHEET_FRACTION = 0.6;
/** Altura do puxador e do trecho do painel que fica à vista quando ele está recolhido (título "Onde" e dica). */
const HANDLE_ZONE = 36;
const PEEK_CONTENT = 76;

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
  /** Chip estreito de largura fixa (horários), para caberem seis por linha. */
  compact?: boolean;
  styles: ReturnType<typeof createStyles>;
};

/** Opção de escolha única de `06.04`, anunciada como `radio` (Spec 052, RN-09). */
function OptionChip({ label, accessibilityLabel, selected, onPress, compact, styles }: OptionChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={withPress([styles.chip, compact && styles.chipCompact, selected && styles.chipSelected, selected && styles.chipWithCheck])}
    >
      {selected ? <AppIcon name="check" size={compact ? 16 : 18} color={colors.m3.onSecondaryContainer} /> : null}
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
  // Com token, o mapa é o fundo da tela e o formulário sobe num painel; sem token, o painel ocupa tudo.
  const hasMap = Boolean(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);
  const [stageHeight, setStageHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const heightValue = useRef(0);
  const dragStart = useRef(0);
  const placed = useRef(false);
  // Painel de altura fixa; recolhido, deixa à vista só o puxador, o início da lista e o rodapé com a ação.
  const expandedHeight = Math.round(stageHeight * SHEET_FRACTION);
  const collapsedHeight = Math.min(expandedHeight, HANDLE_ZONE + PEEK_CONTENT + footerHeight);
  const sheetHeight = expanded ? expandedHeight : collapsedHeight;
  const scrollRef = useRef<ScrollViewInstance>(null);
  const dayY = useRef(0);

  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => { heightValue.current = value; });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  // Começa recolhido, embaixo; depois anima entre os dois pontos de parada.
  useEffect(() => {
    if (stageHeight === 0 || footerHeight === 0) return;
    const target = expanded ? expandedHeight : collapsedHeight;
    if (!placed.current) {
      placed.current = true;
      heightAnim.setValue(target);
      return;
    }
    Animated.spring(heightAnim, { toValue: target, useNativeDriver: false, bounciness: 4 }).start();
  }, [expanded, expandedHeight, collapsedHeight, stageHeight, footerHeight, heightAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          heightAnim.stopAnimation();
          dragStart.current = heightValue.current;
        },
        onPanResponderMove: (_event, gesture) => {
          heightAnim.setValue(Math.min(expandedHeight, Math.max(collapsedHeight, dragStart.current - gesture.dy)));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (Math.abs(gesture.dy) < 6) {
            setExpanded((value) => !value);
            return;
          }
          const end = dragStart.current - gesture.dy;
          setExpanded(gesture.vy < -0.4 ? true : gesture.vy > 0.4 ? false : end > (expandedHeight + collapsedHeight) / 2);
        },
        onPanResponderTerminate: () => {
          heightAnim.setValue(expanded ? expandedHeight : collapsedHeight);
        },
      }),
    [collapsedHeight, expandedHeight, expanded, heightAnim],
  );

  // Escolhido o local (na lista ou no pino), leva o painel ao "Dia" para o próximo passo não ficar escondido abaixo da dobra.
  useEffect(() => {
    if (expanded && state.pointName && state.dayIndex === null) scrollRef.current?.scrollTo({ y: Math.max(0, dayY.current - 8), animated: true });
  }, [expanded, state.pointName, state.dayIndex]);

  const selectFromMap = (name: string) => {
    actions.selectPoint(name);
    setExpanded(true);
  };

  const selectedPoint = PIRIPIRI_MEETING_POINTS.find((item) => item.name === state.pointName) ?? null;

  const summary = (() => {
    const missing = [
      state.pointName ? null : "o local",
      state.dayIndex === null ? "o dia" : null,
      state.hour === null ? "o horário" : null,
    ].filter(Boolean);
    if (missing.length > 0) return { complete: false, text: `Falta escolher ${missing.join(", ").replace(/, ([^,]*)$/, " e $1")}.` };
    const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === state.pointName);
    return { complete: true, text: `${point?.name.replace(/ \(.*\)$/, "")} · ${formatMeetingDay(state.dayOptions[state.dayIndex as number])} · ${state.hour}h` };
  })();

  return (
    <View style={styles.page}>
      {/* Com mapa, ele ocupa a tela toda (inclusive atrás da barra e do painel). */}
      {hasMap && !state.loading && !state.loadError ? (
        <MeetingMap selectedName={state.pointName} coveredBottom={SHEET_FRACTION} sheetHeight={sheetHeight} onSelect={selectFromMap} />
      ) : null}
      <SafeAreaView style={styles.safe} pointerEvents="box-none" edges={hasMap ? ["bottom", "left", "right"] : undefined}>
      <TopAppBar contentMaxWidth={560} floating={hasMap} title={rescheduling ? "Reagendar encontro" : "Combinar encontro"} onBack={() => onBack?.()} />
      {state.loading ? (
        <LoadingState label="Carregando o encontro" />
      ) : state.loadError ? (
        <ErrorState message={state.loadError} onRetry={() => onBack?.()} />
      ) : (
        <View style={styles.stage} pointerEvents="box-none" onLayout={(event) => setStageHeight(Math.round(event.nativeEvent.layout.height))}>
          <Animated.View
            style={hasMap ? [styles.sheet, { height: heightAnim }] : styles.sheetFull}
          >
          {hasMap ? (
            <View
              {...panResponder.panHandlers}
              accessible
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Recolher a lista de locais" : "Expandir a lista de locais"}
              accessibilityActions={[{ name: "activate" }]}
              onAccessibilityAction={() => setExpanded((value) => !value)}
              style={styles.handleZone}
            >
              <View style={styles.handle} />
            </View>
          ) : null}
          {hasMap && !expanded ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Expandir a lista de locais"
              onPress={() => setExpanded(true)}
              style={withPress(styles.peek)}
            >
              {selectedPoint ? (
                <>
                  <View style={styles.peekBadge}>
                    <Text style={styles.peekBadgeText}>{PIRIPIRI_MEETING_POINTS.indexOf(selectedPoint) + 1}</Text>
                  </View>
                  <View style={styles.peekText}>
                    <Text numberOfLines={1} style={styles.peekTitle}>{selectedPoint.name}</Text>
                    <Text numberOfLines={1} style={styles.peekHint}>Toque para escolher o dia e o horário</Text>
                  </View>
                </>
              ) : (
                <View style={styles.peekText}>
                  <Text style={styles.sectionLabel}>Onde</Text>
                  <Text numberOfLines={1} style={styles.peekHint}>Toque num pino ou arraste para ver os locais.</Text>
                </View>
              )}
            </Pressable>
          ) : null}
          <ScrollView ref={scrollRef} scrollEnabled={!hasMap || expanded} style={styles.sheetScroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              {rescheduling ? (
                <>
                  <Text accessibilityRole="header" style={styles.headline}>Encontre um novo horário.</Text>
                  <Text style={styles.body}>Escolha uma nova data e envie a sugestão para a outra pessoa.</Text>
                </>
              ) : null}

              <View style={styles.whereHeader}>
                <Text accessibilityRole="header" style={styles.sectionLabel}>Onde</Text>
                <Text style={styles.whereHint}>
                  {hasMap ? "Toque num pino do mapa ou escolha na lista." : "Escolha um ponto público e seguro."}
                </Text>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll} contentContainerStyle={styles.daysRow} keyboardShouldPersistTaps="handled">
              <View accessibilityRole="radiogroup" accessibilityLabel="Dia do encontro" style={styles.daysChips}>
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
              </ScrollView>

              <Text accessibilityRole="header" style={styles.sectionLabel}>Horário</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Horário do encontro" style={styles.chips}>
                {state.timeSlots.map((hour) => (
                  <OptionChip
                    key={hour}
                    compact
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
          <View style={styles.footer} onLayout={(event) => setFooterHeight(Math.round(event.nativeEvent.layout.height))}>
            <View style={styles.footerContent}>
              <View accessibilityLiveRegion="polite" style={styles.summary}>
                <AppIcon name={summary.complete ? "check" : "info"} size={18} color={summary.complete ? colors.m3.primary : colors.m3.onSurfaceVariant} />
                <Text numberOfLines={2} style={[styles.summaryText, summary.complete && styles.summaryTextDone]}>{summary.text}</Text>
              </View>
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
          </Animated.View>
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
    safe: { flex: 1 },
    stage: { flex: 1 },
    sheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopLeftRadius: tokens.radius.extraLarge,
      borderTopRightRadius: tokens.radius.extraLarge,
      overflow: "hidden",
      elevation: 8,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    peek: {
      position: "absolute",
      top: HANDLE_ZONE,
      left: 0,
      right: 0,
      height: PEEK_CONTENT,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
      zIndex: 1,
    },
    peekBadge: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    peekBadgeText: { ...tokens.typography.titleLarge, fontFamily: fontFamily.brand, color: colors.m3.onSecondaryContainer },
    peekText: { flex: 1, gap: tokens.spacing[4] },
    peekTitle: { ...tokens.typography.bodyLarge, fontFamily: fontFamily.semiBold, color: colors.m3.primary },
    peekHint: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    handleZone: { height: HANDLE_ZONE, justifyContent: "center", alignItems: "center" },
    handle: {
      width: 32,
      height: 4,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.outlineVariant,
    },
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
  });
}
