import { useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";

export type NavigationDestination = "home" | "search" | "shelf" | "conversations" | "profile";

export type NavigationBarProps = {
  active: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  disabledDestinations?: readonly NavigationDestination[];
};

const ITEMS: ReadonlyArray<{ key: NavigationDestination; label: string; icon: AppIconName }> = [
  { key: "home", label: "Início", icon: "home" },
  { key: "search", label: "Explorar", icon: "search" },
  { key: "shelf", label: "Estante", icon: "shelf" },
  { key: "conversations", label: "Conversas", icon: "chat" },
  { key: "profile", label: "Perfil", icon: "person" },
];

/** Barra de navegação do design system (barra-de-navegacao.md), Material 3 como no Figma `02.01`:
 * barra em `surface-container`, indicador ativo em pílula de 56x32 dp ao redor do ícone e rótulo
 * abaixo. Restrita a 5 destinos (ADR 0011).
 */
export function NavigationBar({ active, onNavigate, disabledDestinations = [] }: NavigationBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lastNavigateTime = useRef(0);
  const DEBOUNCE_MS = 300;

  return (
    <View testID="navigation-bar-tablist" accessibilityRole="tablist" style={styles.bar}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        const isDisabled = disabledDestinations.includes(item.key);
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={isDisabled ? { selected: isActive, disabled: true } : { selected: isActive }}
            accessibilityLabel={isDisabled ? `${item.label} (em breve)` : item.label}
            disabled={isDisabled}
            onPress={() => {
              if (isDisabled || isActive) return;
              const now = Date.now();
              if (now - lastNavigateTime.current < DEBOUNCE_MS) return;
              lastNavigateTime.current = now;
              onNavigate(item.key);
            }}
            style={[styles.item, isDisabled && styles.itemDisabled]}
          >
            <View style={[styles.indicator, isActive && styles.indicatorActive]}>
              <AppIcon
                name={item.icon}
                size={24}
                filled={isActive}
                color={isDisabled ? colors.secondaryText : isActive ? colors.m3.onSecondaryContainer : colors.secondaryText}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive, isDisabled && styles.labelDisabled]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: colors.m3.surfaceContainer,
      paddingTop: tokens.spacing[12],
      paddingBottom: tokens.spacing[16],
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[4],
    },
    indicator: {
      width: tokens.spacing[56],
      height: tokens.spacing[32],
      borderRadius: tokens.radius.large,
      justifyContent: "center",
      alignItems: "center",
    },
    indicatorActive: { backgroundColor: colors.m3.secondaryContainer },
    itemDisabled: { opacity: 0.38 },
    label: { color: colors.secondaryText, ...tokens.typography.labelMedium },
    labelActive: { color: colors.m3.onSurface },
    labelDisabled: { opacity: 0.7 },
  });
}

export default NavigationBar;
