import { Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";

export function CachedBookNotice({ cachedAt, catalog }: { cachedAt?: number | null; catalog?: boolean }) {
  const { colors } = useTheme();
  if (cachedAt == null) return null;
  const updatedAt = new Date(cachedAt).toLocaleTimeString("pt-BR", {
    timeStyle: "short",
  });
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacing[8],
        backgroundColor: colors.m3.secondaryContainer,
        borderRadius: tokens.radius.cardSmall,
        paddingHorizontal: tokens.spacing[12],
        paddingVertical: tokens.spacing[8],
        marginVertical: tokens.spacing[4],
        marginHorizontal: tokens.spacing[16],
      }}
    >
      <AppIcon name="info" size={18} color={colors.m3.onSecondaryContainer} />
      <Text style={{ ...tokens.typography.footnote, color: colors.m3.onSecondaryContainer, flex: 1 }}>
        {catalog
          ? `Catálogo salvo às ${updatedAt}. Conecte-se para carregar mais.`
          : `Estante salva às ${updatedAt}.`}
      </Text>
    </View>
  );
}
