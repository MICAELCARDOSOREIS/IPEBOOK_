import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ALL_PIRIPIRI_LOCATIONS_LABEL,
  PIRIPIRI_MEETING_POINT_NAMES,
  type PiripiriMeetingPointName,
} from "@/model/entities/location";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { AppIcon } from "@/view/components/AppIcon";
import { type FocusableElement, useModalFocusTrap } from "@/view/components/Dialog";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { withPress } from "@/view/pressFeedback";
import { standardVerticalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, fontFamily, tokens } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAnimatedKeyboardInset } from "@/view/useKeyboardInset";

export type LocationItem = {
  id: string;
  name: string;
  subtitle: string;
  isAll?: boolean;
};

export type NeighborhoodSelectorModalProps = {
  visible: boolean;
  currentNeighborhood?: string;
  onSelect: (neighborhood: string) => void;
  onClose: () => void;
  /** `false` em escolhas que exigem um local específico (ex.: retirada do anúncio). */
  allowAllNeighborhoods?: boolean;
};

const PIRIPIRI_LOCATIONS: readonly LocationItem[] = [
  {
    id: "all",
    name: ALL_PIRIPIRI_LOCATIONS_LABEL,
    subtitle: "Ver livros de toda a cidade de Piripiri",
    isAll: true,
  },
  {
    id: "ifpi",
    name: "Campus IFPI Piripiri",
    subtitle: "Recepção ou Biblioteca · Rodovia PI-112",
  },
  {
    id: "bandeira",
    name: "Praça da Bandeira",
    subtitle: "Centro de Piripiri · Diariamente das 8h às 18h",
  },
  {
    id: "museu",
    name: "Museu de Piripiri",
    subtitle: "Museu de Perypery · Rua Leônidas Melo, Centro",
  },
  {
    id: "eventos",
    name: "Praça de Eventos",
    subtitle: "Centro de Piripiri · Espaço público",
  },
];

const neighborhoodModalStylesCache = new WeakMap<ColorPalette, ReturnType<typeof createStyles>>();
function getNeighborhoodModalStyles(colors: ColorPalette) {
  let cached = neighborhoodModalStylesCache.get(colors);
  if (!cached) {
    cached = createStyles(colors);
    neighborhoodModalStylesCache.set(colors, cached);
  }
  return cached;
}

export function NeighborhoodSelectorModal(props: NeighborhoodSelectorModalProps) {
  if (!props.visible) return null;
  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
        <NeighborhoodSelectorModalContent {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}

function NeighborhoodSelectorModalContent({
  visible,
  currentNeighborhood = "all",
  onSelect,
  onClose,
  allowAllNeighborhoods = true,
}: NeighborhoodSelectorModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getNeighborhoodModalStyles(colors);
  const [filterText, setFilterText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const wideWeb = useIsWideWeb();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;

  useEffect(() => {
    if (Platform.OS === "web") return undefined;
    const showSub = Keyboard.addListener(
      isIos ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener(
      isIos ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardOpen(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [isIos]);

  const baseItems = useMemo(() => {
    return allowAllNeighborhoods
      ? PIRIPIRI_LOCATIONS
      : PIRIPIRI_LOCATIONS.filter((item) => !item.isAll);
  }, [allowAllNeighborhoods]);

  const filteredItems = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    if (!term) return baseItems;
    return baseItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term),
    );
  }, [baseItems, filterText]);

  const closeRef = useRef<FocusableElement | null>(null);
  const searchInputRef = useRef<FocusableElement | null>(null);
  const keyboardInset = useAnimatedKeyboardInset();

  useModalFocusTrap(visible, () => [searchInputRef.current, closeRef.current], onClose);

  if (!visible) return null;

  return (
      <Animated.View
        testID="neighborhood-selector-scrim"
        style={[
          styles.scrim,
          wideWeb && styles.scrimWide,
          !wideWeb && { paddingTop: insets.top + tokens.spacing[12], paddingBottom: keyboardInset },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ao tocar fora"
          onPress={onClose}
          style={styles.scrimBackdrop}
        />
        <View
          style={[
            styles.sheetContainer,
            !wideWeb && isIos && (iosGlass ? styles.iosSheetGlass : styles.iosSheetOpaque),
            wideWeb
              ? styles.dialogWide
              : {
                  paddingBottom: keyboardOpen
                    ? tokens.spacing[12]
                    : Math.max(tokens.spacing[16], insets.bottom + tokens.spacing[8]),
                },
          ]}
        >
          {!wideWeb && iosGlass ? (
            <IosGlassBackdrop
              style={{
                borderTopLeftRadius: tokens.radius.extraLarge,
                borderTopRightRadius: tokens.radius.extraLarge,
              }}
            />
          ) : null}
          {/* Alça da folha (M3) */}
          {wideWeb ? null : <View accessible={false} importantForAccessibility="no" style={styles.handle} />}

          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text accessibilityRole="header" style={styles.title}>
                Locais em Piripiri
              </Text>
              <Text style={styles.subtitle}>Pontos de encontro para entrega e retirada · PI</Text>
            </View>
            <Pressable
              ref={closeRef as never}
              accessibilityRole="button"
              accessibilityLabel="Fechar seletor de locais"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                isIos && styles.iosCloseButton,
                isIos && opaqueIos && styles.iosCloseOpaque,
                pressed && { transform: [{ scale: 0.96 }] },
                pressed && !iosGlass && { opacity: 0.75 },
              ]}
            >
              {iosGlass ? <IosGlassBackdrop style={{ borderRadius: tokens.radius.full }} /> : null}
              <AppIcon name="close" size={isIos ? 20 : 24} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Campo de busca rápida */}
          <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
            <AppIcon name="search" size={20} color={searchFocused ? colors.m3.primary : colors.m3.onSurfaceVariant} />
            <TextInput
              ref={searchInputRef as never}
              style={styles.searchInput}
              placeholder="Buscar ponto de encontro"
              placeholderTextColor={colors.m3.onSurfaceVariant}
              accessibilityLabel="Buscar ponto de encontro em Piripiri"
              value={filterText}
              onChangeText={setFilterText}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {filterText.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca de local"
                onPress={() => setFilterText("")}
                style={withPress(styles.clearSearchButton)}
              >
                <AppIcon name="close" size={18} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Lista de locais e pontos de encontro */}
          <FlatList
            {...standardVerticalScrollProps}
            data={filteredItems}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum local encontrado para "{filterText}".
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca e mostrar todos os locais"
                  onPress={() => setFilterText("")}
                  style={withPress(styles.emptyAction)}
                >
                  <Text style={styles.emptyActionText}>Ver todos os locais</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => {
              const currentNorm = (currentNeighborhood || "").toLowerCase();
              const isAll = item.isAll;
              const isSelected =
                (isAll && (currentNorm === "all" || currentNorm === "" || currentNorm.includes("todos") || currentNorm === "piripiri")) ||
                (!isAll && (currentNorm === item.name.toLowerCase() || (item.name.toLowerCase().includes(currentNorm) && currentNorm.length > 3)));

              const label = isAll
                ? "Selecionar todos os locais de Piripiri"
                : `Selecionar ponto de encontro ${item.name}`;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(item.name)}
                  style={({ pressed }) => [
                    styles.itemButton,
                    isSelected && styles.itemButtonSelected,
                    pressed && styles.itemButtonPressed,
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.itemIconBox,
                        isSelected && styles.itemIconBoxSelected,
                      ]}
                    >
                      <AppIcon
                        name={isAll ? "place" : "place"}
                        size={20}
                        color={isSelected ? colors.m3.onPrimaryContainer : colors.m3.primary}
                      />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text
                        style={[
                          styles.itemText,
                          isSelected && styles.itemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.itemSubtext,
                          isSelected && styles.itemSubtextSelected,
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {isSelected ? <AppIcon name="check" size={20} color={colors.m3.primary} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: colors.m3.scrim,
      justifyContent: "flex-end",
    },
    // Web larga: diálogo centralizado em vez de folha inferior esticada pela janela inteira.
    scrimWide: { justifyContent: "center", alignItems: "center", padding: tokens.spacing[24] },
    dialogWide: { width: "100%", maxWidth: 480, borderRadius: tokens.radius.xxl },
    scrimBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    handle: {
      alignSelf: "center",
      width: 32,
      height: 4,
      borderRadius: tokens.radius.hairline,
      marginTop: tokens.spacing[12],
      backgroundColor: colors.m3.onSurfaceVariant,
      opacity: 0.4,
    },
    sheetContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: tokens.radius.extraLarge,
      borderTopRightRadius: tokens.radius.extraLarge,
      ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : {}),
      maxHeight: "90%",
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    iosSheetGlass: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      overflow: "hidden",
    },
    iosSheetOpaque: {
      backgroundColor: colors.m3.surfaceContainer,
    },
    iosCloseButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.radius.full,
      backgroundColor: "transparent",
      borderCurve: "continuous",
    },
    iosCloseOpaque: {
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: tokens.spacing[12],
    },
    headerTitles: {
      flex: 1,
    },
    title: {
      ...tokens.typography.titleBar,
      color: colors.text,
    },
    subtitle: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
      marginTop: tokens.spacing[2],
    },
    closeButton: {
      minWidth: tokens.accessibility.touchTarget,
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
      alignItems: "center",
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Platform.OS === "ios" ? tokens.ios.cell : colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.cardSmall,
      ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : {}),
      borderWidth: 1.5,
      borderColor: Platform.OS === "ios" ? tokens.ios.separator : "transparent",
      paddingHorizontal: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      marginBottom: tokens.spacing[12],
    },
    searchBoxFocused: {
      borderColor: Platform.OS === "ios" ? colors.m3.focusRing : colors.m3.primary,
      backgroundColor: Platform.OS === "ios" ? tokens.ios.cell : colors.m3.surfaceContainerHighest,
    },
    searchInput: {
      flex: 1,
      // 16 px evita o zoom involuntário do Safari ao focar o campo (Spec 136).
      ...tokens.typography.bodyLarge,
      color: colors.text,
      marginLeft: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : {}),
    },
    clearSearchButton: {
      padding: tokens.spacing[4],
      minWidth: Platform.OS === "ios" ? 44 : tokens.spacing[32],
      minHeight: Platform.OS === "ios" ? 44 : tokens.spacing[32],
      justifyContent: "center",
      alignItems: "center",
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      paddingBottom: tokens.spacing[16],
    },
    itemButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      borderRadius: tokens.radius.cardSmall,
      marginBottom: tokens.spacing[4],
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    itemButtonSelected: {
      backgroundColor: colors.m3.secondaryContainer,
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    itemButtonPressed: {
      transform: [{ scale: 0.98 }],
      borderRadius: tokens.shapeMorph.chipSelected,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: tokens.spacing[12],
    },
    itemIconBox: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      justifyContent: "center",
      alignItems: "center",
    },
    itemIconBoxSelected: {
      backgroundColor: colors.m3.primaryContainer,
    },
    itemTextBox: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    itemText: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.medium,
      color: colors.text,
    },
    itemTextSelected: {
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
    itemSubtext: {
      ...tokens.typography.footnote,
      color: colors.m3.onSurfaceVariant,
    },
    itemSubtextSelected: {
      color: colors.m3.onSecondaryContainer,
      opacity: 0.85,
    },
    emptyContainer: {
      paddingVertical: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[16],
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    emptyText: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
    },
    emptyAction: {
      minHeight: tokens.accessibility.touchTarget,
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyActionText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSecondaryContainer,
      fontFamily: fontFamily.semiBold,
    },
  });
}
