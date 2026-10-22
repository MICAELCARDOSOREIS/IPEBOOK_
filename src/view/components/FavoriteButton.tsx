import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";

export type FavoriteButtonProps = { bookId: string; userId: string | null };
export function FavoriteButton({ bookId, userId }: FavoriteButtonProps) {
  const [state, actions] = useFavoriteButtonViewModel(bookId, userId);
  const { colors } = useTheme();
  return <View>
    <Pressable accessibilityRole="button" accessibilityLabel={state.selected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      accessibilityState={{ disabled: state.loading }} disabled={state.loading}
      onPress={() => void actions.toggle()}
      style={{ minWidth: tokens.accessibility.touchTarget, minHeight: tokens.accessibility.touchTarget, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.action, fontSize: 24 }}>{state.selected ? "♥" : "♡"}</Text>
    </Pressable>
    {state.error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{state.error}</Text> : null}
  </View>;
}
