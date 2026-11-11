import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ALL_PIRIPIRI_LOCATIONS_LABEL,
  PIRIPIRI_MEETING_POINT_NAMES,
  type PiripiriMeetingPointName,
} from "@/model/entities/location";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";
import { type FocusableElement, useModalFocusTrap } from "@/view/components/Dialog";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { standardVerticalScrollProps } from "@/view/scrollProps";

import { withPress } from "@/view/pressFeedback";

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

export const ALL_NEIGHBORHOODS_LABEL = ALL_PIRIPIRI_LOCATIONS_LABEL;

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
    subtitle: "Centro de Piripiri · Espaço público seguro",
  },
];

export function NeighborhoodSelectorModal({
  visible,
  currentNeighborhood = "all",
  onSelect,
  onClose,
  allowAllNeighborhoods = true,
}: NeighborhoodSelectorModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filterText, setFilterText] = useState("");
  const wideWeb = useIsWideWeb();

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

  useModalFocusTrap(visible, () => [searchInputRef.current, closeRef.current], onClose);

  if (!visible) return null;

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.scrim, wideWeb && styles.scrimWide]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ao tocar fora"
          onPress={onClose}
          style={styles.scrimBackdrop}
        />
        <View
          style={[
            styles.sheetContainer,
            wideWeb
              ? styles.dialogWide
              : { paddingBottom: Math.max(tokens.spacing[24], insets.bottom + tokens.spacing[12]) },
          ]}
        >
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
              style={withPress(styles.closeButton)}
            >
              <AppIcon name="close" size={24} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Campo de busca rápida */}
          <View style={styles.searchBox}>
            <AppIcon name="search" size={20} color={colors.m3.onSurfaceVariant} />
            <TextInput
              ref={searchInputRef as never}
              style={styles.searchInput}
              placeholder="Buscar ponto de encontro em Piripiri..."
              placeholderTextColor={colors.m3.onSurfaceVariant}
              accessibilityLabel="Buscar ponto de encontro em Piripiri"
              value={filterText}
              onChangeText={setFilterText}
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
            contentContainerStyle={[
              styles.listContent,
              !wideWeb && { paddingBottom: Math.max(tokens.spacing[16], insets.bottom + tokens.spacing[8]) },
            ]}
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
                        numberOfLines={1}
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
      </View>
    </Modal>
  );
}

export const LocationSelectorModal = NeighborhoodSelectorModal;

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
      maxHeight: "80%",
      paddingTop: tokens.spacing[16],
      paddingBottom: tokens.spacing[24],
      paddingHorizontal: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
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
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.cardSmall,
      paddingHorizontal: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      marginBottom: tokens.spacing[12],
    },
    searchInput: {
      flex: 1,
      ...tokens.typography.subheadline,
      color: colors.text,
      marginLeft: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
    },
    clearSearchButton: {
      padding: tokens.spacing[4],
      minWidth: tokens.spacing[32],
      minHeight: tokens.spacing[32],
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
