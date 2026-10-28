import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";

export type NavigationDestination = "home" | "search" | "shelf" | "conversations" | "profile";

export type NavigationBarProps = {
  active: NavigationDestination;
  onNavigate: (destination: NavigationDestination) => void;
  disabledDestinations?: readonly NavigationDestination[];
  /** Selo numérico por destino (M3 badge); 0 ou ausente não mostra nada. */
  badges?: Partial<Record<NavigationDestination, number>>;
};

const ITEMS: ReadonlyArray<{ key: NavigationDestination; label: string; icon: AppIconName }> = [
  { key: "home", label: "Início", icon: "home" },
  { key: "search", label: "Explorar", icon: "search" },
  { key: "shelf", label: "Estante", icon: "shelf" },
  { key: "conversations", label: "Conversas", icon: "chat" },
  { key: "profile", label: "Perfil", icon: "person" },
];

/** Barra de navegação do design system (barra-de-navegacao.md), Material 3 como no Figma `02.01`:
 * barra em `surface-container` de 80 dp, indicador ativo em pílula de 64x32 dp que se expande ao
 * selecionar, ícone preenchido só no destino ativo e rótulo abaixo. Restrita a 5 destinos (ADR 0011).
 */
export function NavigationBar({ active, onNavigate, disabledDestinations = [], badges = {} }: NavigationBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lastNavigateTime = useRef(0);
  const DEBOUNCE_MS = 300;

  return (
    <View testID="navigation-bar-tablist" accessibilityRole="tablist" style={styles.bar}>
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        const isDisabled = disabledDestinations.includes(item.key);
        const badgeCount = badges[item.key] ?? 0;
        const baseLabel = isDisabled ? `${item.label} (em breve)` : item.label;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={isDisabled ? { selected: isActive, disabled: true } : { selected: isActive }}
            accessibilityLabel={badgeCount > 0 ? `${baseLabel}, ${badgeCount} ${badgeCount === 1 ? "nova" : "novas"}` : baseLabel}
            disabled={isDisabled}
            android_ripple={{ color: colors.m3.secondaryContainer, borderless: true, radius: 40 }}
            onPress={() => {
              if (isDisabled || isActive) return;
              const now = Date.now();
              if (now - lastNavigateTime.current < DEBOUNCE_MS) return;
              lastNavigateTime.current = now;
              onNavigate(item.key);
            }}
            style={({ pressed }) => [styles.item, pressed && !isActive && styles.itemPressed, isDisabled && styles.itemDisabled]}
          >
            <View style={styles.indicator}>
              <ActiveIndicator active={isActive} color={colors.m3.secondaryContainer} />
              {/* Na web a pílula (posicionada) seria pintada por cima do ícone: ele sobe uma camada. */}
              <View style={styles.iconLayer}>
                <AppIcon
                  name={item.icon}
                  size={24}
                  filled={isActive}
                  color={isDisabled ? colors.secondaryText : isActive ? colors.m3.onSecondaryContainer : colors.m3.onSurfaceVariant}
                />
              </View>
              {badgeCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount > 9 ? "9+" : String(badgeCount)}</Text>
                </View>
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={[styles.label, isActive && styles.labelActive, isDisabled && styles.labelDisabled]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Pílula de seleção: cresce do centro para as laterais, como na animação do Material 3. */
function ActiveIndicator({ active, color }: { active: boolean; color: string }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: active ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [active, progress]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: color,
          borderRadius: tokens.radius.full,
          opacity: progress,
          transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        },
      ]}
    />
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
      // Elevação nível 2 do M3: separa a barra do conteúdo sem borda.
      elevation: 3,
      zIndex: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    iconLayer: { zIndex: 1 },
    indicator: {
      width: 64,
      height: tokens.spacing[32],
      justifyContent: "center",
      alignItems: "center",
    },
    badge: {
      position: "absolute",
      top: -2,
      right: 10,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    badgeText: { fontSize: 11, lineHeight: 14, fontWeight: "700", color: colors.surface },
    itemPressed: { opacity: 0.7 },
    itemDisabled: { opacity: 0.38 },
    label: { color: colors.m3.onSurfaceVariant, ...tokens.typography.labelMedium },
    labelActive: { color: colors.m3.onSurface, fontWeight: "700" },
    labelDisabled: { opacity: 0.7 },
  });
}

export default NavigationBar;
