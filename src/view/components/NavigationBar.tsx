import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";

export type NavigationDestination = "home" | "search" | "profile";

export type NavigationBarProps = {
  active: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  disabledDestinations?: readonly NavigationDestination[];
};

const ITEMS: ReadonlyArray<{ key: NavigationDestination; label: string; icon: AppIconName }> = [
  { key: "home", label: "Início", icon: "home" },
  { key: "search", label: "Pesquisa", icon: "search" },
  { key: "profile", label: "Perfil", icon: "person" },
];

/** Barra de navegação do design system (barra-de-navegacao.md), restrita a 3 destinos (ADR 0011). */
export function NavigationBar({ active, onNavigate, disabledDestinations = [] }: NavigationBarProps) {
  return (
    <View style={styles.bar}>
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
            onPress={() => !isDisabled && onNavigate(item.key)}
            style={[styles.item, isActive && styles.itemActive, isDisabled && styles.itemDisabled]}
          >
            <AppIcon
              name={item.icon}
              size={24}
              filled={isActive}
              color={
                isDisabled
                  ? tokens.colors.secondaryText
                  : isActive
                  ? tokens.colors.m3.onSecondaryContainer
                  : tokens.colors.secondaryText
              }
            />
            <Text style={[styles.label, isActive && styles.labelActive, isDisabled && styles.labelDisabled]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: tokens.colors.surface,
    paddingVertical: tokens.spacing[8],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  item: {
    minHeight: tokens.accessibility.touchTarget,
    minWidth: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[4],
    borderRadius: tokens.radius.full,
  },
  itemActive: { backgroundColor: tokens.colors.soft },
  itemDisabled: { opacity: 0.38 },
  label: { color: tokens.colors.secondaryText, ...tokens.typography.labelSmall },
  labelActive: { color: tokens.colors.m3.onSecondaryContainer, fontWeight: "600" },
  labelDisabled: { opacity: 0.7 },
});

export default NavigationBar;
