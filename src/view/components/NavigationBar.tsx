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

const INDICATOR_WIDTH = tokens.spacing[40] + tokens.spacing[24]; // 64 dp (proporção áurea do M3)
const INDICATOR_HEIGHT = tokens.spacing[32]; // 32 dp (altura compacta e elegante)
const DOCK_HORIZONTAL_PADDING = tokens.spacing[12]; // 12 dp
const DOCK_VERTICAL_PADDING = tokens.spacing[6]; // 6 dp (respiro equilibrado)
const INITIAL_DOCK_MAX_WIDTH = 340; // Largura balanceada para 3 abas sem distorção das bordas pílula

/**
 * Calcula a posição horizontal X da pílula deslizante centralizada sobre o item `index`.
 */
function getPillTargetX(index: number, totalItems: number, containerWidth: number): number {
  if (index < 0 || totalItems <= 0) return 0;
  const availableWidth = Math.max(0, containerWidth - DOCK_HORIZONTAL_PADDING * 2);
  const itemWidth = availableWidth / totalItems;
  return DOCK_HORIZONTAL_PADDING + index * itemWidth + (itemWidth - INDICATOR_WIDTH) / 2;
}

/** Barra de navegação do design system (barra-de-navegacao.md), Material 3 Expressive como no Figma `02.01`:
 * dock flutuante em pílula com superfície tonal M3, indicador ativo único que desliza suavemente entre abas
 * com física de mola espacial (`tokens.spring.spatialStandard`), ícones com micro-bounce na seleção,
 * rótulo abaixo, suporte a hover no desktop e transluscência web. Restrita a 3 destinos (ADR 0011).
 */
export function NavigationBar({ active, onNavigate, disabledDestinations = [], badges = {} }: NavigationBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hoveredKey, setHoveredKey] = useState<NavigationDestination | null>(null);
  const [dockWidth, setDockWidth] = useState(INITIAL_DOCK_MAX_WIDTH);
  const [optimisticActive, setOptimisticActive] = useState<NavigationDestination>(active);
  const lastNavigateTime = useRef(0);
  const DEBOUNCE_MS = 60;

  // Sincroniza quando a rota ativa é confirmada ou muda externamente
  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

  const currentActive = optimisticActive ?? active;
  const activeIndex = ITEMS.findIndex((item) => item.key === currentActive);
  const hasActiveItem = activeIndex >= 0;

  // Posição inicial da pílula deslizante sem flash/salto no primeiro frame
  const initialX = useMemo(
    () => getPillTargetX(Math.max(0, activeIndex), ITEMS.length, INITIAL_DOCK_MAX_WIDTH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const slideAnim = useRef(new Animated.Value(initialX)).current;

  // Anima a pílula deslizante quando a aba ativa ou a largura do dock muda
  useEffect(() => {
    if (!hasActiveItem) return;
    const targetX = getPillTargetX(activeIndex, ITEMS.length, dockWidth);
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          slideAnim.setValue(targetX);
          return;
        }
        Animated.spring(slideAnim, {
          toValue: targetX,
          tension: tokens.spring.spatialStandard.tension,
          friction: tokens.spring.spatialStandard.friction,
          useNativeDriver: Platform.OS !== "web",
        }).start();
      })
      .catch(() => {
        slideAnim.setValue(targetX);
      });
  }, [activeIndex, dockWidth, hasActiveItem, slideAnim]);

  // Em celulares com barra de 3 botões (Android) ou Home Indicator (iOS),
  // posiciona a cápsula com respiro sutil e ergonômico acima dos controles sem invadir a tela.
  const paddingBottom = insets.bottom > 0 ? insets.bottom + tokens.spacing[8] : tokens.spacing[12];

  return (
    <View
      testID="navigation-bar-tablist"
      accessibilityRole="tablist"
      pointerEvents="box-none"
      style={[styles.floatingWrapper, { paddingBottom }]}
    >
      <View
        style={styles.dock}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - dockWidth) > 1) {
            setDockWidth(w);
          }
        }}
      >
        {/* Pílula Deslizante Contínua Material 3 Expressive */}
        {hasActiveItem ? (
          <Animated.View
            pointerEvents="none"
            testID="navigation-bar-active-pill"
            style={[
              styles.slidingPill,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          />
        ) : null}

        {ITEMS.map((item) => {
          const isActive = item.key === currentActive;
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
                if (isDisabled || currentActive === item.key) return;
                const now = Date.now();
                if (now - lastNavigateTime.current < DEBOUNCE_MS) {
                  return;
                }
                lastNavigateTime.current = now;
                setOptimisticActive(item.key);
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
                    {/* Ícone com micro-bounce elástico no momento da ativação */}
                    <TabIconWithBounce
                      name={item.icon}
                      active={isActive}
                      color={
                        isDisabled
                          ? colors.secondaryText
                          : isActive
                            ? colors.m3.onSecondaryContainer
                            : isHovered
                              ? colors.m3.onSurface
                              : colors.m3.onSurfaceVariant
                      }
                    />
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

/** Ícone de aba com micro-animação de mola (*spring pop*) ao ser ativado */
function TabIconWithBounce({
  name,
  active,
  color,
}: {
  name: AppIconName;
  active: boolean;
  color: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (active) {
      scaleAnim.setValue(0.86);
      void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
        .then((reduced) => {
          if (reduced) {
            scaleAnim.setValue(1);
            return;
          }
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: tokens.spring.spatialStandard.tension,
            friction: tokens.spring.spatialStandard.friction,
            useNativeDriver: Platform.OS !== "web",
          }).start();
        })
        .catch(() => {
          scaleAnim.setValue(1);
        });
    }
  }, [active, scaleAnim]);

  return (
    <Animated.View style={[stylesLocal.iconLayer, { transform: [{ scale: scaleAnim }] }]}>
      <AppIcon name={name} size={24} filled={active} color={color} />
    </Animated.View>
  );
}

const stylesLocal = StyleSheet.create({
  iconLayer: { zIndex: 1 },
});

function createStyles(colors: ColorPalette) {
  const isWeb = Platform.OS === "web";
  const webDockBg =
    colors.surface === "#FCFAF5" ? "rgba(252, 250, 245, 0.92)" : "rgba(29, 27, 25, 0.90)";

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
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      maxWidth: INITIAL_DOCK_MAX_WIDTH,
      backgroundColor: isWeb ? webDockBg : colors.surface,
      borderRadius: tokens.radius.full,
      paddingVertical: DOCK_VERTICAL_PADDING,
      paddingHorizontal: DOCK_HORIZONTAL_PADDING,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
      elevation: 4,
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      ...(isWeb
        ? ({
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          } as never)
        : {}),
    },
    slidingPill: {
      position: "absolute",
      top: DOCK_VERTICAL_PADDING + 2, // alinhado verticalmente com o centro do indicador de 32dp
      left: 0,
      width: INDICATOR_WIDTH,
      height: INDICATOR_HEIGHT,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
      zIndex: 0,
    },
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      gap: 2,
      paddingVertical: 2,
      zIndex: 1,
      ...(isWeb ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
    },
    indicator: {
      width: INDICATOR_WIDTH,
      height: INDICATOR_HEIGHT,
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
      top: -3,
      right: 10,
      minWidth: 16,
      height: 16,
      paddingHorizontal: tokens.spacing[4],
      borderRadius: tokens.radius.full,
      borderWidth: 1.5,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
      zIndex: 2,
    },
    badgeText: { ...tokens.typography.captionSmall, fontWeight: tokens.fontWeight.bold, color: colors.surface },
    itemPressed: { opacity: 0.8 },
    itemDisabled: { opacity: 0.38 },
    label: {
      color: colors.m3.onSurfaceVariant,
      fontFamily: tokens.fontFamily.medium,
      fontSize: tokens.fontSize[12],
      lineHeight: tokens.fontSize[16],
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: 0.2,
      textAlign: "center",
    },
    labelHovered: {
      color: colors.m3.onSurface,
      fontFamily: tokens.fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
    },
    labelActive: {
      color: colors.m3.primary,
      fontFamily: tokens.fontFamily.semiBold,
      fontWeight: tokens.fontWeight.bold,
    },
    labelDisabled: { opacity: 0.7 },
  });
}

export default NavigationBar;