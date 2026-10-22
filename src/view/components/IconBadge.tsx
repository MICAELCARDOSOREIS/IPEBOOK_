import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon, type AppIconName } from "./AppIcon";

export type IconBadgeTone = "action" | "trade" | "donation" | "error" | "neutral";

function createTones(colors: ColorPalette): Record<IconBadgeTone, { background: string; icon: string }> {
  return {
    action: { background: colors.action, icon: colors.surface },
    trade: { background: colors.badge.trade.background, icon: colors.badge.trade.text },
    donation: { background: colors.badge.donation.background, icon: colors.badge.donation.text },
    error: { background: colors.errorContainer, icon: colors.error },
    neutral: { background: colors.soft, icon: colors.secondaryText },
  };
}

/** `medium` é o selo das listas; `large` é o círculo de destaque dos estados vazios do Figma. */
export type IconBadgeSize = "medium" | "large";

export interface IconBadgeProps {
  icon: AppIconName;
  tone: IconBadgeTone;
  size?: IconBadgeSize;
}

export function IconBadge({ icon, tone, size = "medium" }: IconBadgeProps) {
  const { colors } = useTheme();
  const tones = useMemo(() => createTones(colors), [colors]);
  const { background, icon: iconColor } = tones[tone];
  const large = size === "large";
  return (
    <View style={[large ? styles.badgeLarge : styles.badge, { backgroundColor: background }]}>
      <AppIcon name={icon} size={large ? 40 : 18} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLarge: {
    width: 96,
    height: 96,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default IconBadge;
