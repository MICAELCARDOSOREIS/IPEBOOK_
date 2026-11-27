import { useMemo, useState } from "react";
import * as Linking from "expo-linking";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { FaqLink } from "@/model/helpContent";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

type HelpContactLinksProps = {
  links: readonly FaqLink[];
  horizontal?: boolean;
};

export function HelpContactLinks({ links, horizontal }: HelpContactLinksProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [linkError, setLinkError] = useState(false);

  const openContact = async (href: string) => {
    setLinkError(false);
    try {
      await Linking.openURL(href);
    } catch {
      setLinkError(true);
    }
  };

  return (
    <View>
      <View style={horizontal && styles.horizontal}>
        {links.map(({ href, label }) => (
          <Pressable
            key={href}
            accessibilityRole="link"
            accessibilityLabel={label}
            {...(Platform.OS === "web" ? { href } : { onPress: () => void openContact(href) })}
            style={withPress(styles.link)}
          >
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {linkError ? <InlineErrorCard message="Não foi possível abrir este contato." /> : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    horizontal: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: tokens.spacing[24],
    },
    link: {
      alignSelf: "flex-start",
      maxWidth: "100%",
      minHeight: tokens.accessibility.touchTarget,
      justifyContent: "center",
    },
    label: {
      ...tokens.typography.labelLarge,
      color: colors.action,
      textDecorationLine: "underline",
    },
  });
}
