import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

const BUTTON_HEIGHT = 52;

export function AppleSignInButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let active = true;
    void AppleAuthentication.isAvailableAsync().then((supported) => {
      if (active) setAvailable(supported);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!available) return null;

  return (
    <View
      pointerEvents={disabled ? "none" : "auto"}
      accessibilityElementsHidden={disabled}
      style={disabled && styles.busy}
    >
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={BUTTON_HEIGHT / 2}
        style={styles.button}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { width: "100%", height: BUTTON_HEIGHT },
  busy: { opacity: 0.5 },
});
