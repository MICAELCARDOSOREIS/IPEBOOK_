import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lastNavigateTime = useRef(0);
  const DEBOUNCE_MS = 300;

  return (
    <View
      testID="navigation-bar-tablist"
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: tokens.spacing[16] + insets.bottom }]}
    >
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
            onPress={() => {
              if (isDisabled || isActive) return;
              const now = Date.now();
              if (now - lastNavigateTime.current < DEBOUNCE_MS) return;
              lastNavigateTime.current = now;
              onNavigate(item.key);
            }}
            style={[styles.item, isDisabled && styles.itemDisabled]}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.indicator,
                    pressed && !isDisabled && styles.indicatorPressed,
                    pressed && !isActive && !isDisabled && styles.indicatorInactivePressed,
                  ]}
                >
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
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Pílula de seleção M3 Expressive: expande do centro com física de mola espacial (`tokens.spring.spatialStandard`). */
function ActiveIndicator({ active, color }: { active: boolean; color: string }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    const target = active ? 1 : 0;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          progress.setValue(target);
          return;
        }
        Animated.spring(progress, {
          toValue: target,
          tension: tokens.spring.spatialStandard.tension,
          friction: tokens.spring.spatialStandard.friction,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        progress.setValue(target);
      });
  }, [active, progress]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: color,
          borderRadius: tokens.radius.full,
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" }),
          transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }],
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
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: tokens.spacing[4],
      ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    iconLayer: { zIndex: 1 },
    indicator: {
      width: 64,
      height: tokens.spacing[32],
      borderRadius: tokens.radius.full,
      justifyContent: "center",
      alignItems: "center",
    },
    indicatorPressed: {
      transform: [{ scale: 0.94 }],
    },
    indicatorInactivePressed: {
      backgroundColor: colors.m3.surfaceContainerHighest,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: 10,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.small,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    badgeText: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.bold, color: colors.surface },
    itemPressed: { opacity: 0.7 },
    itemDisabled: { opacity: 0.38 },
    label: { color: colors.m3.onSurfaceVariant, ...tokens.typography.labelMedium },
    labelActive: { color: colors.m3.onSurface, fontWeight: tokens.fontWeight.bold },
    labelDisabled: { opacity: 0.7 },
  });
}

export default NavigationBar;
