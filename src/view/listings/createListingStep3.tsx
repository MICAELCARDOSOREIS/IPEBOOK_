import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BookCondition } from "@/model/entities/book";
import {
  BOOK_CONDITIONS,
  BOOK_CONDITION_LABELS,
  MAX_BOOK_DESCRIPTION_LENGTH,
} from "@/model/entities/book";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { categoryTone } from "@/view/categoryTone";
import { AppIcon } from "@/view/components/AppIcon";
import { Checkbox } from "@/view/components/Checkbox";
import { Chip } from "@/view/components/Chip";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { TextField } from "@/view/components/TextField";

import { withPress } from "@/view/pressFeedback";
/** Categorias sugeridas pela etapa de detalhes do Figma (`04.05`). */
export const LISTING_CATEGORIES = ["Literatura", "Infantil", "Didático", "Romance", "Outros"];

export type CreateListingStep3Props = {
  condition: BookCondition | null;
  category: string;
  description: string;
  neighborhood: string;
  isBox?: boolean;
  boxVolumesCount?: string;
  loading: boolean;
  error: string | null;
  errorRef?: React.Ref<any>;
  onSetCondition: (condition: BookCondition | null) => void;
  onSetCategory: (category: string) => void;
  onSetDescription: (description: string) => void;
  onSetNeighborhood: (neighborhood: string) => void;
  onSetIsBox?: (isBox: boolean) => void;
  onSetBoxVolumesCount?: (count: string) => void;
};

/**
 * Etapa 3 (`04.05 · Detalhes do livro`, nó `12:360`): conservação e categoria em chips de
 * filtro de 40 dp, descrição com contador à direita e bairro como campo que abre o seletor
 * de bairros de Piripiri. As ações ficam na barra fixa inferior do fluxo (nó `12:413`).
 */
export function CreateListingStep3({
  condition,
  category,
  description,
  neighborhood,
  isBox = false,
  boxVolumesCount = "",
  loading,
  error,
  errorRef,
  onSetCondition,
  onSetCategory,
  onSetDescription,
  onSetNeighborhood,
  onSetIsBox,
  onSetBoxVolumesCount,
}: CreateListingStep3Props) {
  const { colors, resolvedScheme } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors, wideWeb), [colors, wideWeb]);
  const [neighborhoodPickerVisible, setNeighborhoodPickerVisible] = useState(false);

  const descriptionTooLong = description.length > MAX_BOOK_DESCRIPTION_LENGTH;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Conservação</Text>
        <View style={styles.chipRow}>
          {BOOK_CONDITIONS.map((cond: BookCondition) => (
            <Chip
              key={cond}
              size="regular"
              label={BOOK_CONDITION_LABELS[cond]}
              accessibilityLabel={`Conservação ${BOOK_CONDITION_LABELS[cond]}`}
              selected={condition === cond}
              onPress={() => onSetCondition(condition === cond ? null : cond)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Categoria</Text>
        <View style={styles.chipRow}>
          {LISTING_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              size="regular"
              label={cat}
              accessibilityLabel={`Categoria ${cat}`}
              tone={categoryTone(cat, resolvedScheme)}
              selected={category === cat}
              onPress={() => onSetCategory(category === cat ? "" : cat)}
              disabled={loading}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.sectionLabel}>Formato do anúncio</Text>
        <Checkbox
          label="Box ou coleção de livros"
          description="Marque se este anúncio reúne mais de um volume"
          checked={Boolean(isBox)}
          onChange={(checked) => onSetIsBox?.(checked)}
          disabled={loading}
        />
        {isBox ? (
          <View style={styles.boxVolumesContainer}>
            <TextField
              label="Quantidade de volumes (opcional)"
              value={boxVolumesCount}
              onChangeText={(text) => onSetBoxVolumesCount?.(text)}
              editable={!loading}
              placeholder="Ex: 3, 5, 7"
              keyboardType="number-pad"
              helperText="De 2 a 100 volumes componentes da coleção"
            />
          </View>
        ) : null}
      </View>

      <TextField
        label="Descrição"
        value={description}
        onChangeText={onSetDescription}
        editable={!loading}
        placeholder="Ex: Marcas leves de uso, páginas completas."
        maxLength={MAX_BOOK_DESCRIPTION_LENGTH}
        multiline
        helperText={`${description.length}/${MAX_BOOK_DESCRIPTION_LENGTH}`}
        helperTextAlign="right"
        error={
          descriptionTooLong
            ? `A descrição deve ter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`
            : undefined
        }
      />

      <View style={styles.field}>
        {/* Campo contornado como em `04.05` (nó `99:2259`): o rótulo flutua na borda e abre o seletor. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            neighborhood
              ? `Bairro para retirada: ${neighborhood}. Alterar bairro`
              : "Selecionar bairro para retirada em Piripiri"
          }
          accessibilityHint="Abre a lista dos bairros de Piripiri"
          disabled={loading}
          onPress={() => setNeighborhoodPickerVisible(true)}
          style={({ pressed }) => [
            styles.neighborhoodField,
            pressed && styles.neighborhoodFieldPressed,
            loading && styles.disabled,
          ]}
        >
          <View pointerEvents="none" style={[styles.notch, { backgroundColor: wideWeb ? colors.m3.surfaceContainerLowest : colors.background }]}>
            <Text style={styles.floatingLabel}>Bairro para retirada</Text>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.neighborhoodValue, !neighborhood && styles.neighborhoodPlaceholder]}
          >
            {neighborhood ? `${neighborhood}, Piripiri` : "Selecione em qual bairro a entrega ocorre"}
          </Text>
          {neighborhood ? (
            <View style={styles.clearButton} />
          ) : (
            <AppIcon name="chevronDown" size={20} color={colors.m3.onSurfaceVariant} />
          )}
        </Pressable>
        {/* Fora do campo: na web, botão dentro de botão é HTML inválido. */}
        {neighborhood ? (
          <View pointerEvents="box-none" style={styles.clearButtonOverlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar bairro selecionado"
              hitSlop={12}
              disabled={loading}
              onPress={() => onSetNeighborhood("")}
              style={withPress(styles.clearButton)}
            >
              <AppIcon name="close" size={20} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.hint}>Só o bairro aparece no anúncio.</Text>
      </View>

      {error ? (
        <Text
          ref={errorRef}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : null}

      <NeighborhoodSelectorModal
        visible={neighborhoodPickerVisible}
        allowAllNeighborhoods={false}
        currentNeighborhood={neighborhood}
        onSelect={(selected) => {
          onSetNeighborhood(selected);
          setNeighborhoodPickerVisible(false);
        }}
        onClose={() => setNeighborhoodPickerVisible(false)}
      />
    </>
  );
}

function createStyles(colors: ColorPalette, wideWeb: boolean) {
  return StyleSheet.create({
    field: { gap: tokens.spacing[8] },
    boxVolumesContainer: { marginTop: tokens.spacing[4], paddingLeft: tokens.spacing[32] },
    // `04.05`: rótulo do grupo em 16/24 peso médio sobre `on-surface`.
    sectionLabel: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.medium,
      fontWeight: tokens.fontWeight.medium,
      color: colors.text,
    },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8] },
    neighborhoodField: {
      minHeight: tokens.spacing[56],
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outline,
      backgroundColor: wideWeb ? colors.m3.surfaceContainerLow : "transparent",
    },
    neighborhoodFieldPressed: { borderColor: colors.action },
    notch: {
      position: "absolute",
      top: -8,
      left: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.extraSmall,
    },
    floatingLabel: { ...tokens.typography.labelMedium, color: colors.m3.onSurfaceVariant },
    neighborhoodValue: {
      flex: 1,
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    neighborhoodPlaceholder: { color: colors.m3.onSurfaceVariant },
    clearButton: { width: tokens.spacing[32], height: tokens.spacing[32], justifyContent: "center", alignItems: "center" },
    clearButtonOverlay: {
      position: "absolute",
      top: 0,
      right: tokens.spacing[16],
      height: tokens.spacing[56],
      justifyContent: "center",
    },
    hint: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    disabled: { opacity: 0.38 },
    errorText: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
  });
}
