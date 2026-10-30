import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { type ModerationDecision, type ModerationItem, REPORT_REASON_LABEL } from "@/model/entities/moderation";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useModerationViewModel } from "@/viewmodel/useModerationViewModel";
import { AppIcon } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { Snackbar } from "@/view/components/Snackbar";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";

import { withPress } from "@/view/pressFeedback";
export type ModerationProps = {
  sessionUserId: string | null;
  onBack: () => void;
  onOpenListing?: (listingId: string) => void;
  onOpenProfile?: (userId: string) => void;
};

type Pending = { item: ModerationItem; decision: Exclude<ModerationDecision, "dismiss"> };

const CONFIRM: Record<Pending["decision"], { title: string; message: (label: string) => string; label: string }> = {
  remove_listing: {
    title: "Remover anúncio?",
    message: (label) => `"${label}" sai do ar de vez e quem anunciou é avisado.`,
    label: "Remover",
  },
  suspend_user: {
    title: "Suspender conta?",
    message: () => "A conta não poderá anunciar, pedir livros nem mandar mensagens, e os anúncios dela ficam pausados.",
    label: "Suspender",
  },
};

/** Fila da moderação (Spec 102 / ADR 0078): denúncias abertas agrupadas por anúncio ou pessoa. */
export function Moderation({ sessionUserId, onBack, onOpenListing, onOpenProfile }: ModerationProps) {
  const [state, actions] = useModerationViewModel(sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const wide = useIsWideWeb();
  const [pending, setPending] = useState<Pending | null>(null);

  async function confirm() {
    if (!pending) return;
    const ok = await actions.decide(pending.item, pending.decision);
    if (ok) setPending(null);
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Moderação" onBack={onBack} contentMaxWidth={wide ? WEB_MAX_WIDTH : undefined} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => void actions.reload()} colors={[colors.action]} tintColor={colors.action} />
        }
      >
        <View style={[styles.content, wide && styles.contentWide]}>
          <Text style={styles.intro}>
            Denúncias abertas, das mais denunciadas para as menos. Anúncios com três denúncias ficam pausados até a sua decisão.
          </Text>

          {state.loading && state.items.length === 0 ? (
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando denúncias" />
          ) : state.error ? (
            <View style={styles.card}>
              <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
              <Pressable accessibilityRole="button" onPress={() => void actions.reload()} style={withPress(styles.secondary)}>
                <Text style={styles.secondaryText}>Tentar de novo</Text>
              </Pressable>
            </View>
          ) : state.items.length === 0 ? (
            <View style={styles.empty}>
              <AppIcon name="checkCircle" size={36} color={colors.action} />
              <Text accessibilityRole="header" style={styles.emptyTitle}>Nenhuma denúncia aberta</Text>
              <Text style={styles.muted}>A comunidade está em dia.</Text>
            </View>
          ) : (
            state.items.map((item) => {
              const busy = state.decidingId === item.targetId;
              const isListing = item.kind === "listing";
              return (
                <View key={`${item.kind}-${item.targetId}`} style={styles.card} testID={`moderation-${item.targetId}`}>
                  <View style={styles.header}>
                    <AppIcon name={isListing ? "shelf" : "person"} size={20} color={colors.secondaryText} />
                    <Text style={styles.kind}>{isListing ? "Anúncio" : "Pessoa"}</Text>
                    <Text style={styles.count}>
                      {`${item.reportCount} ${item.reportCount === 1 ? "denúncia" : "denúncias"}`}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`Abrir ${item.label}`}
                    onPress={() => (isListing ? onOpenListing?.(item.targetId) : onOpenProfile?.(item.targetId))}
                  >
                    <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
                  </Pressable>
                  <Text style={styles.muted}>
                    {item.reasons.map((reason) => REPORT_REASON_LABEL[reason] ?? reason).join(" · ")}
                  </Text>
                  {item.details.map((detail) => (
                    <Text key={detail} style={styles.detail}>{`“${detail}”`}</Text>
                  ))}
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Arquivar denúncias de ${item.label}`}
                      disabled={busy}
                      onPress={() => void actions.decide(item, "dismiss")}
                      style={withPress(styles.secondary)}
                    >
                      <Text style={styles.secondaryText}>Arquivar</Text>
                    </Pressable>
                    {isListing ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remover anúncio ${item.label}`}
                        disabled={busy}
                        onPress={() => setPending({ item, decision: "remove_listing" })}
                        style={withPress(styles.secondary)}
                      >
                        <Text style={styles.dangerText}>Remover anúncio</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Suspender conta ligada a ${item.label}`}
                      disabled={busy}
                      onPress={() => setPending({ item, decision: "suspend_user" })}
                      style={withPress(styles.secondary)}
                    >
                      <Text style={styles.dangerText}>Suspender conta</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Dialog
        visible={pending !== null}
        title={pending ? CONFIRM[pending.decision].title : ""}
        message={pending ? CONFIRM[pending.decision].message(pending.item.label) : ""}
        confirmLabel={pending ? CONFIRM[pending.decision].label : ""}
        cancelLabel="Voltar"
        destructive
        loading={pending !== null && state.decidingId === pending.item.targetId}
        onConfirm={() => void confirm()}
        onCancel={() => setPending(null)}
      />
      <Snackbar visible={state.actionMessage !== null} message={state.actionMessage ?? ""} onDismiss={actions.clearActionMessage} />
    </SafeAreaView>
  );
}

export default function ModerationScreen(props: Omit<ModerationProps, "sessionUserId">) {
  const [authState] = useAuthViewModel();
  if (authState.loading) return null;
  return <Moderation sessionUserId={authState.user?.id ?? null} {...props} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], gap: tokens.spacing[16] },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: WEB_GUTTER },
    intro: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
    card: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[8],
    },
    header: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[8] },
    kind: { ...tokens.typography.labelMedium, color: colors.secondaryText, flex: 1 },
    count: { ...tokens.typography.labelMedium, color: colors.error },
    label: { ...tokens.typography.titleMedium, color: colors.text },
    muted: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
    detail: { ...tokens.typography.bodyMedium, color: colors.text, fontStyle: "italic" },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing[8], marginTop: tokens.spacing[4] },
    secondary: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.small,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    secondaryText: { ...tokens.typography.labelLarge, color: colors.action },
    dangerText: { ...tokens.typography.labelLarge, color: colors.error },
    error: { ...tokens.typography.bodyMedium, color: colors.error },
    empty: { alignItems: "center", gap: tokens.spacing[8], paddingVertical: tokens.spacing[32] },
    emptyTitle: { ...tokens.typography.titleMedium, color: colors.text },
  });
}
