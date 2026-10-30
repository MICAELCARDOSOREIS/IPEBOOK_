import { Animated, Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useExpressivePress } from "@/view/useExpressivePress";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";

export type FavoriteButtonProps = { bookId: string; userId: string | null };
export function FavoriteButton({ bookId, userId }: FavoriteButtonProps) {
  const [state, actions] = useFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  const { scale, isPressed, onPressIn, onPressOut } = useExpressivePress({
    disabled: state.loading,
    pressedScale: 0.88,
  });
  return (
    <View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={state.selected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          accessibilityState={{ disabled: state.loading }}
          disabled={state.loading}
          onPress={() => void actions.toggle()}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={{
            minWidth: tokens.accessibility.touchTarget,
            minHeight: tokens.accessibility.touchTarget,
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
        <Text accessibilityRole="alert" style={{ color: colors.error }}>
          {state.error}
        </Text>
      ) : null}
    </View>
  );
}
