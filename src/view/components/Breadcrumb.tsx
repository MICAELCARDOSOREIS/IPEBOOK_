import { useMemo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";

export type BreadcrumbItem = {
  /** Texto legível exibido no caminho */
  label: string;
  /** Ação acionada ao clicar ou tocar no item */
  onPress?: () => void;
  /** Rótulo para tecnologias assistivas */
  accessibilityLabel?: string;
  /** Indica se é a página atual */
  isCurrent?: boolean;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Caminho de navegação (Breadcrumbs) para telas web e desktop.
 * Segue as diretrizes WAI-ARIA de navegação com separadores decorativos ocultos,
 * realce sutil no foco/hover e truncamento inteligente para títulos longos.
 */
export function Breadcrumb({ items, style, testID = "breadcrumb" }: BreadcrumbProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!items || items.length === 0) return null;

  return (
    <View
      testID={testID}
      role="navigation"
      aria-label="Caminho de navegação"
      accessibilityRole="header"
      style={[styles.container, style]}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.isCurrent ?? isLast;
        const hasAction = typeof item.onPress === "function" && !isCurrent;

        return (
          <View key={`${item.label}-${index}`} style={styles.segment}>
            {index > 0 ? (
              <Text
                aria-hidden={true}
                accessible={false}
                importantForAccessibility="no"
                style={styles.separator}
              >
                ›
              </Text>
            ) : null}

            {hasAction ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={item.accessibilityLabel ?? item.label}
                onPress={item.onPress}
                style={styles.hit}
              >
                {({ hovered }: { hovered?: boolean }) => (
                  <Text
                    numberOfLines={1}
                    style={[styles.link, hovered && styles.linkHover]}
                  >
                    {item.label}
                  </Text>
                )}
              </Pressable>
            ) : (
              <Text
                aria-current={isCurrent ? "page" : undefined}
                numberOfLines={1}
                style={isCurrent ? styles.current : styles.inactive}
              >
                {item.label}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      columnGap: tokens.spacing[4],
      rowGap: tokens.spacing[4],
      width: "100%",
    },
    segment: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      maxWidth: "100%",
    },
    separator: {
      ...tokens.typography.bodyMedium,
      fontSize: 14,
      color: colors.m3.outline,
      marginHorizontal: tokens.spacing[2],
      userSelect: "none" as "auto",
      textAlignVertical: "center",
      includeFontPadding: false,
    },
    hit: {
      minHeight: 28,
      justifyContent: "center",
      borderRadius: tokens.radius.small,
      paddingHorizontal: tokens.spacing[2],
      cursor: Platform.OS === "web" ? ("pointer" as "auto") : "auto",
    },
    link: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.medium,
      fontSize: 14,
    },
    linkHover: {
      textDecorationLine: "underline",
    },
    inactive: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
      fontSize: 14,
      paddingHorizontal: tokens.spacing[2],
    },
    current: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
      fontSize: 14,
      paddingHorizontal: tokens.spacing[2],
      flexShrink: 1,
    },
  });
}

export default Breadcrumb;
