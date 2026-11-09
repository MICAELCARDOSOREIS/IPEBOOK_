import { useEffect, useMemo, useRef, useState } from "react";
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
];

/** Barra de navegação do design system (barra-de-navegacao.md), Material 3 Expressive como no Figma `02.01`:
 * dock flutuante em pílula com superfície tonal M3, indicador ativo em pílula de 64x32 dp que se expande ao
 * selecionar, ícone preenchido só no destino ativo, rótulo abaixo e suporte a hover e transluscência na web.
 * Restrita a 3 destinos (ADR 0011).
 */
export function NavigationBar({ active, onNavigate, disabledDestinations = [], badges = {} }: NavigationBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hoveredKey, setHoveredKey] = useState<NavigationDestination | null>(null);
  const lastNavigateTime = useRef(0);
  const DEBOUNCE_MS = 600;

  // Em celulares com barra de 3 botões (Android) ou Home Indicator (iOS),
  // insets.bottom eleva os itens acima dos controles do sistema operacional para evitar sobreposição.
  const paddingBottom = Math.max(tokens.spacing[20], insets.bottom + tokens.spacing[10]);

  return (
    <View
      testID="navigation-bar-tablist"
      accessibilityRole="tablist"
      pointerEvents="box-none"
      style={[styles.floatingWrapper, { paddingBottom }]}
    >
      <View style={styles.dock}>
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          const isDisabled = disabledDestinations.includes(item.key);
          const isHovered = hoveredKey === item.key;
          const badgeCount = badges[item.key] ?? 0;
          const baseLabel = isDisabled ? `${item.label} (em breve)` : item.label;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={isDisabled ? { selected: isActive, disabled: true } : { selected: isActive }}
              accessibilityLabel={badgeCount > 0 ? `${baseLabel}, ${badgeCount} ${badgeCount === 1 ? "nova" : "novas"}` : baseLabel}
              disabled={isDisabled}
              onHoverIn={() => setHoveredKey(item.key)}
              onHoverOut={() => setHoveredKey((prev) => (prev === item.key ? null : prev))}
              onPress={() => {
                if (isDisabled || isActive) return;
                const now = Date.now();
                if (now - lastNavigateTime.current < DEBOUNCE_MS) {
                  lastNavigateTime.current = now;
                  return;
                }
                lastNavigateTime.current = now;
                onNavigate(item.key);
              }}
              style={({ pressed }) => [
                styles.item,
                pressed && !isDisabled && styles.itemPressed,
                isDisabled && styles.itemDisabled,
              ]}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.indicator,
                      pressed && !isDisabled && styles.indicatorPressed,
                      isHovered && !isActive && !isDisabled && styles.indicatorHovered,
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
                        color={isDisabled ? colors.secondaryText : isActive ? colors.m3.onSecondaryContainer : isHovered ? colors.m3.onSurface : colors.m3.onSurfaceVariant}
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
                    style={[
                      styles.label,
                      isActive && styles.labelActive,
                      isHovered && !isActive && !isDisabled && styles.labelHovered,
                      isDisabled && styles.labelDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
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
          transform: [
            { scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) },
            { scaleY: progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ],
        },
      ]}
    />
  );
}

function createStyles(colors: ColorPalette) {
  const isWeb = Platform.OS === "web";
  const webDockBg = colors.surface === "#FCFAF5" ? "rgba(252, 250, 245, 0.92)" : "rgba(29, 27, 25, 0.90)";

  return StyleSheet.create({
    floatingWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: tokens.spacing[16],
      backgroundColor: "transparent",
      pointerEvents: "box-none",
    },
    dock: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      maxWidth: 328,
      backgroundColor: isWeb ? webDockBg : colors.surface,
      borderRadius: tokens.radius.full,
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[12],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
      elevation: 6,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      ...(isWeb
        ? ({
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          } as never)
        : {}),
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: tokens.spacing[4],
      paddingVertical: tokens.spacing[4],
      ...(isWeb ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    iconLayer: { zIndex: 1 },
    indicator: {
      width: 64,
      height: tokens.spacing[32],
      borderRadius: tokens.radius.full,
      justifyContent: "center",
      alignItems: "center",
    },
    indicatorHovered: {
      backgroundColor: colors.m3.surfaceContainerHighest,
      opacity: 0.8,
    },
    indicatorPressed: {
      transform: [{ scale: 0.94 }],
    },
    indicatorInactivePressed: {
      backgroundColor: colors.m3.surfaceContainer,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: 8,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      borderWidth: 1.5,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    badgeText: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.bold, color: colors.surface },
    itemPressed: { opacity: 0.8 },
    itemDisabled: { opacity: 0.38 },
    label: {
      color: colors.m3.onSurfaceVariant,
      fontSize: 12,
      fontWeight: "500",
      letterSpacing: 0.2,
      textAlign: "center",
    },
    labelHovered: {
      color: colors.m3.onSurface,
      fontWeight: "600",
    },
    labelActive: {
      color: colors.m3.primary,
      fontWeight: "700",
    },
    labelDisabled: { opacity: 0.7 },
  });
}

export default NavigationBar;
