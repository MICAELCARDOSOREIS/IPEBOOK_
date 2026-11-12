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
};
export function FavoriteButton({ bookId, userId, onToggleSuccess }: FavoriteButtonProps) {
  const [state, actions] = makeFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  const [showToggleError, setShowToggleError] = useState(false);
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({
    disabled: state.loading,
    pressedScale: 0.88,
  });

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
          style={{
            width: tokens.accessibility.touchTarget,
            height: tokens.accessibility.touchTarget,
            borderRadius: isPressed ? tokens.shapeMorph.buttonPressed : tokens.shapeMorph.buttonRest,
            backgroundColor: isPressed ? colors.m3.surfaceContainerHigh : "transparent",
            alignItems: "center",
            justifyContent: "center",
            ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as never) : {}),
          }}
        >
          <AppIcon
            name={state.selected ? "heartFill" : "heart"}
            size={24}
            color={state.selected ? colors.ipe.bloom : colors.m3.primary}
          />
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
