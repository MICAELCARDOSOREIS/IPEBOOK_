import { Pressable, type PressableProps } from "react-native";

export const isAvailableAsync = jest.fn(async () => false);
export const AppleAuthenticationButtonStyle = { WHITE_OUTLINE: 0 };
export const AppleAuthenticationButtonType = { CONTINUE: 0 };

export function AppleAuthenticationButton({ onPress }: Pick<PressableProps, "onPress">) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Continuar com a Apple" onPress={onPress} />;
}
