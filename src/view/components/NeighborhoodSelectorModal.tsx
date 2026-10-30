import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PIRIPIRI_NEIGHBORHOODS } from "@/model/entities/location";
import { useTheme } from "@/view/theme/ThemeProvider";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";
import { useIsWideWeb } from "@/view/useIsWideWeb";

import { withPress } from "@/view/pressFeedback";
export type NeighborhoodSelectorModalProps = {
  visible: boolean;
  currentNeighborhood?: string;
  onSelect: (neighborhood: string) => void;
  onClose: () => void;
  /** `false` em escolhas que exigem um bairro único (ex.: retirada do anúncio, `04.05`). */
  allowAllNeighborhoods?: boolean;
};

const ALL_NEIGHBORHOODS_LABEL = "Todos os bairros (Piripiri)";

export function NeighborhoodSelectorModal({
  visible,
  currentNeighborhood = "Centro",
  onSelect,
  onClose,
  allowAllNeighborhoods = true,
}: NeighborhoodSelectorModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filterText, setFilterText] = useState("");
  const wideWeb = useIsWideWeb();

  const filteredItems = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    const allList = allowAllNeighborhoods
      ? [ALL_NEIGHBORHOODS_LABEL, ...PIRIPIRI_NEIGHBORHOODS]
      : [...PIRIPIRI_NEIGHBORHOODS];
    if (!term) return allList;
    return allList.filter((name) => name.toLowerCase().includes(term));
  }, [allowAllNeighborhoods, filterText]);

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      // Tela cheia: o véu cobre também as barras do sistema (sem faixas claras em cima e embaixo).
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
        <View style={[styles.sheetContainer, wideWeb && styles.dialogWide]}>
          {/* Alça da folha (M3): indica que é uma folha inferior que se fecha. */}
          {wideWeb ? null : <View accessible={false} importantForAccessibility="no" style={styles.handle} />}
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text accessibilityRole="header" style={styles.title}>
                Escolha seu bairro
              </Text>
              <Text style={styles.subtitle}>Piripiri · Piauí</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar seletor de bairros"
              onPress={onClose}
              style={withPress(styles.closeButton)}
            >
              <AppIcon name="close" size={24} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>

          {/* Campo de busca rápida de bairro */}
          <View style={styles.searchBox}>
            <AppIcon name="search" size={20} color={colors.m3.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar bairro em Piripiri..."
              placeholderTextColor={colors.m3.onSurfaceVariant}
              value={filterText}
              onChangeText={setFilterText}
              autoCapitalize="words"
              clearButtonMode="while-editing"
            />
            {filterText.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca de bairro"
                onPress={() => setFilterText("")}
                style={withPress(styles.clearSearchButton)}
              >
                <AppIcon name="close" size={18} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Lista de bairros */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isAll = item === ALL_NEIGHBORHOODS_LABEL;
              const isSelected =
                (isAll && (currentNeighborhood === "all" || currentNeighborhood === ALL_NEIGHBORHOODS_LABEL)) ||
                (!isAll && currentNeighborhood.toLowerCase() === item.toLowerCase());

              const label = isAll
                ? "Selecionar todos os bairros de Piripiri"
                : `Selecionar bairro ${item}`;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.itemButton,
                    isSelected && styles.itemButtonSelected,
                    pressed && styles.itemButtonPressed,
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <AppIcon
                      name="place"
                      size={20}
                      color={isSelected ? colors.m3.primary : colors.m3.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.itemText,
                        isSelected && styles.itemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
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
    },
    itemText: {
      ...tokens.typography.bodyLarge,
      color: colors.text,
      marginLeft: tokens.spacing[12],
    },
    itemTextSelected: {
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
  });
}
