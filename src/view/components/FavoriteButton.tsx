import { Animated, Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useExpressivePress } from "@/view/useExpressivePress";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";

export type FavoriteButtonProps = {
  bookId: string;
  userId: string | null;
  onToggleSuccess?: (selected: boolean) => void;
};
export function FavoriteButton({ bookId, userId, onToggleSuccess }: FavoriteButtonProps) {
  const [state, actions] = useFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({
    disabled: state.loading,
    pressedScale: 0.88,
  });

  const handleToggle = async () => {
    const wasSelected = state.selected;
    await actions.toggle();
    onToggleSuccess?.(!wasSelected);
  };
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={state.selected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          accessibilityState={{ disabled: state.loading }}
          disabled={state.loading}
          onPress={() => void handleToggle()}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={{
            width: tokens.accessibility.touchTarget,
            height: tokens.accessibility.touchTarget,
            borderRadius: isPressed ? tokens.shapeMorph.buttonPressed : tokens.shapeMorph.buttonRest,
            backgroundColor: isPressed ? colors.m3.surfaceContainerHigh : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon
            name={state.selected ? "heartFill" : "heart"}
            size={24}
            color={state.selected ? colors.action : colors.m3.primary}
          />
        </Pressable>
      </Animated.View>
      {state.error ? (
        <Text accessibilityRole="alert" style={{ color: colors.error, position: "absolute", top: tokens.accessibility.touchTarget, fontSize: tokens.fontSize[10], textAlign: "center" }}>
          {state.error}
        </Text>
      ) : null}
    </View>
  );
}
