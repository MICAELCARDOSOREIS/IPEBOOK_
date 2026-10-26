import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";

export type FavoriteButtonProps = { bookId: string; userId: string | null };
export function FavoriteButton({ bookId, userId }: FavoriteButtonProps) {
  const [state, actions] = useFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={state.selected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        accessibilityState={{ disabled: state.loading }}
        disabled={state.loading}
        onPress={() => void actions.toggle()}
        style={{
          minWidth: tokens.accessibility.touchTarget,
          minHeight: tokens.accessibility.touchTarget,
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
      {state.error ? (
        <Text accessibilityRole="alert" style={{ color: colors.error }}>
          {state.error}
        </Text>
      ) : null}
    </View>
  );
}
