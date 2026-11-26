import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { triggerHaptic } from "@/view/haptics";
import { useGuardedPress } from "@/view/useGuardedPress";

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  onCancel?: () => void;
};

/** Campo de busca com destaque de foco e acabamento adaptado ao iPhone. */
export function SearchField({ value, onChangeText, placeholder = "Buscar título, autor ou categoria", onSubmitEditing, onCancel }: SearchFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const isIos = Platform.OS === "ios";

  const handleClear = useGuardedPress(() => {
    if (isIos) {
      triggerHaptic("light");
    }
    onChangeText("");
  });

  const handleCancel = useGuardedPress(() => {
    if (isIos) {
      triggerHaptic("light");
    }
    onChangeText("");
    setFocused(false);
    onCancel?.();
  });

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, focused && styles.containerFocused, isIos && styles.containerIos]}>
        <AppIcon name="search" size={isIos ? 20 : 24} color={focused ? colors.m3.primary : colors.secondaryText} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          accessibilityLabel="Buscar livros"
          style={styles.input}
          clearButtonMode={isIos ? "never" : undefined}
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            hitSlop={8}
            onPress={handleClear}
            style={({ pressed }) => [
              styles.clearButton,
              isIos && styles.clearButtonIos,
              pressed && styles.clearButtonPressed,
            ]}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      {isIos && (focused || value.length > 0) && onCancel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar busca"
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      width: "100%",
    },
    container: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      minHeight: tokens.spacing[56],
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.full,
      borderWidth: 1.5,
      borderColor: colors.m3.outline,
      paddingHorizontal: tokens.spacing[20],
      gap: tokens.spacing[12],
    },
    containerIos: {
      minHeight: 44,
      borderRadius: tokens.radius.cardSmall,
      paddingHorizontal: tokens.spacing[12],
      gap: tokens.spacing[8],
    },
    containerFocused: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      borderColor: colors.m3.primary,
    },
    input: {
      flex: 1,
      ...tokens.typography.bodyLarge,
      color: colors.text,
      ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : {}),
    },
    clearButton: {
      minHeight: tokens.accessibility.touchTarget,
      minWidth: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.buttonRest,
      justifyContent: "center",
      alignItems: "center",
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    clearButtonIos: {
      minHeight: 36,
      minWidth: 36,
    },
    clearButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainer,
    },
    clearIcon: { color: colors.secondaryText, fontSize: tokens.fontSize[16] },
    cancelButton: {
      paddingHorizontal: tokens.spacing[8],
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelText: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.medium,
    },
  });
}

export default SearchField;
