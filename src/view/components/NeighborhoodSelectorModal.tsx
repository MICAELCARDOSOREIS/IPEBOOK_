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

export type NeighborhoodSelectorModalProps = {
  visible: boolean;
  currentNeighborhood?: string;
  onSelect: (neighborhood: string) => void;
  onClose: () => void;
};

const ALL_NEIGHBORHOODS_LABEL = "Todos os bairros (Piripiri)";

export function NeighborhoodSelectorModal({
  visible,
  currentNeighborhood = "Centro",
  onSelect,
  onClose,
}: NeighborhoodSelectorModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    const term = filterText.trim().toLowerCase();
    const allList = [ALL_NEIGHBORHOODS_LABEL, ...PIRIPIRI_NEIGHBORHOODS];
    if (!term) return allList;
    return allList.filter((name) => name.toLowerCase().includes(term));
  }, [filterText]);

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.scrim}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ao tocar fora"
          onPress={onClose}
          style={styles.scrimBackdrop}
        />
        <View style={styles.sheetContainer}>
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
              style={styles.closeButton}
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
                style={styles.clearSearchButton}
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
                  style={[
                    styles.itemButton,
                    isSelected && styles.itemButtonSelected,
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
                  {isSelected ? (
                    <AppIcon name="check" size={20} color={colors.m3.primary} />
                  ) : null}
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
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    scrimBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    sheetContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
      fontSize: 20,
      fontFamily: fontFamily.brand,
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      marginTop: 2,
    },
    closeButton: {
      minWidth: 48,
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: 12,
      paddingHorizontal: tokens.spacing[12],
      minHeight: 48,
      marginBottom: tokens.spacing[12],
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontFamily: fontFamily.regular,
      marginLeft: tokens.spacing[8],
      paddingVertical: tokens.spacing[8],
    },
    clearSearchButton: {
      padding: tokens.spacing[4],
      minWidth: 32,
      minHeight: 32,
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
      minHeight: 48,
      borderRadius: 12,
      marginBottom: 4,
    },
    itemButtonSelected: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: fontFamily.regular,
      marginLeft: tokens.spacing[12],
    },
    itemTextSelected: {
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSecondaryContainer,
    },
  });
}
