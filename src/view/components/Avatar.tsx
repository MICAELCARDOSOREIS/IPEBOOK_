import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

/** Avatar do design system (avatar.md): foto quando houver, iniciais quando não. */
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
  const fontSize = size >= 64 ? Math.round(size * 0.34) : tokens.typography.labelMedium.fontSize;
  return (
    <View accessibilityLabel={name} style={[styles.fallback, dimension]}>
      <Text style={[styles.initials, { fontSize }]}>{initials(name)}</Text>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    fallback: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.primaryContainer,
    },
    initials: {
      color: colors.m3.onPrimaryContainer,
      fontSize: tokens.typography.labelMedium.fontSize,
      fontWeight: "600",
    },
  });
}
