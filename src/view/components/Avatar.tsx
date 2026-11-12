import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { IpeMark } from "@/view/components/IpeMark";
import { useTheme } from "@/view/theme/ThemeProvider";

export type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: number;
};

/** Avatar do design system (avatar.md): foto quando houver; sem foto, o ipê da marca (Spec 078). */
export function Avatar({ name, photoUrl, size = 40 }: AvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dimension = { width: size, height: size, borderRadius: tokens.radius.full };
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        accessibilityLabel={name}
        style={dimension}
      />
    );
  }
  return (
    <View accessibilityLabel={name} style={[styles.fallback, dimension]}>
      <IpeMark size={Math.round(size * 0.72)} testID="avatar-ipe" />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    fallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.ipe.container,
    },
  });
}
