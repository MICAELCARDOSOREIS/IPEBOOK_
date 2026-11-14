import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useExpressivePress } from "@/view/useExpressivePress";
import { useGuardedPress } from "@/view/useGuardedPress";
import { makeFavoriteButtonViewModel } from "@/di/container";

export type FavoriteButtonProps = {
  bookId: string;
  userId: string | null;
  onToggleSuccess?: (selected: boolean) => void;
  /** Em `overlay`, exibe um fundo circular de alto contraste para sobrepor capas escuras. */
  variant?: "default" | "overlay";
};
export function FavoriteButton({ bookId, userId, onToggleSuccess, variant = "default" }: FavoriteButtonProps) {
  const [state, actions] = makeFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  const [showToggleError, setShowToggleError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({
    disabled: state.loading,
    pressedScale: 0.88,
  });
  const isOverlay = variant === "overlay";

  useEffect(() => {
    if (!showToggleError || !state.error) return;
    const timer = setTimeout(() => setShowToggleError(false), 3500);
    return () => clearTimeout(timer);
  }, [showToggleError, state.error]);

  const handleToggle = useGuardedPress(async () => {
    setShowToggleError(true);
    const wasSelected = state.selected;
    await actions.toggle();
    onToggleSuccess?.(!wasSelected);
  });
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={state.selected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          accessibilityState={{ disabled: state.loading }}
          disabled={state.loading}
          onPress={handleToggle}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
          style={{
            width: tokens.accessibility.touchTarget,
            height: tokens.accessibility.touchTarget,
            borderRadius: isPressed ? tokens.shapeMorph.buttonPressed : tokens.shapeMorph.buttonRest,
            backgroundColor: !isOverlay && isPressed ? colors.m3.surfaceContainerHigh : "transparent",
            alignItems: "center",
            justifyContent: "center",
            ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
          }}
        >
          <View
            style={
              isOverlay
                ? {
                    width: 36,
                    height: 36,
                    borderRadius: tokens.radius.full,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isPressed || isHovered ? colors.m3.surfaceContainerHigh : colors.m3.surfaceContainerLowest,
                    borderWidth: 1,
                    borderColor: colors.m3.outlineVariant,
                    elevation: 2,
                    shadowColor: colors.m3.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.14,
                    shadowRadius: 4,
                  }
                : undefined
            }
          >
            <AppIcon
              name={state.selected ? "heartFill" : "heart"}
              size={isOverlay ? 20 : 24}
              color={state.selected ? (isOverlay ? colors.ipe.bloomDeep : colors.ipe.bloom) : colors.m3.primary}
            />
          </View>
        </Pressable>
      </Animated.View>
      {showToggleError && state.error ? (
        <View
          style={{
            position: "absolute",
            top: tokens.accessibility.touchTarget + 4,
            right: 0,
            minWidth: 168,
            paddingHorizontal: tokens.spacing[8],
            paddingVertical: tokens.spacing[4],
            backgroundColor: colors.errorContainer,
            borderRadius: tokens.radius.small,
            borderWidth: 1,
            borderColor: colors.error,
            zIndex: 10,
          }}
        >
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{ color: colors.text, fontSize: tokens.fontSize[10], textAlign: "center", fontWeight: "500" }}
          >
            {state.error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
