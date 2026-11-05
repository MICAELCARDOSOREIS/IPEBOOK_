import { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PIRIPIRI_MEETING_POINTS, type MeetingPoint } from "@/model/entities/meetingPoint";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { formatMeetingDay, spokenMeetingDay } from "@/view/meetingFormat";
import { withPress } from "@/view/pressFeedback";
import { MeetingMap } from "@/view/requests/MeetingMap";
import { StaticMeetingMap } from "@/view/requests/MeetingMapStatic";
import { scrollBottomPadding, standardVerticalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";

export type OptionChipProps = {
  label: string;
  accessibilityLabel: string;
  selected: boolean;
  onPress: () => void;
  /** Chip estreito de largura fixa (horários), para caberem seis por linha. */
  compact?: boolean;
};

/** Opção de escolha única de `06.04`, anunciada como `radio` (Spec 052, RN-09). */
export function OptionChip({ label, accessibilityLabel, selected, onPress, compact }: OptionChipProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

export type ScheduleMeetingWideLayoutProps = {
  rescheduling: boolean;
  hasMap: boolean;
  windowWidth: number;
  windowHeight: number;
  pointName: string | null;
  dayOptions: readonly Date[];
  dayIndex: number | null;
  isPointOpenOnDay: boolean;
  timeSlots: readonly number[];
  hour: number | null;
  error: string | null;
  submitting: boolean;
  selectedPoint: MeetingPoint | null;
  summary: { complete: boolean; text: string };
  scrollRef: React.RefObject<ScrollViewInstance | null>;
  errorRef: React.RefObject<any>;
  onBack: () => void;
  onSelectPoint: (name: string) => void;
  onSelectFromMap: (name: string) => void;
  onSelectDay: (index: number) => void;
  onSelectHour: (hour: number) => void;
  onSubmit: () => void;
};

/**
 * Layout em duas colunas para web larga da tela Combinar/Reagendar Encontro.
 */
export function ScheduleMeetingWideLayout({
  rescheduling,
  hasMap,
  windowWidth,
  windowHeight,
  pointName,
  dayOptions,
  dayIndex,
  isPointOpenOnDay,
  timeSlots,
  hour,
  error,
  submitting,
  selectedPoint,
  summary,
  scrollRef,
  errorRef,
  onBack,
  onSelectPoint,
  onSelectFromMap,
  onSelectDay,
  onSelectHour,
  onSubmit,
}: ScheduleMeetingWideLayoutProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isStacked = windowWidth < 1024;
  const mapViewportHeight = windowHeight < 760 ? 320 : 400;

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.safe}>
        <TopAppBar
          contentMaxWidth={1180}
          title={rescheduling ? "Reagendar encontro" : "Combinar encontro"}
          onBack={onBack}
        />
        <ScrollView
          ref={scrollRef}
          style={styles.widePageScroll}
          contentContainerStyle={[styles.widePageScrollContent, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
          {...standardVerticalScrollProps}
        >
          <View style={[styles.wideContainer, isStacked && styles.wideContainerStacked]}>
            {/* Coluna Esquerda: Formulário de Agendamento */}
            <View style={[styles.wideFormCol, isStacked && styles.wideColFull]}>
              <View style={styles.wideFormContent}>
                <View style={styles.whereHeader}>
                  <Text accessibilityRole="header" style={styles.wideHeadline}>
                    {rescheduling ? "Encontre um novo horário." : "Escolha onde e quando encontrar"}
                  </Text>
                  <Text style={styles.wideBody}>
                    {rescheduling
                      ? "Escolha uma nova data e envie a sugestão para a outra pessoa."
                      : "Ponto público e seguro em Piripiri para realizar a entrega presencial."}
                  </Text>
                </View>

                {/* 1. Onde */}
                <View style={styles.whereHeader}>
                  <Text accessibilityRole="header" style={styles.sectionLabel}>Onde</Text>
                  <Text style={styles.whereHint}>
                    {hasMap ? "Clique num pino do mapa ou escolha na lista." : "Escolha um ponto público e seguro em Piripiri."}
                  </Text>
                </View>

                <View accessibilityRole="radiogroup" accessibilityLabel="Local do encontro" style={styles.places}>
                  {PIRIPIRI_MEETING_POINTS.map((point, index) => {
                    const selected = pointName === point.name;
                    const isWeekdayOnly = point.recommendedTime.includes("úteis");
                    return (
                      <Pressable
                        key={point.name}
                        accessibilityRole="radio"
                        accessibilityLabel={`Local ${point.name}, ${point.recommendedTime}`}
                        accessibilityState={{ checked: selected }}
                        onPress={() => onSelectPoint(point.name)}
                        style={withPress([styles.widePlaceCard, selected && styles.widePlaceCardSelected])}
                      >
                        <View style={[styles.widePlaceNumberBox, selected && styles.widePlaceNumberBoxSelected]}>
                          <Text
                            accessibilityElementsHidden
                            importantForAccessibility="no"
                            style={[styles.widePlaceNumberText, selected && styles.widePlaceNumberTextSelected]}
                          >
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.widePlaceInfo}>
                          <View style={styles.widePlaceTitleRow}>
                            <Text style={[styles.widePlaceName, selected && styles.widePlaceNameSelected]}>{point.name}</Text>
                            <View style={[styles.wideTag, !isWeekdayOnly && styles.wideTagDaily]}>
                              <Text style={[styles.wideTagText, !isWeekdayOnly && styles.wideTagDailyText]}>
                                {isWeekdayOnly ? "Dias úteis" : "Diário"}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.widePlaceAddress}>{point.address}</Text>
                          <Text style={styles.widePlaceTime}>{point.recommendedTime}</Text>
                        </View>
                        <View style={[styles.radio, selected && styles.radioSelected]}>
                          {selected ? <View style={styles.radioDot} /> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* 2. Dia */}
                <Text accessibilityRole="header" style={styles.sectionLabel}>Dia</Text>
                <View accessibilityRole="radiogroup" accessibilityLabel="Dia do encontro" style={styles.wideDaysGrid}>
                  {dayOptions.map((day, index) => (
                    <OptionChip
                      key={day.toISOString()}
                      label={formatMeetingDay(day)}
                      accessibilityLabel={`Dia ${spokenMeetingDay(day)}`}
                      selected={dayIndex === index}
                      onPress={() => onSelectDay(index)}
                    />
                  ))}
                </View>

                {/* 3. Horário */}
                <Text accessibilityRole="header" style={styles.sectionLabel}>Horário</Text>
                {!isPointOpenOnDay && dayIndex !== null ? (
                  <View style={styles.closedNotice}>
                    <Text style={styles.closedNoticeText}>
                      O Campus IFPI e o Museu funcionam exclusivamente em dias úteis (segunda a sexta-feira). Escolha um dia útil para este local ou selecione uma das praças para os fins de semana.
                    </Text>
                  </View>
                ) : (
                  <View accessibilityRole="radiogroup" accessibilityLabel="Horário do encontro" style={styles.wideHoursGrid}>
                    {timeSlots.map((slotHour) => (
                      <OptionChip
                        key={slotHour}
                        compact
                        label={`${slotHour}h`}
                        accessibilityLabel={`Horário ${slotHour}h`}
                        selected={hour === slotHour}
                        onPress={() => onSelectHour(slotHour)}
                      />
                    ))}
                  </View>
                )}

                {error ? (
                  <Text ref={errorRef} accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                    {error}
                  </Text>
                ) : null}
              </View>

              {/* Rodapé da Coluna Esquerda: Resumo e Ação */}
              <View style={styles.wideFormFooter}>
                <View style={styles.wideFormFooterContent}>
                  <View accessibilityLiveRegion="polite" style={styles.summary}>
                    <AppIcon name={summary.complete ? "check" : "info"} size={18} color={summary.complete ? colors.m3.primary : colors.m3.onSurfaceVariant} />
                    <Text numberOfLines={2} style={[styles.summaryText, summary.complete && styles.summaryTextDone]}>{summary.text}</Text>
                  </View>
                  <FilledButton
                    label={rescheduling ? "Enviar nova sugestão" : "Enviar convite"}
                    disabled={!summary.complete}
                    loading={submitting}
                    loadingLabel="Enviando"
                    onPress={onSubmit}
                  />
                  {rescheduling ? <TextButton label="Cancelar" onPress={onBack} /> : null}
                </View>
              </View>
            </View>

            {/* Coluna Direita: Mapa e Detalhes do Local */}
            <View
              style={[
                styles.wideMapColumn,
                isStacked && styles.wideColFull,
                Platform.OS === "web" && !isStacked && styles.wideMapSticky,
              ]}
            >
              <View style={styles.wideMapCard}>
                <View style={styles.wideMapCardHeader}>
                  <View style={styles.wideMapCardTitleGroup}>
                    <AppIcon name="place" size={18} color={colors.m3.primary} />
                    <Text style={styles.wideMapCardTitle}>Pontos de Encontro em Piripiri</Text>
                  </View>
                  <Text style={styles.wideMapCardSubtitle}>4 locais públicos oficiais</Text>
                </View>

                <View style={[styles.wideMapViewport, { height: mapViewportHeight }]}>
                  {hasMap ? (
                    <MeetingMap selectedName={pointName} compactPadding onSelect={onSelectFromMap} />
                  ) : (
                    <StaticMeetingMap selectedName={pointName} compactPadding />
                  )}
                  {!hasMap && !process.env.EXPO_PUBLIC_MAPBOX_TOKEN ? (
                    <View style={styles.wideMapEmptyFallback}>
                      <AppIcon name="place" size={32} color={colors.m3.primary} />
                      <Text style={styles.wideMapEmptyFallbackTitle}>4 Pontos Seguros em Piripiri</Text>
                      <Text style={styles.wideMapEmptyFallbackText}>
                        Praça da Bandeira, Praça de Eventos, Museu de Perypery e Campus IFPI.
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.wideMapCardFooter}>
                  <View style={styles.wideMapFooterRow}>
                    <View style={styles.peekBadge}>
                      <Text style={styles.peekBadgeText}>
                        {selectedPoint ? PIRIPIRI_MEETING_POINTS.indexOf(selectedPoint) + 1 : "✓"}
                      </Text>
                    </View>
                    <View style={styles.wideMapFooterTextCol}>
                      <Text numberOfLines={1} style={styles.wideMapFooterTitle}>
                        {selectedPoint ? selectedPoint.name : "Escolha o local na lista ao lado ou no mapa"}
                      </Text>
                      <Text numberOfLines={2} style={styles.wideMapFooterSubtitle}>
                        {selectedPoint
                          ? `${selectedPoint.address} · ${selectedPoint.recommendedTime}`
                          : "Pontos monitorados e centrais em Piripiri, ideais para troca segura de livros."}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card de Dicas de Segurança Comunitária */}
              <View style={styles.wideSafetyCard}>
                <View style={styles.wideSafetyHeader}>
                  <AppIcon name="checkCircle" size={18} color={colors.nature.foliage} />
                  <Text style={styles.wideSafetyTitle}>Dicas de Segurança Comunitária</Text>
                </View>
                <Text style={styles.wideSafetyText}>
                  • Prefira horários durante o dia e com circulação de pedestres.{"\n"}
                  • Encontros nos pontos sugeridos garantem visibilidade e tranquilidade.{"\n"}
                  • Confira o estado do livro no momento da entrega presencial.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    safe: { flex: 1 },
    peekBadge: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    peekBadgeText: { ...tokens.typography.titleLarge, fontFamily: fontFamily.brand, color: colors.m3.onSecondaryContainer },
    summary: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    summaryText: { flex: 1, ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    summaryTextDone: { fontFamily: fontFamily.semiBold, color: colors.m3.onSurface },
    sectionLabel: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
      marginTop: tokens.spacing[8],
    },
    whereHeader: { gap: tokens.spacing[4] },
    whereHint: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    places: { gap: tokens.spacing[8] },
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
    widePageScroll: {
      flex: 1,
      width: "100%",
    },
    widePageScrollContent: {
      paddingBottom: tokens.spacing[48],
    },
    wideContainer: {
      maxWidth: 1180,
      width: "100%",
      alignSelf: "center",
      flexDirection: "row",
      gap: tokens.spacing[24],
      padding: tokens.spacing[24],
      alignItems: "flex-start",
    },
    wideContainerStacked: {
      flexDirection: "column",
      paddingHorizontal: tokens.spacing[16],
    },
    wideColFull: {
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
    },
    wideFormCol: {
      flex: 1,
      minWidth: 320,
      maxWidth: 560,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    wideFormContent: {
      padding: tokens.spacing[20],
      gap: tokens.spacing[16],
    },
    wideFormFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      backgroundColor: colors.m3.surfaceContainerLow,
      padding: tokens.spacing[16],
    },
    wideFormFooterContent: {
      gap: tokens.spacing[12],
    },
    wideHeadline: {
      ...tokens.typography.headlineMedium,
      fontFamily: fontFamily.brand,
      color: colors.m3.onSurface,
    },
    wideBody: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 20,
    },
    widePlaceCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[14],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      backgroundColor: colors.surface,
    },
    widePlaceCardSelected: {
      borderColor: colors.m3.primary,
      borderWidth: 2,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    widePlaceNumberBox: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    widePlaceNumberBoxSelected: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    widePlaceNumberText: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.brand,
      color: colors.m3.onSurfaceVariant,
    },
    widePlaceNumberTextSelected: {
      color: colors.m3.onSecondaryContainer,
    },
    widePlaceInfo: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    widePlaceTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[8],
    },
    widePlaceName: {
      flex: 1,
      flexShrink: 1,
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    widePlaceNameSelected: {
      color: colors.m3.primary,
    },
    wideTag: {
      paddingHorizontal: tokens.spacing[8],
      paddingVertical: tokens.spacing[2],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    wideTagDaily: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    wideTagText: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      fontSize: 11,
    },
    wideTagDailyText: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSecondaryContainer,
      fontSize: 11,
    },
    widePlaceAddress: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    widePlaceTime: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.regular,
      color: colors.m3.outline,
    },
    wideDaysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    wideHoursGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[8],
    },
    wideMapColumn: {
      flex: 1,
      minWidth: 320,
      maxWidth: 580,
      gap: tokens.spacing[16],
    },
    wideMapSticky: {
      position: (Platform.OS === "web" ? ("sticky" as "relative") : "relative"),
      top: tokens.spacing[24],
      zIndex: 1,
    },
    wideMapCard: {
      borderRadius: tokens.radius.large,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerHigh,
      shadowColor: colors.m3.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    wideMapCardHeader: {
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    wideMapCardTitleGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    wideMapCardTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    wideMapCardSubtitle: {
      ...tokens.typography.labelSmall,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    wideMapViewport: {
      height: 440,
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    wideMapCardFooter: {
      padding: tokens.spacing[14],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
    },
    wideMapFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    wideMapFooterTextCol: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    wideMapFooterTitle: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
    wideMapFooterSubtitle: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    wideMapEmptyFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    wideMapEmptyFallbackTitle: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.brand,
      color: colors.m3.onSurface,
      textAlign: "center",
    },
    wideMapEmptyFallbackText: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 20,
    },
    wideSafetyCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      padding: tokens.spacing[14],
      gap: tokens.spacing[8],
    },
    wideSafetyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    wideSafetyTitle: {
      ...tokens.typography.labelLarge,
      fontFamily: fontFamily.semiBold,
      color: colors.nature.foliage,
    },
    wideSafetyText: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 18,
    },
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
