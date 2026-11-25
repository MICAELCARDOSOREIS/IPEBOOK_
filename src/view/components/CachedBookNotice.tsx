import { Text, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";

export type CachedBookNoticeVariant = "catalog" | "shelf" | "detail";

export type CachedBookNoticeProps = {
  cachedAt?: number | null;
  variant?: CachedBookNoticeVariant;
  /** Compatibilidade: equivale a `variant="catalog"`. */
  catalog?: boolean;
};

function formatCachedMessage(cachedAt: number, variant: CachedBookNoticeVariant): string {
  const date = new Date(cachedAt);
  const updatedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const updatedTime = date.toLocaleTimeString("pt-BR", {
    timeStyle: "short",
  });
  if (variant === "catalog") {
    return `Catálogo salvo em ${updatedDate} às ${updatedTime}. Conecte-se para carregar mais.`;
  }
  if (variant === "detail") {
    return `Anúncio salvo em ${updatedDate} às ${updatedTime}. Conecte-se para confirmar a disponibilidade.`;
  }
  return `Estante salva em ${updatedDate} às ${updatedTime}.`;
}

export function CachedBookNotice({ cachedAt, variant, catalog }: CachedBookNoticeProps) {
  const { colors } = useTheme();
  if (cachedAt == null) return null;
  const resolvedVariant: CachedBookNoticeVariant = variant ?? (catalog ? "catalog" : "shelf");
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
        {formatCachedMessage(cachedAt, resolvedVariant)}
      </Text>
    </View>
  );
}
